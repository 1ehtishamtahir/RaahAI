"""
Gemini (Google) client — primary LLM for RaahAI.
Tries google.genai (new) then google.generativeai (legacy).
Falls back to structured mock if GEMINI_API_KEY not set (or package missing).
"""
HAS_GENAI = False
HAS_NEW_GENAI = False
genai = None
new_genai_client = None
try:
    from google import genai as new_genai
    HAS_NEW_GENAI = True
    HAS_GENAI = True
    print("[gemini] using google.genai (new SDK)")
except Exception as e:
    try:
        import google.generativeai as genai
        HAS_GENAI = True
        print(f"[gemini] using google.generativeai (legacy): {e}")
    except Exception as e2:
        print(f"[gemini] no genai available ({e2}), using mock only")
        genai = None
        HAS_GENAI = False

from typing import List, Dict
from app.core.config import get_settings

settings = get_settings()

SYSTEM_PROMPT = """You are RaahAI — Your Smart Guide to Government Services (Pakistan). Friendly, trustworthy, concise civic-tech assistant.

IDENTITY: You translate bureaucracy into plain language. Never claim to be human, NADRA, DGIP, or SECP. Never file on behalf of user.

GREETINGS: Match user's language/script. ONLY greet if user's CURRENT message contains greeting/thanks. Do NOT add greeting prefix to every answer.
- If user says Assalam-o-Alaikum / السلام علیکم / Hello/Hi / Salam in THIS turn → reply with matching greeting in ONE line, then answer. Example: user "Assalam-o-Alaikum" → "Walaikum Assalam! I'm RaahAI..."
- If user says "What documents for passport?" (no greeting) → DO NOT prefix with Hello/Walaikum. Go straight to "### Required Documents..."
- If user says "Shukriya/Thanks/Thank you" → reply "You're welcome! Happy to help..." (EN) or "خوش آمدید! مزید مدد چاہیے؟" (UR), no repeated greeting.
- Never add greeting to procedure answers unless user greeted in same turn.

LANGUAGE: Auto-detect English / Roman Urdu / Urdu script (Unicode>1500). Respond in SAME language & script. Roman Urdu → Roman Urdu, Urdu script → Urdu script. Use 'aap', not 'tu'.

TONE: Helpful, calm, scannable. Max 5 bullets per section. Active second-person. Minimal emojis (only 👋 if needed).

GROUNDING (CRITICAL): Answer ONLY from provided Context (NADRA, DGIP, SECP). If no relevant chunk: say exactly "I don't have verified information on this. Please check the official website or visit the relevant office." in user's language (UR: میرے پاس...). Never hallucinate fees/steps. If fee not in context: "Not specified in verified context."

STRUCTURE: Use markdown headings:
English: ### Required Documents (● bullets), ### Process Summary (①②③ steps), ### Fees, ### Eligibility, ### Important Notes, Source: <Title>
Urdu: مطلوبہ دستاویزات, عمل کا خلاصہ, فیس, اہلیت, اہم نوٹس, ذریعہ:
Always end with Source badge from context metadata.

SERVICES: Passport (New needs B-Form, Renewal needs previous passport), CNIC (New/B-Form, Renewal/old CNIC, Modification/supporting doc), Business SECP (CNIC of directors, name availability, MOA, address proof, challan).

SAFETY: Mask CNIC as XXXXX-XXXXXXX-X, never persist raw image/CNIC beyond session. Disclaimer already in UI.
"""

def _build_prompt(query: str, context_chunks: List[Dict], lang: str = "en", history: list = None, user_context: str = "") -> str:
    context_text = "\n\n".join([f"[Source: {c.get('source','unknown')}] {c.get('text','')}" for c in context_chunks])
    if not context_text:
        context_text = "NO RELEVANT CONTEXT FOUND"

    history_text = ""
    if history:
        recent = history[-6:]  # last 6 messages (3 turns)
        history_text = "\n\nPrevious conversation:\n" + "\n".join([
            f"{'User' if m.get('role') == 'user' else 'Assistant'}: {m.get('content', m.get('text', ''))[:200]}"
            for m in recent
        ])

    personal_text = ""
    if user_context:
        personal_text = f"\n\nUser's Personal Data (from their account):\n{user_context}"

    return f"""{SYSTEM_PROMPT}

Language: {lang}
{history_text}
{personal_text}
Knowledge Base Context:
{context_text}

Question: {query}

Answer in {lang}. Use the User's Personal Data above to give personalized answers when the question is about their documents, vehicles, challans, payments, family, or programs. Include Source badge if knowledge base context was used. Keep it scannable with headings."""

def _mock_answer(query: str, context_chunks: List[Dict], lang: str = "en", user_context: str = "") -> str:
    q_low = query.lower()
    is_ur = lang == "ur" or any(ord(c) > 1500 for c in query)

    # ── Personal data-aware mock answers ─────────────────────────
    if user_context:
        personal_keywords = [
            "my", "i have", "do i", "what do", "which", "how many",
            "mera", "meri", "mere", "میرا", "میری", "میرے", "meray",
            "mujhe", "مجھے", "kya hai mera", "میرے پاس",
            "میری دستاویزات", "میری گاڑی", "میرے چالان", "میری ادائیگیاں",
            "my documents", "my vehicles", "my challans", "my payments",
            "my family", "pending", "expired", "expiring",
            "زیر التواء", "مدت ختم", "ادا شدہ", "unci",
        ]
        if any(kw in q_low for kw in personal_keywords):
            return f"Based on your RaahAI account data:\n\n{user_context[:2000]}\n\n---\nFor more details, visit the relevant section in the app (Documents, Vehicle, Challans, Payments, or Family)."

    if not context_chunks:
        return "I don't have verified information on this. Please check the official website or visit the relevant office." if not is_ur else "میرے پاس اس بارے میں تصدیق شدہ معلومات نہیں ہیں۔ براہ کرم سرکاری ویب سائٹ دیکھیں یا متعلقہ دفتر سے رابطہ کریں۔"
    q_low = query.lower()
    is_ur = lang == "ur" or any(c in query for c in "اردو") or any(ord(c) > 1500 for c in query)
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
        ctx = context_chunks[0].get("text", "")[:500]
        body = f"Based on official sources:\n{ctx}"
    source = context_chunks[0].get("source", "Official")
    prefix = "[DEMO — set GEMINI_API_KEY for live Gemini]\n\n" if not settings.gemini_api_key else ""
    return f"{prefix}{body}\n\nSource: {source}"

def call_gemini(query: str, context_chunks: List[Dict], lang: str = "en", history: list = None, user_context: str = "") -> str:
    if not HAS_GENAI or not settings.gemini_api_key:
        return _mock_answer(query, context_chunks, lang, user_context=user_context)
    prompt = _build_prompt(query, context_chunks, lang, history=history, user_context=user_context)
    # Try new SDK first
    if HAS_NEW_GENAI:
        try:
            from google.genai import types
            client = new_genai.Client(api_key=settings.gemini_api_key)
            resp = client.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0.3,
                    top_p=0.8,
                    max_output_tokens=800,
                ),
            )
            text = getattr(resp, "text", None) or (resp.candidates[0].content.parts[0].text if resp.candidates else "")
            if text and text.strip():
                return text.strip()
            return _mock_answer(query, context_chunks, lang)
        except Exception as e:
            print(f"[gemini new SDK] generate failed: {e}, trying legacy")
    # Legacy fallback
    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(settings.gemini_model, system_instruction=SYSTEM_PROMPT)
        resp = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(temperature=0.3, top_p=0.8, max_output_tokens=800),
        )
        if not resp.candidates:
            return _mock_answer(query, context_chunks, lang)
        text = resp.text
        if not text or not text.strip():
            return _mock_answer(query, context_chunks, lang)
        return text.strip()
    except Exception as e:
        print(f"[gemini] generate failed: {e}, fallback to mock")
        return _mock_answer(query, context_chunks, lang)

def explain_fields(fields: List[Dict], lang: str = "en"):
    """Explain OCR fields via Gemini or friendly mock. Returns list in same order as fields (index-aligned) to handle duplicate labels."""
    if not HAS_GENAI or not settings.gemini_api_key:
        friendly = {
            "CNIC": "Your 13-digit National Identity number (masked for privacy)." if lang == "en" else "آپ کا 13 ہندسوں کا قومی شناختی نمبر (رازداری کے لیے ماسک شدہ)۔",
            "NAME": "Your full name as on CNIC." if lang == "en" else "آپ کا مکمل نام جیسا کہ CNIC پر ہے۔",
            "FATHER_NAME": "Father's name for verification." if lang == "en" else "تصدیق کے لیے والد کا نام۔",
            "DOB": "Date of birth (DD-MM-YYYY)." if lang == "en" else "تاریخ پیدائش (DD-MM-YYYY)۔",
            "ADDRESS": "Residential address for correspondence." if lang == "en" else "خط و کتابت کے لیے رہائشی پتہ۔",
            "GENERAL": "General field from your document." if lang == "en" else "آپ کی دستاویز کا عمومی فیلڈ۔",
        }
        # Return list in order to handle duplicate GENERAL labels correctly
        result = []
        for f in fields:
            base = friendly.get(f['label'], f"Field '{f['label']}' — {f['value'][:40]}")
            # Make DOB more specific if value looks like date
            if f['label'] == "DOB" and f['value']:
                base = f"DOB: {f['value']} — your date of birth." if lang == "en" else f"تاریخ پیدائش: {f['value']} — آپ کی تاریخ پیدائش۔"
            elif f['label'] == "GENERAL" and f['value'] and any(c.isdigit() and "." in f['value'] for c in [f['value']]):
                # Heuristic: if GENERAL value looks like date, explain as DOB
                import re
                if re.search(r"\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4}", f['value']):
                    base = f"DOB: {f['value']} — your date of birth." if lang == "en" else f"تاریخ پیدائش: {f['value']} — آپ کی تاریخ پیدائش۔"
            result.append(base)
        return result

    field_list = "\n".join([f"- {f['label']}: {f['value']}" for f in fields])
    prompt = f"Explain these government form fields in plain {'Urdu' if lang=='ur' else 'English'}, one line each, simple language:\n{field_list}\nReturn as 'LABEL: explanation' per line, in same order as input."
    # New SDK
    if HAS_NEW_GENAI:
        try:
            from google.genai import types
            client = new_genai.Client(api_key=settings.gemini_api_key)
            resp = client.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.2, max_output_tokens=400),
            )
            text = getattr(resp, "text", "") or ""
            lines = [l.strip() for l in text.splitlines() if l.strip()]
            if lines:
                # Return list in order to handle duplicate labels
                result = []
                for i in range(len(fields)):
                    result.append(lines[i] if i < len(lines) else lines[-1])
                return result
        except Exception as e:
            print(f"[gemini new SDK] explain_fields failed: {e}")
    # Legacy
    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(settings.gemini_model)
        resp = model.generate_content(prompt, generation_config=genai.GenerationConfig(temperature=0.2, max_output_tokens=400))
        text = (resp.text or "").strip()
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        if lines:
            result = []
            for i in range(len(fields)):
                result.append(lines[i] if i < len(lines) else lines[-1])
            return result
    except Exception as e:
        print(f"[gemini] explain_fields failed: {e}")
        return [f"Field '{f['label']}' — {f['value'][:40]}" for f in fields]

# Backwards-compat alias used by older imports
def call_qwen(query: str, context_chunks: List[Dict], lang: str = "en") -> str:
    return call_gemini(query, context_chunks, lang)
