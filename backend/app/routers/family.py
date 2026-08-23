from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/family", tags=["family"])

HOUSEHOLD = {
    "id": "HH-001",
    "head": {"name": "Ehtisham Tahir", "cnic": "42101-1234567-1", "age": 28, "education": "Bachelor", "province": "Sindh", "city": "Karachi"},
    "members": [
        {"id": "M-001", "name": "Ehtisham Tahir", "relation": "Self", "age": 28, "cnic": "42101-1234567-1", "education": "Bachelor", "eligible_programs": ["PM Youth Laptop", "Kamyab Jawan Loan"]},
        {"id": "M-002", "name": "Ayesha Tahir", "relation": "Sister", "age": 20, "cnic": "42101-1234568-2", "education": "Intermediate", "eligible_programs": ["Ehsaas Scholarship", "PEEF"]},
        {"id": "M-003", "name": "Muhammad Tahir", "relation": "Father", "age": 55, "cnic": "42101-1111111-1", "education": "Matric", "eligible_programs": ["Health Card"]},
        {"id": "M-004", "name": "Fatima Tahir", "relation": "Mother", "age": 50, "cnic": "42101-2222222-2", "education": "Intermediate", "eligible_programs": ["Ehsaas Kafalat"]},
    ],
    "programs": [
        {"program": "Ehsaas Kafalat", "member": "Fatima Tahir", "status": "Eligible", "amount": "PKR 14,000/quarter"},
        {"program": "Sehat Insaf Card", "member": "All", "status": "Enrolled", "amount": "Free treatment up to PKR 1M"},
        {"program": "BISP Taleemi Wazaif", "member": "Ayesha Tahir", "status": "Eligible", "amount": "PKR 2,500/quarter"},
    ]
}

@router.get("/profile")
def profile():
    return HOUSEHOLD

@router.get("/programs")
def programs():
    return {"programs": HOUSEHOLD["programs"], "by_member": {m["name"]: m["eligible_programs"] for m in HOUSEHOLD["members"]}}

@router.get("/member/{member_id}")
def member(member_id: str):
    for m in HOUSEHOLD["members"]:
        if m["id"] == member_id or m["name"].lower().replace(" ","_") == member_id.lower():
            return m
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Member not found")
