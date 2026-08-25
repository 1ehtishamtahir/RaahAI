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

    def _parse_fields(raw: str) -> Dict[str, str]:
        """Parse 'key=value, key=value' lines into a dict."""
        fields = {}
        for part in raw.split(", "):
            if "=" in part:
                k, v = part.split("=", 1)
                fields[k.strip()] = v.strip()
        return fields

    def _format_doc(raw: str) -> str:
        f = _parse_fields(raw)
        dtype = f.get("document_type", "document")
        name = f.get("document_name_en", dtype).title()
        status = f.get("status", "unknown")
        exp = f.get("expires", "")
        badge = "✅" if status == "valid" else ("⚠️" if "expir" in status else "❌")
        line = f"{badge} **{name}**"
        if exp:
            line += f" — expires {exp}"
        if status == "expired":
            line += " — **needs renewal**"
        return line

    def _format_vehicle(raw: str) -> str:
        f = _parse_fields(raw)
        plate = f.get("registration_no", "N/A")
        make = f.get("make", "?")
        model = f.get("model", "?")
        vtype = f.get("vehicle_type", "vehicle")
        token = f.get("token_tax", "unknown")
        due = f.get("token_due", "")
        badge = "✅" if token.lower() == "paid" else "⚠️"
        line = f"{badge} **{plate}** — {make} {model} ({vtype})"
        if token.lower() != "paid":
            line += f"\n   Token tax: **{token}**"
            if due:
                line += f" — due {due}"
        return line

    def _format_challan(raw: str) -> str:
        f = _parse_fields(raw)
        plate = f.get("vehicle", "N/A")
        violation = f.get("violation", "Unknown violation")
        amount = f.get("amount", "N/A")
        try:
            amount = f"{int(float(amount)):,}"
        except Exception:
            pass
        status = f.get("status", "unknown")
        due = f.get("due", "N/A")
        source = f.get("source", "")
        badge = "✅" if status.lower() == "paid" else "🔴"
        line = f"{badge} **{plate}** — {violation}"
        line += f"\n   Amount: **PKR {amount}** | Due: {due}"
        if status.lower() == "paid":
            line += " | Status: Paid ✅"
        else:
            line += f" | Status: ⏳ Pending"
        if source:
            line += f"\n   Source: {source}"
        return line

    def _format_payment(raw: str) -> str:
        f = _parse_fields(raw)
        title = f.get("title_en", f.get("type", "Payment"))
        amount = f.get("amount", "N/A")
        try:
            amount = f"{int(float(amount)):,}"
        except Exception:
            pass
        status = f.get("status", "unknown")
        due = f.get("due", "N/A")
        paid = f.get("paid_date", "")
        category = f.get("category", "")
        badge = "✅" if status.lower() == "paid" else ("🔴" if status.lower() == "overdue" else "⏳")
        line = f"{badge} **{title}**"
        line += f"\n   Amount: **PKR {amount}**"
        if status.lower() == "paid":
            line += f" | Paid on {paid}" if paid else " | Paid"
        else:
            line += f" | Due: {due}"
            if status.lower() == "overdue":
                line += " | **OVERDUE**"
        if category:
            line += f" | {category}"
        return line

    def _format_family(raw: str) -> str:
        f = _parse_fields(raw)
        name = f.get("name", "Unknown")
        relation = f.get("relation", "")
        age = f.get("age", "")
        edu = f.get("education", "")
        line = f"👤 **{name}**"
        if relation:
            line += f" — {relation}"
        if age:
            line += f", age {age}"
        if edu and edu != "N/A":
            line += f", {edu}"
        return line

    def _format_program(raw: str) -> str:
        f = _parse_fields(raw)
        pname = f.get("program_name", "Unknown")
        member = f.get("member", "N/A")
        status = f.get("status", "unknown")
        amount = f.get("amount", "")
        badge = "✅" if status.lower() == "enrolled" else ("⏳" if status.lower() == "applied" else "📋")
        line = f"{badge} **{pname}**"
        if member and member != "All":
            line += f" for {member}"
        line += f"\n   Status: {status}"
        if amount:
            line += f" | {amount}"
        return line

    # ── Personal data-aware answers ─────────────────────────────────
    if user_context:
        sections = _parse_user_context(user_context)

        doc_kw = ["document", "documents", "dastavez", "passport", "cnic", "nadra", "secp",
                   "دستاویزات", "پاسپورٹ", "شناختی", "expiry", "expire", "expiring", "expired",
                   "valid", "wallet", " expiry"]
        vehicle_kw = ["vehicle", "vehicles", "gaari", "gari", "car", "bike", "motorcycle",
                       "token", "registration", "گاڑی", "گاری", "موٹر", "ٹوکن", "رجسٹریشن"]
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
        help_kw = ["help", "what can you", "features", "options", "menu", "madad", "مدد"]

        def match_category(keywords):
            return any(kw in q_low for kw in keywords)

        # ── Documents ──
        if match_category(doc_kw):
            docs = sections.get("My Documents (Wallet)", [])
            if docs:
                lines = [_format_doc(d) for d in docs]
                expired = sum(1 for d in docs if "expired" in d.lower())
                expiring = sum(1 for d in docs if "expiring" in d.lower() and "expired" not in d.lower())
                valid = sum(1 for d in docs if "valid" in d.lower() and "expir" not in d.lower())
                summary = f"You have **{len(docs)} documents** on file."
                if expired:
                    summary += f" ⚠️ **{expired}** need renewal."
                if expiring:
                    summary += f" **{expiring}** expiring soon."
                if valid and not expired and not expiring:
                    summary += " All looking good! ✅"
                return f"{summary}\n\n" + "\n\n".join(lines) + "\n\n---\n📄 Check the Documents section for details."
            return "No documents registered yet. Add your passport, CNIC, or other documents in the Documents section to keep track of expiry dates and renewals."

        # ── Vehicles ──
        if match_category(vehicle_kw):
            vehicles = sections.get("My Vehicles", [])
            if vehicles:
                lines = [_format_vehicle(v) for v in vehicles]
                pending_tax = sum(1 for v in vehicles if "pending" in v.lower() or "overdue" in v.lower())
                summary = f"You have **{len(vehicles)} vehicle(s)** registered."
                if pending_tax:
                    summary += f" ⚠️ **{pending_tax}** has pending token tax."
                else:
                    summary += " All token taxes are up to date! ✅"
                return f"{summary}\n\n" + "\n\n".join(lines) + "\n\n---\n🚗 Visit the Vehicle section for details."
            return "No vehicles registered yet. Add your vehicle in the Vehicle section to track token tax and registration."

        # ── Challans ──
        if match_category(challan_kw):
            challans = sections.get("My Challans", [])
            if challans:
                pending = [c for c in challans if "Pending" in c or "pending" in c.lower()]
                paid = [c for c in challans if "Paid" in c or "paid" in c.lower()]
                total_pending = sum(int(float(_parse_fields(c).get("amount", "0"))) for c in pending)
                summary = f"You have **{len(challans)} challans** total."
                if pending:
                    summary += f" 🔴 **{len(pending)} pending** (PKR {total_pending:,})"
                if paid:
                    summary += f" | ✅ {len(paid)} paid"
                lines = []
                if pending:
                    lines.append("**Pending — action needed:**")
                    lines.extend([_format_challan(c) for c in pending])
                if paid:
                    lines.append("**Paid:**")
                    lines.extend([_format_challan(c) for c in paid])
                return f"{summary}\n\n" + "\n\n".join(lines) + "\n\n---\n💡 Pay pending challans in the Challans section to avoid extra fines."
            return "No challans found — you're all clear! 🎉 Keep driving safe."

        # ── Payments ──
        if match_category(payment_kw):
            payments = sections.get("My Payments", [])
            if payments:
                pending = [p for p in payments if "paid" not in p.lower()]
                paid = [p for p in payments if "paid" in p.lower()]
                overdue = [p for p in payments if "overdue" in p.lower()]
                summary = f"You have **{len(payments)} payments** on record."
                if pending:
                    summary += f" ⏳ **{len(pending)} pending**"
                if overdue:
                    summary += f" | 🔴 **{len(overdue)} overdue**"
                if paid:
                    summary += f" | ✅ {len(paid)} completed"
                lines = []
                if overdue:
                    lines.append("**🔴 Overdue — pay ASAP:**")
                    lines.extend([_format_payment(p) for p in overdue])
                if pending:
                    lines.append("**⏳ Upcoming:**")
                    lines.extend([_format_payment(p) for p in pending if "Overdue" not in p])
                if paid:
                    lines.append("**✅ Completed:**")
                    lines.extend([_format_payment(p) for p in paid[:3]])
                    if len(paid) > 3:
                        lines.append(f"_...and {len(paid)-3} more_")
                return f"{summary}\n\n" + "\n\n".join(lines) + "\n\n---\n💳 Manage payments in the Payments section."
            return "No payments found. Once you add documents or get challans, payments will appear here."

        # ── Family ──
        if match_category(family_kw):
            family = sections.get("My Family Members", [])
            if family:
                lines = [_format_family(m) for m in family]
                return f"Your family has **{len(family)} member(s):**\n\n" + "\n".join(lines) + "\n\n---\n👨‍👩‍👧 Manage family in the Family section."
            return "No family members added yet. Add your family in the Family section to check program eligibility."

        # ── Programs ──
        if match_category(program_kw):
            programs = sections.get("My Enrolled/Eligible Programs", [])
            if programs:
                enrolled = sum(1 for p in programs if "Enrolled" in p)
                eligible = sum(1 for p in programs if "Eligible" in p)
                applied = sum(1 for p in programs if "Applied" in p)
                summary = f"**{len(programs)} programs** on your radar."
                if enrolled:
                    summary += f" ✅ {enrolled} enrolled"
                if eligible:
                    summary += f" | 📋 {eligible} eligible"
                if applied:
                    summary += f" | ⏳ {applied} applied"
                lines = [_format_program(p) for p in programs]
                return f"{summary}\n\n" + "\n\n".join(lines) + "\n\n---\n🎓 Browse more in the Opportunities section."
            return "No programs found. Check the Opportunities section for scholarships and government programs you may qualify for."

        # ── Checklist ──
        if match_category(checklist_kw):
            checklists = sections.get("My Checklist Progress", [])
            if checklists:
                lines = []
                for cl in checklists:
                    f = _parse_fields(cl)
                    svc = f.get("service", "Service")
                    progress = f.get("progress", "")
                    lines.append(f"📋 **{svc}** — {progress}")
                return "**Your checklists:**\n\n" + "\n\n".join(lines)
            return "No checklists yet. Start a service flow to track your progress step by step."

        # ── Generic "my" / account overview ──
        generic_my_kw = ["my", "i have", "do i", "what do", "which", "how many",
                         "mera", "meri", "mere", "میرا", "میری", "میرے", "meray",
                         "mujhe", "مجھے", "kya hai mera", "میرے پاس", "tell me about",
                         "account", "summary", "overview", "اکاؤنٹ", "خلاصہ"]
        if any(kw in q_low for kw in generic_my_kw):
            parts = []
            profile = sections.get("Citizen Profile", [])
            if profile:
                for p in profile:
                    if "Name:" in p:
                        parts.append(f"👋 Welcome, **{p.split(':',1)[1].strip()}**!")
                    elif "CNIC:" in p and "Not" not in p:
                        parts.append(f"🆔 CNIC: {p.split(':',1)[1].strip()}")

            docs = sections.get("My Documents (Wallet)", [])
            vehicles = sections.get("My Vehicles", [])
            challans = sections.get("My Challans", [])
            payments = sections.get("My Payments", [])
            family = sections.get("My Family Members", [])
            programs = sections.get("My Enrolled/Eligible Programs", [])

            summary_parts = []
            if docs:
                expired = sum(1 for d in docs if "expired" in d.lower() and "expiring" not in d.lower())
                summary_parts.append(f"📄 **{len(docs)} documents**" + (f" ({expired} need renewal)" if expired else ""))
            if vehicles:
                summary_parts.append(f"🚗 **{len(vehicles)} vehicles**")
            if challans:
                pending_c = sum(1 for c in challans if "Pending" in c)
                if pending_c:
                    summary_parts.append(f"🔴 **{pending_c} pending challans**")
                else:
                    summary_parts.append(f"✅ **{len(challans)} challans** (all paid)")
            if payments:
                pending_p = sum(1 for p in payments if "Paid" not in p)
                if pending_p:
                    summary_parts.append(f"💳 **{pending_p} pending payments**")
            if family:
                summary_parts.append(f"👨‍👩‍👧 **{len(family)} family members**")
            if programs:
                summary_parts.append(f"🎓 **{len(programs)} programs**")

            if summary_parts:
                return "\n\n".join(parts) + "\n\n**Your account at a glance:**\n" + "\n".join(f"  {s}" for s in summary_parts) + "\n\n---\nAsk me about any of these for more details!"
            return "Your account is set up! Start by adding documents, vehicles, or family members to see your personalized overview here."

        # ── Help ──
        if match_category(help_kw):
            if is_ur:
                return ("میں آپ کی ان چیزوں میں مدد کر سکتا ہوں:\n\n"
                        "📄 **دستاویزات** — پاسپورٹ، شناختی کارڈ، SECP رجسٹریشن\n"
                        "🚗 **گاڑیاں** — ٹوکن ٹیکس، رجسٹریشن\n"
                        "🔴 **چالان** — ٹریفک جرمانے\n"
                        "💳 **ادائیگیاں** — فیس، بل، ٹیکس\n"
                        "👨‍👩‍👧 **خاندان** — ممبران، پروگرام\n"
                        "📋 **چیک لسٹ** — عمل کی پیشرفت\n\n"
                        "بس مجھ سے سوال پوچھیں — میں آپ کا ڈیٹا دیکھ کر جواب دوں گا!")
            return ("Here's what I can help with — I'll use **your actual data** to answer:\n\n"
                    "📄 **Documents** — Passport, CNIC, SECP registration, expiry tracking\n"
                    "🚗 **Vehicles** — Token tax, registration status\n"
                    "🔴 **Challans** — Pending/paid traffic fines\n"
                    "💳 **Payments** — Fees, taxes, bills, overdue tracking\n"
                    "👨‍👩‍👧 **Family** — Members, programs, eligibility\n"
                    "📋 **Checklists** — Step-by-step progress\n\n"
                    "Just ask me anything about your account!")

    # ── No user context — use KB chunks ──
    if not context_chunks:
        return ("I don't have verified information on this. Please check the official website or visit the relevant office."
                if not is_ur else
                "میرے پاس اس بارے میں تصدیق شدہ معلومات نہیں ہیں۔ براہ کرم سرکاری ویب سائٹ دیکھیں یا متعلقہ دفتر سے رابطہ کریں۔")

    # ── KB-based answers ──
    if any(k in q_low for k in ["passport", "پاسپورٹ"]):
        body = (
            "### 🛂 Passport Requirements\n\n"
            "**Documents needed:**\n"
            "● Original CNIC / Smart CNIC\n"
            "● B-Form (if under 18)\n"
            "● Passport photographs (white background)\n"
            "● Previous passport (if any)\n"
            "● Fee payment receipt\n\n"
            "**Process:**\n"
            "① Online form at DGIP → ② Fee at National Bank → ③ Appointment → ④ Center visit (biometrics) → ⑤ Verification & delivery\n\n"
            "**Fees:** Normal ~PKR 3,000 | Urgent ~PKR 5,000\n\n"
            "_Source: DGIP Official Website_"
            if not is_ur else
            "### 🛂 پاسپورٹ کی ضروریات\n\n"
            "**دستاویزات:**\n"
            "● اصل CNIC / Smart CNIC\n"
            "● B-Form (اگر 18 سال سے کم)\n"
            "● پاسپورٹ تصاویر (سفید پس منظر)\n"
            "● پچھلا پاسپورٹ (اگر ہے)\n"
            "● فیس کی رسید\n\n"
            "**عمل:**\n"
            "① DGIP پر آن لائن فارم → ② نیشنل بینک میں فیس → ③ اپائنٹمنٹ → ④ مرکز کا دورہ (بائیومیٹرکس) → ⑤ تصدیق اور ترسیل\n\n"
            "**فیس:** عام ~PKR 3,000 | فوری ~PKR 5,000\n\n"
            "_ذریعہ: DGIP سرکاری ویب سائٹ_"
        )
    elif any(k in q_low for k in ["cnic", "شناختی کارڈ"]):
        body = (
            "### 🪪 CNIC (National Identity Card)\n\n"
            "**Required:**\n"
            "● B-Form / CRC\n"
            "● Parent/Guardian CNIC copy\n"
            "● Photographs\n"
            "● NADRA fee (Normal ~PKR 1,000, Urgent ~PKR 2,000)\n\n"
            "**Process:** Visit NADRA Center → Biometrics → Token tracking\n\n"
            "_Source: NADRA Official Website_"
            if not is_ur else
            "### 🪪 شناختی کارڈ\n\n"
            "**ضروری:**\n"
            "● B-Form / CRC\n"
            "● والد/سرپرست CNIC کاپی\n"
            "● تصاویر\n"
            "● نادرا فیس (عام ~PKR 1,000، فوری ~PKR 2,000)\n\n"
            "**عمل:** نادرا سینٹر → بائیومیٹرکس → ٹوکن ٹریکنگ\n\n"
            "_ذریعہ: نادرا سرکاری ویب سائٹ_"
        )
    elif any(k in q_low for k in ["business", "secp", "company", "کاروبار"]):
        body = (
            "### 🏢 SECP Business Registration\n\n"
            "**Required:**\n"
            "● CNIC of directors\n"
            "● Name availability (SECP eServices)\n"
            "● Memorandum & Articles\n"
            "● Address proof\n"
            "● SECP fee challan\n\n"
            "_Source: SECP Official Website_"
            if not is_ur else
            "### 🏢 SECP کاروبار رجسٹریشن\n\n"
            "**ضروری:**\n"
            "● ڈائریکٹرز کے CNIC\n"
            "● نام کی دستیابی (eServices)\n"
            "● یادداشت و ضوابط\n"
            "● پتہ کا ثبوت\n"
            "● SECP فیس چالان\n\n"
            "_ذریعہ: SECP سرکاری ویب سائٹ_"
        )
    else:
        ctx = context_chunks[0].get("text", "")[:500]
        body = f"Based on official sources:\n\n{ctx}"
    source = context_chunks[0].get("source", "Official")
    prefix = "[DEMO — set GEMINI_API_KEY for live Gemini]\n\n" if not settings.gemini_api_key else ""
    return f"{prefix}{body}"


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
