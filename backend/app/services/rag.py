from typing import List, Dict, Tuple
from app.services.vectorstore import search

# Prefer Gemini, fallback to Qwen mock if gemini not available
try:
    from app.services.gemini import call_gemini as call_llm
except Exception:
    from app.services.qwen import call_qwen as call_llm

# Grounding threshold — if no chunk passes, we refuse to answer
MIN_CHUNKS = 1

async def rag_answer(query: str, lang: str = "en") -> Tuple[str, List[Dict], bool]:
    """
    RAG pipeline: query -> vector search -> LLM with context.
    Returns (answer, citations, grounded)
    """
    # Greeting / small-talk: handle without RAG (no citations, but friendly, not fallback)
    import re
    q_low = query.lower().strip()
    q_tokens = re.findall(r"\b\w+\b", q_low, flags=re.UNICODE)
    greeting_words = {"hello", "hi", "salam", "assalam", "walaikum", "thanks", "thank", "shukriya", "bye", "good", "السلام", "وعلیکم", "شکریہ"}
    is_greeting = any(w in greeting_words for w in q_tokens) and len(q_tokens) <= 5
    # If pure greeting (no domain keywords), return warm greeting directly
    domain_present = any(w in {"passport","cnic","secp","nadra","dgip","document","fee","پاسپورٹ","شناختی","کارڈ"} for w in q_tokens) or "passport" in q_low or "cnic" in q_low or "پاسپورٹ" in query
    if is_greeting and not domain_present:
        # Thanks has priority over hello
        if any(w in q_tokens for w in ["thanks", "thank", "shukriya", "شکریہ"]):
            if lang == "ur" or any(ord(c) > 1500 for c in query):
                return "خوش آمدید! مزید مدد چاہیے؟ پاسپورٹ، شناختی کارڈ یا کاروبار کے بارے میں پوچھیں۔", [], False
            return "You're welcome! Happy to help — need anything else about Passport, CNIC or Business Registration?", [], False
        if lang == "ur" or any(ord(c) > 1500 for c in query):
            return "وعلیکم السلام! میں راہ AI ہوں — پاسپورٹ، شناختی کارڈ یا کاروبار رجسٹریشن میں کیسے مدد کر سکتا ہوں؟", [], False
        return "Walaikum Assalam! I'm RaahAI — your guide to Passport, CNIC and Business Registration. Ask me in Urdu or English.", [], False

    chunks = await search(query, top_k=4)
    if len(chunks) < MIN_CHUNKS:
        fallback = "I don't have verified information on this. Please check the official website or visit the relevant office."
        if lang == "ur":
            fallback = "میرے پاس اس بارے میں تصدیق شدہ معلومات نہیں ہیں۔ براہ کرم سرکاری ویب سائٹ دیکھیں یا متعلقہ دفتر سے رابطہ کریں۔"
        return fallback, [], False

    answer = call_llm(query, chunks, lang=lang)
    # If LLM correctly says no verified info, strip citations and mark ungrounded
    fallback_phrases = [
        "don't have verified information",
        "don't have verified information on this",
        "میرے پاس اس بارے میں تصدیق شدہ معلومات نہیں",
        "تصدیق شدہ معلومات نہیں",
    ]
    if any(p.lower() in answer.lower() for p in fallback_phrases):
        return answer, [], False
    # Deduplicate citations by title
    seen = set()
    deduped = []
    for c in chunks:
        t = c["source"]
        if t not in seen:
            seen.add(t)
            deduped.append({"title": t, "snippet": c["text"][:200]})
    citations = deduped
    return answer, citations, True
