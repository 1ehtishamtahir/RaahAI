"""
Context builder for the LLM.
Assembles structured context from database results and RAG results,
with clear source labels (DATABASE vs RAG).
"""
from typing import Dict, List, Optional
from datetime import datetime


def build_structured_context(
    db_results: Dict = None,
    rag_results: List[Dict] = None,
    user_profile: Dict = None,
    conversation_history: list = None,
    intent_info: Dict = None,
) -> str:
    """
    Build a structured context string for the LLM.
    
    Each section is clearly labeled with its source:
    - DATABASE: Direct from application database
    - RAG: From knowledge base/documents
    - HISTORY: From conversation history
    """
    sections = []
    
    # ── User Profile (always included if available) ──────────────────
    if user_profile:
        profile_lines = []
        if user_profile.get("name"):
            profile_lines.append(f"Name: {user_profile['name']}")
        if user_profile.get("cnic") and user_profile["cnic"] != "Not provided":
            profile_lines.append(f"CNIC: {user_profile['cnic']}")
        if user_profile.get("city") and user_profile["city"] != "Not provided":
            profile_lines.append(f"City: {user_profile['city']}")
        if user_profile.get("province") and user_profile["province"] != "Not provided":
            profile_lines.append(f"Province: {user_profile['province']}")
        if profile_lines:
            sections.append(f"[AUTHENTICATED USER]\n" + "\n".join(profile_lines))
    
    # ── Intent Classification ────────────────────────────────────────
    if intent_info:
        sections.append(
            f"[DETECTED INTENT]\n"
            f"Type: {intent_info.get('intent', 'UNKNOWN')}\n"
            f"Confidence: {intent_info.get('confidence', 0):.0%}"
        )
    
    # ── Database Results ─────────────────────────────────────────────
    if db_results:
        db_section = "[DATABASE RESULTS]\n"
        db_section += "The following data comes directly from the application database.\n"
        db_section += "This is AUTHORITATIVE for dynamic portal data (status, records, assignments).\n"
        db_section += "NEVER contradict or override this information.\n\n"
        
        for key, value in db_results.items():
            if value is None:
                continue
            if isinstance(value, list):
                if len(value) == 0:
                    db_section += f"{key.replace('_', ' ').title()}: No records found.\n\n"
                else:
                    db_section += f"{key.replace('_', ' ').title()} ({len(value)} record(s)):\n"
                    for i, item in enumerate(value, 1):
                        if isinstance(item, dict):
                            db_section += f"  Record {i}:\n"
                            for k, v in item.items():
                                if v is not None and v != "Not provided" and v != "Not specified":
                                    db_section += f"    {k.replace('_', ' ').title()}: {v}\n"
                        else:
                            db_section += f"  {i}. {item}\n"
                    db_section += "\n"
            elif isinstance(value, dict):
                db_section += f"{key.replace('_', ' ').title()}:\n"
                for k, v in value.items():
                    if v is not None and v != "Not provided" and v != "Not specified":
                        db_section += f"  {k.replace('_', ' ').title()}: {v}\n"
                db_section += "\n"
            else:
                db_section += f"{key.replace('_', ' ').title()}: {value}\n\n"
        
        sections.append(db_section)
    
    # ── RAG / Knowledge Base Results ─────────────────────────────────
    if rag_results:
        rag_section = "[KNOWLEDGE BASE]\n"
        rag_section += "The following information comes from official government documents and procedures.\n"
        rag_section += "Use this for general knowledge about services, requirements, fees, and processes.\n\n"
        
        for i, chunk in enumerate(rag_results, 1):
            source = chunk.get("source", "Unknown")
            text = chunk.get("text", "")
            rag_section += f"Document {i} (Source: {source}):\n{text}\n\n"
        
        sections.append(rag_section)
    
    # ── Conversation History ─────────────────────────────────────────
    if conversation_history:
        history_section = "[CONVERSATION HISTORY]\n"
        history_section += "Use this to understand follow-up questions and context.\n"
        history_section += "IMPORTANT: For dynamic data (status, records), always re-query the database.\n"
        history_section += "Do NOT rely on old conversation context for live status.\n\n"
        
        recent = conversation_history[-6:]  # Last 6 messages (3 turns)
        for msg in recent:
            role = msg.get("role", "unknown")
            content = msg.get("content", "")[:300]
            history_section += f"{'User' if role == 'user' else 'Assistant'}: {content}\n"
        
        sections.append(history_section)
    
    # ── Anti-Hallucination Rules ─────────────────────────────────────
    rules_section = (
        "[CRITICAL RULES]\n"
        "1. ANSWER ONLY from the provided context above.\n"
        "2. DATABASE results are the SOURCE OF TRUTH for dynamic data (status, records, assignments, dates).\n"
        "3. KNOWLEDGE BASE is the SOURCE OF TRUTH for procedures, requirements, fees, policies.\n"
        "4. NEVER invent, guess, or assume database records, IDs, statuses, officers, or dates.\n"
        "5. NEVER claim an action was performed unless the backend actually performed it.\n"
        "6. If DATABASE RESULTS say 'No records found', say: 'I couldn't find any matching records in your account.'\n"
        "7. NEVER say 'your complaint is probably under review' or similar guesses.\n"
        "8. If you don't have enough information, say: 'I don't have enough information to answer this.'\n"
        "9. NEVER expose SQL queries, database schema, API keys, or internal system details.\n"
        "10. NEVER reveal another user's private data. Only show data from DATABASE RESULTS for this user.\n"
    )
    sections.append(rules_section)
    
    return "\n\n".join(sections)


def build_db_context_for_mock(
    db_results: Dict = None,
    user_profile: Dict = None,
) -> str:
    """
    Build a formatted text context for the mock answer fallback.
    This replaces the old build_user_context() with structured DB data.
    """
    parts = []
    
    if user_profile:
        parts.append(f"## Citizen Profile\n- Name: {user_profile.get('name', 'N/A')}\n- CNIC: {user_profile.get('cnic', 'N/A')}\n- City: {user_profile.get('city', 'N/A')}")
    
    if db_results:
        for key, value in db_results.items():
            if value is None:
                continue
            if isinstance(value, list) and len(value) > 0:
                section_title = key.replace('_', ' ').title()
                lines = [f"## {section_title}"]
                for item in value:
                    if isinstance(item, dict):
                        field_str = ", ".join(f"{k}={v}" for k, v in item.items() if v is not None)
                        lines.append(f"- {field_str}")
                parts.append("\n".join(lines))
    
    return "\n\n".join(parts) if parts else "No personal data available."
