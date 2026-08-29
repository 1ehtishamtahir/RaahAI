import time
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
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

docs_url = "/docs" if settings.app_env == "development" else None
redoc_url = "/redoc" if settings.app_env == "development" else None
openapi_url = "/openapi.json" if settings.app_env == "development" else None

app = FastAPI(
    title="RaahAI Backend",
    description="RaahAI Citizen Copilot \u2014 Identity, Vehicle, Challans, Payments, Documents, Opportunities, Family, Updates + RAG + OCR + Voice",
    version="4.1.0",
    docs_url=docs_url,
    redoc_url=redoc_url,
    openapi_url=openapi_url,
)

app.add_middleware(GZipMiddleware, minimum_size=500)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

@app.middleware("http")
async def security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if settings.app_env == "production":
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    response.headers["X-Process-Time"] = f"{time.time() - start:.4f}"
    return response

try:
    Base.metadata.create_all(bind=engine)
except Exception:
    pass

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
