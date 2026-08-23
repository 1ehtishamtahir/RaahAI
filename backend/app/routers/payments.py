from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/payments", tags=["payments"])

TIMELINE = [
    {"id": "PAY-001", "type": "Fee", "title_en": "Passport Fee (Urgent)", "title_ur": "پاسپورٹ فیس (ارجنٹ)", "amount": 5250, "currency": "PKR", "status": "Paid", "due_date": "2026-08-15", "paid_date": "2026-08-10", "method": "NBP", "category": "Identity", "official_source": "DGIP", "last_verified": "2026-08-01", "priority": "normal"},
    {"id": "PAY-002", "type": "Tax", "title_en": "Token Tax — ABC-123", "title_ur": "ٹوکن ٹیکس — ABC-123", "amount": 2500, "currency": "PKR", "status": "Pending", "due_date": "2026-12-31", "paid_date": None, "method": "Excise / ePay", "category": "Vehicle", "official_source": "Excise & Taxation", "last_verified": "2026-08-01", "priority": "normal"},
    {"id": "PAY-003", "type": "Fee", "title_en": "CNIC Renewal (Normal)", "title_ur": "شناختی کارڈ تجدید", "amount": 1000, "currency": "PKR", "status": "Pending", "due_date": "2026-09-18", "paid_date": None, "method": "NADRA", "category": "Identity", "official_source": "NADRA", "last_verified": "2026-08-01", "priority": "high"},
    {"id": "PAY-004", "type": "Fine", "title_en": "Traffic Challan — CH-2026-001", "title_ur": "ٹریفک چالان", "amount": 2000, "currency": "PKR", "status": "Pending", "due_date": "2026-08-28", "paid_date": None, "method": "Traffic Police app", "category": "Challans", "official_source": "Sindh Police", "last_verified": "2026-08-01", "priority": "high"},
    {"id": "PAY-005", "type": "Fee", "title_en": "SECP Business Name Reservation", "title_ur": "ایس ای سی پی نام ریزرویشن", "amount": 1000, "currency": "PKR", "status": "Paid", "due_date": "2026-07-01", "paid_date": "2026-06-28", "method": "HBL/UBL Challan", "category": "Business", "official_source": "SECP", "last_verified": "2026-08-01", "priority": "normal"},
    {"id": "PAY-006", "type": "Tax", "title_en": "Income Tax Return — FY 2025-26", "title_ur": "انکم ٹیکس ریٹرن", "amount": 15000, "currency": "PKR", "status": "Pending", "due_date": "2026-09-30", "paid_date": None, "method": "FBR IRIS", "category": "Tax", "official_source": "FBR", "last_verified": "2026-08-01", "priority": "high"},
    {"id": "PAY-007", "type": "Fee", "title_en": "FRC Fee", "title_ur": "ایف آر سی فیس", "amount": 1000, "currency": "PKR", "status": "Pending", "due_date": "2026-08-20", "paid_date": None, "method": "NADRA", "category": "Identity", "official_source": "NADRA", "last_verified": "2026-08-01", "priority": "normal"},
    {"id": "PAY-008", "type": "Fine", "title_en": "Token Tax Late Fee — XYZ-789", "title_ur": "ٹوکن ٹیکس جرمانہ", "amount": 500, "currency": "PKR", "status": "Overdue", "due_date": "2026-08-10", "paid_date": None, "method": "Excise", "category": "Vehicle", "official_source": "Excise & Taxation", "last_verified": "2026-08-01", "priority": "high"},
]

def _is_overdue(due: str) -> bool:
    try:
        return datetime.strptime(due, "%Y-%m-%d") < datetime.now()
    except: return False

def _due_status(p):
    if p["status"] == "Paid": return "Paid"
    if p["status"] == "Overdue" or (p["status"]=="Pending" and _is_overdue(p["due_date"])):
        return "Overdue"
    # Due soon within 7 days
    try:
        due = datetime.strptime(p["due_date"], "%Y-%m-%d")
        if (due - datetime.now()).days <= 7 and (due - datetime.now()).days >=0:
            return "Due Soon"
    except: pass
    return p["status"]

@router.get("/timeline")
def timeline(
    status: Optional[str] = None,
    category: Optional[str] = None,
    type: Optional[str] = Query(None, description="Fee|Tax|Fine"),
    q: Optional[str] = Query(None, description="Search by title"),
    sort: Optional[str] = Query("due_date", description="due_date|amount|priority"),
):
    data = TIMELINE.copy()
    # Enrich with computed due_status
    for p in data:
        p["due_status"] = _due_status(p)
        p["is_overdue"] = p["due_status"] == "Overdue"
        p["is_due_soon"] = p["due_status"] == "Due Soon"

    if status:
        # Support Overdue as virtual status
        if status.lower() == "overdue":
            data = [p for p in data if p["due_status"]=="Overdue"]
        elif status.lower() == "due_soon":
            data = [p for p in data if p["due_status"]=="Due Soon"]
        else:
            data = [p for p in data if p["status"].lower() == status.lower() or p["due_status"].lower()==status.lower()]
    if category:
        data = [p for p in data if p["category"].lower() == category.lower()]
    if type:
        data = [p for p in data if p["type"].lower() == type.lower()]
    if q:
        ql = q.lower()
        data = [p for p in data if ql in p["title_en"].lower() or ql in p["title_ur"].lower() or ql in p["category"].lower()]

    # Sorting
    if sort == "amount":
        data.sort(key=lambda x: x["amount"], reverse=True)
    elif sort == "priority":
        prio = {"high":0,"normal":1}
        data.sort(key=lambda x: prio.get(x.get("priority","normal"),1))
    else: # due_date
        data.sort(key=lambda x: x["due_date"])

    total = len(TIMELINE)
    pending = sum(1 for p in TIMELINE if p["status"] in ("Pending","Overdue") or _due_status(p)=="Overdue")
    paid = sum(1 for p in TIMELINE if p["status"]=="Paid")
    overdue = sum(1 for p in TIMELINE if _due_status(p)=="Overdue")
    due_soon = sum(1 for p in TIMELINE if _due_status(p)=="Due Soon")
    pending_amount = sum(p["amount"] for p in data if p["status"]!="Paid" and p["due_status"]!="Paid")
    overdue_amount = sum(p["amount"] for p in TIMELINE if _due_status(p)=="Overdue")
    paid_amount = sum(p["amount"] for p in TIMELINE if p["status"]=="Paid")

    return {
        "timeline": data,
        "summary": {
            "total": total, "pending": pending, "paid": paid, "overdue": overdue, "due_soon": due_soon,
            "pending_amount": pending_amount, "overdue_amount": overdue_amount, "paid_amount": paid_amount,
            "total_pending": pending_amount,
        }
    }

@router.get("/analytics")
def analytics():
    # Category breakdown
    cats = {}
    for p in TIMELINE:
        cats[p["category"]] = cats.get(p["category"], 0) + (p["amount"] if p["status"]!="Paid" else 0)
    types = {}
    for p in TIMELINE:
        types[p["type"]] = types.get(p["type"], 0) + (p["amount"] if p["status"]!="Paid" else 0)
    return {
        "by_category": cats,
        "by_type": types,
        "overdue": [p for p in TIMELINE if _due_status(p)=="Overdue"],
        "due_soon": [p for p in TIMELINE if _due_status(p)=="Due Soon"],
    }

@router.get("/pending")
def pending():
    return {"payments": [p for p in TIMELINE if p["status"] in ("Pending","Overdue") or _due_status(p)=="Overdue"], "total_pending": sum(p["amount"] for p in TIMELINE if p["status"]!="Paid")}

@router.get("/fees")
def fees():
    return {"fees": [p for p in TIMELINE if p["type"]=="Fee"]}

@router.get("/taxes")
def taxes():
    return {"taxes": [p for p in TIMELINE if p["type"]=="Tax"]}
