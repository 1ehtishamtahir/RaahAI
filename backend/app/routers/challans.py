from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter(prefix="/api/challans", tags=["challans"])

CHALLANS = [
    {"id": "CH-2026-001", "category": "Traffic", "amount": 2000, "status": "Pending", "issue_date": "2026-08-10", "due_date": "2026-09-10", "source": "Traffic Police — Sindh", "vehicle": "ABC-123", "violation": "Signal violation — Shara-e-Faisal", "explanation_en": "You crossed the signal at Shara-e-Faisal. Pay within 30 days to avoid fine.", "explanation_ur": "آپ نے شارع فیصل پر سگنل توڑا۔ 30 دن کے اندر ادائیگی کریں۔"},
    {"id": "CH-2026-002", "category": "Traffic", "amount": 1500, "status": "Paid", "issue_date": "2026-07-15", "due_date": "2026-08-15", "source": "Traffic Police — Punjab", "vehicle": "XYZ-789", "violation": "No helmet — Mall Road", "explanation_en": "Riding without helmet on Mall Road.", "explanation_ur": "مال روڈ پر ہیلمٹ کے بغیر سواری۔"},
    {"id": "CH-2025-089", "category": "Excise", "amount": 5000, "status": "Pending", "issue_date": "2026-06-20", "due_date": "2026-07-20", "source": "Excise & Taxation", "vehicle": "ABC-123", "violation": "Token tax overdue", "explanation_en": "Token tax for FY 2025-26 not paid.", "explanation_ur": "ٹوکن ٹیکس ادا نہیں کیا گیا۔"},
]

@router.get("")
def list_challans(status: Optional[str] = Query(None, description="Pending|Paid"), category: Optional[str] = None):
    data = CHALLANS
    if status:
        data = [c for c in data if c["status"].lower() == status.lower()]
    if category:
        data = [c for c in data if c["category"].lower() == category.lower()]
    pending = sum(1 for c in CHALLANS if c["status"]=="Pending")
    paid = sum(1 for c in CHALLANS if c["status"]=="Paid")
    return {"challans": data, "summary": {"total": len(CHALLANS), "pending": pending, "paid": paid, "pending_amount": sum(c["amount"] for c in CHALLANS if c["status"]=="Pending")}}

@router.get("/{challan_id}")
def get_challan(challan_id: str):
    for c in CHALLANS:
        if c["id"] == challan_id:
            return c
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Challan not found")
