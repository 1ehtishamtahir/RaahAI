from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.routers.chat import router as chat_router
from app.routers.ocr_router import router as ocr_router
from app.routers.voice import router as voice_router
from app.routers.checklist import router as checklist_router
from app.core.database import Base, engine

settings = get_settings()

app = FastAPI(
    title="RaahAI Backend",
    description="AI Government Assistant — RAG + OCR + Voice",
    version="1.0.0",
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# create tables (for dev; use alembic in prod)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[DB] Skipping table creation: {e}")

app.include_router(chat_router)
app.include_router(ocr_router)
app.include_router(voice_router)
app.include_router(checklist_router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "RaahAI", "version": "1.0.0"}

@app.get("/")
def root():
    return {"message": "RaahAI Backend running. See /docs for API docs."}
