from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.db_models import User, VehicleRecord

router = APIRouter(prefix="/api/vehicle", tags=["vehicle"])

class MissionStep(BaseModel):
    step: str
    title_en: str
    title_ur: str
    description_en: str
    description_ur: str
    status: str = "pending"

class MissionFlow(BaseModel):
    service: str
    name_en: str
    name_ur: str
    mission_steps: list[MissionStep]
    required_documents: list[str]
    eligibility: list[str]
    fee_normal: str
    fee_urgent: str
    application_method: list[str]
    tracking_url: str
    official_source: str
    last_verified: str


REG_FLOW = MissionFlow(
    service="registration", name_en="Vehicle Registration", name_ur="\u06af\u0627\u0691\u06cc \u06a9\u06cc \u0631\u062c\u0633\u0637\u0631\u06cc\u0634\u0646",
    mission_steps=[
        MissionStep(step="1", title_en="Requirement", title_ur="\u0636\u0631\u0648\u0631\u062a", description_en="New vehicle registration", description_ur="\u0646\u0626\u06cc \u06af\u0627\u0691\u06cc \u06a9\u06cc \u0631\u062c\u0633\u0637\u0631\u06cc\u0634\u0646", status="done"),
        MissionStep(step="2", title_en="Eligibility", title_ur="\u0627\u0647\u0644\u06cc\u062a", description_en="Owner with valid CNIC, invoice", description_ur="\u062f\u0631\u0633\u062a \u0634\u0646\u0627\u062e\u062a\u06cc \u06a9\u0627\u0631\u062f \u0627\u0648\u0631 \u0627\u0646\u0648\u0627\u0626\u0633 \u06a9\u06d2 \u0633\u0627\u062a\u06be", status="pending"),
        MissionStep(step="3", title_en="Documents", title_ur="\u062f\u0633\u062a\u0627\u0648\u06cc\u0632\u0627\u062a", description_en="CNIC, sale invoice, import docs, form", description_ur="\u0634\u0646\u0627\u062e\u062a\u06cc \u06a9\u0627\u0631\u062f\u060c \u0633\u06cc\u0644 \u0627\u0646\u0648\u0627\u0626\u0633\u060c \u062f\u0631\u0622\u0645\u062f\u06cc \u062f\u0633\u062a\u0627\u0648\u06cc\u0632\u0627\u062a", status="pending"),
        MissionStep(step="4", title_en="Fee", title_ur="\u0641\u06cc\u0633", description_en="Registration fee based on CC/engine", description_ur="\u0627\u0646\u062c\u0646 \u06a9\u06cc \u06af\u0646\u062c\u0627\u0626\u0634 \u06a9\u06d2 \u062d\u0633\u0627\u0628 \u0633\u06d2 \u0641\u06cc\u0633", status="pending"),
        MissionStep(step="5", title_en="Application", title_ur="\u062f\u0631\u062e\u0648\u0633\u062a", description_en="Visit Excise office, submit docs, verification", description_ur="\u0627\u06cc\u06a9\u0633\u0627\u0626\u0632 \u0622\u0641\u0633 \u062c\u0627\u0626\u06cc\u06ba\u060c \u062f\u0633\u062a\u0627\u0648\u06cc\u0632\u0627\u062a \u062c\u0645\u0639 \u06a9\u0631\u0627\u0626\u06cc\u06ba", status="pending"),
        MissionStep(step="6", title_en="Tracking", title_ur="\u0679\u0631\u06cc\u06a9\u0646\u06af", description_en="Receive number plate + registration book", description_ur="\u0646\u0645\u0628\u0631 \u067e\u0644\u06cc\u0679 \u0627\u0648\u0631 \u0631\u062c\u0633\u0637\u0631\u06cc\u0634\u0646 \u0628\u06a9 \u0648\u0635\u0648\u0644 \u06a9\u0631\u06cc\u06ba", status="pending"),
    ],
    required_documents=["CNIC (owner)", "Sale invoice", "Import documents (if imported)", "Form A + photos", "Proof of address"],
    eligibility=["Valid CNIC", "Vehicle invoice", "No outstanding challans"],
    fee_normal="Car 1000-1300cc: PKR 25,000", fee_urgent="Urgent: +PKR 5,000",
    application_method=["Visit Excise & Taxation office", "Submit CNIC + invoice + import docs", "Pay registration fee at NBP", "Receive number plate + book"],
    tracking_url="https://excise.gos.pk", official_source="Excise & Taxation \u2014 excise.gos.pk", last_verified="2026-08-01",
)

TRANSFER_FLOW = MissionFlow(
    service="transfer", name_en="Ownership Transfer", name_ur="\u0645\u0644\u06a9\u06cc\u062a \u06a9\u06cc \u0645\u0646\u062a\u0642\u0644\u06cc",
    mission_steps=[
        MissionStep(step="1", title_en="Requirement", title_ur="\u0636\u0631\u0648\u0631\u062a", description_en="Transfer ownership seller \u2192 buyer", description_ur="\u0641\u0631\u0648\u062e\u062a \u06a9\u0646\u0646\u062f\u0647 \u0633\u06d2 \u062e\u0631\u06cc\u062f\u0627\u0631 \u06a9\u0648 \u0645\u0646\u062a\u0642\u0644\u06cc", status="done"),
        MissionStep(step="2", title_en="Eligibility", title_ur="\u0627\u0647\u0644\u06cc\u062a", description_en="Both parties with valid CNICs, no dues", description_ur="\u062f\u0648\u0646\u0648\u06ba \u0641\u0631\u06cc\u0642\u06cc\u0646 \u06a9\u06d2 \u062f\u0631\u0633\u062a \u0634\u0646\u0627\u062e\u062a\u06cc \u06a9\u0627\u0631\u062f\u060c \u06a9\u0648\u0626\u06cc \u0648\u0627\u062c\u0628\u0627\u062a \u0646\u06be\u06cc\u06ba", status="pending"),
        MissionStep(step="3", title_en="Documents", title_ur="\u062f\u0633\u062a\u0627\u0648\u06cc\u0632\u0627\u062a", description_en="CNICs, transfer deed, registration book, NOC", description_ur="\u0634\u0646\u0627\u062e\u062a\u06cc \u06a9\u0627\u0631\u062f\u060c \u0679\u0631\u0627\u0646\u0633\u0641\u0631 \u062f\u06cc\u0688\u060c \u0631\u062c\u0633\u0637\u0631\u06cc\u0634\u0646 \u0628\u06a9", status="pending"),
        MissionStep(step="4", title_en="Fee", title_ur="\u0641\u06cc\u0633", description_en="1% of vehicle value + service charges", description_ur="\u06af\u0627\u0691\u06cc \u06a9\u06cc \u0642\u06cc\u0645\u062a \u06a9\u0627 1% + \u0633\u0631\u0648\u0633 \u0686\u0627\u0631\u062c", status="pending"),
        MissionStep(step="5", title_en="Application", title_ur="\u062f\u0631\u062e\u0648\u0633\u062a", description_en="Both visit Excise, biometrics, submit deed", description_ur="\u062f\u0648\u0646\u0648\u06ba \u0627\u06cc\u06a9\u0633\u0627\u0626\u0632 \u062c\u0627\u0626\u06cc\u06ba\u060c \u0628\u0627\u0626\u06cc\u0648\u0645\u06cc\u0679\u0631\u06a9\u0633\u060c \u062f\u06cc\u0688 \u062c\u0645\u0639", status="pending"),
        MissionStep(step="6", title_en="Tracking", title_ur="\u0679\u0631\u06cc\u06a9\u0646\u06af", description_en="Receive new registration book in buyer name", description_ur="\u062e\u0631\u06cc\u062f\u0627\u0631 \u06a9\u06d2 \u0646\u0627\u0645 \u067e\u0631 \u0646\u0626\u06cc \u0631\u062c\u0633\u0637\u0631\u06cc\u0634\u0646 \u0628\u06a9", status="pending"),
    ],
    required_documents=["Seller + Buyer CNICs", "Transfer deed (Form)", "Original registration book", "NOC (if leased)", "Token tax clearance"],
    eligibility=["No pending challans/token dues", "Valid CNICs", "Seller consent"],
    fee_normal="1% of assessed value", fee_urgent="Urgent: +PKR 2,000",
    application_method=["Seller + buyer visit Excise", "Submit CNICs + transfer deed", "Pay transfer fee (1% of value)", "Receive new registration book"],
    tracking_url="https://excise.gos.pk", official_source="Excise & Taxation \u2014 excise.gos.pk", last_verified="2026-08-01",
)

TOKEN_FLOW = MissionFlow(
    service="token_tax", name_en="Token Tax", name_ur="\u0679\u0648\u06a9\u0646 \u0679\u06cc\u06a9\u0633",
    mission_steps=[
        MissionStep(step="1", title_en="Requirement", title_ur="\u0636\u0631\u0648\u0631\u062a", description_en="Annual token tax payment", description_ur="\u0633\u0627\u0644\u0627\u0646\u0647 \u0679\u0648\u06a9\u0646 \u0679\u06cc\u06a9\u0633 \u06a9\u06cc \u0627\u062f\u0627\u0626\u06cc\u06af\u06cc", status="done"),
        MissionStep(step="2", title_en="Eligibility", title_ur="\u0627\u0647\u0644\u06cc\u062a", description_en="Registered vehicle owner", description_ur="\u0631\u062c\u0633\u0637\u0631\u0688 \u06af\u0627\u0691\u06cc \u06a9\u0627 \u0645\u0627\u0644\u06a9", status="pending"),
        MissionStep(step="3", title_en="Documents", title_ur="\u062f\u0633\u062a\u0627\u0648\u06cc\u0632\u0627\u062a", description_en="Registration book, CNIC", description_ur="\u0631\u062c\u0633\u0637\u0631\u06cc\u0634\u0646 \u0628\u06a9\u060c \u0634\u0646\u0627\u062e\u062a\u06cc \u06a9\u0627\u0631\u062f", status="pending"),
        MissionStep(step="4", title_en="Fee", title_ur="\u0641\u06cc\u0633", description_en="Car: PKR 2,500 | Bike: PKR 1,000", description_ur="\u06a9\u0627\u0631 2500 | \u0645\u0648\u0679\u0631 \u0633\u0627\u0626\u06a9\u0644 1000", status="pending"),
        MissionStep(step="5", title_en="Application", title_ur="\u062f\u0631\u062e\u0648\u0633\u062a", description_en="Pay via Excise or ePay app", description_ur="\u0627\u06cc\u06a9\u0633\u0627\u0626\u0632 \u06cc\u0627 \u0627\u06cc \u067e\u06cc \u0627\u06cc\u067e \u0633\u06d2 \u0627\u062f\u0627\u0626\u06cc\u06af\u06cc", status="pending"),
        MissionStep(step="6", title_en="Tracking", title_ur="\u0679\u0631\u06cc\u06a9\u0646\u06af", description_en="Receive payment receipt, update record", description_ur="\u0631\u0633\u06cc\u062f \u0648\u0635\u0648\u0644 \u06a9\u0631\u06cc\u06ba\u060c \u0631\u06cc\u06a9\u0627\u0631\u0688 \u0627\u067e \u0688\u06cc\u0679", status="pending"),
    ],
    required_documents=["Registration book", "CNIC", "Previous token receipt"],
    eligibility=["Vehicle registered", "No outstanding dues"],
    fee_normal="Car: PKR 2,500 | Bike: PKR 1,000", fee_urgent="Late fee: +PKR 500/month",
    application_method=["Visit Excise office or ePay Punjab/Sindh app", "Enter registration no", "Pay token tax", "Receive receipt"],
    tracking_url="https://epay.punjab.gov.pk", official_source="Excise & Taxation \u2014 epay.punjab.gov.pk", last_verified="2026-08-01",
)

FLOWS = {
    "registration": REG_FLOW,
    "transfer": TRANSFER_FLOW,
    "token_tax": TOKEN_FLOW,
    "token": TOKEN_FLOW,
}


@router.get("")
def list_vehicles(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    vehicles = db.query(VehicleRecord).filter(VehicleRecord.user_id == current_user.id).all()
    result = [{
        "id": v.id, "registration_no": v.registration_no or "",
        "type": v.vehicle_type or "Car", "make": v.make or "",
        "model": v.model or "", "owner": v.owner_name or current_user.name,
        "ownership_status": v.ownership_status or "Owned",
        "token_tax_status": v.token_tax_status or "Pending",
        "token_due": v.token_due or "", "cnic": current_user.cnic or "",
    } for v in vehicles]
    return {"vehicles": result, "count": len(result)}


@router.get("/flows")
def list_flows():
    return {"services": list(FLOWS.keys())}


@router.get("/flow/{service}", response_model=MissionFlow)
def get_flow(service: str):
    flow = FLOWS.get(service)
    if not flow:
        raise HTTPException(status_code=404, detail=f"Unknown vehicle service: {service}")
    return flow


@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    v = db.query(VehicleRecord).filter(
        VehicleRecord.id == vehicle_id, VehicleRecord.user_id == current_user.id
    ).first()
    if not v:
        v = db.query(VehicleRecord).filter(
            VehicleRecord.user_id == current_user.id,
            VehicleRecord.registration_no == vehicle_id
        ).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {
        "id": v.id, "registration_no": v.registration_no or "",
        "type": v.vehicle_type or "Car", "make": v.make or "",
        "model": v.model or "", "owner": v.owner_name or current_user.name,
        "ownership_status": v.ownership_status or "Owned",
        "token_tax_status": v.token_tax_status or "Pending",
        "token_due": v.token_due or "", "cnic": current_user.cnic or "",
    }


@router.post("/register")
def register_vehicle(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    vehicle = VehicleRecord(
        user_id=current_user.id,
        registration_no=payload.get("registration_no", f"NEW-{str(hash(str(payload)))[-4:]}"),
        vehicle_type=payload.get("type", "Car"),
        make=payload.get("make", ""),
        model=payload.get("model", ""),
        year=payload.get("year", ""),
        color=payload.get("color", ""),
        owner_name=current_user.name,
        token_tax_status="Pending",
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return {
        "status": "Submitted", "vehicle_id": vehicle.id,
        "registration_no": vehicle.registration_no,
        "message": "Vehicle registration submitted. Visit Excise office with documents.",
        "next_steps": ["Visit Excise & Taxation office", "Submit CNIC + invoice + import docs", "Pay registration fee", "Receive number plate"],
    }


@router.post("/transfer")
def transfer_vehicle(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {
        "status": "Submitted", "message": "Ownership transfer initiated.",
        "next_steps": ["Seller + buyer visit Excise", "Submit CNICs + transfer deed", "Pay transfer fee (1% of value)", "Receive new registration book"],
    }


@router.get("/{vehicle_id}/token-tax")
def token_tax(vehicle_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    v = db.query(VehicleRecord).filter(
        VehicleRecord.id == vehicle_id, VehicleRecord.user_id == current_user.id
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    amount = "PKR 2,500" if v.vehicle_type == "Car" else "PKR 1,000"
    return {
        "registration_no": v.registration_no, "token_tax_status": v.token_tax_status,
        "due_date": v.token_due, "amount": amount,
        "pay_at": "Excise office or ePay Punjab/Sindh app",
        "official_source": "Excise & Taxation Department", "last_verified": "2026-08-01",
    }
