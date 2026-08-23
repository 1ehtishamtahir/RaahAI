from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from enum import Enum

router = APIRouter(prefix="/fees", tags=["fees"])

class ServiceType(str, Enum):
    passport = "passport"
    cnic = "cnic"
    business_registration = "business_registration"

class Urgency(str, Enum):
    normal = "normal"
    urgent = "urgent"
    executive = "executive"

class FeeRequest(BaseModel):
    service: ServiceType
    urgency: Urgency = Urgency.normal
    pages: int = 36

class FeeBreakdown(BaseModel):
    service: str
    service_name_en: str
    service_name_ur: str
    urgency: str
    government_fee: int
    bank_charges: int
    total: int
    currency: str = "PKR"
    payment_method: str
    processing_time: str
    notes: list[str] = []
    valid_upto: str

FEES = {
    "passport": {
        "normal": {
            "government_fee": 3000,
            "bank_charges": 250,
            "processing_time": "15-20 working days",
            "valid_upto": "2026-03-31",
            "payment_method": "National Bank of Pakistan (NBP)",
        },
        "urgent": {
            "government_fee": 5000,
            "bank_charges": 250,
            "processing_time": "5-7 working days",
            "valid_upto": "2026-03-31",
            "payment_method": "National Bank of Pakistan (NBP)",
        },
        "executive": {
            "government_fee": 8000,
            "bank_charges": 250,
            "processing_time": "1-2 working days",
            "valid_upto": "2026-03-31",
            "payment_method": "National Bank of Pakistan (NBP)",
        },
    },
    "cnic": {
        "normal": {
            "government_fee": 1000,
            "bank_charges": 0,
            "processing_time": "7-10 working days",
            "valid_upto": "2026-06-30",
            "payment_method": "NADRA fee (paid at center)",
        },
        "urgent": {
            "government_fee": 2000,
            "bank_charges": 0,
            "processing_time": "1-3 working days",
            "valid_upto": "2026-06-30",
            "payment_method": "NADRA fee (paid at center)",
        },
        "executive": {
            "government_fee": 3000,
            "bank_charges": 0,
            "processing_time": "Same day",
            "valid_upto": "2026-06-30",
            "payment_method": "NADRA fee (paid at center)",
        },
    },
    "business_registration": {
        "normal": {
            "government_fee": 15000,
            "bank_charges": 500,
            "processing_time": "7-10 working days",
            "valid_upto": "2026-12-31",
            "payment_method": "SECP eChallan (HBL/UBL)",
        },
        "urgent": {
            "government_fee": 25000,
            "bank_charges": 500,
            "processing_time": "3-5 working days",
            "valid_upto": "2026-12-31",
            "payment_method": "SECP eChallan (HBL/UBL)",
        },
        "executive": {
            "government_fee": 40000,
            "bank_charges": 500,
            "processing_time": "1-2 working days",
            "valid_upto": "2026-12-31",
            "payment_method": "SECP eChallan (HBL/UBL)",
        },
    },
}

SERVICE_NAMES = {
    "passport": ("Passport (36 pages)", "پاسپورٹ (36 صفحات)"),
    "cnic": ("CNIC (New / Renewal)", "شناختی کارڈ (نیا / تجدید)"),
    "business_registration": ("SECP Business Registration", "ایس ای سی پی کاروبار رجسٹریشن"),
}

PAGE_EXTRA = {
    "36": 0,
    "72": 1000,
}

@router.post("", response_model=FeeBreakdown)
def calculate_fee(req: FeeRequest):
    service = req.service.value
    urgency = req.urgency.value

    if service not in FEES or urgency not in FEES[service]:
        raise HTTPException(status_code=400, detail=f"Invalid service or urgency")

    fee_data = FEES[service][urgency]
    gov_fee = fee_data["government_fee"]

    if service == "passport" and req.pages > 36:
        gov_fee += 1000

    svc_en, svc_ur = SERVICE_NAMES[service]

    if service == "passport":
        notes = [
            "Online form at DGIP portal (dgip.gov.pk)",
            "Fee receipt from NBP (original required)",
            "Photos: white background, 2x2 inches",
        ]
    elif service == "cnic":
        notes = [
            "Visit NADRA center with B-Form/CRC",
            "Biometrics required (fingerprints + photo)",
            "Existing CNIC copy for renewal",
        ]
    else:
        notes = [
            "Name reservation via SECP eServices",
            "Memorandum & Articles of Association",
            "Director CNICs + address proof required",
        ]

    total = gov_fee + fee_data["bank_charges"]

    return FeeBreakdown(
        service=service,
        service_name_en=svc_en,
        service_name_ur=svc_ur,
        urgency=urgency,
        government_fee=gov_fee,
        bank_charges=fee_data["bank_charges"],
        total=total,
        currency="PKR",
        payment_method=fee_data["payment_method"],
        processing_time=fee_data["processing_time"],
        notes=notes,
        valid_upto=fee_data["valid_upto"],
    )

@router.get("/all")
def list_all_fees():
    results = []
    for svc_key, svc_data in FEES.items():
        svc_en, svc_ur = SERVICE_NAMES[svc_key]
        for urgency_key, fee_info in svc_data.items():
            results.append({
                "service": svc_key,
                "service_name_en": svc_en,
                "service_name_ur": svc_ur,
                "urgency": urgency_key,
                "government_fee": fee_info["government_fee"],
                "bank_charges": fee_info["bank_charges"],
                "total": fee_info["government_fee"] + fee_info["bank_charges"],
                "processing_time": fee_info["processing_time"],
            })
    return results
