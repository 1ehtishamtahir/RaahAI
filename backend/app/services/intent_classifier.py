"""
Intent classifier for user questions.
Classifies questions into: DATABASE_QUERY, RAG_QUERY, HYBRID_QUERY, GENERAL_QUERY
Uses keyword/pattern matching — no LLM call needed for classification.
"""
import re
from typing import Dict, List, Tuple
from enum import Enum


class Intent(str, Enum):
    DATABASE_QUERY = "DATABASE_QUERY"
    RAG_QUERY = "RAG_QUERY"
    HYBRID_QUERY = "HYBRID_QUERY"
    GENERAL_QUERY = "GENERAL_QUERY"


# ── Keywords that indicate the user wants their own data ──────────────
DB_INDICATORS = {
    # Status queries
    "status", " statuses",
    # Ownership/possession
    "my", "mine", "i have", "i got", "do i have", "do i own",
    "میرا", "میری", "میرے", "مجھے",
    # Record queries
    "record", "records", "show", "list", "display", "display",
    "چاہیے", "دکھائیں", "لسٹ",
    # Specific IDs (will be extracted)
    "complaint", "complaints", "application", "applications",
    "چالان", "درخواست",
    # Status words
    "pending", "paid", "overdue", "expired", "expiring",
    "جاری", "ادا شدہ", "زائد", "م熄",
    # Assignment
    "assigned", "officer", "handling", "department",
    "افیسر", "محکمہ",
    # Counting
    "how many", "kitne", "kitni",
    # Payment/fee status
    "due", "owe", "pay", "payment", "bill",
    "ادائیگی", "فیس",
    # Vehicle-specific
    "vehicle", "car", "bike", "token", "registration",
    "گاڑی", "موٹر", "ٹوکن",
    # Family
    "family", "member", "dependent",
    "خاندان", "ممبر",
    # Program
    "program", "scheme", "enrolled", "eligible",
    "پروگرام", "اسکیم",
    # Document wallet
    "document", "documents", "wallet", "passport status", "cnic status",
    "دستاویز", "دستاویزات",
    # Checklist
    "checklist", "progress", "steps completed",
    "چیک لسٹ", "پیشرفت",
}

# ── Keywords that indicate the user wants general knowledge ───────────
RAG_INDICATORS = {
    # Procedure/process
    "how to", "how do", "how can", "what is the process",
    "کیسے", "طریقہ", "عمل",
    # Requirements
    "required", "requirements", "documents needed", "documents required",
    "ضروری", "دستاویزات", "چاہیے",
    # Fees (general, not specific payment)
    "fee", "cost", "price", "charges",
    "فیس", "قیمت",
    # Rules/policy
    "rule", "rules", "policy", "guideline", "regulation",
    "قانون", "qpolicy",
    # Eligibility
    "eligible", "eligibility", "qualify",
    "اہلیت",
    # Government services
    "passport", "cnic", "nadra", "dgip", "secp",
    "پاسپورٹ", "شناختی", "نادرا",
    # General procedure
    "apply", "application process", "renew", "renewal",
    "درخواست", "تجدید",
    # Office
    "office", "center", "centre", "location",
    "دفتر", "مرکز",
    # General document requirements
    "what documents", "which documents", "kya documents",
    "kya dastavez", "konsay documents",
}

# ── Patterns that strongly indicate specific IDs ─────────────────────
ID_PATTERNS = [
    r'\b[A-Z]{2,3}-\d{3,8}\b',       # CP-1024, APP-12345, VEH-123
    r'\b\d{5,13}\b',                   # Numeric IDs (CNIC-like)
    r'\b[A-Z]{2}\d{4,8}\b',           # AB123456
    r'\b(?:complaint|application|challan|payment)\s+(?:id\s+)?(\S+)\b',
]


def classify_intent(query: str, history: list = None) -> Dict:
    """
    Classify the user's question intent.
    
    Returns:
        {
            "intent": Intent,
            "confidence": float (0-1),
            "reasons": list[str],
            "extracted_entities": dict,
        }
    """
    q_low = query.lower().strip()
    reasons = []
    db_score = 0
    rag_score = 0
    
    # Check for ID patterns (strong DB indicator)
    for pattern in ID_PATTERNS:
        if re.search(pattern, query, re.IGNORECASE):
            db_score += 3
            reasons.append(f"Contains ID pattern: {re.search(pattern, query, re.IGNORECASE).group()}")
            break
    
    # Check DB indicators
    for indicator in DB_INDICATORS:
        if indicator in q_low:
            db_score += 1
            reasons.append(f"DB indicator: '{indicator}'")
    
    # Check RAG indicators
    for indicator in RAG_INDICATORS:
        if indicator in q_low:
            rag_score += 1
            reasons.append(f"RAG indicator: '{indicator}'")
    
    # Override: if asking about "documents needed/required" it's RAG, not DB
    doc_need_patterns = ["documents needed", "documents required", "what documents", "which documents",
                        "kya documents", "kya dastavez", "konsay documents", "dastavez chahiye"]
    if any(pattern in q_low for pattern in doc_need_patterns):
        # This is a knowledge question, not a database query
        rag_score += 3
        db_score = max(0, db_score - 2)  # Reduce DB score
        reasons.append("Document requirements query -> RAG")
    
    # Check for follow-up questions (conversation context)
    if history and len(history) > 0:
        last_assistant = None
        for msg in reversed(history):
            if msg.get("role") == "assistant":
                last_assistant = msg.get("content", "")
                break
        if last_assistant:
            follow_up_words = ["it", "that", "this", "them", "those", "who", "which",
                             "اس", "یہ", "وہ", "ان", "kon", "konsa", "konsay"]
            for word in follow_up_words:
                if word in q_low:
                    db_score += 2
                    reasons.append(f"Follow-up question detected (refers to previous context)")
                    break
    
    # Classify based on scores
    if db_score > 0 and rag_score > 0:
        intent = Intent.HYBRID_QUERY
        confidence = min(0.9, 0.5 + (db_score + rag_score) * 0.05)
    elif db_score > rag_score and db_score >= 2:
        intent = Intent.DATABASE_QUERY
        confidence = min(0.9, 0.5 + db_score * 0.05)
    elif rag_score > 0 and db_score == 0:
        intent = Intent.RAG_QUERY
        confidence = min(0.9, 0.5 + rag_score * 0.05)
    elif db_score > 0 and rag_score == 0:
        intent = Intent.DATABASE_QUERY
        confidence = min(0.85, 0.5 + db_score * 0.05)
    else:
        intent = Intent.GENERAL_QUERY
        confidence = 0.4
    
    return {
        "intent": intent,
        "confidence": confidence,
        "reasons": reasons[:5],  # Top 5 reasons
        "db_score": db_score,
        "rag_score": rag_score,
    }


def detect_language(query: str) -> str:
    """Detect if the query is in Urdu script, Roman Urdu, or English."""
    # Check for Urdu script (Unicode > 1500)
    urdu_chars = sum(1 for c in query if ord(c) > 1500)
    if urdu_chars > len(query) * 0.3:
        return "ur"
    
    # Check for Roman Urdu indicators
    roman_indicators = ["kya", "hai", "kaise", "kahan", "kab", "kaun", "mera", "meri",
                       "mujhe", "chahiye", "batao", "hain", "ho", "tho", "phir", "abhi",
                       "yeh", "woh", "mein", "ko", "se", "ke", "ka", "ki", "par", "aur",
                       "ya", "lekin", "magar", "kyun", "banwana", "renew", "fee", "kitni",
                       "kitna", "pass", "wala", "wali", "konsa", "konsay", "kis", "kise",
                       "kya hai", "kya karna hai", "kaise hai"]
    words = query.lower().split()
    matches = sum(1 for w in words if w in roman_indicators)
    if matches >= 2:
        return "ur"
    
    return "en"


def is_greeting(query: str) -> bool:
    """Check if the query is just a greeting/thanks."""
    q_low = query.lower().strip()
    # Also handle hyphenated greetings like "assalam-o-alaikum"
    q_normalized = q_low.replace("-", " ").replace("  ", " ")
    greeting_words = {"hello", "hi", "salam", "assalam", "walaikum", "alaikum", "thanks", "thank",
                     "shukriya", "bye", "good", "hey"}
    words = q_normalized.split()
    return any(w in greeting_words for w in words) and len(words) <= 6


def is_out_of_domain(query: str) -> bool:
    """Check if the query is completely outside the portal's scope."""
    q_low = query.lower().strip()
    out_of_domain = [
        "weather", "cricket", "score", "news", "movie", "song", "music",
        "recipe", "cook", "game", "play", "stock", "market", "bitcoin",
        "anime", "movie", "film", "youtube", "tiktok", "instagram",
        "mausam", "cricket", "khabar", "film", "gaana",
    ]
    return any(word in q_low for word in out_of_domain) and not any(
        indicator in q_low for indicator in DB_INDICATORS | RAG_INDICATORS
    )
