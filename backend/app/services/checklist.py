from typing import List, Dict

# Checklist templates per service / situation
TEMPLATES = {
    "passport": {
        "new": [
            {"id": "cnic", "label": "Original CNIC / Smart CNIC", "required": True},
            {"id": "bform", "label": "B-Form (if under 18)", "required": False},
            {"id": "photos", "label": "Passport photographs (white background)", "required": True},
            {"id": "prev_passport", "label": "Previous Passport (if any)", "required": False},
            {"id": "fee", "label": "Fee payment receipt", "required": True},
        ],
        "renewal": [
            {"id": "cnic", "label": "Original CNIC / Smart CNIC", "required": True},
            {"id": "prev_passport", "label": "Previous Passport", "required": True},
            {"id": "photos", "label": "Recent photographs", "required": True},
            {"id": "fee", "label": "Fee payment receipt", "required": True},
        ],
    },
    "cnic": {
        "new": [
            {"id": "bform", "label": "B-Form / CRC", "required": True},
            {"id": "parent_cnic", "label": "Parent/Guardian CNIC copy", "required": True},
            {"id": "photos", "label": "Photographs", "required": True},
            {"id": "fee", "label": "NADRA fee", "required": True},
        ],
        "renewal": [
            {"id": "old_cnic", "label": "Old CNIC", "required": True},
            {"id": "photos", "label": "Photographs", "required": True},
            {"id": "fee", "label": "NADRA fee", "required": True},
        ],
        "modification": [
            {"id": "old_cnic", "label": "Old CNIC", "required": True},
            {"id": "supporting_doc", "label": "Supporting document (e.g. marriage certificate)", "required": True},
            {"id": "fee", "label": "NADRA fee", "required": True},
        ],
    },
    "business_registration": {
        "new": [
            {"id": "cnic", "label": "CNIC of directors", "required": True},
            {"id": "name_availability", "label": "Company name availability (SECP)", "required": True},
            {"id": "moa", "label": "Memorandum & Articles of Association", "required": True},
            {"id": "address_proof", "label": "Registered address proof", "required": True},
            {"id": "fee", "label": "SECP fee challan", "required": True},
        ],
        "default": [
            {"id": "cnic", "label": "CNIC", "required": True},
            {"id": "fee", "label": "SECP fee", "required": True},
        ],
    },
}

def get_checklist(service: str, situation: str, completed_ids: List[str] = None) -> Dict:
    completed_ids = completed_ids or []
    svc = TEMPLATES.get(service, {})
    items = svc.get(situation) or svc.get("new") or svc.get("default") or []
    enriched = []
    for it in items:
        enriched.append({**it, "completed": it["id"] in completed_ids})
    total = len(enriched)
    completed = sum(1 for i in enriched if i["completed"])
    progress = (completed / total) if total else 0
    return {
        "service": service,
        "situation": situation,
        "items": enriched,
        "progress": progress,
        "completed_count": completed,
        "total_count": total,
    }

def infer_situation_from_query(query: str) -> str:
    q = query.lower()
    if "renew" in q or "tajdeed" in q:
        return "renewal"
    if "modify" in q or "update" in q or "correction" in q:
        return "modification"
    return "new"
