from typing import List, Dict, Tuple
from app.services.vectorstore import search

try:
    from app.services.gemini import call_gemini as call_llm
except Exception:
    from app.services.qwen import call_qwen as call_llm

MIN_CHUNKS = 1

ROMAN_URDU_MAP = {
    "kya": "کیا",
    "hai": "ہے",
    "kaise": "کیسے",
    "kahan": "کہاں",
    "kab": "کب",
    "kaun": "کون",
    "mera": "میرا",
    "meri": "میری",
    "mujhe": "مجھے",
    "chahiye": "چاہیے",
    "batao": "بتاؤ",
    "bhai": "بھائی",
    "bhaiya": "بھائیا",
    "yaar": "یار",
    "acha": "اچھا",
    "theek": "ٹھیک",
    "theek hai": "ٹھیک ہے",
    "acha hai": "اچھا ہے",
    "please": "براہ کرم",
    "shukriya": "شکریہ",
    "hello": "السلام علیکم",
    "hi": "السلام علیکم",
    "pass": "پاس",
    "wala": "والا",
    "wali": "والی",
    "wale": "والے",
    "hain": "ہیں",
    "ho": "ہو",
    "tho": "تو",
    "phir": "پھر",
    "abhi": "ابھی",
    "yeh": "یہ",
    "woh": "وہ",
    "yahan": "یہاں",
    "wahan": "وہاں",
    "saath": "ساتھ",
    "mein": "میں",
    "ko": "کو",
    "se": "سے",
    "ke": "کے",
    "ka": "کا",
    "ki": "کی",
    "par": "پر",
    "aur": "اور",
    "ya": "یا",
    "lekin": "لیکن",
    "magar": "مگر",
    "kyun": "کیوں",
    "kyn": "کیوں",
    "kion": "کیوں",
    "kis": "کس",
    "kya hai": "کیا ہے",
    "kya karna hai": "کیا کرنا ہے",
    "kaise hai": "کیسے ہو",
    "passport": "پاسپورٹ",
    "passport banwana hai": "پاسپورٹ بنوانا ہے",
    "passport renew": "پاسپورٹ رینیو",
    "passport renewal": "پاسپورٹ رینیو",
    "passport fee": "پاسپورٹ فیس",
    "cnic": "شناختی کارڈ",
    "shanakhti card": "شناختی کارڈ",
    "nadra": "نادرا",
    "secp": "ایس ای سی پی",
    "business": "کاروبار",
    "company": "کمپنی",
    "documents": "دستاویزات",
    "documents chahiye": "دستاویزات چاہیے",
    "fee": "فیس",
    "kitni": "کتنی",
    "kitna": "کتنا",
    "kya": "کیا",
}

def detect_roman_urdu(query: str) -> bool:
    q = query.lower().strip()
    roman_indicators = ["kya", "hai", "kaise", "kahan", "kab", "kaun", "mera", "meri", "mujhe", "chahiye", "batao", "hain", "ho", "tho", "phir", "abhi", "yeh", "woh", "mein", "ko", "se", "ke", "ka", "ki", "par", "aur", "ya", "lekin", "magar", "kyun", "banwana", "renew", "fee", "kitni", "kitna", "pass", "wala", "wali"]
    words = q.split()
    matches = sum(1 for w in words if w in roman_indicators)
    return matches >= 2

def roman_to_urdu_script(query: str) -> str:
    result = query
    for roman, urdu in sorted(ROMAN_URDU_MAP.items(), key=lambda x: -len(x[0])):
        result = result.replace(roman, urdu)
    return result

async def rag_answer(query: str, lang: str = "en", history: list = None, user_context: str = "") -> Tuple[str, List[Dict], bool]:
    import re
    q_low = query.lower().strip()
    q_tokens = re.findall(r"\b\w+\b", q_low, flags=re.UNICODE)

    is_roman_urdu = detect_roman_urdu(query)
    if is_roman_urdu and lang == "en":
        lang = "ur"
        query = roman_to_urdu_script(query)

    greeting_words = {"hello", "hi", "salam", "assalam", "walaikum", "thanks", "thank", "shukriya", "bye", "good", "السلام", "وعلیکم", "شکریہ"}
    is_greeting = any(w in greeting_words for w in q_tokens) and len(q_tokens) <= 5
    domain_present = any(w in {"passport","cnic","secp","nadra","dgip","document","fee","پاسپورٹ","شناختی","کارڈ"} for w in q_tokens) or "passport" in q_low or "cnic" in q_low or "پاسپورٹ" in query
    if is_greeting and not domain_present:
        if any(w in q_tokens for w in ["thanks", "thank", "shukriya", "شکریہ"]):
            if lang == "ur" or any(ord(c) > 1500 for c in query):
                return "خوش آمدید! مزید مدد چاہیے؟ پاسپورٹ، شناختی کارڈ یا کاروبار کے بارے میں پوچھیں۔", [], False
            return "You're welcome! Happy to help — need anything else about Passport, CNIC or Business Registration?", [], False
        if lang == "ur" or any(ord(c) > 1500 for c in query):
            return "وعلیکم السلام! میں راہ AI ہوں — پاسپورٹ، شناختی کارڈ یا کاروبار رجسٹریشن میں کیسے مدد کر سکتا ہوں؟", [], False
        return "Walaikum Assalam! I'm RaahAI — your guide to Passport, CNIC and Business Registration. Ask me in Urdu or English.", [], False

    chunks = await search(query, top_k=4)
    if len(chunks) < MIN_CHUNKS:
        # If user has personal data, always try to answer from it
        if user_context:
            answer = call_llm(query, [], lang=lang, history=history, user_context=user_context)
            # If the answer contains real data (not a generic fallback), return it
            fallback_phrases = [
                "don't have verified information",
                "don't have verified information on this",
                "میرے پاس اس بارے میں تصدیق شدہ معلومات نہیں",
                "تصدیق شدہ معلومات نہیں",
            ]
            if not any(p.lower() in answer.lower() for p in fallback_phrases):
                return answer, [{"title": "Your Account Data", "snippet": "Personal data from your RaahAI profile"}], True
            # Even if LLM returned fallback, we have user data — return it anyway
            answer = call_llm(query, [], lang=lang, history=history, user_context=user_context)
            return answer, [{"title": "Your Account Data", "snippet": "Personal data from your RaahAI profile"}], True
        fallback = "I don't have verified information on this. Please check the official website or visit the relevant office."
        if lang == "ur":
            fallback = "میرے پاس اس بارے میں تصدیق شدہ معلومات نہیں ہیں۔ براہ کرم سرکاری ویب سائٹ دیکھیں یا متعلقہ دفتر سے رابطہ کریں۔"
        return fallback, [], False

    answer = call_llm(query, chunks, lang=lang, history=history, user_context=user_context)
    fallback_phrases = [
        "don't have verified information",
        "don't have verified information on this",
        "میرے پاس اس بارے میں تصدیق شدہ معلومات نہیں",
        "تصدیق شدہ معلومات نہیں",
    ]
    # If we have user context, never return the fallback — answer from user data
    if any(p.lower() in answer.lower() for p in fallback_phrases):
        if user_context:
            answer = call_llm(query, [], lang=lang, history=history, user_context=user_context)
            return answer, [{"title": "Your Account Data", "snippet": "Personal data from your RaahAI profile"}], True
        return answer, [], False
    seen = set()
    deduped = []
    for c in chunks:
        t = c["source"]
        if t not in seen:
            seen.add(t)
            deduped.append({"title": t, "snippet": c["text"][:200]})
    citations = deduped
    return answer, citations, True
