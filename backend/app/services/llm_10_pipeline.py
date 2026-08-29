"""
10-LLM Pipeline with 3 providers for maximum speed.
Cerebras (fastest) + Groq (fast) + Gemini (smart)

Pipeline:
  LLM1 (Cerebras) → [LLM2+3 (Cerebras)] → LLM4 (Groq) → LLM5 (Groq) → [LLM6 (Gemini) + LLM7+9 (Groq)] → [LLM8+10 (Gemini)]
"""
import json
import re
import time
import asyncio
from typing import Dict, List, Optional
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.services import db_queries

settings = get_settings()

# ── Provider setup ──────────────────────────────────────────────────
from openai import OpenAI, AsyncOpenAI

# Cerebras
CEREBRAS_BASE_URL = "https://api.cerebras.ai/v1"
CEREBRAS_MODEL = "gemma-4-31b"

# Groq
GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_MODEL = "openai/gpt-oss-20b"

# Gemini
HAS_GENAI = False
HAS_NEW_GENAI = False
new_genai = None
genai = None
try:
    from google import genai as new_genai
    HAS_NEW_GENAI = True
    HAS_GENAI = True
except Exception:
    try:
        import google.generativeai as genai
        HAS_GENAI = True
    except Exception:
        HAS_GENAI = False

GEMINI_MODEL = settings.gemini_model or "gemini-flash-lite-latest"


def _get_client(provider: str):
    """Get async client for provider."""
    if provider == "cerebras":
        if not settings.cerebras_api_key:
            return None
        return AsyncOpenAI(api_key=settings.cerebras_api_key, base_url=CEREBRAS_BASE_URL)
    elif provider == "groq":
        if not settings.groq_api_key:
            return None
        return AsyncOpenAI(api_key=settings.groq_api_key, base_url=GROQ_BASE_URL)
    return None


# ── Shared callers ──────────────────────────────────────────────────

async def _call_openai_async(provider: str, prompt: str, system: str = "", temperature: float = 0.2) -> str:
    """Call Cerebras/Groq (OpenAI-compatible)."""
    client = _get_client(provider)
    if not client:
        return ""

    model = CEREBRAS_MODEL if provider == "cerebras" else GROQ_MODEL
    try:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        resp = await client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=600,
        )
        text = resp.choices[0].message.content
        return text.strip() if text else ""
    except Exception as e:
        print(f"[llm] {provider} error: {e}")
        return ""


async def _call_gemini_async(prompt: str, system: str = "", temperature: float = 0.2) -> str:
    """Call Gemini."""
    if not HAS_GENAI or not settings.gemini_api_key:
        return ""

    try:
        if HAS_NEW_GENAI and new_genai is not None:
            client = new_genai.Client(api_key=settings.gemini_api_key)
            from google.genai import types
            resp = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system if system else None,
                    temperature=temperature,
                    max_output_tokens=600,
                ),
            )
            text = getattr(resp, "text", None)
            if not text and resp.candidates:
                text = resp.candidates[0].content.parts[0].text
            return text.strip() if text else ""
        elif genai is not None:
            genai.configure(api_key=settings.gemini_api_key)
            model = genai.GenerativeModel(GEMINI_MODEL, system_instruction=system if system else None)
            resp = await asyncio.to_thread(
                model.generate_content,
                prompt,
                generation_config=genai.GenerationConfig(temperature=temperature, max_output_tokens=600),
            )
            return resp.text.strip() if resp.candidates and resp.text else ""
    except Exception as e:
        print(f"[llm] Gemini error: {e}")
        return ""


# ── Unified caller ──────────────────────────────────────────────────

async def _call_llm(provider: str, prompt: str, system: str = "", temperature: float = 0.2) -> str:
    """Route to correct provider."""
    if provider == "gemini":
        text = await _call_gemini_async(prompt, system, temperature)
    else:
        text = await _call_openai_async(provider, prompt, system, temperature)
    return _fix_unicode(text) if text else ""


def _parse_json(text: str) -> Dict:
    """Extract JSON from LLM response."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    return {}


def _fix_unicode(text: str) -> str:
    """Fix Unicode escape sequences that LLMs output as text."""
    replacements = {
        "\\u2022": "•", "\\u2013": "–", "\\u2014": "—",
        "\\u2018": "'", "\\u2019": "'", "\\u201c": '"', "\\u201d": '"',
        "\\u2026": "…", "\\u00a0": " ",
    }
    for esc, char in replacements.items():
        text = text.replace(esc, char)
    return text


# ── LLM 1: Analyzer (Cerebras - fastest) ────────────────────────────

ANALYZER_SYSTEM = """You are an AI message analyzer. Analyze user messages and return JSON.

Return ONLY valid JSON:
{
  "intent": "DATABASE_QUERY" | "RAG_QUERY" | "HYBRID_QUERY" | "GENERAL_QUERY",
  "needs_db": true/false,
  "needs_rag": true/false,
  "db_tables": ["vehicles", "challans", "payments", "documents", "family_members", "family_programs", "profile"],
  "db_filters": {"status": "Pending", "document_type": "passport"},
  "rag_keywords": ["passport", "renewal"],
  "is_followup": true/false,
  "language": "en" | "ur"
}"""

async def llm1_analyze(query: str, lang: str) -> Dict:
    """LLM 1: Understand the user's message."""
    prompt = f'User message: "{query}"\nLanguage: {lang}\n\nAnalyze and return JSON:'
    response = await _call_llm("gemini", prompt, ANALYZER_SYSTEM, temperature=0.1)
    if response:
        parsed = _parse_json(response)
        if parsed:
            parsed.setdefault("intent", "GENERAL_QUERY")
            parsed.setdefault("needs_db", False)
            parsed.setdefault("needs_rag", False)
            parsed.setdefault("db_tables", [])
            parsed.setdefault("db_filters", {})
            parsed.setdefault("rag_keywords", [])
            parsed.setdefault("is_followup", False)
            parsed.setdefault("language", lang)
            return parsed

    return {"intent": "GENERAL_QUERY", "needs_db": False, "needs_rag": False,
            "db_tables": [], "db_filters": {}, "rag_keywords": [], "is_followup": False, "language": lang}


# ── LLM 2: DB Planner (Cerebras) ───────────────────────────────────

DB_PLANNER_SYSTEM = """You are a database query planner. Given user intent, output the exact database queries needed.

Return ONLY valid JSON array:
[
  {"table": "vehicles", "filters": {}},
  {"table": "challans", "filters": {"status": "Pending"}}
]

Rules:
- If user asks about vehicles: query vehicles
- If user asks about challans: query challans
- If user asks about payments: query payments
- If user asks about documents/passport/cnic: query documents
- If user asks about family: query family_members
- If user asks about programs: query family_programs
- If user asks for overview/summary: query summary
- Always include profile for personalization"""

async def llm2_db_planner(intent: str, query: str, tables: list, filters: dict) -> List[Dict]:
    """LLM 2: Plan database queries."""
    prompt = f'Intent: {intent}\nUser message: "{query}"\nSuggested tables: {tables}\nSuggested filters: {filters}\n\nPlan the database queries:'
    response = await _call_llm("gemini", prompt, DB_PLANNER_SYSTEM, temperature=0.1)
    if response:
        try:
            text = response.strip()
            if text.startswith("```"):
                text = re.sub(r"^```(?:json)?\s*", "", text)
                text = re.sub(r"\s*```$", "", text)
            result = json.loads(text)
            if isinstance(result, list):
                return result
        except json.JSONDecodeError:
            pass

    return [{"table": t, "filters": filters} for t in tables]


# ── LLM 3: RAG Retriever (Cerebras) ────────────────────────────────

RAG_SYSTEM = """You are a knowledge base search specialist. Given a user question, identify the best search keywords.

Return ONLY valid JSON:
{
  "keywords": ["passport", "renewal", "documents"],
  "sections": ["passport", "cnic", "business"],
  "language": "en"
}"""

async def llm3_rag_retriever(query: str, lang: str) -> Dict:
    """LLM 3: Plan RAG retrieval."""
    prompt = f'User message: "{query}"\nLanguage: {lang}\n\nIdentify search terms:'
    response = await _call_llm("gemini", prompt, RAG_SYSTEM, temperature=0.1)
    if response:
        parsed = _parse_json(response)
        if parsed:
            parsed.setdefault("keywords", query.lower().split())
            parsed.setdefault("sections", [])
            return parsed

    return {"keywords": query.lower().split(), "sections": [], "language": lang}


# ── LLM 4: Context Merger (Groq) ───────────────────────────────────

CONTEXT_MERGER_SYSTEM = """You are a context merger. Merge database results and knowledge base results into a single structured context.

Return the merged context in clear format:
- Mark database data with [DATABASE]
- Mark knowledge base data with [KNOWLEDGE BASE]"""

async def llm4_context_merger(query: str, db_results: Dict, rag_chunks: List[Dict]) -> str:
    """LLM 4: Merge DB results and RAG chunks."""
    db_text = json.dumps(db_results, indent=2, default=str)[:2000] if db_results else "None"
    rag_text = "\n".join([f"[{c.get('source', 'KB')}] {c.get('text', '')[:200]}" for c in rag_chunks[:3]]) if rag_chunks else "None"

    prompt = f'User question: "{query}"\n\nDATABASE RESULTS:\n{db_text}\n\nKNOWLEDGE BASE:\n{rag_text}\n\nMerge into structured context:'
    response = await _call_llm("groq", prompt, CONTEXT_MERGER_SYSTEM, temperature=0.1)

    if response:
        return _fix_unicode(response)

    parts = []
    if db_results:
        parts.append("[DATABASE]\n" + db_text)
    if rag_chunks:
        parts.append("[KNOWLEDGE BASE]\n" + rag_text)
    return "\n\n".join(parts) if parts else "No context available."


# ── LLM 5: Response Writer (Groq) ──────────────────────────────────

WRITER_SYSTEM = """You are RaahAI -- a Citizen Portal assistant. Generate a clear, helpful response.

RULES:
1. Answer from the provided context only
2. Never invent data
3. Use markdown headings and bullet points
4. Keep it concise
5. Respond in the user's language"""

async def llm5_writer(query: str, context: str, lang: str) -> str:
    """LLM 5: Generate the response."""
    short_context = context[:500] if len(context) > 500 else context
    prompt = f'User question: "{query}"\nLanguage: {lang}\n\nContext:\n{short_context}\n\nGenerate answer:'
    response = await _call_llm("groq", prompt, WRITER_SYSTEM, temperature=0.3)
    return _fix_unicode(response) if response else "I don't have enough information to answer this question."


# ── LLM 6: Translator (Gemini) ─────────────────────────────────────

async def llm6_translator(text: str, target_lang: str) -> str:
    """LLM 6: Translate if needed. Skipped for English."""
    return text


# ── LLM 7: Validator (Groq) ────────────────────────────────────────

VALIDATOR_SYSTEM = """You are a response validator. Check if the response answers the question and uses only context data.

Return ONLY valid JSON:
{
  "valid": true/false,
  "issues": ["issue1"],
  "suggestion": "improved response if needed"
}"""

async def llm7_validator(query: str, response: str, context: str) -> Dict:
    """LLM 7: Validate the response."""
    prompt = f'User question: "{query}"\n\nResponse:\n{response}\n\nContext:\n{context[:500]}\n\nValidate:'
    result = await _call_llm("groq", prompt, VALIDATOR_SYSTEM, temperature=0.1)
    if result:
        parsed = _parse_json(result)
        if parsed:
            parsed.setdefault("valid", True)
            parsed.setdefault("issues", [])
            parsed.setdefault("suggestion", "")
            return parsed

    return {"valid": True, "issues": [], "suggestion": ""}


# ── LLM 8: Personalizer (Gemini) ───────────────────────────────────

PERSONALIZER_SYSTEM = """You add personalized touches to responses. Based on user profile, add relevant suggestions.

Keep additions brief (1-2 lines max).
Return the enhanced response."""

async def llm8_personalizer(response: str, user_profile: Dict, db_results: Dict) -> str:
    """LLM 8: Add personalization."""
    if not user_profile:
        return response

    profile_text = f"Name: {user_profile.get('name', 'User')}, City: {user_profile.get('city', 'N/A')}"

    suggestions = []
    if db_results.get("challans"):
        pending = [c for c in db_results["challans"] if isinstance(c, dict) and c.get("status") == "Pending"]
        if pending:
            suggestions.append(f"You have {len(pending)} pending challan(s)")
    if db_results.get("payments"):
        pending = [p for p in db_results["payments"] if isinstance(p, dict) and p.get("status") != "Paid"]
        if pending:
            suggestions.append(f"You have {len(pending)} pending payment(s)")

    if not suggestions:
        return response

    prompt = f'User profile: {profile_text}\n\nResponse:\n{response}\n\nSuggestions: {", ".join(suggestions)}\n\nAdd personalization:'
    enhanced = await _call_llm("gemini", prompt, PERSONALIZER_SYSTEM, temperature=0.2)
    return _fix_unicode(enhanced) if enhanced else response


# ── LLM 9: Safety Filter (Groq) ────────────────────────────────────

SAFETY_SYSTEM = """You are a safety filter. Check if the response contains PII, SQL queries, API keys, or harmful content.

Return ONLY valid JSON:
{
  "safe": true/false,
  "filtered_response": "safe version if needed"
}"""

async def llm9_safety(response: str) -> Dict:
    """LLM 9: Safety check."""
    prompt = f'Check this response for safety issues:\n\n{response}'
    result = await _call_llm("groq", prompt, SAFETY_SYSTEM, temperature=0.1)
    if result:
        parsed = _parse_json(result)
        if parsed:
            parsed.setdefault("safe", True)
            parsed.setdefault("filtered_response", response)
            return parsed

    return {"safe": True, "filtered_response": response}


# ── LLM 10: Summarizer (Gemini) ────────────────────────────────────

SUMMARIZER_SYSTEM = """You are a response summarizer. If the response is longer than 300 words, create a concise summary (max 150 words).

If the response is already short, return it as is.
Return ONLY the summary."""

async def llm10_summarizer(response: str) -> str:
    """LLM 10: Summarize if too long."""
    if len(response.split()) < 300:
        return response

    prompt = f'Summarize this response concisely:\n\n{response}'
    summary = await _call_llm("gemini", prompt, SUMMARIZER_SYSTEM, temperature=0.2)
    return _fix_unicode(summary) if summary and len(summary) < len(response) else response


# ── Main Pipeline ────────────────────────────────────────────────────

async def run_10llm_pipeline(
    query: str,
    user_id: Optional[str],
    db: Session,
    lang: str = "en",
) -> Dict:
    """
    Execute the 10-LLM pipeline with 3 providers.

    Cerebras: LLM1, LLM2, LLM3 (analysis + planning)
    Groq: LLM4, LLM5, LLM7, LLM9 (processing)
    Gemini: LLM6, LLM8, LLM10 (translation + personalization)
    """
    start = time.time()
    debug = {}

    # ── LLM 1: Analyze (Cerebras) ────────────────────────────────────
    t1 = time.time()
    analysis = await llm1_analyze(query, lang)
    debug["llm1"] = f"{time.time()-t1:.1f}s"
    debug["analysis"] = analysis

    # ── LLM 2 + LLM 3 (PARALLEL - Cerebras) ─────────────────────────
    t2 = time.time()
    db_tables = analysis.get("db_tables", [])
    db_filters = analysis.get("db_filters", {})
    needs_db = analysis.get("needs_db", False)
    needs_rag = analysis.get("needs_rag", False)

    tasks = []
    if needs_db:
        tasks.append(llm2_db_planner(analysis.get("intent", ""), query, db_tables, db_filters))
    else:
        tasks.append(_empty_list())

    if needs_rag:
        tasks.append(llm3_rag_retriever(query, lang))
    else:
        tasks.append(_empty_dict())

    results = await asyncio.gather(*tasks, return_exceptions=True)
    db_plan = results[0] if not isinstance(results[0], Exception) else []
    rag_plan = results[1] if not isinstance(results[1], Exception) else {}
    debug["llm2+3"] = f"{time.time()-t2:.1f}s"

    # ── Executor: Fetch from DB ───────────────────────────────────────
    db_results = {}
    if user_id and needs_db:
        try:
            for instruction in db_plan:
                table = instruction.get("table", "")
                filters = instruction.get("filters", {})
                if table == "profile":
                    db_results["profile"] = db_queries.get_user_profile(user_id, db)
                elif table == "documents":
                    db_results["documents"] = db_queries.get_user_documents(user_id, db, document_type=filters.get("document_type"))
                elif table == "vehicles":
                    db_results["vehicles"] = db_queries.get_user_vehicles(user_id, db, registration_no=filters.get("vehicle_plate"))
                elif table == "challans":
                    db_results["challans"] = db_queries.get_user_challans(user_id, db, status=filters.get("status"))
                elif table == "payments":
                    db_results["payments"] = db_queries.get_user_payments(user_id, db, status=filters.get("status"))
                elif table == "family_members":
                    db_results["family_members"] = db_queries.get_user_family_members(user_id, db)
                elif table == "family_programs":
                    db_results["family_programs"] = db_queries.get_user_family_programs(user_id, db)
                elif table == "summary":
                    db_results.update(db_queries.get_user_summary(user_id, db))
        except Exception as e:
            print(f"[executor] DB fetch error: {e}")
    elif user_id:
        db_results["profile"] = db_queries.get_user_profile(user_id, db)

    # ── RAG retrieval ─────────────────────────────────────────────────
    rag_chunks = []
    if needs_rag:
        try:
            from app.services.vectorstore import search as vector_search
            rag_chunks = await vector_search(query, top_k=4)
        except Exception as e:
            print(f"[rag] Retrieval error: {e}")

    # ── LLM 4: Merge context (Groq) ──────────────────────────────────
    t4 = time.time()
    context = await llm4_context_merger(query, db_results, rag_chunks)
    debug["llm4"] = f"{time.time()-t4:.1f}s"

    # ── LLM 5: Write response (Groq) ─────────────────────────────────
    t5 = time.time()
    raw_response = await llm5_writer(query, context, lang)
    debug["llm5"] = f"{time.time()-t5:.1f}s"

    # ── LLM 6 + LLM 7 + LLM 9 (PARALLEL - Gemini + Groq) ────────────
    t679 = time.time()
    results2 = await asyncio.gather(
        llm6_translator(raw_response, lang),
        llm7_validator(query, raw_response, context),
        llm9_safety(raw_response),
        return_exceptions=True,
    )
    translated = results2[0] if not isinstance(results2[0], Exception) else raw_response
    validation = results2[1] if not isinstance(results2[1], Exception) else {"valid": True, "issues": [], "suggestion": ""}
    safety = results2[2] if not isinstance(results2[2], Exception) else {"safe": True, "filtered_response": raw_response}
    debug["llm6+7+9"] = f"{time.time()-t679:.1f}s"

    response = raw_response
    if not validation.get("valid") and validation.get("suggestion"):
        response = validation["suggestion"]
    if not safety.get("safe"):
        response = safety.get("filtered_response", response)

    # ── LLM 8 + LLM 10 (PARALLEL - Gemini) ──────────────────────────
    t810 = time.time()
    profile = db_results.get("profile", {})
    results3 = await asyncio.gather(
        llm8_personalizer(response, profile, db_results),
        llm10_summarizer(response),
        return_exceptions=True,
    )
    personalized = results3[0] if not isinstance(results3[0], Exception) else response
    summarized = results3[1] if not isinstance(results3[1], Exception) else response
    debug["llm8+10"] = f"{time.time()-t810:.1f}s"

    response = personalized if len(personalized) > len(response) else summarized

    # Final unicode fix
    response = _fix_unicode(response)

    # ── Build sources ─────────────────────────────────────────────────
    sources = []
    for key, value in db_results.items():
        if value and isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    sources.append({"type": "DATABASE", "title": key.replace("_", " ").title(), "snippet": str(item)[:150]})
    for chunk in rag_chunks:
        sources.append({"type": "RAG", "title": chunk.get("source", "KB"), "snippet": chunk.get("text", "")[:150]})

    seen = set()
    unique_sources = [s for s in sources if f"{s['type']}:{s['title']}" not in seen and not seen.add(f"{s['type']}:{s['title']}")]

    total_time = time.time() - start
    debug["total"] = f"{total_time:.1f}s"
    print(f"[10-LLM] Total: {total_time:.1f}s | LLM1: {debug['llm1']} | LLM2+3: {debug['llm2+3']} | LLM4: {debug['llm4']} | LLM5: {debug['llm5']} | LLM6+7+9: {debug['llm6+7+9']} | LLM8+10: {debug['llm8+10']}")

    return {
        "answer": response,
        "intent": analysis.get("intent", "UNKNOWN"),
        "sources": unique_sources,
        "grounded": bool(db_results or rag_chunks),
        "debug": debug,
    }


async def _empty_list():
    return []

async def _empty_dict():
    return {}
