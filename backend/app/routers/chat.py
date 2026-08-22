from fastapi import APIRouter, Depends, Request, HTTPException
from app.models.schemas import ChatRequest, ChatResponse, Citation
from app.services.rag import rag_answer
from app.services.checklist import infer_situation_from_query
import uuid
import time
from collections import defaultdict, deque

router = APIRouter(prefix="/chat", tags=["chat"])

# Simple in-memory rate limiter: 20 req/min per IP, 60 per hour (matches Gemini free tier 20/day per model)
# Uses sliding window
_RATE_LIMIT_MIN = 20
_RATE_LIMIT_HOUR = 60
_WINDOW_MIN = 60
_WINDOW_HOUR = 3600
_ip_hits: defaultdict[str, deque] = defaultdict(deque)

def _check_rate(request: Request):
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    q = _ip_hits[ip]
    # clean old
    while q and q[0] < now - _WINDOW_HOUR:
        q.popleft()
    # count in last minute
    recent = sum(1 for t in q if t > now - _WINDOW_MIN)
    if recent >= _RATE_LIMIT_MIN:
        raise HTTPException(status_code=429, detail=f"Rate limit: {_RATE_LIMIT_MIN} requests per minute. Please wait.")
    if len(q) >= _RATE_LIMIT_HOUR:
        raise HTTPException(status_code=429, detail=f"Rate limit: {_RATE_LIMIT_HOUR} requests per hour. Please wait.")
    q.append(now)

@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest, request: Request):
    _check_rate(request)
    answer, citations, grounded = await rag_answer(req.query, lang=req.lang)
    session_id = req.session_id or str(uuid.uuid4())
    return ChatResponse(
        answer=answer,
        citations=[Citation(title=c["title"], snippet=c.get("snippet")) for c in citations],
        grounded=grounded,
        session_id=session_id,
    )
