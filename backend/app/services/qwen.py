"""
Qwen (Alibaba Cloud DashScope) client.
Uses OpenAI-compatible API via dashscope or openai sdk.
"""
try:
    import dashscope
    from dashscope import Generation
    HAS_DASHSCOPE = True
except Exception as e:
    print(f"[qwen] dashscope not available ({e}), using mock only")
    dashscope = None
    Generation = None
    HAS_DASHSCOPE = False

from typing import List, Dict
from app.core.config import get_settings

settings = get_settings()

SYSTEM_PROMPT = """You are RaahAI, a helpful assistant for Pakistani government services.
You MUST:
- Answer only from the provided official context. If context is insufficient, say "I don't have verified information on this. Please check the official source." in the user's language.
- Be concise, structured, and scannable. Use headings: Required Documents, Process, Fees, Eligibility, Important Notes.
- Always include Source citation at the end if available.
- Support Urdu (including Roman Urdu) and English. Match user's language.
- Never hallucinate procedures or fees.
[LEGACY Qwen — now Gemini is primary; this file kept for fallback]
"""

def build_messages(query: str, context_chunks: List[Dict], lang: str = "en") -> List[Dict]:
    context_text = "\n\n".join([f"[Source: {c.get('source','unknown')}] {c.get('text','')}" for c in context_chunks])
    user_content = f"Language: {lang}\n\nContext:\n{context_text if context_text else 'NO RELEVANT CONTEXT FOUND'}\n\nQuestion: {query}\n\nAnswer in {lang} and include Source badge if context was used."
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

def call_qwen(query: str, context_chunks: List[Dict], lang: str = "en") -> str:
    if not HAS_DASHSCOPE or not settings.dashscope_api_key:
        # High-quality mock that mimics real Qwen structure for demo
        if not context_chunks:
            return "I don't have verified information on this. Please check the official website or visit the relevant office." if lang == "en" else "میرے پاس اس بارے میں تصدیق شدہ معلومات نہیں ہیں۔ براہ کرم سرکاری ویب سائٹ دیکھیں یا متعلقہ دفتر سے رابطہ کریں۔"
        # Build structured answer from chunks
        q_low = query.lower()
        is_ur = lang == "ur" or any(c in query for c in "اردو")
        # Detect service
        if any(k in q_low for k in ["passport", "پاسپورٹ"]):
            body = (
                "مطلوبہ دستاویزات:\n● اصل CNIC / Smart CNIC\n● B-Form (اگر 18 سال سے کم)\n● پاسپورٹ تصاویر (سفید پس منظر)\n● پچھلا پاسپورٹ (اگر ہے)\n● فیس کی رسید\n\nعمل کا خلاصہ:\n① DGIP پر آن لائن فارم ② نیشنل بینک میں فیس ③ اپائنٹمنٹ ④ مرکز کا دورہ (بائیومیٹرکس) ⑤ تصدیق اور ترسیل"
                if is_ur else
                "Required Documents:\n● Original CNIC / Smart CNIC\n● B-Form (if under 18)\n● Passport photographs (white background)\n● Previous passport (if any)\n● Fee payment receipt\n\nProcess Summary:\n① Online form at DGIP ② Fee at National Bank ③ Appointment ④ Center visit (biometrics) ⑤ Verification & delivery"
            )
        elif any(k in q_low for k in ["cnic", "شناختی کارڈ"]):
            body = (
                "مطلوبہ دستاویزات:\n● B-Form / CRC\n● والد/سرپرست کے CNIC کی کاپی\n● تصاویر\n● نادرا فیس\n\nعمل: نادرا سینٹر → بائیومیٹرکس → ٹوکن ٹریکنگ"
                if is_ur else
                "Required Documents:\n● B-Form / CRC\n● Parent/Guardian CNIC copy\n● Photographs\n● NADRA fee (Normal PKR 1000, Urgent PKR 2000)\n\nProcess: Visit NADRA Center → Biometrics → Token tracking"
            )
        elif any(k in q_low for k in ["business", "secp", "company", "کاروبار"]):
            body = (
                "SECP رجسٹریشن:\n● ڈائریکٹرز کے CNIC\n● نام کی دستیابی (eServices)\n● یادداشت و ضوابط\n● پتہ کا ثبوت\n● SECP فیس چالان"
                if is_ur else
                "SECP Business Registration:\n● CNIC of directors\n● Name availability via SECP eServices\n● Memorandum & Articles\n● Address proof\n● SECP fee challan"
            )
        else:
            ctx = context_chunks[0].get("text","")[:500]
            body = f"Based on official sources:\n{ctx}"
        source = context_chunks[0].get("source","Official")
        prefix = "[DEMO — set DASHSCOPE_API_KEY for live Qwen]\n\n" if not settings.dashscope_api_key else ""
        return f"{prefix}{body}\n\nSource: {source}"
    if not HAS_DASHSCOPE:
        raise RuntimeError("dashscope not installed")
    dashscope.api_key = settings.dashscope_api_key
    messages = build_messages(query, context_chunks, lang)
    resp = Generation.call(
        model=settings.qwen_model,
        messages=messages,
        result_format="message",
        temperature=0.3,
        top_p=0.8,
    )
    if resp.status_code == 200:
        return resp.output.choices[0].message.content
    raise RuntimeError(f"Qwen error {resp.status_code}: {resp.message}")

def explain_fields(fields: List[Dict], lang: str = "en") -> Dict[str, str]:
    """Ask Qwen to explain OCR fields in plain language."""
    field_list = "\n".join([f"- {f['label']}: {f['value']}" for f in fields])
    prompt = f"Explain these government form fields in plain {'Urdu' if lang=='ur' else 'English'}, one line each, simple language:\n{field_list}"
    if not HAS_DASHSCOPE or not settings.dashscope_api_key:
        # friendly mock explanations
        friendly = {
            "CNIC": "Your 13-digit National Identity number (masked for privacy)." if lang=="en" else "آپ کا 13 ہندسوں کا قومی شناختی نمبر (رازداری کے لیے ماسک شدہ)۔",
            "NAME": "Your full name as on CNIC." if lang=="en" else "آپ کا مکمل نام جیسا کہ CNIC پر ہے۔",
            "FATHER_NAME": "Father's name for verification." if lang=="en" else "تصدیق کے لیے والد کا نام۔",
            "DOB": "Date of birth (DD-MM-YYYY)." if lang=="en" else "تاریخ پیدائش (DD-MM-YYYY)۔",
            "ADDRESS": "Residential address for correspondence." if lang=="en" else "خط و کتابت کے لیے رہائشی پتہ۔",
        }
        return {f['label']: friendly.get(f['label'], f"Field '{f['label']}' — {f['value'][:40]}") for f in fields}
    if not HAS_DASHSCOPE:
        return {}
    dashscope.api_key = settings.dashscope_api_key
    resp = Generation.call(
        model=settings.qwen_model,
        messages=[{"role": "user", "content": prompt}],
        result_format="message",
    )
    if resp.status_code == 200:
        text = resp.output.choices[0].message.content
        # naive split — real parsing can be smarter
        lines = text.split("\n")
        out = {}
        for i, f in enumerate(fields):
            out[f['label']] = lines[i] if i < len(lines) else text
        return out
    return {}
