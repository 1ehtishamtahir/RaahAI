from fastapi import APIRouter, Query, Depends
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.db_models import User, PaymentRecord

router = APIRouter(prefix="/api/payments", tags=["payments"])


def _is_overdue(due: str) -> bool:
    try:
        return datetime.strptime(due, "%Y-%m-%d") < datetime.now()
    except Exception:
        return False


def _due_status(p: PaymentRecord) -> str:
    if p.status == "Paid":
        return "Paid"
    if p.status == "Overdue" or (p.status == "Pending" and p.due_date and _is_overdue(p.due_date)):
        return "Overdue"
    if p.due_date:
        try:
            due = datetime.strptime(p.due_date, "%Y-%m-%d")
            if (due - datetime.now()).days <= 7 and (due - datetime.now()).days >= 0:
                return "Due Soon"
        except Exception:
            pass
    return p.status or "Pending"


def _payment_to_dict(p: PaymentRecord) -> dict:
    ds = _due_status(p)
    return {
        "id": p.id, "type": p.type or "Fee",
        "title_en": p.title_en or "", "title_ur": p.title_ur or "",
        "amount": p.amount or 0, "currency": p.currency or "PKR",
        "status": p.status or "Pending", "due_date": p.due_date or "",
        "paid_date": p.paid_date, "method": p.method or "",
        "category": p.category or "", "official_source": p.official_source or "",
        "last_verified": p.last_verified or "", "priority": p.priority or "normal",
        "due_status": ds, "is_overdue": ds == "Overdue", "is_due_soon": ds == "Due Soon",
    }


@router.get("/timeline")
def timeline(
    status: Optional[str] = None,
    category: Optional[str] = None,
    type: Optional[str] = Query(None, description="Fee|Tax|Fine"),
    q: Optional[str] = Query(None, description="Search by title"),
    sort: Optional[str] = Query("due_date", description="due_date|amount|priority"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    all_payments = db.query(PaymentRecord).filter(PaymentRecord.user_id == current_user.id).all()
    data = [_payment_to_dict(p) for p in all_payments]

    if status:
        if status.lower() == "overdue":
            data = [p for p in data if p["due_status"] == "Overdue"]
        elif status.lower() == "due_soon":
            data = [p for p in data if p["due_status"] == "Due Soon"]
        else:
            data = [p for p in data if p["status"].lower() == status.lower() or p["due_status"].lower() == status.lower()]
    if category:
        data = [p for p in data if p["category"].lower() == category.lower()]
    if type:
        data = [p for p in data if p["type"].lower() == type.lower()]
    if q:
        ql = q.lower()
        data = [p for p in data if ql in p["title_en"].lower() or ql in p["title_ur"].lower() or ql in p["category"].lower()]

    if sort == "amount":
        data.sort(key=lambda x: x["amount"], reverse=True)
    elif sort == "priority":
        prio = {"high": 0, "normal": 1}
        data.sort(key=lambda x: prio.get(x.get("priority", "normal"), 1))
    else:
        data.sort(key=lambda x: x["due_date"])

    total = len(all_payments)
    pending = sum(1 for p in all_payments if p.status in ("Pending", "Overdue") or _due_status(p) == "Overdue")
    paid = sum(1 for p in all_payments if p.status == "Paid")
    overdue = sum(1 for p in all_payments if _due_status(p) == "Overdue")
    due_soon = sum(1 for p in all_payments if _due_status(p) == "Due Soon")
    pending_amount = sum(p.amount or 0 for p in all_payments if p.status != "Paid" and _due_status(p) != "Paid")
    overdue_amount = sum(p.amount or 0 for p in all_payments if _due_status(p) == "Overdue")
    paid_amount = sum(p.amount or 0 for p in all_payments if p.status == "Paid")

    return {
        "timeline": data,
        "summary": {
            "total": total, "pending": pending, "paid": paid, "overdue": overdue, "due_soon": due_soon,
            "pending_amount": pending_amount, "overdue_amount": overdue_amount, "paid_amount": paid_amount,
            "total_pending": pending_amount,
        },
    }


@router.get("/analytics")
def analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    all_payments = db.query(PaymentRecord).filter(PaymentRecord.user_id == current_user.id).all()
    cats = {}
    types = {}
    overdue_list = []
    due_soon_list = []
    for p in all_payments:
        ds = _due_status(p)
        if p.status != "Paid":
            cats[p.category or "Other"] = cats.get(p.category or "Other", 0) + (p.amount or 0)
            types[p.type or "Other"] = types.get(p.type or "Other", 0) + (p.amount or 0)
        if ds == "Overdue":
            overdue_list.append(_payment_to_dict(p))
        elif ds == "Due Soon":
            due_soon_list.append(_payment_to_dict(p))
    return {"by_category": cats, "by_type": types, "overdue": overdue_list, "due_soon": due_soon_list}


@router.get("/pending")
def pending(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    all_payments = db.query(PaymentRecord).filter(PaymentRecord.user_id == current_user.id).all()
    pending_payments = [p for p in all_payments if p.status in ("Pending", "Overdue") or _due_status(p) == "Overdue"]
    return {
        "payments": [_payment_to_dict(p) for p in pending_payments],
        "total_pending": sum(p.amount or 0 for p in all_payments if p.status != "Paid"),
    }


@router.get("/fees")
def fees(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    all_payments = db.query(PaymentRecord).filter(PaymentRecord.user_id == current_user.id).all()
    return {"fees": [_payment_to_dict(p) for p in all_payments if p.type == "Fee"]}


@router.get("/taxes")
def taxes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    all_payments = db.query(PaymentRecord).filter(PaymentRecord.user_id == current_user.id).all()
    return {"taxes": [_payment_to_dict(p) for p in all_payments if p.type == "Tax"]}
