from fastapi import APIRouter, UploadFile, File, Form
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

@router.post("", response_model=OCRResponse)
async def ocr_upload(file: UploadFile = File(...), lang: str = Form("en")):
    if file.content_type not in ALLOWED and not file.filename.lower().endswith((".png",".jpg",".jpeg",".pdf")):
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")
    data = await file.read()
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if len(data) > max_bytes:
        from fastapi import HTTPException
        raise HTTPException(status_code=413, detail=f"File too large. Max {settings.max_upload_mb} MB")

    # PDF -> images
    if file.filename.lower().endswith(".pdf"):
        try:
            from pdf2image import convert_from_bytes
            pages = convert_from_bytes(data, first_page=1, last_page=1)
            import io
            buf = io.BytesIO()
            pages[0].save(buf, format="PNG")
            data = buf.getvalue()
        except Exception as e:
            from fastapi import HTTPException
            raise HTTPException(status_code=422, detail=f"PDF conversion failed: {e}")

    fields, raw_text = extract_fields(data, engine=settings.ocr_engine)
    explanations = explain_fields(fields, lang=lang)

    # Handle both list (new) and dict (legacy) and duplicate labels
    if isinstance(explanations, list):
        expl_list = explanations
    elif isinstance(explanations, dict):
        # If dict has duplicate label issue (e.g., GENERAL x3 but dict len 1), fallback to values in order
        if len(explanations) < len(fields):
            expl_list = list(explanations.values())
            # pad to fields length
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
    return OCRResponse(fields=enriched, raw_text=raw_text, masked_fields=masked)
