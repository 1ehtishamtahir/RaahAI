from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter(prefix="/api/updates", tags=["updates"])

POLICIES = [
    {"id": "POL-001", "title": "New CNIC Fee Structure 2026", "title_ur": "نیا شناختی کارڈ فیس اسٹرکچر 2026", "description": "NADRA revised CNIC fees effective Sep 2026. Normal PKR 1,000, Urgent PKR 2,000.", "category": "Identity", "published_date": "2026-08-15", "official_source": "NADRA — nadra.gov.pk", "last_verified": "2026-08-15", "impact": "All new CNIC applicants"},
    {"id": "POL-002", "title": "PM Youth Business Loan Increased to 25 Lakhs", "title_ur": "وزیراعظم یوتھ کاروبار قرض 25 لاکھ تک", "description": "Kamyab Jawan loan limit increased from 10 lakhs to 25 lakhs for youth 21-45.", "category": "Youth", "published_date": "2026-08-12", "official_source": "SBP — sbp.org.pk", "last_verified": "2026-08-12", "impact": "Aspiring entrepreneurs"},
    {"id": "POL-003", "title": "E-Challan System Launched in Karachi", "title_ur": "کراچی میں ای چالان نظام کا آغاز", "description": "Sindh Traffic Police launched e-challan via cameras on main roads. Pay via app.", "category": "Transport", "published_date": "2026-08-10", "official_source": "Sindh Police — sindhpolice.gov.pk", "last_verified": "2026-08-10", "impact": "All vehicle owners in Karachi"},
    {"id": "POL-004", "title": "New Tax Return Deadline: Sep 30", "title_ur": "ٹیکس ریٹرن کی نئی آخری تاریخ 30 ستمبر", "description": "FBR extended income tax return deadline to Sep 30, 2026.", "category": "Tax", "published_date": "2026-08-08", "official_source": "FBR — fbr.gov.pk", "last_verified": "2026-08-08", "impact": "All taxpayers"},
    {"id": "POL-005", "title": "Sehat Card Hospitals Expanded to 200+", "title_ur": "صحت کارڈ ہسپتال 200 سے زائد", "description": "Sehat Insaf Card now accepted at 200+ private hospitals in Punjab & KP.", "category": "Welfare", "published_date": "2026-08-05", "official_source": "Health Ministry — pmhealth.gov.pk", "last_verified": "2026-08-05", "impact": "Sehat Card holders"},
    {"id": "POL-006", "title": "NAVTTC Free Courses for Youth", "title_ur": "نیوٹیک مفت کورسز", "description": "NAVTTC offers free 6-month courses (IT, plumbing, electrician) with PKR 5k stipend.", "category": "Employment", "published_date": "2026-08-01", "official_source": "NAVTTC — navttc.gov.pk", "last_verified": "2026-08-01", "impact": "Youth 18-35"},
]

CATEGORIES = ["Education", "Employment", "Tax", "Transport", "Business", "Youth", "Family", "Welfare", "Identity"]

@router.get("/latest")
def latest(limit: int = 5, category: Optional[str] = None):
    data = POLICIES
    if category:
        data = [p for p in data if p["category"].lower() == category.lower()]
    return {"updates": data[:limit], "total": len(data)}

@router.get("/recommended")
def recommended(province: str = "Sindh", age: int = 25):
    scored = []
    for p in POLICIES:
        score = 50
        if p["category"] in ("Youth","Employment") and 18 <= age <= 35:
            score += 30
        if p["category"] == "Identity":
            score += 20
        scored.append({**p, "relevance": score, "reason": "Relevant to your profile" if score>70 else "General update"})
    scored.sort(key=lambda x: x["relevance"], reverse=True)
    return {"recommended": scored[:3], "radar": scored}

@router.get("/categories")
def categories():
    return {"categories": CATEGORIES}

@router.get("/{policy_id}")
def get_policy(policy_id: str):
    for p in POLICIES:
        if p["id"] == policy_id:
            return p
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Policy not found")
