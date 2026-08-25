from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.routers.chat import router as chat_router
from app.routers.ocr_router import router as ocr_router
from app.routers.voice import router as voice_router
from app.routers.checklist import router as checklist_router
from app.routers.fees import router as fees_router
from app.routers.eligibility import router as eligibility_router
from app.routers.feedback import router as feedback_router
from app.routers.offices import router as offices_router
from app.routers.alerts import router as alerts_router
from app.routers.identity import router as identity_router
from app.routers.vehicle import router as vehicle_router
from app.routers.challans import router as challans_router
from app.routers.payments import router as payments_router
from app.routers.opportunities import router as opportunities_router
from app.routers.family import router as family_router
from app.routers.updates import router as updates_router
from app.routers.citizen import router as citizen_router
from app.routers.orchestrator import router as orchestrator_router
from app.routers.notifications import router as notifications_router
from app.routers.ai_features import router as ai_features_router
from app.core.database import Base, engine, SessionLocal

settings = get_settings()

app = FastAPI(
    title="RaahAI Backend",
    description="RaahAI Citizen Copilot \u2014 Identity, Vehicle, Challans, Payments, Documents, Opportunities, Family, Updates + RAG + OCR + Voice",
    version="4.1.0",
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    Base.metadata.create_all(bind=engine)
    print("[DB] Tables created/verified successfully")
except Exception as e:
    print(f"[DB] Skipping table creation: {e}")


app.include_router(chat_router)
app.include_router(ocr_router)
app.include_router(voice_router)
app.include_router(checklist_router)
app.include_router(fees_router)
app.include_router(eligibility_router)
app.include_router(feedback_router)
app.include_router(offices_router)
app.include_router(alerts_router)
app.include_router(identity_router)
app.include_router(vehicle_router)
app.include_router(challans_router)
app.include_router(payments_router)
app.include_router(opportunities_router)
app.include_router(family_router)
app.include_router(updates_router)
app.include_router(citizen_router)
app.include_router(orchestrator_router)
app.include_router(notifications_router)
app.include_router(ai_features_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "RaahAI", "version": "4.1.0"}


@app.get("/")
def root():
    return {"message": "RaahAI Backend running. See /docs for API docs."}
