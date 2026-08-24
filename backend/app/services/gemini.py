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


def _parse_user_context(user_context: str) -> Dict[str, List[str]]:
    """Parse the structured user_context string into sections."""
    sections = {}
    current_section = None
    current_lines = []
    for line in user_context.split("\n"):
        if line.startswith("## "):
            if current_section:
                sections[current_section] = current_lines
            current_section = line.strip("# ").strip()
            current_lines = []
        elif line.strip().startswith("- ") and current_section:
            current_lines.append(line.strip()[2:])
    if current_section:
        sections[current_section] = current_lines
    return sections


def _mock_answer(query: str, context_chunks: List[Dict], lang: str = "en", user_context: str = "") -> str:
    q_low = query.lower().strip()
    is_ur = lang == "ur" or any(ord(c) > 1500 for c in query)

    # ── Personal data-aware answers ─────────────────────────────────
    if user_context:
        sections = _parse_user_context(user_context)

        # Detect what the user is asking about
        doc_kw = ["document", "documents", "dastavez", "dastawiz", "passport", "cnic", "nadra", "secp",
                   "دستاویزات", "پاسپورٹ", "شناختی", "سی ایس سی پی", " expiry", "expire", "expiring",
                   "expired", "valid", "expiry", "wallet"]
        vehicle_kw = ["vehicle", "vehicles", "gaari", "gari", "car", "bike", "token", "registration",
                       "گاڑی", "گاری", "موٹر", "ٹوکن", "رجسٹریشن"]
        challan_kw = ["challan", "challans", "fine", "penalty", "violation", "traffic",
                       "چالان", "جرمانہ", "ٹریفک"]
        payment_kw = ["payment", "payments", "pay", "due", "bill", "fee", "receipt",
                       "ادائیگی", "ادا", "فیس", "بل"]
        family_kw = ["family", "members", "member", "dependent", "child", "wife", "son", "daughter",
                      "خاندان", "芜员", "بچے", "بيوي", " family"]
        program_kw = ["program", "programs", "scheme", "bisp", "ehsaas", "eligible", "enrolled", "wazaif",
                       "پروگرام", "اسکیم", "ایحاث", "بی ایس پی"]
        checklist_kw = ["checklist", "progress", "steps", "completed", "step",
                         "چیک لسٹ", "پیشرفت", "مرحلہ"]

        def match_category(keywords):
            return any(kw in q_low for kw in keywords)

        def format_section(section_name, lines, prefix="", suffix=""):
            if not lines:
                return ""
            return f"{prefix}**{section_name}:**\n" + "\n".join(f"● {l}" for l in lines) + f"\n{suffix}"

        def format_section_ur(section_name, lines, prefix="", suffix=""):
            if not lines:
                return ""
            return f"{prefix}**{section_name}:**\n" + "\n".join(f"● {l}" for l in lines) + f"\n{suffix}"

        # ── Documents ──
        if match_category(doc_kw):
            docs = sections.get("My Documents (Wallet)", [])
            if docs:
                header = "آپ کے دستاویزات:" if is_ur else "Your Documents:"
                items = []
                for d in docs:
                    items.append(f"● {d}")
                return f"{header}\n" + "\n".join(items) + "\n\n---\nVisit Documents section for details."
            return "آپ کے پاس ابھی کوئی دستاویزات رجسٹرڈ نہیں ہیں۔" if is_ur else "No documents registered yet. Add your first document in the Documents section."

        # ── Vehicles ──
        if match_category(vehicle_kw):
            vehicles = sections.get("My Vehicles", [])
            if vehicles:
                header = "آپ کی گاڑیاں:" if is_ur else "Your Vehicles:"
                items = []
                for v in vehicles:
                    items.append(f"● {v}")
                return f"{header}\n" + "\n".join(items) + "\n\n---\nVisit Vehicle section for details."
            return "آپ کے پاس ابھی کوئی گاڑی رجسٹرڈ نہیں ہے۔" if is_ur else "No vehicles registered yet. Add your vehicle in the Vehicle section."

        # ── Challans ──
        if match_category(challan_kw):
            challans = sections.get("My Challans", [])
            if challans:
                pending = [c for c in challans if "Pending" in c or "pending" in c.lower()]
                paid = [c for c in challans if "Paid" in c or "paid" in c.lower()]
                header = "آپ کے چالان:" if is_ur else "Your Challans:"
                items = []
                if pending:
                    items.append("**Pending:**")
                    for c in pending:
                        items.append(f"● {c}")
                if paid:
                    items.append("**Paid:**")
                    for c in paid:
                        items.append(f"● {c}")
                return f"{header}\n" + "\n".join(items) + "\n\n---\nVisit Challans section to pay online."
            return "آپ کے کوئی چالان نہیں ہیں۔" if is_ur else "No challans found. You're all clear!"

        # ── Payments ──
        if match_category(payment_kw):
            payments = sections.get("My Payments", [])
            if payments:
                header = "آپ کی ادائیگیاں:" if is_ur else "Your Payments:"
                items = []
                for p in payments:
                    items.append(f"● {p}")
                return f"{header}\n" + "\n".join(items) + "\n\n---\nVisit Payments section to manage."
            return "آپ کے کوئی ادائیگی زیر التواء نہیں۔" if is_ur else "No pending payments found."

        # ── Family ──
        if match_category(family_kw):
            family = sections.get("My Family Members", [])
            if family:
                header = "آپ کا خاندان:" if is_ur else "Your Family:"
                items = []
                for m in family:
                    items.append(f"● {m}")
                return f"{header}\n" + "\n".join(items) + "\n\n---\nVisit Family section for details."
            return "آپ نے ابھی کوئی خاندان کے ممبران اضافہ نہیں کیے۔" if is_ur else "No family members added yet."

        # ── Programs ──
        if match_category(program_kw):
            programs = sections.get("My Enrolled/Eligible Programs", [])
            if programs:
                header = "آپ کے پروگرام:" if is_ur else "Your Programs:"
                items = []
                for p in programs:
                    items.append(f"● {p}")
                return f"{header}\n" + "\n".join(items) + "\n\n---\nVisit Opportunities section for more."
            return "آپ کسی پروگرام میں اندراج نہیں ہیں۔" if is_ur else "No programs enrolled. Check the Opportunities section."

        # ── Checklist ──
        if match_category(checklist_kw):
            checklists = sections.get("My Checklist Progress", [])
            if checklists:
                header = "آپ کی چیک لسٹ:" if is_ur else "Your Checklists:"
                items = []
                for cl in checklists:
                    items.append(f"● {cl}")
                return f"{header}\n" + "\n".join(items)
            return "آپ کی کوئی چیک لسٹ نہیں ہے۔" if is_ur else "No checklists yet."

        # ── Generic "my" questions — show all data ──
        generic_my_kw = ["my", "i have", "do i", "what do", "which", "how many",
                         "mera", "meri", "mere", "میرا", "میری", "میرے", "meray",
                         "mujhe", "مجھے", "kya hai mera", "میرے پاس", "tell me about"]
        if any(kw in q_low for kw in generic_my_kw):
            all_sections = []
            section_map = {
                "Citizen Profile": "Your Profile",
                "My Documents (Wallet)": "Your Documents",
                "My Vehicles": "Your Vehicles",
                "My Challans": "Your Challans",
                "My Payments": "Your Payments",
                "My Family Members": "Your Family",
                "My Enrolled/Eligible Programs": "Your Programs",
                "My Checklist Progress": "Your Checklists",
            }
            for sec_key, sec_label in section_map.items():
                lines = sections.get(sec_key, [])
                if lines:
                    all_sections.append(f"**{sec_label}:**")
                    for l in lines:
                        all_sections.append(f"● {l}")
            if all_sections:
                return "\n".join(all_sections) + "\n\n---\nAsk me specifics about any section!"
            return "Your account is set up but no data added yet. Start by adding documents, vehicles, or family members!"

        # ── Help / What can you do ──
        help_kw = ["help", "what can you", "features", "options", "menu", "madad", "mدد"]
        if any(kw in q_low for kw in help_kw):
            if is_ur:
                return ("میں آپ کی ان م.metroں میں مدد کر سکتا ہوں:\n"
                        "● دستاویزات — پاسپورٹ، شناختی کارڈ، SECP\n"
                        "● گاڑیاں — ٹوکن ٹیکس، رجسٹریشن\n"
                        "● چالان — ٹریفک جرمانے\n"
                        "● ادائیگیاں — فیس، بل\n"
                        "● خاندان — ممبران، پروگرام\n"
                        "● چیک لسٹ — عمل کی پیشرفت\n\n"
                        "بس مجھ سے پوچھیں!")
            return ("I can help you with:\n"
                    "● Documents — Passport, CNIC, SECP registration\n"
                    "● Vehicles — Token tax, registration\n"
                    "● Challans — Traffic fines\n"
                    "● Payments — Fees, bills\n"
                    "● Family — Members, programs\n"
                    "● Checklists — Progress tracking\n\n"
                    "Just ask me anything!")

    # ── No user context, use KB chunks ──
    if not context_chunks:
        return ("I don't have verified information on this. Please check the official website or visit the relevant office."
                if not is_ur else
                "میرے پاس اس بارے میں تصدیق شدہ معلومات نہیں ہیں۔ براہ کرم سرکاری ویب سائٹ دیکھیں یا متعلقہ دفتر سے رابطہ کریں۔")

    # ── KB-based answers ──
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
            return _mock_answer(query, context_chunks, lang, user_context=user_context)
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
            return _mock_answer(query, context_chunks, lang, user_context=user_context)
        text = resp.text
        if not text or not text.strip():
            return _mock_answer(query, context_chunks, lang, user_context=user_context)
        return text.strip()
    except Exception as e:
        print(f"[gemini] generate failed: {e}, fallback to mock")
        return _mock_answer(query, context_chunks, lang, user_context=user_context)


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
        result = []
        for f in fields:
            base = friendly.get(f['label'], f"Field '{f['label']}' — {f['value'][:40]}")
            if f['label'] == "DOB" and f['value']:
                base = f"DOB: {f['value']} — your date of birth." if lang == "en" else f"تاریخ پیدائش: {f['value']} — آپ کی تاریخ پیدائش۔"
            elif f['label'] == "GENERAL" and f['value'] and any(c.isdigit() and "." in f['value'] for c in [f['value']]):
                import re
                if re.search(r"\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4}", f['value']):
                    base = f"DOB: {f['value']} — your date of birth." if lang == "en" else f"تاریخ پیدائش: {f['value']} — آپ کی تاریخ پیدائش۔"
            result.append(base)
        return result

    field_list = "\n".join([f"- {f['label']}: {f['value']}" for f in fields])
    prompt = f"Explain these government form fields in plain {'Urdu' if lang=='ur' else 'English'}, one line each, simple language:\n{field_list}\nReturn as 'LABEL: explanation' per line, in same order as input."
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
                result = []
                for i in range(len(fields)):
                    result.append(lines[i] if i < len(lines) else lines[-1])
                return result
        except Exception as e:
            print(f"[gemini new SDK] explain_fields failed: {e}")
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


def call_qwen(query: str, context_chunks: List[Dict], lang: str = "en") -> str:
    return call_gemini(query, context_chunks, lang)
