from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import hash_password, verify_password, create_access_token, get_current_user
from app.models.db_models import User
from app.models.schemas import UserRegister, UserLogin, TokenResponse, UserResponse

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

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=req.name,
        email=req.email,
        phone=req.phone,
        cnic=req.cnic,
        password_hash=hash_password(req.password),
        province=req.province,
        city=req.city,
        education=req.education,
        date_of_birth=req.date_of_birth,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(
        token=token,
        user={"id": user.id, "name": user.name, "email": user.email, "phone": user.phone, "cnic": user.cnic, "province": user.province, "city": user.city, "education": user.education, "date_of_birth": user.date_of_birth},
    )

@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(
        token=token,
        user={"id": user.id, "name": user.name, "email": user.email, "phone": user.phone, "cnic": user.cnic, "province": user.province, "city": user.city, "education": user.education, "date_of_birth": user.date_of_birth},
    )

@router.get("/profile", response_model=CitizenProfile)
def get_profile(current_user: User = Depends(get_current_user)):
    return CitizenProfile(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone or "",
        cnic=current_user.cnic or "",
        date_of_birth=current_user.date_of_birth or "",
        education=current_user.education or "",
        province=current_user.province or "",
        city=current_user.city or "",
    )

@router.get("/dashboard")
def dashboard(current_user: User = Depends(get_current_user)):
    return {
        "citizen": {"name": current_user.name, "cnic": current_user.cnic or "", "city": current_user.city or ""},
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
            {"label_en": "Renew Passport", "label_ur": "پاسپورٹ تجدید", "href": "/identity?svc=passport", "icon": "passport"},
            {"label_en": "Pay Challan", "label_ur": "چالان ادائیگی", "href": "/challans", "icon": "challan"},
            {"label_en": "Check Eligibility", "label_ur": "اہلیت چیک", "href": "/eligibility", "icon": "check"},
            {"label_en": "Find Office", "label_ur": "دفتر تلاش", "href": "/offices", "icon": "office"},
        ],
    }
