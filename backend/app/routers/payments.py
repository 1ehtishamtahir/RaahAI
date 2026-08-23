from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter(prefix="/api/payments", tags=["payments"])

TIMELINE = [
    {"id": "PAY-001", "type": "Fee", "title_en": "Passport Fee (Urgent)", "title_ur": "پاسپورٹ فیس (ارجنٹ)", "amount": 5250, "currency": "PKR", "status": "Paid", "due_date": "2026-08-15", "paid_date": "2026-08-10", "method": "NBP", "category": "Identity", "official_source": "DGIP", "last_verified": "2026-08-01"},
    {"id": "PAY-002", "type": "Tax", "title_en": "Token Tax — ABC-123", "title_ur": "ٹوکن ٹیکس — ABC-123", "amount": 2500, "currency": "PKR", "status": "Pending", "due_date": "2026-12-31", "paid_date": None, "method": "Excise / ePay", "category": "Vehicle", "official_source": "Excise & Taxation", "last_verified": "2026-08-01"},
    {"id": "PAY-003", "type": "Fee", "title_en": "CNIC Renewal (Normal)", "title_ur": "شناختی کارڈ تجدید", "amount": 1000, "currency": "PKR", "status": "Pending", "due_date": "2026-09-30", "paid_date": None, "method": "NADRA", "category": "Identity", "official_source": "NADRA", "last_verified": "2026-08-01"},
    {"id": "PAY-004", "type": "Fine", "title_en": "Traffic Challan — CH-2026-001", "title_ur": "ٹریفک چالان", "amount": 2000, "currency": "PKR", "status": "Pending", "due_date": "2026-09-10", "paid_date": None, "method": "Traffic Police app", "category": "Challans", "official_source": "Sindh Police", "last_verified": "2026-08-01"},
    {"id": "PAY-005", "type": "Fee", "title_en": "SECP Business Name Reservation", "title_ur": "ایس ای سی پی نام ریزرویشن", "amount": 1000, "currency": "PKR", "status": "Paid", "due_date": "2026-07-01", "paid_date": "2026-06-28", "method": "HBL/UBL Challan", "category": "Business", "official_source": "SECP", "last_verified": "2026-08-01"},
]

@router.get("/timeline")
def timeline(status: Optional[str] = None, category: Optional[str] = None):
    data = TIMELINE
    if status:
        data = [p for p in data if p["status"].lower() == status.lower()]
    if category:
        data = [p for p in data if p["category"].lower() == category.lower()]
    return {"timeline": data, "summary": {"total": len(TIMELINE), "pending": sum(1 for p in TIMELINE if p["status"]=="Pending"), "paid": sum(1 for p in TIMELINE if p["status"]=="Paid"), "pending_amount": sum(p["amount"] for p in TIMELINE if p["status"]=="Pending")}}

@router.get("/pending")
def pending():
    return {"payments": [p for p in TIMELINE if p["status"]=="Pending"], "total_pending": sum(p["amount"] for p in TIMELINE if p["status"]=="Pending")}

@router.get("/fees")
def fees():
    return {"fees": [p for p in TIMELINE if p["type"]=="Fee"]}

@router.get("/taxes")
def taxes():
    return {"taxes": [p for p in TIMELINE if p["type"]=="Tax"]}
