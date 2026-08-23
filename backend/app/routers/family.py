from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/family", tags=["family"])

def mask_cnic(cnic: str) -> str:
    if "-" in cnic and len(cnic) >= 13:
        return cnic[:2] + "XXX-XXXXXXX-X"[-11:]
    if len(cnic) == 13:
        return cnic[:4] + "XXXXXXX" + cnic[-1]
    return "XXXXX-XXXXXXX-X"

HOUSEHOLD = {
    "id": "HH-001",
    "head": {"name": "Ehtisham Tahir", "cnic": "42101-1234567-1", "cnic_masked": "42101-XXXXXXX-1", "age": 28, "education": "Bachelor", "province": "Sindh", "city": "Karachi"},
    "members": [
        {"id": "M-001", "name": "Ehtisham Tahir", "relation": "Self", "age": 28, "cnic": "42101-1234567-1", "cnic_masked": "42101-XXXXXXX-1", "education": "Bachelor", "eligible_programs": ["PM Youth Laptop", "Kamyab Jawan Loan"], "status": "Active"},
        {"id": "M-002", "name": "Ayesha Tahir", "relation": "Sister", "age": 20, "cnic": "42101-1234568-2", "cnic_masked": "42101-XXXXXXX-2", "education": "Intermediate", "eligible_programs": ["Ehsaas Scholarship", "PEEF"], "status": "Active"},
        {"id": "M-003", "name": "Muhammad Tahir", "relation": "Father", "age": 55, "cnic": "42101-1111111-1", "cnic_masked": "42101-XXXXXXX-1", "education": "Matric", "eligible_programs": ["Health Card", "BISP"], "status": "Active"},
        {"id": "M-004", "name": "Fatima Tahir", "relation": "Mother", "age": 50, "cnic": "42101-2222222-2", "cnic_masked": "42101-XXXXXXX-2", "education": "Intermediate", "eligible_programs": ["Ehsaas Kafalat", "Sehat Card"], "status": "Active"},
    ],
    "programs": [
        {"program": "Ehsaas Kafalat", "program_ur": "احساس کفالت", "member": "Fatima Tahir", "status": "Eligible", "amount": "PKR 14,000/quarter", "category": "Family", "official_source": "BISP — bisp.gov.pk", "last_verified": "2026-08-01", "next_step": "Visit BISP center with CNIC"},
        {"program": "Sehat Insaf Card", "program_ur": "صحت انصاف کارڈ", "member": "All", "status": "Enrolled", "amount": "Free treatment up to PKR 1M", "category": "Welfare", "official_source": "Health Ministry — pmhealth.gov.pk", "last_verified": "2026-08-01", "next_step": "Already enrolled — show CNIC at hospital"},
        {"program": "BISP Taleemi Wazaif", "program_ur": "تعلیمی وظائف", "member": "Ayesha Tahir", "status": "Eligible", "amount": "PKR 2,500/quarter", "category": "Education", "official_source": "BISP — bisp.gov.pk", "last_verified": "2026-08-01", "next_step": "Submit school admission slip at BISP"},
        {"program": "PM Youth Laptop", "program_ur": "یوتھ لیپ ٹاپ", "member": "Ehtisham Tahir", "status": "Applied", "amount": "Free laptop", "category": "Youth", "official_source": "PM Youth — pmyouth.gov.pk", "last_verified": "2026-08-01", "next_step": "Track at laptop.pmyp.gov.pk"},
    ]
}

@router.get("/profile")
def profile():
    return HOUSEHOLD

@router.get("/programs")
def programs(category: Optional[str] = None):
    progs = HOUSEHOLD["programs"]
    if category:
        progs = [p for p in progs if p["category"].lower() == category.lower()]
    return {"programs": progs, "by_member": {m["name"]: m["eligible_programs"] for m in HOUSEHOLD["members"]}, "count": len(progs)}

@router.post("/member")
def add_member(payload: dict):
    new_id = f"M-{len(HOUSEHOLD['members'])+1:03d}"
    cnic = payload.get("cnic","")
    member = {
        "id": new_id,
        "name": payload.get("name","New Member"),
        "relation": payload.get("relation","Other"),
        "age": payload.get("age", 18),
        "cnic": cnic,
        "cnic_masked": mask_cnic(cnic) if cnic else "—",
        "education": payload.get("education","Matric"),
        "eligible_programs": ["Ehsaas Scholarship"],
        "status": "Active",
    }
    HOUSEHOLD["members"].append(member)
    return {"status": "added", "member": member, "total": len(HOUSEHOLD["members"])}

@router.get("/member/{member_id}")
def member(member_id: str):
    for m in HOUSEHOLD["members"]:
        if m["id"] == member_id or m["name"].lower().replace(" ","_") == member_id.lower():
            return m
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Member not found")

@router.get("/stats")
def stats():
    return {
        "total_members": len(HOUSEHOLD["members"]),
        "by_relation": {m["relation"]:1 for m in HOUSEHOLD["members"]},
        "programs_enrolled": sum(1 for p in HOUSEHOLD["programs"] if p["status"]=="Enrolled"),
        "programs_eligible": sum(1 for p in HOUSEHOLD["programs"] if p["status"]=="Eligible"),
        "total_programs": len(HOUSEHOLD["programs"]),
    }
