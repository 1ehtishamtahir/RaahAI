from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.db_models import User, Document, ChallanRecord, PaymentRecord
from datetime import datetime

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


def _build_notifications(user: User, db: Session) -> list[dict]:
    notifications = []
    now = datetime.now()

    # Documents expiring soon
    docs = db.query(Document).filter(Document.user_id == user.id).all()
    for d in docs:
        if d.expiry_date:
            try:
                exp = datetime.strptime(d.expiry_date, "%Y-%m-%d")
                days = (exp - now).days
                if days < 0:
                    notifications.append({
                        "id": f"doc-expired-{d.id}",
                        "type": "document",
                        "title": f"{d.document_name_en or d.document_type} has expired",
                        "title_ur": f"{d.document_name_ur or d.document_type} ختم ہو گیا ہے",
                        "desc": f"Expired {abs(days)} days ago. Renew immediately.",
                        "desc_ur": f"{abs(days)} دن پہلے ختم ہو گیا۔ فوری تجدید کریں۔",
                        "time": d.expiry_date,
                        "priority": "high",
                        "href": "/alerts",
                    })
                elif 0 <= days <= 30:
                    notifications.append({
                        "id": f"doc-expiring-{d.id}",
                        "type": "document",
                        "title": f"{d.document_name_en or d.document_type} expiring soon",
                        "title_ur": f"{d.document_name_ur or d.document_type} جلد ختم ہو رہا ہے",
                        "desc": f"Expires in {days} days. Start renewal process.",
                        "desc_ur": f"{days} دن میں ختم۔ تجدید شروع کریں۔",
                        "time": d.expiry_date,
                        "priority": "medium",
                        "href": "/alerts",
                    })
            except Exception:
                pass

    # Pending challans
    challans = db.query(ChallanRecord).filter(
        ChallanRecord.user_id == user.id, ChallanRecord.status == "Pending"
    ).all()
    for c in challans:
        notifications.append({
            "id": f"challan-{c.id}",
            "type": "challan",
            "title": f"Pending challan — {c.vehicle_plate or ''}",
            "title_ur": f"زیر التوا چالان — {c.vehicle_plate or ''}",
            "desc": f"PKR {c.amount or 0:,} — {c.violation or 'Traffic violation'}",
            "desc_ur": f"روپے {c.amount or 0:,} — {c.violation or 'ٹریفک خلاف ورزی'}",
            "time": c.issue_date or "",
            "priority": "high" if c.amount and c.amount >= 2000 else "medium",
            "href": "/challans",
        })

    # Overdue payments
    payments = db.query(PaymentRecord).filter(
        PaymentRecord.user_id == user.id,
        PaymentRecord.status.in_(["Pending", "Overdue"])
    ).all()
    for p in payments:
        is_overdue = False
        if p.due_date:
            try:
                due = datetime.strptime(p.due_date, "%Y-%m-%d")
                if due < now:
                    is_overdue = True
            except Exception:
                pass

        if is_overdue or p.status == "Overdue":
            notifications.append({
                "id": f"payment-overdue-{p.id}",
                "type": "payment",
                "title": f"Overdue: {p.title_en or p.type}",
                "title_ur": f"واجب التوا: {p.title_ur or p.type}",
                "desc": f"PKR {p.amount or 0:,} was due on {p.due_date}",
                "desc_ur": f"روپے {p.amount or 0:,} {p.due_date} کو واجب التھے",
                "time": p.due_date,
                "priority": "high",
                "href": "/payments",
            })
        elif p.status == "Pending":
            notifications.append({
                "id": f"payment-due-{p.id}",
                "type": "payment",
                "title": f"Payment due: {p.title_en or p.type}",
                "title_ur": f"ادائیگی واجب: {p.title_ur or p.type}",
                "desc": f"PKR {p.amount or 0:,} due on {p.due_date}",
                "desc_ur": f"روپے {p.amount or 0:,} {p.due_date} کو واجب",
                "time": p.due_date,
                "priority": "medium",
                "href": "/payments",
            })

    # Sort by priority then time
    priority_order = {"high": 0, "medium": 1, "low": 2}
    notifications.sort(key=lambda x: (priority_order.get(x["priority"], 2), x["time"] or ""), reverse=False)
    # High priority first
    notifications.sort(key=lambda x: priority_order.get(x["priority"], 2))

    return notifications


@router.get("")
def list_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notifications = _build_notifications(current_user, db)
    return {"notifications": notifications, "count": len(notifications)}


@router.get("/count")
def notification_count(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notifications = _build_notifications(current_user, db)
    return {"count": len(notifications)}
