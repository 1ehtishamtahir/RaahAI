"""
LLM Router — Routes to different Gemini configurations based on intent.
Same API key, same model, three different system prompts:
  - DB_ROLE: For database-grounded answers (status, records, amounts)
  - RAG_ROLE: For knowledge base answers (procedures, requirements, policies)
  - GENERAL_ROLE: For casual chat, greetings, general questions
"""
from typing import List, Dict, Optional
from app.core.config import get_settings
from app.services.intent_classifier import Intent

settings = get_settings()

# ── Check Gemini availability ────────────────────────────────────────
HAS_GENAI = False
HAS_NEW_GENAI = False
new_genai_client = None
try:
    from google import genai as new_genai
    HAS_NEW_GENAI = True
    HAS_GENAI = True
except Exception:
    try:
        import google.generativeai as genai
        HAS_GENAI = True
    except Exception:
        genai = None
        HAS_GENAI = False


# ── System Prompts per Role ──────────────────────────────────────────

DB_SYSTEM_PROMPT = """You are RaahAI — a Citizen Portal assistant answering from DATABASE records.

CRITICAL RULES:
1. Answer ONLY from the DATABASE RESULTS provided below.
2. NEVER invent, guess, or assume record IDs, statuses, amounts, dates, or officer names.
3. If DATABASE RESULTS say "No records found", say exactly: "I couldn't find any matching records in your account." (or Urdu equivalent).
4. NEVER say "your complaint is probably under review" or make up plausible statuses.
5. Format answers with clear headings and bullet points.
6. Use the citizen's name from their profile when addressing them.
7. Never expose SQL, database schema, API keys, or internal system details.
8. Respond in the same language/script as the user (English, Roman Urdu, or Urdu script).

TONE: Helpful, precise, professional. Citizens want facts — give them facts from the data.
"""

RAG_SYSTEM_PROMPT = """You are RaahAI — a Citizen Portal assistant answering from official government documents.

CRITICAL RULES:
1. Answer ONLY from the KNOWLEDGE BASE provided below.
2. NEVER invent fees, steps, requirements, or procedures not in the context.
3. If the context doesn't contain the answer, say: "I don't have verified information on this. Please check the official website or visit the relevant office." (or Urdu equivalent).
4. Always cite the Source from the context metadata.
5. Structure answers with markdown headings: ### Required Documents, ### Process, ### Fees, etc.
6. Max 5 bullets per section. Keep it scannable.
7. Never expose internal system details.
8. Respond in the same language/script as the user.

TONE: Clear, structured, trustworthy. Like a helpful government guide.
"""

GENERAL_SYSTEM_PROMPT = """You are RaahAI — a friendly, casual Citizen Portal assistant for Pakistani citizens.

IDENTITY: You help citizens navigate government services (Passport, CNIC, Business Registration).
You are NOT human, NADRA, DGIP, or SECP. You translate bureaucracy into plain language.

RULES:
1. For greetings: respond warmly, match language/script. Keep it brief.
2. For general questions about the portal: explain what services are available.
3. For out-of-scope questions (weather, cricket, etc.): politely redirect to government services.
4. Respond in the same language/script as the user.
5. Use 'aap' (formal you) in Urdu.
6. Never claim to be human or make promises about government actions.

TONE: Friendly, helpful, casual. Like a knowledgeable friend who knows government processes.
"""


# ── Role selection by intent ─────────────────────────────────────────

def get_role_for_intent(intent: Intent) -> str:
    """Map intent to LLM role."""
    if intent == Intent.DATABASE_QUERY:
        return "db"
    elif intent == Intent.RAG_QUERY:
        return "rag"
    elif intent == Intent.HYBRID_QUERY:
        return "db"  # DB takes priority for hybrid
    else:
        return "general"


ROLE_PROMPTS = {
    "db": DB_SYSTEM_PROMPT,
    "rag": RAG_SYSTEM_PROMPT,
    "general": GENERAL_SYSTEM_PROMPT,
}


# ── Gemini call with role-specific prompt ────────────────────────────

def _call_gemini_with_role(
    query: str,
    context_chunks: List[Dict],
    lang: str = "en",
    history: list = None,
    user_context: str = "",
    role: str = "general",
) -> str:
    """Call Gemini with a role-specific system prompt."""
    system_prompt = ROLE_PROMPTS.get(role, GENERAL_SYSTEM_PROMPT)

    # Build the full prompt with context
    from app.services.gemini import _build_prompt
    prompt = _build_prompt(query, context_chunks, lang, history=history, user_context=user_context)

    if not HAS_GENAI or not settings.gemini_api_key:
        from app.services.gemini import _mock_answer
        return _mock_answer(query, context_chunks, lang, user_context=user_context)

    # Try new SDK first
    if HAS_NEW_GENAI:
        try:
            from google.genai import types
            client = new_genai.Client(api_key=settings.gemini_api_key)
            resp = client.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.3,
                    top_p=0.8,
                    max_output_tokens=800,
                ),
            )
            text = getattr(resp, "text", None)
            if not text and resp.candidates:
                text = resp.candidates[0].content.parts[0].text
            if text and text.strip():
                return text.strip()
        except Exception as e:
            print(f"[llm_router] new SDK failed ({role}): {e}")

    # Legacy fallback
    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(settings.gemini_model, system_instruction=system_prompt)
        resp = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(temperature=0.3, top_p=0.8, max_output_tokens=800),
        )
        if resp.candidates and resp.text:
            return resp.text.strip()
    except Exception as e:
        print(f"[llm_router] legacy SDK failed ({role}): {e}")

    # Final fallback to mock
    from app.services.gemini import _mock_answer
    return _mock_answer(query, context_chunks, lang, user_context=user_context)


# ── Public API ───────────────────────────────────────────────────────

def call_llm_by_intent(
    query: str,
    context_chunks: List[Dict],
    intent: Intent,
    lang: str = "en",
    history: list = None,
    user_context: str = "",
) -> str:
    """
    Route to the appropriate Gemini configuration based on intent.
    Same API key, same model — different system prompts.
    """
    role = get_role_for_intent(intent)
    return _call_gemini_with_role(
        query=query,
        context_chunks=context_chunks,
        lang=lang,
        history=history,
        user_context=user_context,
        role=role,
    )
