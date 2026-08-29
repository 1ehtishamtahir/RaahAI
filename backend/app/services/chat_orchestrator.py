"""
Chat orchestrator — the main pipeline for processing user questions.

Flow:
User Question
    ↓
Intent Classification (DATABASE_QUERY / RAG_QUERY / HYBRID_QUERY / GENERAL_QUERY)
    ↓
Entity Extraction (IDs, dates, filters)
    ↓
Database Retrieval (enforcing auth) + RAG Retrieval
    ↓
Context Building (structured, source-labeled)
    ↓
LLM Generation (anti-hallucination rules)
    ↓
Response (verified against retrieved data)
"""
from typing import Dict, List, Tuple, Optional
from sqlalchemy.orm import Session

from app.services.intent_classifier import (
    classify_intent, detect_language, is_greeting, is_out_of_domain, Intent
)
from app.services.context_builder import build_structured_context, build_db_context_for_mock
from app.services import db_queries
from app.services.vectorstore import search as vector_search

try:
    from app.services.llm_router import call_llm_by_intent
except Exception:
    from app.services.gemini import call_gemini as call_llm_by_intent


def _extract_entities(query: str) -> Dict:
    """Extract relevant entities from the user's question."""
    import re
    entities = {}
    
    # Extract complaint/application IDs (e.g., CP-1024, APP-12345)
    id_patterns = [
        (r'\b([A-Z]{2,3}-\d{3,8})\b', "complaint_id"),
        (r'\b(?:complaint|application|challan|payment)\s+(?:id\s+)?(\S+)\b', "record_id"),
        (r'\b(\d{5,13})\b', "numeric_id"),
    ]
    for pattern, entity_type in id_patterns:
        match = re.search(pattern, query, re.IGNORECASE)
        if match:
            entities[entity_type] = match.group(1) if match.lastindex else match.group()
            break
    
    # Extract document type
    doc_types = ["passport", "cnic", "b-form", "birth certificate", "business registration"]
    for dtype in doc_types:
        if dtype in query.lower():
            entities["document_type"] = dtype
            break
    
    # Extract status filter
    status_words = {
        "pending": "Pending", "paid": "Paid", "overdue": "Overdue",
        "expired": "Expired", "valid": "Valid", "active": "Active",
        "enrolled": "Enrolled", "eligible": "Eligible", "applied": "Applied",
    }
    for word, status in status_words.items():
        if word in query.lower():
            entities["status_filter"] = status
            break
    
    # Extract vehicle plate
    plate_match = re.search(r'\b([A-Z]{2,3}[-\s]?\d{3,4}[-\s]?[A-Z]{0,2})\b', query, re.IGNORECASE)
    if plate_match and ("plate" in query.lower() or "vehicle" in query.lower()):
        entities["vehicle_plate"] = plate_match.group()
    
    return entities


def _query_database(
    intent: Intent,
    entities: Dict,
    user_id: str,
    db: Session,
    query: str = "",
) -> Dict:
    """Query the database based on intent, extracted entities, and query text."""
    results = {}
    
    if intent == Intent.GENERAL_QUERY or intent == Intent.RAG_QUERY:
        # Still get user profile for personalization
        results["user_profile"] = db_queries.get_user_profile(user_id, db)
        return results
    
    # Get user profile
    results["user_profile"] = db_queries.get_user_profile(user_id, db)
    
    # Use both entities and query text for matching
    q_low = query.lower()
    entity_str = str(entities).lower()
    
    def matches_any(keywords):
        return any(kw in q_low or kw in entity_str for kw in keywords)
    
    # Documents
    if matches_any(["document", "passport", "cnic", "b-form", "birth", "wallet", "dastavez"]):
        if "document_type" in entities:
            results["documents"] = db_queries.get_user_documents(
                user_id, db, document_type=entities["document_type"]
            )
        else:
            results["documents"] = db_queries.get_user_documents(user_id, db)
    
    # Vehicles
    if matches_any(["vehicle", "car", "bike", "motorcycle", "token", "registration", "plate", "gari", "gaari"]):
        if "vehicle_plate" in entities:
            results["vehicles"] = db_queries.get_user_vehicles(
                user_id, db, registration_no=entities["vehicle_plate"]
            )
        else:
            results["vehicles"] = db_queries.get_user_vehicles(user_id, db)
    
    # Challans
    if matches_any(["challan", "fine", "violation", "traffic", "challans"]):
        kwargs = {}
        if "status_filter" in entities:
            kwargs["status"] = entities["status_filter"]
        if "vehicle_plate" in entities:
            kwargs["vehicle_plate"] = entities["vehicle_plate"]
        results["challans"] = db_queries.get_user_challans(user_id, db, **kwargs)
    
    # Payments
    if matches_any(["payment", "pay", "bill", "fee", "due", "owe", "payments"]):
        kwargs = {}
        if "status_filter" in entities:
            kwargs["status"] = entities["status_filter"]
        results["payments"] = db_queries.get_user_payments(user_id, db, **kwargs)
    
    # Family
    if matches_any(["family", "member", "dependent", "child", "wife", "son", "daughter"]):
        results["family_members"] = db_queries.get_user_family_members(user_id, db)
    
    # Programs
    if matches_any(["program", "scheme", "enrolled", "eligible", "bisp", "ehsaas", "wazaif"]):
        kwargs = {}
        if "status_filter" in entities:
            kwargs["status"] = entities["status_filter"]
        results["family_programs"] = db_queries.get_user_family_programs(user_id, db, **kwargs)
    
    # Checklists
    if matches_any(["checklist", "progress", "steps"]):
        results["checklists"] = db_queries.get_user_checklists(user_id, db)
    
    # If no specific entity type detected, get summary for database queries
    if len(results) <= 1:  # Only user_profile
        # For generic "my" queries, get summary
        if matches_any(["my", "mine", "i have", "show", "list", "how many", "what do i", "overview"]):
            summary = db_queries.get_user_summary(user_id, db)
            results.update(summary)
    
    # Handle specific ID lookups
    if "complaint_id" in entities or "record_id" in entities:
        record_id = entities.get("complaint_id") or entities.get("record_id")
        # Try to find in different tables
        doc = db_queries.get_document_by_id(user_id, record_id, db)
        if doc:
            results["specific_record"] = doc
            results["record_type"] = "document"
        
        challan = db_queries.get_challan_by_id(user_id, record_id, db)
        if challan:
            results["specific_record"] = challan
            results["record_type"] = "challan"
        
        payment = db_queries.get_payment_by_id(user_id, record_id, db)
        if payment:
            results["specific_record"] = payment
            results["record_type"] = "payment"
    
    return results


async def _retrieve_rag(query: str) -> List[Dict]:
    """Retrieve from the knowledge base."""
    try:
        chunks = await vector_search(query, top_k=4)
        return chunks
    except Exception as e:
        print(f"[orchestrator] RAG retrieval failed: {e}")
        return []


def _build_response(
    intent: Intent,
    db_results: Dict,
    rag_results: List[Dict],
    user_profile: Dict,
    conversation_history: list,
    intent_info: Dict,
    lang: str,
    query: str = "",
) -> str:
    """Build the final context and call the intent-routed LLM."""
    
    # Build structured context
    context = build_structured_context(
        db_results=db_results,
        rag_results=rag_results,
        user_profile=user_profile,
        conversation_history=conversation_history,
        intent_info=intent_info,
    )
    
    # Route to role-specific Gemini (DB / RAG / General)
    answer = call_llm_by_intent(
        query=query,
        context_chunks=[],
        intent=intent,
        lang=lang,
        history=conversation_history,
        user_context=context,
    )
    
    return answer


async def process_question(
    query: str,
    user_id: Optional[str],
    db: Session,
    lang: str = "en",
    conversation_history: list = None,
) -> Dict:
    """
    3-LLM Pipeline:
      LLM 1 (Analyzer):  Understand message → structured fetch instructions
      Executor (Python): Fetch from DB based on instructions
      LLM 3 (Writer):    DB results + query → natural language response
    """
    from app.services.llm_pipeline import llm1_analyze, executor_fetch, llm3_write
    from app.services.vectorstore import search as vector_search

    debug_info = {}

    # ── Detect language ───────────────────────────────────────────────
    detected_lang = detect_language(query)
    if detected_lang == "ur" and lang == "en":
        lang = "ur"

    # ── Greetings → direct response (no LLM needed) ───────────────────
    if is_greeting(query):
        if lang == "ur":
            return {
                "answer": "وعلیکم السلام! میں راہ AI ہوں — پاسپورٹ، شناختی کارڈ یا کاروبار رجسٹریشن میں کیسے مدد کر سکتا ہوں؟",
                "intent": "GREETING", "sources": [], "grounded": False,
            }
        return {
            "answer": "Walaikum Assalam! I'm RaahAI — your guide to Passport, CNIC and Business Registration. Ask me in Urdu or English.",
            "intent": "GREETING", "sources": [], "grounded": False,
        }

    # ── Out-of-domain → direct response ───────────────────────────────
    if is_out_of_domain(query):
        if lang == "ur":
            return {
                "answer": "میں صرف پاسپورٹ، شناختی کارڈ، کاروبار رجسٹریشن اور متعلقہ سرکاری خدمات میں مدد کر سکتا ہوں۔",
                "intent": "OUT_OF_DOMAIN", "sources": [], "grounded": False,
            }
        return {
            "answer": "I can only help with Passport, CNIC, Business Registration and related government services.",
            "intent": "OUT_OF_DOMAIN", "sources": [], "grounded": False,
        }

    # ── LLM 1: Analyze ────────────────────────────────────────────────
    analysis = llm1_analyze(query, lang)
    intent_str = analysis.get("intent", "GENERAL_QUERY")
    needs_db = analysis.get("needs_db", False)
    needs_rag = analysis.get("needs_rag", False)
    debug_info["llm1_analysis"] = analysis

    # ── Executor: Fetch from DB ────────────────────────────────────────
    db_results = {}
    if user_id and needs_db:
        try:
            db_results = executor_fetch(analysis, user_id, db)
            debug_info["db_tables_fetched"] = list(db_results.keys())
            debug_info["db_record_count"] = sum(
                len(v) if isinstance(v, list) else 1
                for v in db_results.values() if v is not None
            )
        except Exception as e:
            print(f"[orchestrator] DB fetch failed: {e}")
            debug_info["db_error"] = str(e)
    elif user_id:
        # Always get profile for personalization
        try:
            from app.services import db_queries
            db_results["profile"] = db_queries.get_user_profile(user_id, db)
        except Exception:
            pass

    # ── RAG retrieval (if needed) ──────────────────────────────────────
    rag_chunks = []
    if needs_rag:
        try:
            rag_chunks = await vector_search(query, top_k=4)
            debug_info["rag_chunks_found"] = len(rag_chunks)
        except Exception as e:
            print(f"[orchestrator] RAG retrieval failed: {e}")
            debug_info["rag_error"] = str(e)

    # ── LLM 3: Write final response ───────────────────────────────────
    try:
        answer = llm3_write(query, db_results, rag_chunks, lang)
    except Exception as e:
        print(f"[orchestrator] LLM 3 failed: {e}")
        if lang == "ur":
            answer = "مجھے جواب دینے میں مسلی ہو رہی ہے۔ براہ کرم دوبارہ کوشش کریں۔"
        else:
            answer = "I'm having trouble generating a response. Please try again."
        debug_info["llm3_error"] = str(e)

    # ── Build sources ──────────────────────────────────────────────────
    sources = []
    for key, value in db_results.items():
        if value is not None and isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    sources.append({"type": "DATABASE", "title": key.replace("_", " ").title(), "snippet": str(item)[:200]})
    for chunk in rag_chunks:
        sources.append({"type": "RAG", "title": chunk.get("source", "Knowledge Base"), "snippet": chunk.get("text", "")[:200]})

    seen = set()
    unique_sources = [s for s in sources if f"{s['type']}:{s['title']}" not in seen and not seen.add(f"{s['type']}:{s['title']}")]

    return {
        "answer": answer,
        "intent": intent_str,
        "sources": unique_sources,
        "grounded": bool(db_results or rag_chunks),
        "debug": debug_info,
    }
