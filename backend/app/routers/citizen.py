from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import hash_password, verify_password, create_access_token, get_current_user
from app.models.db_models import (
    User, Document, VehicleRecord, ChallanRecord, PaymentRecord,
    FamilyMember, FamilyProgram, ChatSession,
)
from app.models.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from datetime import datetime

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
def dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Real data from DB
    docs = db.query(Document).filter(Document.user_id == current_user.id).all()
    vehicles = db.query(VehicleRecord).filter(VehicleRecord.user_id == current_user.id).all()
    challans = db.query(ChallanRecord).filter(ChallanRecord.user_id == current_user.id).all()
    payments = db.query(PaymentRecord).filter(PaymentRecord.user_id == current_user.id).all()
    family_members = db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).all()
    family_programs = db.query(FamilyProgram).filter(FamilyProgram.user_id == current_user.id).all()
    chat_sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).all()

    # Compute stats
    pending_challans = [c for c in challans if c.status == "Pending"]
    pending_payments = [p for p in payments if p.status != "Paid"]
    expiring_docs = []
    for d in docs:
        if d.expiry_date:
            try:
                days = (datetime.strptime(d.expiry_date, "%Y-%m-%d") - datetime.now()).days
                if 0 <= days <= 90:
                    expiring_docs.append(d)
            except Exception:
                pass

    return {
        "citizen": {
            "name": current_user.name,
            "cnic": current_user.cnic or "",
            "city": current_user.city or "",
        },
        "summary": {
            "identity": {
                "cnic_status": "Valid" if current_user.cnic else "Not Added",
                "passport_status": "Expiring Soon" if any(d.document_type == "passport" for d in expiring_docs) else "Valid",
                "pending": len([d for d in docs if d.document_type == "passport"]),
            },
            "vehicle": {
                "count": len(vehicles),
                "pending_token": len([v for v in vehicles if v.token_tax_status == "Pending"]),
            },
            "challans": {
                "pending": len(pending_challans),
                "pending_amount": sum(c.amount or 0 for c in pending_challans),
            },
            "payments": {
                "pending": len(pending_payments),
                "pending_amount": sum(p.amount or 0 for p in pending_payments),
            },
            "documents": {
                "total": len(docs),
                "expiring": len(expiring_docs),
            },
            "opportunities": {"recommended": 3, "new": 2},
            "family": {
                "members": len(family_members),
                "programs": len(family_programs),
            },
            "updates": {"new": 6, "relevant": 2},
        },
        "quick_actions": [
            {"label_en": "Renew Passport", "label_ur": "\u067e\u0627\u0633\u067e\u0648\u0631\u0679 \u062a\u062c\u062f\u06cc\u062f", "href": "/identity?svc=passport", "icon": "passport"},
            {"label_en": "Pay Challan", "label_ur": "\u0686\u0627\u0644\u0627\u0646 \u0627\u062f\u0627\u0626\u06cc\u06af\u06cc", "href": "/challans", "icon": "challan"},
            {"label_en": "Check Eligibility", "label_ur": "\u0627\u0647\u0644\u06cc\u062a \u0686\u06cc\u06a9", "href": "/eligibility", "icon": "check"},
            {"label_en": "Find Office", "label_ur": "\u062f\u0641\u062a\u0631 \u062a\u0644\u0627\u0634", "href": "/offices", "icon": "office"},
        ],
    }
