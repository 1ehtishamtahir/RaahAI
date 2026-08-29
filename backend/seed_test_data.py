"""Seed the database with test data for the chat system."""
import sys
sys.path.insert(0, "D:\\1-Projects\\RaahAI - Bano Qabil Hackathon\\RaahAI\\backend")

from app.core.database import SessionLocal
from app.models.db_models import (
    Document, VehicleRecord, ChallanRecord, PaymentRecord,
    FamilyMember, FamilyProgram
)

db = SessionLocal()

# Get the test user
from app.models.db_models import User
user = db.query(User).filter(User.email == "test@example.com").first()
if not user:
    print("No test user found!")
    exit(1)

print(f"Seeding data for: {user.name} ({user.id})")

# Documents
docs = [
    Document(
        user_id=user.id,
        document_type="passport",
        document_name_en="Pakistan Passport",
        holder_name=user.name,
        issue_date="2024-01-15",
        expiry_date="2029-01-15",
    ),
    Document(
        user_id=user.id,
        document_type="cnic",
        document_name_en="National Identity Card",
        holder_name=user.name,
        issue_date="2020-06-10",
        expiry_date="2030-06-10",
    ),
    Document(
        user_id=user.id,
        document_type="driving_license",
        document_name_en="Driving License",
        holder_name=user.name,
        issue_date="2023-03-20",
        expiry_date="2025-03-20",  # expired
    ),
]
for d in docs:
    db.add(d)

# Vehicles
vehicles = [
    VehicleRecord(
        user_id=user.id,
        registration_no="LEA-1234",
        vehicle_type="Car",
        make="Toyota",
        model="Corolla",
        year="2022",
        color="White",
        owner_name=user.name,
        token_tax_status="Paid",
        token_due="2027-01-01",
    ),
    VehicleRecord(
        user_id=user.id,
        registration_no="MNH-5678",
        vehicle_type="Motorcycle",
        make="Honda",
        model="CD 70",
        year="2023",
        color="Black",
        owner_name=user.name,
        token_tax_status="Pending",
        token_due="2026-08-01",
    ),
]
for v in vehicles:
    db.add(v)

db.commit()

# Get vehicle IDs for challans
v1 = db.query(VehicleRecord).filter(VehicleRecord.registration_no == "LEA-1234").first()
v2 = db.query(VehicleRecord).filter(VehicleRecord.registration_no == "MNH-5678").first()

# Challans
challans = [
    ChallanRecord(
        user_id=user.id,
        vehicle_id=v1.id if v1 else None,
        vehicle_plate="LEA-1234",
        category="Traffic Violation",
        violation="Over Speeding",
        amount=5000,
        status="Pending",
        issue_date="2026-08-10",
        due_date="2026-09-10",
        source="Punjab Traffic Police",
        explanation_en="Speed detected at 95 km/h in 60 km/h zone",
    ),
    ChallanRecord(
        user_id=user.id,
        vehicle_id=v2.id if v2 else None,
        vehicle_plate="MNH-5678",
        category="Traffic Violation",
        violation="Red Light Violation",
        amount=3000,
        status="Paid",
        issue_date="2026-07-15",
        due_date="2026-08-15",
        source="Punjab Traffic Police",
        explanation_en="Vehicle detected crossing red signal",
    ),
]
for c in challans:
    db.add(c)

# Payments
payments = [
    PaymentRecord(
        user_id=user.id,
        type="Fee",
        title_en="Passport Renewal Fee",
        amount=3000,
        status="Pending",
        due_date="2026-09-01",
        category="Government Fee",
    ),
    PaymentRecord(
        user_id=user.id,
        type="Tax",
        title_en="Token Tax - LEA-1234",
        amount=8000,
        status="Paid",
        due_date="2026-06-01",
        paid_date="2026-05-28",
        category="Vehicle Tax",
    ),
    PaymentRecord(
        user_id=user.id,
        type="Fine",
        title_en="Overdue Payment Penalty",
        amount=500,
        status="Overdue",
        due_date="2026-08-01",
        category="Penalty",
    ),
]
for p in payments:
    db.add(p)

# Family Members
family = [
    FamilyMember(
        user_id=user.id,
        name="Fatima Khan",
        relation="Wife",
        age=28,
        gender="Female",
        education="Masters",
        status="Active",
    ),
    FamilyMember(
        user_id=user.id,
        name="Ali Khan",
        relation="Son",
        age=5,
        gender="Male",
        status="Active",
    ),
]
for m in family:
    db.add(m)

# Family Programs
programs = [
    FamilyProgram(
        user_id=user.id,
        program_name="BISP Ehsaas",
        member_name="Fatima Khan",
        status="Enrolled",
        amount="PKR 14,000/quarter",
        category="Social Welfare",
        next_step="Next disbursement in September",
    ),
    FamilyProgram(
        user_id=user.id,
        program_name="Ehsaas Education Stipend",
        member_name="Ali Khan",
        status="Eligible",
        amount="PKR 5,000/month",
        category="Education",
        next_step="Submit school enrollment certificate",
    ),
]
for p in programs:
    db.add(p)

db.commit()
db.close()

print("Seed data created successfully!")
print("  - 3 documents")
print("  - 2 vehicles")
print("  - 2 challans")
print("  - 3 payments")
print("  - 2 family members")
print("  - 2 family programs")
