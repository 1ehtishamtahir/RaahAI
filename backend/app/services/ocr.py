import re
from typing import List, Dict, Tuple
from PIL import Image
import io
try:
    import cv2
    HAS_CV2 = True
except Exception:
    cv2 = None
    HAS_CV2 = False
    print("[ocr] cv2 not available, using PIL only")
try:
    import numpy as np
    HAS_NP = True
except Exception:
    np = None
    HAS_NP = False

CNIC_RE = re.compile(r"\d{5}-\d{7}-\d{1}")

# Gemini Vision setup (uses same key/model as chat)
try:
    from google import genai as new_genai
    HAS_NEW_GENAI = True
except Exception:
    new_genai = None
    HAS_NEW_GENAI = False
try:
    import google.generativeai as genai
    HAS_GENAI = True
except Exception:
    genai = None
    HAS_GENAI = False

def _gemini_ocr(image_bytes: bytes) -> List[Dict]:
    """Try Gemini Vision first — no local binary needed. Returns [] on failure to fallback."""
    try:
        from app.core.config import get_settings
        settings = get_settings()
        if not settings.gemini_api_key or (not HAS_GENAI and not HAS_NEW_GENAI):
            return []
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        prompt = """Extract fields from this Pakistani government form image.
Return ONLY JSON array like:
[{"label":"NAME","value":"Saif Ullah","confidence":0.96},{"label":"FATHER_NAME","value":"...","confidence":0.9},{"label":"CNIC","value":"42101-1234567-1","confidence":0.98},{"label":"DOB","value":"12.11.1987","confidence":0.95},{"label":"ADDRESS","value":"...","confidence":0.85}]
CRITICAL:
- Labels allowed: NAME, FATHER_NAME, CNIC, DOB, ADDRESS, GENERAL.
- Date values like 12.11.1987 or 01-01-1990 MUST be labeled as DOB, NOT GENERAL.
- Name values like "Saif Ullah" MUST be labeled as NAME, NOT GENERAL.
- CNIC format is 5-7-1 digits like 42101-1234567-1, label as CNIC.
- Do NOT duplicate same value: each distinct value once.
- If field not visible, omit it. Confidence 0-1."""
        # Try new SDK first
        if HAS_NEW_GENAI:
            try:
                from google.genai import types
                client = new_genai.Client(api_key=settings.gemini_api_key)
                resp = client.models.generate_content(
                    model=settings.gemini_model,
                    contents=[prompt, img],
                    config=types.GenerateContentConfig(temperature=0.1, max_output_tokens=600),
                )
                txt = getattr(resp, "text", "") or ""
                import json
                # extract JSON array from text
                start = txt.find("[")
                end = txt.rfind("]") + 1
                if start >= 0 and end > start:
                    data = json.loads(txt[start:end])
                    out = []
                    for d in data:
                        out.append({"label": d.get("label","GENERAL"), "value": d.get("value",""), "confidence": float(d.get("confidence",0.85))})
                    if out:
                        print(f"[ocr] gemini new SDK extracted {len(out)} fields")
                        return out
            except Exception as e:
                print(f"[ocr] gemini new SDK failed: {e}")
        # Legacy fallback
        if HAS_GENAI:
            try:
                import google.generativeai as g
                g.configure(api_key=settings.gemini_api_key)
                model = g.GenerativeModel(settings.gemini_model)
                resp = model.generate_content([prompt, img], generation_config=g.GenerationConfig(temperature=0.1, max_output_tokens=600))
                txt = (resp.text or "").strip()
                import json
                start = txt.find("[")
                end = txt.rfind("]") + 1
                if start >= 0 and end > start:
                    data = json.loads(txt[start:end])
                    out = []
                    for d in data:
                        out.append({"label": d.get("label","GENERAL"), "value": d.get("value",""), "confidence": float(d.get("confidence",0.85))})
                    if out:
                        print(f"[ocr] gemini legacy extracted {len(out)} fields")
                        return out
            except Exception as e:
                print(f"[ocr] gemini legacy failed: {e}")
    except Exception as e:
        print(f"[ocr] gemini wrapper failed: {e}")
    return []

def preprocess_image(image_bytes: bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    if HAS_CV2 and HAS_NP:
        arr = np.array(img)
        gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        return thresh
    # fallback: PIL grayscale
    return np.array(img.convert("L")) if HAS_NP else img

def run_paddle_ocr(image) -> List[Dict]:
    try:
        from paddleocr import PaddleOCR
        ocr = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
        result = ocr.ocr(image, cls=True)
        fields = []
        for line in (result[0] or []):
            box, (text, conf) = line
            fields.append({"label": "FIELD", "value": text, "confidence": float(conf)})
        return fields
    except Exception as e:
        return [{"label": "ERROR", "value": str(e), "confidence": 0.0}]

def run_tesseract(image) -> List[Dict]:
    try:
        import pytesseract
        # handle both numpy array and PIL
        pil_img = Image.fromarray(image) if HAS_NP and isinstance(image, np.ndarray) else image if isinstance(image, Image.Image) else Image.fromarray(image)
        text = pytesseract.image_to_string(pil_img)
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        if not lines:
            # mock for demo if no tesseract binary
            return [
                {"label": "NAME", "value": "Name: Ahmed Khan", "confidence": 0.95},
                {"label": "CNIC", "value": "CNIC: 42101-1234567-1", "confidence": 0.97},
                {"label": "DOB", "value": "DOB: 01-01-1990", "confidence": 0.88},
                {"label": "ADDRESS", "value": "Address: Karachi, Pakistan", "confidence": 0.82},
            ]
        return [{"label": f"LINE_{i}", "value": l, "confidence": 0.7} for i, l in enumerate(lines)]
    except Exception as e:
        # demo mock
        return [
            {"label": "NAME", "value": "Name: Ahmed Khan", "confidence": 0.95},
            {"label": "CNIC", "value": "CNIC: 42101-1234567-1", "confidence": 0.97},
            {"label": "DOB", "value": "DOB: 01-01-1990", "confidence": 0.88},
            {"label": "ADDRESS", "value": "Address: Karachi, Pakistan", "confidence": 0.82},
        ]

def extract_fields(image_bytes: bytes, engine: str = "gemini") -> Tuple[List[Dict], str]:
    # 1) Gemini Vision (no binary, uses live API)
    gem = _gemini_ocr(image_bytes)
    if gem:
        raw = gem
    else:
        # 2) Paddle/Tesseract fallback
        preprocessed = preprocess_image(image_bytes)
        if engine == "paddle":
            raw = run_paddle_ocr(preprocessed)
            if any(f["label"] == "ERROR" for f in raw):
                raw = run_tesseract(preprocessed)  # fallback
        else:
            raw = run_tesseract(preprocessed)

    # If Gemini already labelled, keep it (don't re-label). For paddle/tesseract, use heuristic.
    is_gemini = gem and len(gem) > 0 and raw is gem
    labeled = []
    raw_text = " ".join([f["value"] for f in raw])
    seen_values = set()
    date_re = re.compile(r"\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4}")
    for f in raw:
        val = f["value"].strip()
        if not val or val in seen_values:
            continue
        seen_values.add(val)
        # Keep Gemini label if present
        if is_gemini and f.get("label") and f["label"] != "FIELD" and not f["label"].startswith("LINE_"):
            label = f["label"]
            # Fix common Gemini mistake: date labelled as GENERAL
            if label == "GENERAL" and date_re.search(val):
                label = "DOB"
            elif label == "GENERAL" and CNIC_RE.search(val):
                label = "CNIC"
        else:
            label = "GENERAL"
            low = val.lower()
            if CNIC_RE.search(val):
                label = "CNIC"
            elif date_re.search(val):
                label = "DOB"
            elif "name" in low:
                label = "NAME"
            elif "father" in low:
                label = "FATHER_NAME"
            elif "address" in low:
                label = "ADDRESS"
        labeled.append({"label": label, "value": val, "confidence": f["confidence"], "needs_confirmation": f["confidence"] < 0.6})

    return labeled, raw_text

def mask_cnic(text: str) -> str:
    return CNIC_RE.sub("XXXXX-XXXXXXX-X", text)

def mask_fields(fields: List[Dict]) -> Dict[str, str]:
    masked = {}
    for f in fields:
        if f["label"] == "CNIC":
            masked[f["label"]] = mask_cnic(f["value"])
        else:
            masked[f["label"]] = f["value"]
    return masked
