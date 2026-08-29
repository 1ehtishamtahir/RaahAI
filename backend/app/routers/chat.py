from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from app.models.schemas import ChatRequest, ChatResponse, Citation
from app.services.llm_10_pipeline import run_10llm_pipeline
from app.core.database import get_db
from app.core.auth import security, get_current_user
from app.models.db_models import User, ChatSession, ChatMessage
from sqlalchemy.orm import Session
import uuid
import time
from collections import defaultdict, deque

router = APIRouter(prefix="/chat", tags=["chat"])

_RATE_LIMIT_MIN = 20
_RATE_LIMIT_HOUR = 60
_WINDOW_MIN = 60
_WINDOW_HOUR = 3600
_ip_hits: defaultdict[str, deque] = defaultdict(deque)


def _check_rate(request: Request):
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    q = _ip_hits[ip]
    while q and q[0] < now - _WINDOW_HOUR:
        q.popleft()
    recent = sum(1 for t in q if t > now - _WINDOW_MIN)
    if recent >= _RATE_LIMIT_MIN:
        raise HTTPException(status_code=429, detail=f"Rate limit: {_RATE_LIMIT_MIN} requests per minute. Please wait.")
    if len(q) >= _RATE_LIMIT_HOUR:
        raise HTTPException(status_code=429, detail=f"Rate limit: {_RATE_LIMIT_HOUR} requests per hour. Please wait.")
    q.append(now)


@router.post("", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    request: Request,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    _check_rate(request)

    # Resolve user if token provided
    user_id = None
    if credentials:
        try:
            from app.core.auth import decode_token
            payload = decode_token(credentials.credentials)
            user_id = payload.get("sub")
        except Exception as e:
            print(f"[chat] token decode failed: {e}")

    # Fetch conversation history for context
    history = []
    if user_id and req.session_id:
        try:
            session_owner = db.query(ChatSession).filter(
                ChatSession.id == req.session_id,
                ChatSession.user_id == user_id
            ).first()
            if session_owner:
                prev_msgs = db.query(ChatMessage).filter(
                    ChatMessage.session_id == req.session_id
                ).order_by(ChatMessage.created_at.desc()).limit(10).all()
                history = [{"role": m.role, "content": m.content} for m in reversed(prev_msgs)]
        except Exception:
            pass

    # Determine language
    lang = req.lang.value if hasattr(req.lang, 'value') else str(req.lang)

    # Process through the 10-LLM pipeline (parallel execution for speed)
    result = await run_10llm_pipeline(
        query=req.query,
        user_id=user_id,
        db=db,
        lang=lang,
    )

    answer = result["answer"]
    sources = result.get("sources", [])
    grounded = result.get("grounded", False)

    # Build citations from sources
    citations = []
    for s in sources:
        citations.append({
            "title": s.get("title", "Unknown"),
            "snippet": s.get("snippet", ""),
        })

    # Persist to DB if user is logged in
    session_id = req.session_id
    if user_id:
        if not session_id:
            chat_session = ChatSession(
                user_id=user_id,
                title=req.query[:80],
                lang=lang
            )
            db.add(chat_session)
            db.commit()
            db.refresh(chat_session)
            session_id = chat_session.id
        else:
            existing = db.query(ChatSession).filter(
                ChatSession.id == session_id,
                ChatSession.user_id == user_id
            ).first()
            if not existing:
                chat_session = ChatSession(
                    user_id=user_id,
                    title=req.query[:80],
                    lang=lang
                )
                db.add(chat_session)
                db.commit()
                db.refresh(chat_session)
                session_id = chat_session.id

        # Save user message
        user_msg = ChatMessage(session_id=session_id, role="user", content=req.query)
        db.add(user_msg)

        # Save assistant message with source metadata
        citation_data = [{"title": c["title"], "snippet": c.get("snippet")} for c in citations]
        assistant_msg = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=answer,
            citations=citation_data
        )
        db.add(assistant_msg)
        db.commit()
    else:
        session_id = session_id or str(uuid.uuid4())

    return ChatResponse(
        answer=answer,
        citations=[Citation(title=c["title"], snippet=c.get("snippet")) for c in citations],
        grounded=grounded,
        session_id=session_id,
    )


@router.get("/sessions")
def list_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.updated_at.desc()).limit(50).all()
    return {
        "sessions": [{
            "id": s.id,
            "title": s.title or "New Chat",
            "lang": s.lang,
            "created_at": s.created_at.isoformat() if s.created_at else "",
            "updated_at": s.updated_at.isoformat() if s.updated_at else "",
        } for s in sessions]
    }


@router.get("/sessions/{session_id}/messages")
def get_session_messages(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at).all()
    return {
        "session_id": session.id,
        "messages": [{
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "citations": m.citations or [],
            "created_at": m.created_at.isoformat() if m.created_at else "",
        } for m in messages],
    }


@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    db.delete(session)
    db.commit()
    return {"status": "ok"}
