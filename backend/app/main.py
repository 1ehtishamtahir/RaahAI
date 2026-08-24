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
from app.core.database import Base, engine, SessionLocal

settings = get_settings()

app = FastAPI(
    title="RaahAI Backend",
    description="RaahAI Citizen Copilot \u2014 Identity, Vehicle, Challans, Payments, Documents, Opportunities, Family, Updates + RAG + OCR + Voice",
    version="4.0.0",
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


def seed_demo_data(user_id: str):
    """Seed demo documents, vehicles, challans, payments, family for a new user."""
    from app.models.db_models import (
        Document, VehicleRecord, ChallanRecord, PaymentRecord,
        FamilyMember, FamilyProgram,
    )
    db = SessionLocal()
    try:
        # Check if already seeded
        existing_docs = db.query(Document).filter(Document.user_id == user_id).count()
        if existing_docs > 0:
            return

        # Documents
        docs = [
            Document(user_id=user_id, document_type="passport", document_name_en="Passport", document_name_ur="\u067e\u0627\u0633\u067e\u0648\u0631\u0679", holder_name="User", cnic="42101-1234567-1", issue_date="2022-01-15", expiry_date="2027-01-15", renewal_url="https://dgip.gov.pk"),
            Document(user_id=user_id, document_type="cnic", document_name_en="CNIC", document_name_ur="\u0634\u0646\u0627\u062e\u062a\u06cc \u06a9\u0627\u0631\u062f", holder_name="User", cnic="42101-1234567-1", issue_date="2020-06-20", expiry_date="2030-06-20", renewal_url="https://www.nadra.gov.pk"),
            Document(user_id=user_id, document_type="business", document_name_en="SECP Registration", document_name_ur="\u0627\u06cc\u0633 \u0627\u06cc \u0633\u06cc \u067e\u06cc \u0631\u062c\u0633\u0637\u0631\u0634\u0646", holder_name="User", cnic="42101-1234567-1", issue_date="2024-03-01", expiry_date="2025-03-01", renewal_url="https://www.secp.gov.pk"),
        ]
        db.add_all(docs)

        # Vehicles
        vehicles = [
            VehicleRecord(user_id=user_id, registration_no="ABC-123", vehicle_type="Car", make="Toyota Corolla", model="2022", owner_name="User", token_tax_status="Paid", token_due="2026-12-31"),
            VehicleRecord(user_id=user_id, registration_no="XYZ-789", vehicle_type="Motorcycle", make="Honda CG 125", model="2020", owner_name="User", token_tax_status="Pending", token_due="2026-09-30"),
        ]
        db.add_all(vehicles)
        db.flush()

        # Challans
        challans = [
            ChallanRecord(user_id=user_id, vehicle_id=vehicles[0].id, category="Traffic", amount=2000, status="Pending", issue_date="2026-08-10", due_date="2026-09-10", source="Traffic Police \u2014 Sindh", vehicle_plate="ABC-123", violation="Signal violation \u2014 Shara-e-Faisal", explanation_en="You crossed the signal at Shara-e-Faisal. Pay within 30 days to avoid fine.", explanation_ur="\u0622\u067e \u0646\u06d2 \u0634\u0627\u0631\u0639 \u0641\u06cc\u0635\u0644 \u067e\u0631 \u0633\u06af\u0646\u0644 \u062a\u0648\u0691\u0627\u0640\u060c 30 \u062f\u0646 \u06a9\u06d2 \u0627\u0646\u0686\u0631 \u0627\u062f\u0627\u0626\u06cc\u06af\u06cc \u06a9\u0631\u06cc\u06ba\u0640"),
            ChallanRecord(user_id=user_id, vehicle_id=vehicles[1].id, category="Traffic", amount=1500, status="Paid", issue_date="2026-07-15", due_date="2026-08-15", source="Traffic Police \u2014 Punjab", vehicle_plate="XYZ-789", violation="No helmet \u2014 Mall Road", explanation_en="Riding without helmet on Mall Road.", explanation_ur="\u0645\u0627\u0644 \u0631\u0648\u0688 \u067e\u0631 \u0647\u06cc\u0644\u0645\u0679 \u06a9\u06d2 \u0628\u063a\u0626\u0631 \u0633\u0648\u0627\u0631\u06cc\u0640"),
            ChallanRecord(user_id=user_id, vehicle_id=vehicles[0].id, category="Excise", amount=5000, status="Pending", issue_date="2026-06-20", due_date="2026-07-20", source="Excise & Taxation", vehicle_plate="ABC-123", violation="Token tax overdue", explanation_en="Token tax for FY 2025-26 not paid.", explanation_ur="\u0679\u0648\u06a9\u0646 \u0679\u06cc\u06a9\u0633 \u0627\u062f\u0627 \u0646\u06be\u06cc\u06ba \u06a9\u06cc\u0627 \u06af\u06cc\u0627\u0640"),
        ]
        db.add_all(challans)

        # Payments
        payments = [
            PaymentRecord(user_id=user_id, type="Fee", title_en="Passport Fee (Urgent)", title_ur="\u067e\u0627\u0633\u067e\u0648\u0631\u0679 \u0641\u06cc\u0633 (\u0627\u0631\u062c\u0646\u0679)", amount=5250, status="Paid", due_date="2026-08-15", paid_date="2026-08-10", method="NBP", category="Identity", official_source="DGIP"),
            PaymentRecord(user_id=user_id, type="Tax", title_en="Token Tax \u2014 ABC-123", title_ur="\u0679\u0648\u06a9\u0646 \u0679\u06cc\u06a9\u0633 \u2014 ABC-123", amount=2500, status="Pending", due_date="2026-12-31", method="Excise / ePay", category="Vehicle", official_source="Excise & Taxation"),
            PaymentRecord(user_id=user_id, type="Fee", title_en="CNIC Renewal (Normal)", title_ur="\u0634\u0646\u0627\u062e\u062a\u06cc \u06a9\u0627\u0631\u062f \u062a\u062c\u062f\u06cc\u062f", amount=1000, status="Pending", due_date="2026-09-18", method="NADRA", category="Identity", official_source="NADRA", priority="high"),
            PaymentRecord(user_id=user_id, type="Fine", title_en="Traffic Challan \u2014 CH-2026-001", title_ur="\u0679\u0631\u06cc\u0641\u06a9 \u0686\u0627\u0644\u0627\u0646", amount=2000, status="Pending", due_date="2026-08-28", method="Traffic Police app", category="Challans", official_source="Sindh Police", priority="high"),
            PaymentRecord(user_id=user_id, type="Fee", title_en="SECP Business Name Reservation", title_ur="\u0627\u06cc\u0633 \u0627\u06cc \u0633\u06cc \u067e\u06cc \u0646\u0627\u0645 \u0631\u06cc\u0632\u0631\u0648\u06cc\u0634\u0646", amount=1000, status="Paid", due_date="2026-07-01", paid_date="2026-06-28", method="HBL/UBL Challan", category="Business", official_source="SECP"),
            PaymentRecord(user_id=user_id, type="Tax", title_en="Income Tax Return \u2014 FY 2025-26", title_ur="\u0627\u0646\u06a9\u0645 \u0679\u06cc\u06a9\u0633 \u0631\u06cc\u0679\u0631\u0646", amount=15000, status="Pending", due_date="2026-09-30", method="FBR IRIS", category="Tax", official_source="FBR", priority="high"),
            PaymentRecord(user_id=user_id, type="Fee", title_en="FRC Fee", title_ur="\u0627\u06cc\u0641 \u0622\u0631 \u0633\u06cc \u0641\u06cc\u0633", amount=1000, status="Pending", due_date="2026-08-20", method="NADRA", category="Identity", official_source="NADRA"),
            PaymentRecord(user_id=user_id, type="Fine", title_en="Token Tax Late Fee \u2014 XYZ-789", title_ur="\u0679\u0648\u06a9\u0646 \u0679\u06cc\u06a9\u0633 \u062c\u0631\u0645\u0627\u0646\u0647", amount=500, status="Overdue", due_date="2026-08-10", method="Excise", category="Vehicle", official_source="Excise & Taxation", priority="high"),
        ]
        db.add_all(payments)

        # Family members
        members = [
            FamilyMember(user_id=user_id, name="User", relation="Self", cnic="42101-1234567-1", cnic_masked="42101-XXXXXXX-1", age=28, education="Bachelor"),
            FamilyMember(user_id=user_id, name="Ayesha Tahir", relation="Sister", cnic="42101-1234568-2", cnic_masked="42101-XXXXXXX-2", age=20, education="Intermediate"),
            FamilyMember(user_id=user_id, name="Muhammad Tahir", relation="Father", cnic="42101-1111111-1", cnic_masked="42101-XXXXXXX-1", age=55, education="Matric"),
            FamilyMember(user_id=user_id, name="Fatima Tahir", relation="Mother", cnic="42101-2222222-2", cnic_masked="42101-XXXXXXX-2", age=50, education="Intermediate"),
        ]
        db.add_all(members)

        # Family programs
        programs = [
            FamilyProgram(user_id=user_id, program_name="Ehsaas Kafalat", program_name_ur="\u0627\u062d\u0633\u0627\u0633 \u06a9\u0641\u0627\u0644\u062a", member_name="Fatima Tahir", status="Eligible", amount="PKR 14,000/quarter", category="Family", official_source="BISP \u2014 bisp.gov.pk", last_verified="2026-08-01", next_step="Visit BISP center with CNIC"),
            FamilyProgram(user_id=user_id, program_name="Sehat Insaf Card", program_name_ur="\u0635\u062d\u062a \u0627\u0646\u0635\u0627\u0641 \u06a9\u0627\u0631\u0688", member_name="All", status="Enrolled", amount="Free treatment up to PKR 1M", category="Welfare", official_source="Health Ministry \u2014 pmhealth.gov.pk", last_verified="2026-08-01", next_step="Already enrolled \u2014 show CNIC at hospital"),
            FamilyProgram(user_id=user_id, program_name="BISP Taleemi Wazaif", program_name_ur="\u062a\u0639\u0644\u06cc\u0645\u06cc \u0648\u0638\u0627\u0626\u0641", member_name="Ayesha Tahir", status="Eligible", amount="PKR 2,500/quarter", category="Education", official_source="BISP \u2014 bisp.gov.pk", last_verified="2026-08-01", next_step="Submit school admission slip at BISP"),
            FamilyProgram(user_id=user_id, program_name="PM Youth Laptop", program_name_ur="\u06cc\u0648\u062a\u06be \u0644\u06cc\u067e \u0679\u0627\u067e", member_name="User", status="Applied", amount="Free laptop", category="Youth", official_source="PM Youth \u2014 pmyouth.gov.pk", last_verified="2026-08-01", next_step="Track at laptop.pmyp.gov.pk"),
        ]
        db.add_all(programs)

        db.commit()
        print(f"[DB] Demo data seeded for user {user_id[:8]}...")
    except Exception as e:
        db.rollback()
        print(f"[DB] Seed error: {e}")
    finally:
        db.close()


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


@app.get("/health")
def health():
    return {"status": "ok", "service": "RaahAI", "version": "4.0.0"}


@app.get("/")
def root():
    return {"message": "RaahAI Backend running. See /docs for API docs."}
