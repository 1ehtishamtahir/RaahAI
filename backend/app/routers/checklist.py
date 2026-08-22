from fastapi import APIRouter, Query, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.schemas import ChecklistResponse, ChecklistUpdateRequest
from app.services.checklist import get_checklist
from app.core.database import get_db
from app.models.db_models import ChecklistState

router = APIRouter(prefix="/checklist", tags=["checklist"])

@router.get("", response_model=ChecklistResponse)
async def get_checklist_route(
    service: str = Query(..., description="passport | cnic | business_registration"),
    situation: str = Query("new", description="new | renewal | modification"),
    completed: str = Query("", description="comma-separated completed ids"),
    session_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    completed_ids = [c.strip() for c in completed.split(",") if c.strip()] if completed else []
    # try DB override if session_id provided
    if session_id:
        try:
            state = db.query(ChecklistState).filter_by(session_id=session_id, service=service, situation=situation).first()
            if state and state.completed_ids:
                completed_ids = state.completed_ids  # DB is source of truth
        except Exception:
            pass
    data = get_checklist(service, situation, completed_ids)
    return ChecklistResponse(**data)

@router.post("/update", response_model=ChecklistResponse)
async def update_checklist(req: ChecklistUpdateRequest, session_id: Optional[str] = None, db: Session = Depends(get_db)):
    # persist if session_id supplied, otherwise stateless
    if session_id:
        try:
            state = db.query(ChecklistState).filter_by(session_id=session_id, service=req.service.value, situation=req.situation).first()
            if state:
                state.completed_ids = req.checked_ids
            else:
                state = ChecklistState(session_id=session_id, service=req.service.value, situation=req.situation, completed_ids=req.checked_ids)
                db.add(state)
            db.commit()
        except Exception as e:
            db.rollback()
            # still return computed checklist even if DB fails
            print(f"[checklist] persist skip: {e}")
    data = get_checklist(req.service.value, req.situation, req.checked_ids)
    return ChecklistResponse(**data)
