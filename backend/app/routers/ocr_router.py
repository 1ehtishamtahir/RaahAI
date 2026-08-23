from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.models.schemas import OCRResponse, OCRField
from app.services.ocr import extract_fields, mask_fields
try:
    from app.services.gemini import explain_fields
except Exception:
    from app.services.qwen import explain_fields
from app.core.config import get_settings

router = APIRouter(prefix="/ocr", tags=["ocr"])
settings = get_settings()

ALLOWED = {"image/png", "image/jpeg", "image/jpg", "application/pdf"}

SERVICE_KEYWORDS = {
    "passport": {
        "en": ["passport", "dgip", "travel", "visa", "immigration", "departure", "arrival"],
        "ur": ["\u067e\u0627\u0633\u067e\u0648\u0631\u0679", "\u062f\u06cc\u067e\u0627\u0631\u0679", "\u0633فرaqueت"],
    },
    "cnic": {
        "en": ["cnic", "nadra", "identity", "national id", "smart card", "shanaKhti"],
        "ur": ["\u0634\u0646\u0627\u062e\u062a\u06cc", "\u06a9\u0627\u0631\u062f", "\u0646\u0627\u0688\u0631\u0627"],
    },
    "business_registration": {
        "en": ["secp", "company", "business", "incorporation", "memorandum", "articles", "director"],
        "ur": ["\u06a9\u0627\u0631\u0648\u0628\u0627\u0631", "\u06a9\u0645\u067e\u0646\u06cc", "\u0627\u06cc\u0633 \u0627\u06cc \u0633\u06cc \u067e\u06cc"],
    },
}

def match_service(fields: list[dict], raw_text: str) -> dict:
    text_lower = (raw_text or "").lower()
    scores = {"passport": 0, "cnic": 0, "business_registration": 0}

    for f in fields:
        label = f.get("label", "").lower()
        value = f.get("value", "").lower()
        combined = f"{label} {value}"

        if label == "cnic" or "cnic" in combined:
            scores["cnic"] += 3
        if label == "passport_no" or "passport" in combined:
            scores["passport"] += 3
        if label in ("company_name", "business_name") or "secp" in combined:
            scores["business_registration"] += 3

        for svc, keywords in SERVICE_KEYWORDS.items():
            for kw in keywords["en"] + keywords["ur"]:
                if kw.lower() in combined:
                    scores[svc] += 2

    for svc, keywords in SERVICE_KEYWORDS.items():
        for kw in keywords["en"] + keywords["ur"]:
            if kw.lower() in text_lower:
                scores[svc] += 1

    best = max(scores, key=scores.get)
    best_score = scores[best]

    if best_score < 2:
        return {"service": None, "confidence": 0, "reason": "No clear service match"}

    total = sum(scores.values()) or 1
    confidence = round(best_score / total, 2)

    reasons = []
    if scores["passport"] > scores["cnic"] and scores["passport"] > scores["business_registration"]:
        reasons.append("Passport-related fields detected")
    elif scores["cnic"] > scores["business_registration"]:
        reasons.append("CNIC/identity fields detected")
    else:
        reasons.append("Business/company fields detected")

    return {"service": best, "confidence": confidence, "reasons": reasons, "scores": scores}

@router.post("", response_model=OCRResponse)
async def ocr_upload(
    file: UploadFile = File(...),
    lang: str = Form("en"),
    match_service_flag: bool = Form(True, alias="match_service"),
):
    if file.content_type not in ALLOWED and not file.filename.lower().endswith((".png",".jpg",".jpeg",".pdf")):
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")
    data = await file.read()
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if len(data) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File too large. Max {settings.max_upload_mb} MB")

    if file.filename.lower().endswith(".pdf"):
        try:
            from pdf2image import convert_from_bytes
            pages = convert_from_bytes(data, first_page=1, last_page=1)
            import io
            buf = io.BytesIO()
            pages[0].save(buf, format="PNG")
            data = buf.getvalue()
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"PDF conversion failed: {e}")

    fields, raw_text = extract_fields(data, engine=settings.ocr_engine)
    explanations = explain_fields(fields, lang=lang)

    if isinstance(explanations, list):
        expl_list = explanations
    elif isinstance(explanations, dict):
        if len(explanations) < len(fields):
            expl_list = list(explanations.values())
            expl_list += [None] * (len(fields) - len(expl_list))
        else:
            expl_list = [explanations.get(f["label"]) for f in fields]
    else:
        expl_list = [None] * len(fields)

    enriched = []
    for idx, f in enumerate(fields):
        exp = expl_list[idx] if idx < len(expl_list) else None
        enriched.append(OCRField(
            label=f["label"],
            value=f["value"],
            confidence=f["confidence"],
            needs_confirmation=f["needs_confirmation"],
            explanation=exp
        ))

    masked = mask_fields(fields)

    response = OCRResponse(fields=enriched, raw_text=raw_text, masked_fields=masked)

    if match_service_flag:
        service_match = match_service(fields, raw_text)
        response_dict = response.model_dump()
        response_dict["matched_service"] = service_match
        return response_dict

    return response

@router.post("/ask")
async def ocr_followup(field_label: str = Form(...), field_value: str = Form(...), question: str = Form(...), lang: str = Form("en")):
    from app.services.gemini import call_gemini as call_llm
    context = [{"text": f"Field: {field_label}\nValue: {field_value}", "source": "OCR Document"}]
    prompt = f"The user uploaded a document. This field was extracted:\n- Field: {field_label}\n- Value: {field_value}\n\nUser asks: {question}\n\nAnswer concisely in {'Urdu' if lang=='ur' else 'English'}."

    try:
        answer = call_llm(prompt, context, lang=lang)
    except Exception:
        answer = f"About '{field_label}': {field_value}. Please check the official website for details."

    return {"answer": answer, "field": field_label, "value": field_value}
