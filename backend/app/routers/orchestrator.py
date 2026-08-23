from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/orchestrator", tags=["orchestrator"])

INTENT_MAP = {
    "identity": ["cnic", "passport", "frc", "birth", "nadra", "dgip", "شناختی", "پاسپورٹ"],
    "vehicle": ["vehicle", "car", "bike", "registration", "token", "excise", "گاڑی"],
    "challan": ["challan", "fine", "traffic", "police", "چالان"],
    "payment": ["fee", "tax", "payment", "pay", "فیس", "ٹیکس"],
    "document": ["document", "ocr", "scan", "upload", "form", "دستاویز"],
    "opportunity": ["scholarship", "youth", "student", "loan", "kamyab", "ehsaas", "اسکالرشپ"],
    "family": ["family", "household", "bisp", "ehsaas kafalat", "خاندان"],
    "update": ["policy", "scheme", "update", "radar", "government", "حکومت"],
}

@router.post("/route")
def route(payload: dict):
    query = payload.get("query","").lower()
    lang = payload.get("lang","en")
    scores = {k: sum(1 for kw in v if kw in query) for k,v in INTENT_MAP.items()}
    best = max(scores, key=scores.get) if max(scores.values())>0 else "general"
    routes = {
        "identity": "/api/identity/cnic or /api/identity/passport",
        "vehicle": "/api/vehicle",
        "challan": "/api/challans",
        "payment": "/api/payments/timeline",
        "document": "/ocr",
        "opportunity": "/api/opportunities/recommended",
        "family": "/api/family/profile",
        "update": "/api/updates/latest",
        "general": "/chat",
    }
    return {
        "query": payload.get("query"),
        "detected_intent": best,
        "confidence": round(scores[best]/3,2) if best!="general" else 0.3,
        "route": routes[best],
        "all_scores": scores,
        "message": f"Routed to {best} domain. In production, this orchestrator calls domain agents." if best!="general" else "General chat — routed to RAG.",
        "trust": {"source": "RaahAI Orchestrator", "last_verified": "2026-08-23"},
    }
