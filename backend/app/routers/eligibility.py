from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/eligibility", tags=["eligibility"])

class EligibilityRequest(BaseModel):
    age: int
    is_pakistani: bool = True
    has_cnic: bool = True
    has_bform: bool = False
    is_business_owner: bool = False
    has_secp_registration: bool = False
    document_type: Optional[str] = None  # passport, cnic, business

class EligibleService(BaseModel):
    service: str
    name_en: str
    name_ur: str
    eligible: bool
    reasons: list[str] = []
    required_documents: list[str] = []
    steps: list[str] = []
    fee_normal: str
    fee_urgent: str

@router.post("", response_model=list[EligibleService])
def check_eligibility(req: EligibilityRequest):
    services = []

    # Passport
    passport_eligible = req.is_pakistani and req.age >= 0
    passport_reasons = []
    passport_docs = []
    passport_steps = []

    if not req.is_pakistani:
        passport_reasons.append("Must be Pakistani citizen")
    if req.age < 18:
        passport_docs = ["B-Form / CRC", "Parent/Guardian CNIC copy", "Guardian consent form", "Photos (white background)"]
        passport_reasons.append("Minor: parent/guardian consent required")
    else:
        passport_docs = ["CNIC / Smart CNIC", "Photos (white background)", "Previous passport (if any)", "Fee receipt (NBP)"]
    passport_steps = [
        "1. Fill online form at dgip.gov.pk",
        "2. Pay fee at National Bank",
        "3. Book appointment",
        "4. Visit passport center (biometrics)",
        "5. Track via SMS/app",
    ]

    services.append(EligibleService(
        service="passport",
        name_en="Passport Application",
        name_ur="پاسپورٹ درخواست",
        eligible=passport_eligible,
        reasons=passport_reasons,
        required_documents=passport_docs,
        steps=passport_steps,
        fee_normal="PKR 3,000 (36 pages)",
        fee_urgent="PKR 5,000 (36 pages)",
    ))

    # CNIC
    cnic_eligible = req.is_pakistani and req.age >= 0
    cnic_reasons = []
    cnic_docs = []
    cnic_steps = []

    if not req.is_pakistani:
        cnic_reasons.append("Must be Pakistani citizen")
    if req.age < 18:
        cnic_docs = ["B-Form / CRC", "Parent/Guardian CNIC copy", "Photos"]
        cnic_reasons.append("Under 18: B-Form required")
    else:
        cnic_docs = ["B-Form / CRC (if first time)", "Previous CNIC (if renewal)", "Photos"]
    cnic_steps = [
        "1. Visit nearest NADRA center",
        "2. Take biometrics (fingerprints + photo)",
        "3. Receive token",
        "4. Track via SMS (8300)",
        "5. Collect CNIC",
    ]

    services.append(EligibleService(
        service="cnic",
        name_en="CNIC (New / Renewal)",
        name_ur="شناختی کارڈ (نیا / تجدید)",
        eligible=cnic_eligible,
        reasons=cnic_reasons,
        required_documents=cnic_docs,
        steps=cnic_steps,
        fee_normal="PKR 1,000",
        fee_urgent="PKR 2,000",
    ))

    # Business Registration
    biz_eligible = req.age >= 18 and req.is_pakistani
    biz_reasons = []
    biz_docs = []
    biz_steps = []

    if req.age < 18:
        biz_reasons.append("Must be 18+ to register a business")
    if not req.is_pakistani:
        biz_reasons.append("Must be Pakistani citizen for SECP registration")
    biz_docs = [
        "CNIC of all directors",
        "Name availability (SECP eServices)",
        "Memorandum & Articles of Association",
        "Address proof (utility bill / rent agreement)",
        "SECP fee challan",
    ]
    biz_steps = [
        "1. Check name availability on SECP eServices",
        "2. Prepare Memorandum & Articles",
        "3. Submit online via SECP eServices",
        "4. Pay fee (HBL/UBL)",
        "5. Receive Certificate of Incorporation",
    ]

    services.append(EligibleService(
        service="business_registration",
        name_en="SECP Business Registration",
        name_ur="ایس ای سی پی کاروبار رجسٹریشن",
        eligible=biz_eligible,
        reasons=biz_reasons,
        required_documents=biz_docs,
        steps=biz_steps,
        fee_normal="PKR 15,000",
        fee_urgent="PKR 25,000",
    ))

    return services
