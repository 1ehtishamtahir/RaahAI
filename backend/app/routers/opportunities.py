from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter(prefix="/api/opportunities", tags=["opportunities"])

SCHEMES = [
    {"id": "SCH-001", "name": "Ehsaas Undergraduate Scholarship", "name_ur": "احساس انڈر گریجویٹ اسکالرشپ", "category": "Scholarships", "eligibility_rules": "Family income < PKR 45,000/month, enrolled in public university", "required_documents": "CNIC/B-Form, income certificate, admission slip", "deadline": "2026-09-30", "official_source": "HEC — hec.gov.pk", "last_verified": "2026-08-01", "amount": "Full tuition + stipend"},
    {"id": "SCH-002", "name": "PM Youth Laptop Scheme", "name_ur": "وزیراعظم یوتھ لیپ ٹاپ اسکیم", "category": "Student Programs", "eligibility_rules": "University student, CGPA > 3.0", "required_documents": "Student card, CNIC", "deadline": "2026-10-15", "official_source": "PM Youth Program — pmyouth.gov.pk", "last_verified": "2026-08-01", "amount": "Free laptop"},
    {"id": "SCH-003", "name": "Kamyab Jawan Business Loan", "name_ur": "کامیاب جوان کاروبار قرض", "category": "Youth Programs", "eligibility_rules": "Age 21-45, viable business plan", "required_documents": "CNIC, business plan, bank statement", "deadline": "2026-12-31", "official_source": "SBP — sbp.org.pk", "last_verified": "2026-08-01", "amount": "Up to PKR 25 lakhs"},
    {"id": "SCH-004", "name": "Punjab Education Endowment Fund (PEEF)", "name_ur": "پیف اسکالرشپ", "category": "Scholarships", "eligibility_rules": "Punjab domicile, 60% marks, income < 30k", "required_documents": "Domicile, result card, income proof", "deadline": "2026-09-01", "official_source": "PEEF — peef.org.pk", "last_verified": "2026-08-01", "amount": "PKR 50,000/year"},
    {"id": "SCH-005", "name": "NAVTTC Skills Scholarship", "name_ur": "نیوٹیک ہنر اسکالرشپ", "category": "Student Programs", "eligibility_rules": "Age 18-35, matric pass", "required_documents": "CNIC, matric certificate", "deadline": "2026-11-30", "official_source": "NAVTTC — navttc.gov.pk", "last_verified": "2026-08-01", "amount": "Free training + stipend PKR 5,000"},
]

@router.get("")
def list_all(category: Optional[str] = None):
    data = SCHEMES
    if category:
        data = [s for s in data if s["category"].lower() == category.lower()]
    return {"schemes": data, "count": len(data)}

@router.get("/recommended")
def recommended(age: int = 22, education: str = "Bachelor", province: str = "Sindh"):
    scored = []
    for s in SCHEMES:
        score = 50
        if "Scholarship" in s["category"] and "Bachelor" in education:
            score += 20
        if "Youth" in s["category"] and 21 <= age <= 45:
            score += 20
        if province in s.get("official_source",""):
            score += 10
        scored.append({**s, "match_score": score, "match_reason": "Matches your age, education, and province" if score>70 else "Partial match"})
    scored.sort(key=lambda x: x["match_score"], reverse=True)
    return {"recommended": scored[:3], "all": scored}

@router.get("/{scheme_id}")
def get_scheme(scheme_id: str):
    for s in SCHEMES:
        if s["id"] == scheme_id:
            return s
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Scheme not found")
