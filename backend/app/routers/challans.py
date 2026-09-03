from fastapi import APIRouter, Query, Depends, HTTPException
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.db_models import User, ChallanRecord

router = APIRouter(prefix="/api/challans", tags=["challans"])


@router.get("")
def list_challans(
    status: Optional[str] = Query(None, description="Pending|Paid"),
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(ChallanRecord).filter(ChallanRecord.user_id == current_user.id)
    if status:
        q = q.filter(ChallanRecord.status.ilike(status))
    if category:
        q = q.filter(ChallanRecord.category.ilike(category))
    challans_list = q.order_by(ChallanRecord.created_at.desc()).all()

    all_challans = db.query(ChallanRecord).filter(ChallanRecord.user_id == current_user.id).all()
    pending = sum(1 for c in all_challans if c.status == "Pending")
    paid = sum(1 for c in all_challans if c.status == "Paid")

    def _challan_no(c, idx):
        if c.challan_no:
            return c.challan_no
        c.challan_no = f"CHL-{idx:03d}"
        return c.challan_no

    sorted_all = db.query(ChallanRecord).filter(
        ChallanRecord.user_id == current_user.id
    ).order_by(ChallanRecord.created_at.asc()).all()
    challan_num_map = {c.id: i + 1 for i, c in enumerate(sorted_all)}
    for c in sorted_all:
        if not c.challan_no:
            c.challan_no = f"CHL-{challan_num_map[c.id]:03d}"
    db.commit()

    result = [{
        "id": c.challan_no or f"CHL-{challan_num_map.get(c.id, 0):03d}",
        "category": c.category or "Traffic", "amount": c.amount or 0,
        "status": c.status or "Pending", "issue_date": c.issue_date or "",
        "due_date": c.due_date or "", "source": c.source or "",
        "vehicle": c.vehicle_plate or "", "violation": c.violation or "",
        "explanation_en": c.explanation_en or "", "explanation_ur": c.explanation_ur or "",
    } for c in challans_list]

    return {
        "challans": result,
        "summary": {
            "total": len(all_challans), "pending": pending, "paid": paid,
            "pending_amount": sum(c.amount or 0 for c in all_challans if c.status == "Pending"),
        },
    }


@router.get("/{challan_id}")
def get_challan(challan_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = db.query(ChallanRecord).filter(
        ChallanRecord.id == challan_id, ChallanRecord.user_id == current_user.id
    ).first()
    if not c:
        c = db.query(ChallanRecord).filter(
            ChallanRecord.challan_no == challan_id, ChallanRecord.user_id == current_user.id
        ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Challan not found")
    return {
        "id": c.challan_no or c.id, "category": c.category or "Traffic", "amount": c.amount or 0,
        "status": c.status or "Pending", "issue_date": c.issue_date or "",
        "due_date": c.due_date or "", "source": c.source or "",
        "vehicle": c.vehicle_plate or "", "violation": c.violation or "",
        "explanation_en": c.explanation_en or "", "explanation_ur": c.explanation_ur or "",
    }
