"""
3-LLM Architecture:
  LLM 1 (Analyzer):  Understands user message → outputs structured fetch instructions
  Executor (Python): Receives instructions → fetches from database
  LLM 3 (Writer):    DB results + original query → natural language response to user
"""
import json
import re
from typing import Dict, List, Optional
from sqlalchemy.orm import Session

from app.services.intent_classifier import Intent
from app.services import db_queries

# ── Gemini setup ─────────────────────────────────────────────────────
HAS_GENAI = False
HAS_NEW_GENAI = False
new_genai = None
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

from app.core.config import get_settings
settings = get_settings()


# ── LLM 1: Analyzer ─────────────────────────────────────────────────

ANALYZER_PROMPT = """You are an AI message analyzer for a Citizen Portal.

Given a user message, analyze it and return a JSON object with:
{
  "intent": "DATABASE_QUERY" | "RAG_QUERY" | "HYBRID_QUERY" | "GENERAL_QUERY" | "GREETING" | "OUT_OF_DOMAIN",
  "entities": {
    "document_type": "passport" | "cnic" | "driving_license" | null,
    "vehicle_plate": "ABC-1234" | null,
    "status_filter": "Pending" | "Paid" | "Overdue" | null,
    "record_id": "CP-1024" | null,
    "requested_field": "officer" | "status" | "amount" | "date" | null
  },
  "db_fetch_instructions": [
    {"table": "documents", "filters": {"document_type": "passport"}},
    {"table": "vehicles", "filters": {}},
    {"table": "challans", "filters": {"status": "Pending"}},
    {"table": "payments", "filters": {}},
    {"table": "family_members", "filters": {}},
    {"table": "family_programs", "filters": {}},
    {"table": "checklists", "filters": {}},
    {"table": "profile", "filters": {}}
  ],
  "rag_keywords": ["passport", "renewal", "documents"],
  "needs_rag": true/false,
  "needs_db": true/false,
  "language": "en" | "ur",
  "is_greeting": true/false
}

RULES:
- "Show my vehicles" → intent=DATABASE_QUERY, db_fetch_instructions=[{"table":"vehicles"}], needs_db=true
- "What documents for passport?" → intent=RAG_QUERY, rag_keywords=["passport","documents"], needs_rag=true
- "Hello" → intent=GREETING, is_greeting=true
- "What is my status and what docs needed?" → intent=HYBRID_QUERY, needs_db=true, needs_rag=true
- For DATABASE_QUERY: always include relevant db_fetch_instructions
- For RAG_QUERY: include rag_keywords, empty db_fetch_instructions
- NEVER invent record IDs unless the user explicitly mentioned one
- Return ONLY the JSON object, no other text
"""


def _call_gemini(prompt: str) -> str:
    """Call Gemini and return raw text response."""
    if not HAS_GENAI or not settings.gemini_api_key:
        return ""
    try:
        if HAS_NEW_GENAI:
            from google.genai import types
            client = new_genai.Client(api_key=settings.gemini_api_key)
            resp = client.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.1, max_output_tokens=600),
            )
            text = getattr(resp, "text", None)
            if not text and resp.candidates:
                text = resp.candidates[0].content.parts[0].text
            if text and text.strip():
                return text.strip()
        else:
            genai.configure(api_key=settings.gemini_api_key)
            model = genai.GenerativeModel(settings.gemini_model)
            resp = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(temperature=0.1, max_output_tokens=600),
            )
            if resp.candidates and resp.text:
                return resp.text.strip()
    except Exception as e:
        print(f"[llm_analyzer] Gemini failed: {e}")
    return ""


def _parse_json_response(text: str) -> Dict:
    """Extract JSON from LLM response even if wrapped in markdown."""
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


def llm1_analyze(query: str, lang: str = "en") -> Dict:
    """
    LLM 1: Understand the user's message and output structured instructions.
    Returns: {intent, entities, db_fetch_instructions, rag_keywords, needs_rag, needs_db, language}
    """
    prompt = f"""{ANALYZER_PROMPT}

User message: "{query}"
Detected language: {lang}

Analyze and return JSON:"""

    response = _call_gemini(prompt)

    if response:
        parsed = _parse_json_response(response)
        if parsed:
            # Ensure required fields exist
            parsed.setdefault("intent", "GENERAL_QUERY")
            parsed.setdefault("entities", {})
            parsed.setdefault("db_fetch_instructions", [])
            parsed.setdefault("rag_keywords", [])
            parsed.setdefault("needs_rag", False)
            parsed.setdefault("needs_db", False)
            parsed.setdefault("language", lang)
            parsed.setdefault("is_greeting", False)
            print(f"[LLM1] Analyzed: intent={parsed['intent']}, needs_db={parsed['needs_db']}, needs_rag={parsed['needs_rag']}")
            return parsed

    # Fallback: keyword-based analysis
    return _fallback_analyze(query, lang)


def _fallback_analyze(query: str, lang: str) -> Dict:
    """Keyword-based fallback when Gemini is unavailable."""
    from app.services.intent_classifier import classify_intent, detect_language, is_greeting
    q_low = query.lower()
    intent_info = classify_intent(query)
    intent = intent_info["intent"]

    db_fetch = []
    needs_db = False
    needs_rag = False

    if intent in (Intent.DATABASE_QUERY, Intent.HYBRID_QUERY):
        needs_db = True
        if any(kw in q_low for kw in ["vehicle", "car", "bike", "token"]):
            db_fetch.append({"table": "vehicles", "filters": {}})
        if any(kw in q_low for kw in ["challan", "fine", "violation"]):
            db_fetch.append({"table": "challans", "filters": {}})
        if any(kw in q_low for kw in ["payment", "pay", "bill", "fee", "due"]):
            db_fetch.append({"table": "payments", "filters": {}})
        if any(kw in q_low for kw in ["document", "passport", "cnic"]):
            db_fetch.append({"table": "documents", "filters": {}})
        if any(kw in q_low for kw in ["family", "member"]):
            db_fetch.append({"table": "family_members", "filters": {}})
        if any(kw in q_low for kw in ["program", "scheme"]):
            db_fetch.append({"table": "family_programs", "filters": {}})
        if not db_fetch:
            db_fetch.append({"table": "summary", "filters": {}})

    if intent in (Intent.RAG_QUERY, Intent.HYBRID_QUERY):
        needs_rag = True

    return {
        "intent": intent.value,
        "entities": intent_info.get("entities", {}),
        "db_fetch_instructions": db_fetch,
        "rag_keywords": [w for w in q_low.split() if len(w) > 2],
        "needs_rag": needs_rag,
        "needs_db": needs_db,
        "language": detect_language(query),
        "is_greeting": is_greeting(query),
    }


# ── Executor: Python code that fetches from DB ───────────────────────

def executor_fetch(analysis: Dict, user_id: str, db: Session) -> Dict:
    """
    Execute DB fetch instructions from LLM 1.
    Returns structured data from the database.
    """
    results = {}

    # Always get profile
    results["profile"] = db_queries.get_user_profile(user_id, db)

    for instruction in analysis.get("db_fetch_instructions", []):
        table = instruction.get("table", "")
        filters = instruction.get("filters", {})

        try:
            if table == "documents":
                doc_type = filters.get("document_type")
                results["documents"] = db_queries.get_user_documents(user_id, db, document_type=doc_type)
            elif table == "vehicles":
                plate = filters.get("vehicle_plate")
                results["vehicles"] = db_queries.get_user_vehicles(user_id, db, registration_no=plate)
            elif table == "challans":
                status = filters.get("status")
                results["challans"] = db_queries.get_user_challans(user_id, db, status=status)
            elif table == "payments":
                status = filters.get("status")
                results["payments"] = db_queries.get_user_payments(user_id, db, status=status)
            elif table == "family_members":
                results["family_members"] = db_queries.get_user_family_members(user_id, db)
            elif table == "family_programs":
                results["family_programs"] = db_queries.get_user_family_programs(user_id, db)
            elif table == "checklists":
                results["checklists"] = db_queries.get_user_checklists(user_id, db)
            elif table == "summary":
                summary = db_queries.get_user_summary(user_id, db)
                results.update(summary)
        except Exception as e:
            print(f"[executor] Failed to fetch {table}: {e}")
            results[table] = []

    return results


# ── LLM 3: Writer ───────────────────────────────────────────────────

WRITER_PROMPT = """You are RaahAI — a Citizen Portal assistant. You generate the FINAL response to the user.

You will receive:
1. The ORIGINAL user question
2. DATABASE RESULTS (if any) — this is AUTHORITATIVE for dynamic data
3. KNOWLEDGE BASE (if any) — for procedures, requirements, policies
4. LANGUAGE preference

RULES:
1. Answer from DATABASE RESULTS for status, records, amounts, dates, assignments.
2. Answer from KNOWLEDGE BASE for procedures, requirements, fees, policies.
3. NEVER invent data not in the results below.
4. If DATABASE RESULTS say "No records found", say: "I couldn't find any matching records in your account."
5. Format with markdown headings and bullet points.
6. Keep it concise and scannable.
7. Respond in the same language as the user.
8. Never expose SQL, schema, API keys, or internal details.
"""


def llm3_write(query: str, db_results: Dict, rag_chunks: List[Dict], lang: str = "en") -> str:
    """
    LLM 3: Generate the final response to the user.
    Takes DB results + RAG chunks + original query → natural language answer.
    """
    # Format DB results
    db_text = ""
    if db_results:
        for key, value in db_results.items():
            if value is None:
                continue
            if isinstance(value, list):
                if len(value) == 0:
                    db_text += f"\n{key}: No records found.\n"
                else:
                    db_text += f"\n{key} ({len(value)} records):\n"
                    for i, item in enumerate(value, 1):
                        if isinstance(item, dict):
                            db_text += f"  Record {i}:\n"
                            for k, v in item.items():
                                if v and str(v) != "Not provided" and str(v) != "Not specified":
                                    db_text += f"    {k}: {v}\n"
            elif isinstance(value, dict):
                db_text += f"\n{key}:\n"
                for k, v in value.items():
                    if v and str(v) != "Not provided" and str(v) != "Not specified":
                        db_text += f"  {k}: {v}\n"

    # Format RAG chunks
    rag_text = ""
    if rag_chunks:
        for chunk in rag_chunks:
            rag_text += f"\n[Source: {chunk.get('source', 'Unknown')}] {chunk.get('text', '')}\n"

    # Build prompt
    prompt = f"""{WRITER_PROMPT}

ORIGINAL USER QUESTION: "{query}"

DATABASE RESULTS:
{db_text if db_text else "No database results provided."}

KNOWLEDGE BASE:
{rag_text if rag_text else "No knowledge base results provided."}

LANGUAGE: {lang}

Generate the final answer:"""

    response = _call_gemini(prompt)
    if response:
        return response

    # Fallback: format DB results manually
    return _fallback_format(query, db_results, rag_chunks, lang)


def _fallback_format(query: str, db_results: Dict, rag_chunks: List[Dict], lang: str) -> str:
    """Manual formatting when Gemini is unavailable."""
    parts = []

    if db_results.get("profile"):
        p = db_results["profile"]
        parts.append(f"Hello {p.get('name', 'there')}, here's what I found:")

    for key in ["vehicles", "challans", "payments", "documents", "family_members", "family_programs"]:
        items = db_results.get(key)
        if items and isinstance(items, list) and len(items) > 0:
            title = key.replace("_", " ").title()
            parts.append(f"\n### {title}")
            for item in items:
                if isinstance(item, dict):
                    parts.append(f"- {item}")

    if rag_chunks:
        parts.append("\n### Information")
        for chunk in rag_chunks:
            parts.append(chunk.get("text", "")[:300])

    if not parts:
        if lang == "ur":
            return "میرے پاس اس سوال کا جواب دینے کے لیے کافی معلومات نہیں ہیں۔"
        return "I don't have enough information to answer this question."

    return "\n".join(parts)
