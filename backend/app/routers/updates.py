from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter(prefix="/api/updates", tags=["updates"])

POLICIES = [
    {"id": "POL-001", "title": "New CNIC Fee Structure 2026", "title_ur": "نیا شناختی کارڈ فیس اسٹرکچر 2026", "description": "NADRA revised CNIC fees effective Sep 2026. Normal PKR 1,000, Urgent PKR 2,000.", "category": "Identity", "published_date": "2026-08-15", "official_source": "NADRA — nadra.gov.pk", "last_verified": "2026-08-15", "impact": "All new CNIC applicants", "apply_url": "https://www.nadra.gov.pk"},
    {"id": "POL-002", "title": "PM Youth Business Loan Increased to 25 Lakhs", "title_ur": "وزیراعظم یوتھ کاروبار قرض 25 لاکھ تک", "description": "Kamyab Jawan loan limit increased from 10 lakhs to 25 lakhs for youth 21-45.", "category": "Youth", "published_date": "2026-08-12", "official_source": "SBP — sbp.org.pk", "last_verified": "2026-08-12", "impact": "Aspiring entrepreneurs", "apply_url": "https://kamyabjawan.gov.pk"},
    {"id": "POL-003", "title": "E-Challan System Launched in Karachi", "title_ur": "کراچی میں ای چالان نظام کا آغاز", "description": "Sindh Traffic Police launched e-challan via cameras on main roads. Pay via app.", "category": "Transport", "published_date": "2026-08-10", "official_source": "Sindh Police — sindhpolice.gov.pk", "last_verified": "2026-08-10", "impact": "All vehicle owners in Karachi", "apply_url": "https://sindhpolice.gov.pk"},
    {"id": "POL-004", "title": "New Tax Return Deadline: Sep 30", "title_ur": "ٹیکس ریٹرن کی نئی آخری تاریخ 30 ستمبر", "description": "FBR extended income tax return deadline to Sep 30, 2026. File via IRIS.", "category": "Tax", "published_date": "2026-08-08", "official_source": "FBR — fbr.gov.pk", "last_verified": "2026-08-08", "impact": "All taxpayers", "apply_url": "https://iris.fbr.gov.pk"},
    {"id": "POL-005", "title": "Sehat Card Hospitals Expanded to 200+", "title_ur": "صحت کارڈ ہسپتال 200 سے زائد", "description": "Sehat Insaf Card now accepted at 200+ private hospitals in Punjab & KP. Free treatment up to 1M.", "category": "Welfare", "published_date": "2026-08-05", "official_source": "Health Ministry — pmhealth.gov.pk", "last_verified": "2026-08-05", "impact": "Sehat Card holders", "apply_url": "https://sehatsahulat.gov.pk"},
    {"id": "POL-006", "title": "NAVTTC Free Courses for Youth", "title_ur": "نیوٹیک مفت کورسز", "description": "NAVTTC offers free 6-month courses (IT, plumbing, electrician) with PKR 5k stipend.", "category": "Employment", "published_date": "2026-08-01", "official_source": "NAVTTC — navttc.gov.pk", "last_verified": "2026-08-01", "impact": "Youth 18-35", "apply_url": "https://navttc.gov.pk"},
    {"id": "POL-007", "title": "Ehsaas Undergraduate Scholarship Open", "title_ur": "احساس اسکالرشپ کھلی", "description": "HEC Ehsaas scholarship for public university students, family income <45k. Full tuition + stipend.", "category": "Education", "published_date": "2026-08-14", "official_source": "HEC — hec.gov.pk", "last_verified": "2026-08-14", "impact": "University students", "apply_url": "https://ehsaas.hec.gov.pk"},
    {"id": "POL-008", "title": "Punjab Small Business Grant 2026", "title_ur": "پنجاب چھوٹے کاروبار گرانٹ", "description": "Punjab govt offers PKR 500k grant for small businesses, no collateral. Apply via PSIC.", "category": "Business", "published_date": "2026-08-03", "official_source": "PSIC — psic.gop.pk", "last_verified": "2026-08-03", "impact": "Small business owners in Punjab", "apply_url": "https://psic.gop.pk"},
    {"id": "POL-009", "title": "BISP Taleemi Wazaif Increased", "title_ur": "تعلیمی وظائف میں اضافہ", "description": "BISP Taleemi Wazaif increased to PKR 3,500/quarter for girls, 3,000 for boys.", "category": "Family", "published_date": "2026-08-06", "official_source": "BISP — bisp.gov.pk", "last_verified": "2026-08-06", "impact": "BISP families with school children", "apply_url": "https://bisp.gov.pk"},
]

CATEGORIES = ["Education", "Employment", "Tax", "Transport", "Business", "Youth", "Family", "Welfare", "Identity"]

@router.get("/latest")
def latest(limit: int = 5, category: Optional[str] = None, q: Optional[str] = None):
    data = POLICIES
    if category and category.lower() != "all":
        data = [p for p in data if p["category"].lower() == category.lower()]
    if q:
        ql = q.lower()
        data = [p for p in data if ql in p["title"].lower() or ql in p["title_ur"].lower() or ql in p["description"].lower() or ql in p["category"].lower()]
    # Sort by published_date desc
    data = sorted(data, key=lambda x: x["published_date"], reverse=True)
    return {"updates": data[:limit], "total": len(data), "categories": CATEGORIES}

@router.get("/recommended")
def recommended(province: str = "Sindh", age: int = 25, q: Optional[str] = None):
    scored = []
    for p in POLICIES:
        if q and q.lower() not in p["title"].lower() and q.lower() not in p["category"].lower():
            continue
        score = 50
        if p["category"] in ("Youth","Employment") and 18 <= age <= 35:
            score += 30
        if p["category"] == "Identity":
            score += 20
        if province.lower() in p["official_source"].lower():
            score += 10
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
