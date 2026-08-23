from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/api/opportunities", tags=["opportunities"])

SCHEMES = [
    {"id": "SCH-001", "name": "Ehsaas Undergraduate Scholarship", "name_ur": "احساس انڈر گریجویٹ اسکالرشپ", "category": "Scholarships", "eligibility_rules": "Family income < PKR 45,000/month, enrolled in public university", "required_documents": "CNIC/B-Form, income certificate, admission slip", "deadline": "2026-09-30", "official_source": "HEC — hec.gov.pk", "last_verified": "2026-08-01", "amount": "Full tuition + stipend", "apply_url": "https://ehsaas.hec.gov.pk"},
    {"id": "SCH-002", "name": "PM Youth Laptop Scheme", "name_ur": "وزیراعظم یوتھ لیپ ٹاپ اسکیم", "category": "Student Programs", "eligibility_rules": "University student, CGPA > 3.0, age 18-30", "required_documents": "Student card, CNIC, transcript", "deadline": "2026-10-15", "official_source": "PM Youth Program — pmyouth.gov.pk", "last_verified": "2026-08-01", "amount": "Free laptop", "apply_url": "https://laptop.pmyp.gov.pk"},
    {"id": "SCH-003", "name": "Kamyab Jawan Business Loan", "name_ur": "کامیاب جوان کاروبار قرض", "category": "Youth Programs", "eligibility_rules": "Age 21-45, viable business plan, Pakistani", "required_documents": "CNIC, business plan, bank statement", "deadline": "2026-12-31", "official_source": "SBP — sbp.org.pk", "last_verified": "2026-08-01", "amount": "Up to PKR 25 lakhs", "apply_url": "https://kamyabjawan.gov.pk"},
    {"id": "SCH-004", "name": "Punjab Education Endowment Fund (PEEF)", "name_ur": "پیف اسکالرشپ", "category": "Scholarships", "eligibility_rules": "Punjab domicile, 60% marks, income < 30k", "required_documents": "Domicile, result card, income proof", "deadline": "2026-09-01", "official_source": "PEEF — peef.org.pk", "last_verified": "2026-08-01", "amount": "PKR 50,000/year", "apply_url": "https://peef.org.pk"},
    {"id": "SCH-005", "name": "NAVTTC Skills Scholarship", "name_ur": "نیوٹیک ہنر اسکالرشپ", "category": "Student Programs", "eligibility_rules": "Age 18-35, matric pass, unemployed", "required_documents": "CNIC, matric certificate, domicile", "deadline": "2026-11-30", "official_source": "NAVTTC — navttc.gov.pk", "last_verified": "2026-08-01", "amount": "Free training + stipend PKR 5,000", "apply_url": "https://navttc.gov.pk"},
    {"id": "SCH-006", "name": "Ehsaas Kafalat Stipend", "name_ur": "احساس کفالت", "category": "Family", "eligibility_rules": "BISP beneficiary family, female head, NSER survey", "required_documents": "CNIC, B-Form, NSER slip", "deadline": "2026-09-15", "official_source": "BISP — bisp.gov.pk", "last_verified": "2026-08-01", "amount": "PKR 14,000/quarter", "apply_url": "https://bisp.gov.pk"},
    {"id": "SCH-007", "name": "Sehat Insaf Health Card", "name_ur": "صحت انصاف کارڈ", "category": "Welfare", "eligibility_rules": "All families in KP/Punjab, CNIC holder", "required_documents": "CNIC, family registration", "deadline": "2026-12-31", "official_source": "Health Ministry — pmhealth.gov.pk", "last_verified": "2026-08-01", "amount": "Free treatment up to PKR 1M", "apply_url": "https://sehatsahulat.gov.pk"},
]

def _deadline_status(deadline: str):
    try:
        d = datetime.strptime(deadline, "%Y-%m-%d")
        days = (d - datetime.now()).days
        if days < 0: return "expired", days
        if days <= 7: return "expiring_soon", days
        if days <= 30: return "due_soon", days
        return "open", days
    except: return "open", 999

@router.get("")
def list_all(category: Optional[str] = None, q: Optional[str] = Query(None, description="Search by name/category")):
    data = SCHEMES
    if category:
        data = [s for s in data if s["category"].lower() == category.lower()]
    if q:
        ql = q.lower()
        data = [s for s in data if ql in s["name"].lower() or ql in s["name_ur"].lower() or ql in s["category"].lower() or ql in s["eligibility_rules"].lower()]
    # enrich with deadline status
    enriched = []
    for s in data:
        status, days = _deadline_status(s["deadline"])
        enriched.append({**s, "deadline_status": status, "days_left": days})
    return {"schemes": enriched, "count": len(enriched)}

@router.get("/recommended")
def recommended(age: int = 22, education: str = "Bachelor", province: str = "Sindh", q: Optional[str] = None):
    scored = []
    for s in SCHEMES:
        if q and q.lower() not in s["name"].lower() and q.lower() not in s["category"].lower():
            continue
        score = 50
        if "Scholarship" in s["category"] and "Bachelor" in education:
            score += 20
        if "Youth" in s["category"] and 21 <= age <= 45:
            score += 20
        if province.lower() in s.get("official_source","").lower() or province.lower() in s.get("name","").lower():
            score += 10
        # Boost if deadline soon but not expired
        status, _ = _deadline_status(s["deadline"])
        if status == "expiring_soon": score += 5
        if status == "expired": score -= 30
        scored.append({**s, "match_score": score, "match_reason": "Matches your age, education, and province" if score>70 else "Partial match", "deadline_status": status})
    scored.sort(key=lambda x: x["match_score"], reverse=True)
    return {"recommended": scored[:3], "all": scored}

@router.get("/{scheme_id}")
def get_scheme(scheme_id: str):
    for s in SCHEMES:
        if s["id"] == scheme_id:
            status, days = _deadline_status(s["deadline"])
            return {**s, "deadline_status": status, "days_left": days}
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Scheme not found")
