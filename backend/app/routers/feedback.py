from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.db_models import User, FeedbackEntry

router = APIRouter(prefix="/feedback", tags=["feedback"])

class FeedbackRequest(BaseModel):
    message_id: str
    rating: str  # "up" or "down"
    comment: Optional[str] = None
    session_id: Optional[str] = None

class FeedbackStats(BaseModel):
    total: int
    up: int
    down: int
    percentage: float

@router.post("")
def submit_feedback(req: FeedbackRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entry = FeedbackEntry(
        user_id=current_user.id,
        message_id=req.message_id,
        rating=req.rating,
        comment=req.comment,
        session_id=req.session_id,
    )
    db.add(entry)
    db.commit()
    return {"status": "ok", "message": "Thank you for your feedback!"}

@router.get("/stats", response_model=FeedbackStats)
def get_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entries = db.query(FeedbackEntry).filter(FeedbackEntry.user_id == current_user.id).all()
    total = len(entries)
    up = sum(1 for f in entries if f.rating == "up")
    down = total - up
    pct = (up / total * 100) if total > 0 else 0
    return FeedbackStats(total=total, up=up, down=down, percentage=round(pct, 1))
