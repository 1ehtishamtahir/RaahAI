from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/citizen", tags=["citizen"])

class CitizenProfile(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    cnic: str
    date_of_birth: str
    education: str
    province: str
    city: str

MOCK_PROFILE = CitizenProfile(
    id="CIT-001",
    name="Ehtisham Tahir",
    email="ehtisham@example.com",
    phone="0300-1234567",
    cnic="42101-1234567-1",
    date_of_birth="1998-01-15",
    education="Bachelor in Computer Science",
    province="Sindh",
    city="Karachi",
)

@router.get("/profile", response_model=CitizenProfile)
def get_profile():
    return MOCK_PROFILE

@router.get("/dashboard")
def dashboard():
    return {
        "citizen": {"name": MOCK_PROFILE.name, "cnic": MOCK_PROFILE.cnic, "city": MOCK_PROFILE.city},
        "summary": {
            "identity": {"cnic_status": "Valid", "passport_status": "Expiring Soon (45 days)", "pending": 1},
            "vehicle": {"count": 2, "pending_token": 1},
            "challans": {"pending": 2, "pending_amount": 7000},
            "payments": {"pending": 3, "pending_amount": 5500},
            "documents": {"total": 5, "expiring": 1},
            "opportunities": {"recommended": 3, "new": 2},
            "family": {"members": 4, "programs": 3},
            "updates": {"new": 6, "relevant": 2},
        },
        "quick_actions": [
            {"label_en": "Renew Passport", "label_ur": "پاسپورٹ تجدید", "href": "/identity/passport", "icon": "passport"},
            {"label_en": "Pay Challan", "label_ur": "چالان ادائیگی", "href": "/challans", "icon": "challan"},
            {"label_en": "Check Eligibility", "label_ur": "اہلیت چیک", "href": "/eligibility", "icon": "check"},
            {"label_en": "Find Office", "label_ur": "دفتر تلاش", "href": "/offices", "icon": "office"},
        ],
    }

@router.post("/login")
def login(payload: dict = None):
    return {"token": "mock-jwt-token-citizen-001", "citizen": MOCK_PROFILE.model_dump(), "message": "Logged in (mock). In production, uses NADRA e-Sahulat / Pak-ID OAuth."}
