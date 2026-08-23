from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

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

# In-memory store (demo)
_feedback_store: list[dict] = []

@router.post("")
def submit_feedback(req: FeedbackRequest):
    entry = {
        "message_id": req.message_id,
        "rating": req.rating,
        "comment": req.comment,
        "session_id": req.session_id,
        "timestamp": datetime.utcnow().isoformat(),
    }
    _feedback_store.append(entry)
    return {"status": "ok", "message": "Thank you for your feedback!"}

@router.get("/stats", response_model=FeedbackStats)
def get_stats():
    total = len(_feedback_store)
    up = sum(1 for f in _feedback_store if f["rating"] == "up")
    down = total - up
    pct = (up / total * 100) if total > 0 else 0
    return FeedbackStats(total=total, up=up, down=down, percentage=round(pct, 1))
