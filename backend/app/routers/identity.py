from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/identity", tags=["identity"])

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

CNIC_FLOW = MissionFlow(
    service="cnic",
    name_en="CNIC — Computerized National Identity Card",
    name_ur="شناختی کارڈ — قومی شناختی کارڈ",
    mission_steps=[
        MissionStep(step="1", title_en="Requirement", title_ur="ضرورت", description_en="Determine if you need New, Renewal, or Modification", description_ur="نیا، تجدید یا ترمیم کا تعین کریں", status="done"),
        MissionStep(step="2", title_en="Eligibility", title_ur="اہلیت", description_en="Pakistani citizen, any age (B-Form for under 18)", description_ur="پاکستانی شہری، کوئی بھی عمر (18 سے کم کے لیے بی فارم)", status="done"),
        MissionStep(step="3", title_en="Documents", title_ur="دستاویزات", description_en="B-Form/CRC, parent CNIC, photos", description_ur="بی فارم، والدین کا شناختی کارڈ، تصاویر", status="pending"),
        MissionStep(step="4", title_en="Fee", title_ur="فیس", description_en="Normal PKR 1,000 | Urgent PKR 2,000 | Executive PKR 3,000", description_ur="نارمل 1000 | ارجنٹ 2000 | ایگزیکٹو 3000", status="pending"),
        MissionStep(step="5", title_en="Application", title_ur="درخواست", description_en="Visit NADRA center, biometrics, token", description_ur="نادرا سینٹر جائیں، بائیومیٹرکس، ٹوکن", status="pending"),
        MissionStep(step="6", title_en="Tracking", title_ur="ٹریکنگ", description_en="Track via SMS 8300 or NADRA website", description_ur="8300 پر ایس ایم ایس یا نادرا ویب سائٹ سے ٹریک کریں", status="pending"),
    ],
    required_documents=["B-Form / CRC", "Parent/Guardian CNIC copy", "Photos (white background)", "Previous CNIC (if renewal)"],
    eligibility=["Pakistani citizen", "Any age (B-Form for under 18)", "Parent consent for minors"],
    fee_normal="PKR 1,000 (7-10 days)",
    fee_urgent="PKR 2,000 (1-3 days)",
    application_method=["Visit nearest NADRA Mega Center", "Take biometrics (fingerprints + photo)", "Receive tracking token", "Collect CNIC via courier or center"],
    tracking_url="https://www.nadra.gov.pk",
    official_source="NADRA Official — nadra.gov.pk",
    last_verified="2026-08-01",
)

PASSPORT_FLOW = MissionFlow(
    service="passport",
    name_en="Passport — Machine Readable Passport",
    name_ur="پاسپورٹ — مشین ریڈ ایبل پاسپورٹ",
    mission_steps=[
        MissionStep(step="1", title_en="Requirement", title_ur="ضرورت", description_en="New passport or renewal (expired/expiring)", description_ur="نیا پاسپورٹ یا تجدید", status="done"),
        MissionStep(step="2", title_en="Eligibility", title_ur="اہلیت", description_en="Pakistani citizen with valid CNIC/Smart CNIC", description_ur="پاکستانی شہری مع درست شناختی کارڈ", status="done"),
        MissionStep(step="3", title_en="Documents", title_ur="دستاویزات", description_en="CNIC, photos, previous passport, fee receipt", description_ur="شناختی کارڈ، تصاویر، پرانا پاسپورٹ، فیس رسید", status="pending"),
        MissionStep(step="4", title_en="Fee", title_ur="فیس", description_en="Normal PKR 3,000 (36p) | Urgent PKR 5,000 | Executive PKR 8,000", description_ur="نارمل 3000 | ارجنٹ 5000 | ایگزیکٹو 8000", status="pending"),
        MissionStep(step="5", title_en="Application", title_ur="درخواست", description_en="Online form at DGIP, pay at NBP, visit center", description_ur="ڈی جی آئی پی پر آن لائن فارم، نیشنل بینک میں فیس، مرکز کا دورہ", status="pending"),
        MissionStep(step="6", title_en="Tracking", title_ur="ٹریکنگ", description_en="Track via DGIP SMS or dgip.gov.pk", description_ur="ڈی جی آئی پی ایس ایم ایس یا ویب سائٹ سے ٹریک کریں", status="pending"),
    ],
    required_documents=["CNIC / Smart CNIC", "B-Form (if under 18)", "Passport photos (white background)", "Previous passport (if any)", "Fee payment receipt (NBP)"],
    eligibility=["Pakistani citizen", "Valid CNIC / Smart CNIC", "B-Form for minors with guardian"],
    fee_normal="PKR 3,000 (36 pages, 15-20 days)",
    fee_urgent="PKR 5,000 (5-7 days)",
    application_method=["Fill online form at dgip.gov.pk", "Pay fee at National Bank of Pakistan", "Book appointment", "Visit passport center (biometrics)", "Track via SMS/app"],
    tracking_url="https://dgip.gov.pk",
    official_source="DGIP Official — dgip.gov.pk",
    last_verified="2026-08-01",
)

FRC_FLOW = MissionFlow(
    service="frc",
    name_en="Family Registration Certificate (FRC)",
    name_ur="فیملی رجسٹریشن سرٹیفکیٹ",
    mission_steps=[
        MissionStep(step="1", title_en="Requirement", title_ur="ضرورت", description_en="Proof of family composition", description_ur="خاندان کی تفصیل کا ثبوت", status="done"),
        MissionStep(step="2", title_en="Eligibility", title_ur="اہلیت", description_en="CNIC holder with family members registered at NADRA", description_ur="شناختی کارڈ ہولڈر جس کے خاندان کے افراد نادرا میں رجسٹرڈ ہوں", status="pending"),
        MissionStep(step="3", title_en="Documents", title_ur="دستاویزات", description_en="CNIC of applicant + family members' CNICs/B-Forms", description_ur="درخواست دہندہ اور خاندان کے شناختی کارڈ/بی فارم", status="pending"),
        MissionStep(step="4", title_en="Fee", title_ur="فیس", description_en="PKR 1,000 (normal)", description_ur="1000 روپے", status="pending"),
        MissionStep(step="5", title_en="Application", title_ur="درخواست", description_en="Apply at NADRA center or Pak-ID app", description_ur="نادرا سینٹر یا پاک آئی ڈی ایپ پر درخواست", status="pending"),
        MissionStep(step="6", title_en="Tracking", title_ur="ٹریکنگ", description_en="Download from Pak-ID or collect at center", description_ur="پاک آئی ڈی سے ڈاؤن لوڈ یا مرکز سے وصولی", status="pending"),
    ],
    required_documents=["Applicant CNIC", "Family members CNICs/B-Forms", "Fee receipt"],
    eligibility=["CNIC holder", "Family registered at NADRA"],
    fee_normal="PKR 1,000",
    fee_urgent="PKR 1,000",
    application_method=["Apply via Pak-ID app", "Or visit NADRA center", "Receive FRC via courier/app"],
    tracking_url="https://id.nadra.gov.pk",
    official_source="NADRA Official — id.nadra.gov.pk",
    last_verified="2026-08-01",
)

BIRTH_FLOW = MissionFlow(
    service="birth_registration",
    name_en="Birth Registration (B-Form / CRC)",
    name_ur="پیدائش کا اندراج (ب فارم)",
    mission_steps=[
        MissionStep(step="1", title_en="Requirement", title_ur="ضرورت", description_en="Register birth for B-Form/CRC", description_ur="ب فارم کے لیے پیدائش کا اندراج", status="done"),
        MissionStep(step="2", title_en="Eligibility", title_ur="اہلیت", description_en="Child born to Pakistani citizen, within 60 days ideally", description_ur="پاکستانی شہری کا بچہ، بہتر ہے 60 دن کے اندر", status="pending"),
        MissionStep(step="3", title_en="Documents", title_ur="دستاویزات", description_en="Parents CNIC, Nikahnama, hospital birth certificate", description_ur="والدین کے شناختی کارڈ، نکاح نامہ، ہسپتال سرٹیفکیٹ", status="pending"),
        MissionStep(step="4", title_en="Fee", title_ur="فیس", description_en="PKR 1,000 at Union Council + NADRA fee", description_ur="یونین کونسل 1000 + نادرا فیس", status="pending"),
        MissionStep(step="5", title_en="Application", title_ur="درخواست", description_en="Union Council → NADRA for B-Form", description_ur="یونین کونسل → نادرا ب فارم", status="pending"),
        MissionStep(step="6", title_en="Tracking", title_ur="ٹریکنگ", description_en="Collect B-Form from NADRA center", description_ur="نادرا مرکز سے ب فارم وصول کریں", status="pending"),
    ],
    required_documents=["Parents CNICs", "Nikahnama", "Hospital birth certificate", "Union Council birth certificate"],
    eligibility=["Child of Pakistani citizen", "Within 60 days recommended"],
    fee_normal="PKR 1,000 (Union Council) + NADRA fee",
    fee_urgent="PKR 1,000 + NADRA urgent fee",
    application_method=["Get birth certificate from Union Council", "Visit NADRA with documents", "Apply for B-Form/CRC"],
    tracking_url="https://www.nadra.gov.pk",
    official_source="NADRA + Local Government — nadra.gov.pk",
    last_verified="2026-08-01",
)

MARRIAGE_FLOW = MissionFlow(
    service="marriage_registration", name_en="Marriage Registration (Nikah)", name_ur="نکاح کا اندراج",
    mission_steps=[
        MissionStep(step="1", title_en="Requirement", title_ur="ضرورت", description_en="Register Nikah at Union Council", description_ur="یونین کونسل میں نکاح کا اندراج", status="done"),
        MissionStep(step="2", title_en="Eligibility", title_ur="اہلیت", description_en="Both spouses 18+, valid Nikah with witnesses", description_ur="دونوں 18+، درست نکاح اور گواہ", status="pending"),
        MissionStep(step="3", title_en="Documents", title_ur="دستاویزات", description_en="Nikahnama, CNICs of spouses + witnesses", description_ur="نکاح نامہ، میاں بیوی اور گواہوں کے شناختی کارڈ", status="pending"),
        MissionStep(step="4", title_en="Fee", title_ur="فیس", description_en="PKR 1,000 at Union Council", description_ur="یونین کونسل میں 1000 روپے", status="pending"),
        MissionStep(step="5", title_en="Application", title_ur="درخواست", description_en="Submit Nikahnama at Union Council, get certificate", description_ur="یونین کونسل میں نکاح نامہ جمع کرائیں", status="pending"),
        MissionStep(step="6", title_en="Tracking", title_ur="ٹریکنگ", description_en="Collect marriage certificate from Union Council", description_ur="یونین کونسل سے سرٹیفکیٹ وصول کریں", status="pending"),
    ],
    required_documents=["Nikahnama (original)", "CNICs of spouses", "CNICs of witnesses", "Photos"],
    eligibility=["Both spouses 18+", "Valid Nikah with Nikah Khawan"],
    fee_normal="PKR 1,000", fee_urgent="PKR 1,000",
    application_method=["Visit Union Council with Nikahnama", "Submit CNICs of spouses + witnesses", "Pay fee", "Receive marriage certificate"],
    tracking_url="https://www.nadra.gov.pk", official_source="Local Government — nadra.gov.pk", last_verified="2026-08-01",
)

DEATH_FLOW = MissionFlow(
    service="death_registration", name_en="Death Registration", name_ur="وفات کا اندراج",
    mission_steps=[
        MissionStep(step="1", title_en="Requirement", title_ur="ضرورت", description_en="Register death at Union Council for certificate", description_ur="یونین کونسل میں وفات کا اندراج", status="done"),
        MissionStep(step="2", title_en="Eligibility", title_ur="اہلیت", description_en="Legal heir / family member of deceased", description_ur="مرحوم کا قانونی وارث / خاندان", status="pending"),
        MissionStep(step="3", title_en="Documents", title_ur="دستاویزات", description_en="Deceased CNIC, hospital death certificate, applicant CNIC", description_ur="مرحوم کا شناختی کارڈ، ہسپتال سرٹیفکیٹ، درخواست دہندہ کا کارڈ", status="pending"),
        MissionStep(step="4", title_en="Fee", title_ur="فیس", description_en="PKR 1,000 at Union Council", description_ur="یونین کونسل میں 1000 روپے", status="pending"),
        MissionStep(step="5", title_en="Application", title_ur="درخواست", description_en="Submit death certificate at Union Council", description_ur="یونین کونسل میں سرٹیفکیٹ جمع کرائیں", status="pending"),
        MissionStep(step="6", title_en="Tracking", title_ur="ٹریکنگ", description_en="Collect death certificate from Union Council", description_ur="یونین کونسل سے سرٹیفکیٹ وصول کریں", status="pending"),
    ],
    required_documents=["Deceased CNIC (original)", "Hospital death certificate", "Applicant CNIC", "Graveyard receipt (if any)"],
    eligibility=["Legal heir / family member", "Within 30 days recommended"],
    fee_normal="PKR 1,000", fee_urgent="PKR 1,000",
    application_method=["Get hospital death certificate", "Visit Union Council", "Submit documents + fee", "Receive death certificate"],
    tracking_url="https://www.nadra.gov.pk", official_source="Local Government — nadra.gov.pk", last_verified="2026-08-01",
)

FLOWS = {
    "cnic": CNIC_FLOW,
    "passport": PASSPORT_FLOW,
    "frc": FRC_FLOW,
    "birth_registration": BIRTH_FLOW,
    "marriage_registration": MARRIAGE_FLOW,
    "death_registration": DEATH_FLOW,
}

@router.get("", response_model=dict)
def list_identity():
    return {"services": list(FLOWS.keys()), "primary": ["cnic", "passport"]}

@router.get("/{service}", response_model=MissionFlow)
def get_flow(service: str):
    flow = FLOWS.get(service)
    if not flow:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Unknown identity service: {service}")
    return flow

@router.get("/{service}/status")
def get_status(service: str, application_no: str = "APP-2026-001"):
    flow = FLOWS.get(service)
    if not flow:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Unknown service: {service}")
    return {
        "service": service,
        "application_no": application_no,
        "status": "In Progress",
        "current_step": "Documents",
        "progress": 0.4,
        "last_updated": "2026-08-20",
        "estimated_completion": "2026-09-05",
        "official_source": flow.official_source,
        "last_verified": flow.last_verified,
    }

@router.post("/{service}/apply")
def apply(service: str, payload: dict = None):
    if service not in FLOWS:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Unknown service: {service}")
    return {
        "service": service,
        "application_no": f"APP-{service.upper()}-2026-{hash(service) % 9000 + 1000}",
        "status": "Submitted",
        "next_steps": FLOWS[service].application_method,
        "message": "Application submitted. Visit the center with required documents." if payload else "Application created.",
    }
