from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

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

VEHICLES = [
    {"id": "VEH-001", "registration_no": "ABC-123", "type": "Car", "make": "Toyota Corolla", "model": "2022", "owner": "Ehtisham Tahir", "ownership_status": "Owned", "token_tax_status": "Paid", "token_due": "2026-12-31", "cnic": "42101-1234567-1"},
    {"id": "VEH-002", "registration_no": "XYZ-789", "type": "Motorcycle", "make": "Honda CG 125", "model": "2020", "owner": "Ehtisham Tahir", "ownership_status": "Owned", "token_tax_status": "Pending", "token_due": "2026-09-30", "cnic": "42101-1234567-1"},
]

REG_FLOW = MissionFlow(
    service="registration", name_en="Vehicle Registration", name_ur="گاڑی کی رجسٹریشن",
    mission_steps=[
        MissionStep(step="1", title_en="Requirement", title_ur="ضرورت", description_en="New vehicle registration", description_ur="نئی گاڑی کی رجسٹریشن", status="done"),
        MissionStep(step="2", title_en="Eligibility", title_ur="اہلیت", description_en="Owner with valid CNIC, invoice", description_ur="درست شناختی کارڈ اور انوائس کے ساتھ مالک", status="pending"),
        MissionStep(step="3", title_en="Documents", title_ur="دستاویزات", description_en="CNIC, sale invoice, import docs, form", description_ur="شناختی کارڈ، سیل انوائس، درآمدی دستاویزات", status="pending"),
        MissionStep(step="4", title_en="Fee", title_ur="فیس", description_en="Registration fee based on CC/engine", description_ur="انجن کی گنجائش کے حساب سے فیس", status="pending"),
        MissionStep(step="5", title_en="Application", title_ur="درخواست", description_en="Visit Excise office, submit docs, verification", description_ur="ایکسائز آفس جائیں، دستاویزات جمع کرائیں", status="pending"),
        MissionStep(step="6", title_en="Tracking", title_ur="ٹریکنگ", description_en="Receive number plate + registration book", description_ur="نمبر پلیٹ اور رجسٹریشن بک وصول کریں", status="pending"),
    ],
    required_documents=["CNIC (owner)", "Sale invoice", "Import documents (if imported)", "Form A + photos", "Proof of address"],
    eligibility=["Valid CNIC", "Vehicle invoice", "No outstanding challans"],
    fee_normal="Car 1000-1300cc: PKR 25,000", fee_urgent="Urgent: +PKR 5,000",
    application_method=["Visit Excise & Taxation office", "Submit CNIC + invoice + import docs", "Pay registration fee at NBP", "Receive number plate + book"],
    tracking_url="https://excise.gos.pk", official_source="Excise & Taxation — excise.gos.pk", last_verified="2026-08-01",
)

TRANSFER_FLOW = MissionFlow(
    service="transfer", name_en="Ownership Transfer", name_ur="ملکیت کی منتقلی",
    mission_steps=[
        MissionStep(step="1", title_en="Requirement", title_ur="ضرورت", description_en="Transfer ownership seller → buyer", description_ur="فروخت کنندہ سے خریدار کو منتقلی", status="done"),
        MissionStep(step="2", title_en="Eligibility", title_ur="اہلیت", description_en="Both parties with valid CNICs, no dues", description_ur="دونوں فریقین کے درست شناختی کارڈ، کوئی واجبات نہیں", status="pending"),
        MissionStep(step="3", title_en="Documents", title_ur="دستاویزات", description_en="CNICs, transfer deed, registration book, NOC", description_ur="شناختی کارڈ، ٹرانسفر ڈیڈ، رجسٹریشن بک", status="pending"),
        MissionStep(step="4", title_en="Fee", title_ur="فیس", description_en="1% of vehicle value + service charges", description_ur="گاڑی کی قیمت کا 1% + سروس چارجز", status="pending"),
        MissionStep(step="5", title_en="Application", title_ur="درخواست", description_en="Both visit Excise, biometrics, submit deed", description_ur="دونوں ایکسائز جائیں، بائیومیٹرکس، ڈیڈ جمع", status="pending"),
        MissionStep(step="6", title_en="Tracking", title_ur="ٹریکنگ", description_en="Receive new registration book in buyer name", description_ur="خریدار کے نام پر نئی رجسٹریشن بک", status="pending"),
    ],
    required_documents=["Seller + Buyer CNICs", "Transfer deed (Form)", "Original registration book", "NOC (if leased)", "Token tax clearance"],
    eligibility=["No pending challans/token dues", "Valid CNICs", "Seller consent"],
    fee_normal="1% of assessed value", fee_urgent="Urgent: +PKR 2,000",
    application_method=["Seller + buyer visit Excise", "Submit CNICs + transfer deed", "Pay transfer fee (1% of value)", "Receive new registration book"],
    tracking_url="https://excise.gos.pk", official_source="Excise & Taxation — excise.gos.pk", last_verified="2026-08-01",
)

TOKEN_FLOW = MissionFlow(
    service="token_tax", name_en="Token Tax", name_ur="ٹوکن ٹیکس",
    mission_steps=[
        MissionStep(step="1", title_en="Requirement", title_ur="ضرورت", description_en="Annual token tax payment", description_ur="سالانہ ٹوکن ٹیکس کی ادائیگی", status="done"),
        MissionStep(step="2", title_en="Eligibility", title_ur="اہلیت", description_en="Registered vehicle owner", description_ur="رجسٹرڈ گاڑی کا مالک", status="pending"),
        MissionStep(step="3", title_en="Documents", title_ur="دستاویزات", description_en="Registration book, CNIC", description_ur="رجسٹریشن بک، شناختی کارڈ", status="pending"),
        MissionStep(step="4", title_en="Fee", title_ur="فیس", description_en="Car: PKR 2,500 | Bike: PKR 1,000", description_ur="کار 2500 | موٹر سائیکل 1000", status="pending"),
        MissionStep(step="5", title_en="Application", title_ur="درخواست", description_en="Pay via Excise or ePay app", description_ur="ایکسائز یا ای پے ایپ سے ادائیگی", status="pending"),
        MissionStep(step="6", title_en="Tracking", title_ur="ٹریکنگ", description_en="Receive payment receipt, update record", description_ur="رسید وصول کریں، ریکارڈ اپ ڈیٹ", status="pending"),
    ],
    required_documents=["Registration book", "CNIC", "Previous token receipt"],
    eligibility=["Vehicle registered", "No outstanding dues"],
    fee_normal="Car: PKR 2,500 | Bike: PKR 1,000", fee_urgent="Late fee: +PKR 500/month",
    application_method=["Visit Excise office or ePay Punjab/Sindh app", "Enter registration no", "Pay token tax", "Receive receipt"],
    tracking_url="https://epay.punjab.gov.pk", official_source="Excise & Taxation — epay.punjab.gov.pk", last_verified="2026-08-01",
)

FLOWS = {
    "registration": REG_FLOW,
    "transfer": TRANSFER_FLOW,
    "token_tax": TOKEN_FLOW,
    "token": TOKEN_FLOW,
}

@router.get("")
def list_vehicles():
    return {"vehicles": VEHICLES, "count": len(VEHICLES)}

@router.get("/flows")
def list_flows():
    return {"services": list(FLOWS.keys())}

@router.get("/flow/{service}", response_model=MissionFlow)
def get_flow(service: str):
    flow = FLOWS.get(service)
    if not flow:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Unknown vehicle service: {service}")
    return flow

@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: str):
    for v in VEHICLES:
        if v["id"] == vehicle_id or v["registration_no"] == vehicle_id:
            return v
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Vehicle not found")

@router.post("/register")
def register_vehicle(payload: dict):
    return {"status": "Submitted", "registration_no": f"LEA-{hash(str(payload))%9000+1000}", "message": "Vehicle registration submitted. Visit Excise office with documents.", "next_steps": ["Visit Excise & Taxation office", "Submit CNIC + invoice + import docs", "Pay registration fee", "Receive number plate"]}

@router.post("/transfer")
def transfer_vehicle(payload: dict):
    return {"status": "Submitted", "message": "Ownership transfer initiated.", "next_steps": ["Seller + buyer visit Excise", "Submit CNICs + transfer deed", "Pay transfer fee (1% of value)", "Receive new registration book"]}

@router.get("/{vehicle_id}/token-tax")
def token_tax(vehicle_id: str):
    v = next((x for x in VEHICLES if x["id"] == vehicle_id), VEHICLES[0])
    return {"registration_no": v["registration_no"], "token_tax_status": v["token_tax_status"], "due_date": v["token_due"], "amount": "PKR 2,500" if v["type"]=="Car" else "PKR 1,000", "pay_at": "Excise office or ePay Punjab/Sindh app", "official_source": "Excise & Taxation Department", "last_verified": "2026-08-01"}
