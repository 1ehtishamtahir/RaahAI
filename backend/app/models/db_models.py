from sqlalchemy import Column, String, DateTime, Boolean, Text, JSON, Integer, Float, ForeignKey, Index
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base


def _uuid():
    return str(uuid.uuid4())


# ── Auth ──────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=True)
    cnic = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    province = Column(String, nullable=True)
    city = Column(String, nullable=True)
    education = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # relationships
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    feedback_entries = relationship("FeedbackEntry", back_populates="user", cascade="all, delete-orphan")
    family_members = relationship("FamilyMember", back_populates="user", cascade="all, delete-orphan")
    family_programs = relationship("FamilyProgram", back_populates="user", cascade="all, delete-orphan")
    vehicle_records = relationship("VehicleRecord", back_populates="user", cascade="all, delete-orphan")
    challan_records = relationship("ChallanRecord", back_populates="user", cascade="all, delete-orphan")
    payment_records = relationship("PaymentRecord", back_populates="user", cascade="all, delete-orphan")
    checklist_states = relationship("ChecklistState", back_populates="user", cascade="all, delete-orphan")


# ── Chat ──────────────────────────────────────────────────────────────
class ChatSession(Base):
    __tablename__ = "chat_sessions"
    __table_args__ = (Index("ix_chat_sessions_user_id", "user_id"),)
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=True)
    lang = Column(String, default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    __table_args__ = (Index("ix_chat_messages_session_id", "session_id"),)
    id = Column(String, primary_key=True, default=_uuid)
    session_id = Column(String, ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(String, nullable=False)  # user | assistant
    content = Column(Text, nullable=False)
    citations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")


# ── Documents (replaces alerts in-memory) ─────────────────────────────
class Document(Base):
    __tablename__ = "documents"
    __table_args__ = (Index("ix_documents_user_id", "user_id"),)
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    document_type = Column(String, nullable=False)
    custom_type_name = Column(String, nullable=True)
    document_name_en = Column(String, nullable=True)
    document_name_ur = Column(String, nullable=True)
    holder_name = Column(String, nullable=False)
    cnic = Column(String, nullable=True)
    issue_date = Column(String, nullable=True)
    expiry_date = Column(String, nullable=True)
    renewal_url = Column(String, nullable=True)
    notes = Column(JSON, default=list)
    has_image = Column(Boolean, default=False)
    image_filename = Column(String, nullable=True)
    image_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="documents")


# ── Feedback ──────────────────────────────────────────────────────────
class FeedbackEntry(Base):
    __tablename__ = "feedback_entries"
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    message_id = Column(String, nullable=False)
    rating = Column(String, nullable=False)  # up | down
    comment = Column(Text, nullable=True)
    session_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="feedback_entries")


# ── Family ────────────────────────────────────────────────────────────
class FamilyMember(Base):
    __tablename__ = "family_members"
    __table_args__ = (Index("ix_family_members_user_id", "user_id"),)
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    relation = Column(String, nullable=True)
    cnic = Column(String, nullable=True)
    cnic_masked = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    education = Column(String, nullable=True)
    income = Column(String, nullable=True)
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="family_members")


class FamilyProgram(Base):
    __tablename__ = "family_programs"
    __table_args__ = (Index("ix_family_programs_user_id", "user_id"),)
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    program_name = Column(String, nullable=False)
    program_name_ur = Column(String, nullable=True)
    member_name = Column(String, nullable=True)
    status = Column(String, nullable=True)  # Eligible | Enrolled | Applied
    amount = Column(String, nullable=True)
    category = Column(String, nullable=True)
    official_source = Column(String, nullable=True)
    last_verified = Column(String, nullable=True)
    next_step = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="family_programs")


# ── Vehicles ──────────────────────────────────────────────────────────
class VehicleRecord(Base):
    __tablename__ = "vehicle_records"
    __table_args__ = (Index("ix_vehicle_records_user_id", "user_id"),)
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    registration_no = Column(String, nullable=True)
    vehicle_type = Column(String, nullable=True)
    make = Column(String, nullable=True)
    model = Column(String, nullable=True)
    year = Column(String, nullable=True)
    color = Column(String, nullable=True)
    owner_name = Column(String, nullable=True)
    ownership_status = Column(String, default="Owned")
    token_tax_status = Column(String, default="Pending")
    token_due = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="vehicle_records")
    challans = relationship("ChallanRecord", back_populates="vehicle", cascade="all, delete-orphan")


# ── Challans ──────────────────────────────────────────────────────────
class ChallanRecord(Base):
    __tablename__ = "challan_records"
    __table_args__ = (Index("ix_challan_records_user_id", "user_id"), Index("ix_challan_records_status", "status"),)
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    vehicle_id = Column(String, ForeignKey("vehicle_records.id"), nullable=True)
    category = Column(String, nullable=True)
    amount = Column(Float, nullable=True)
    status = Column(String, default="Pending")  # Pending | Paid
    issue_date = Column(String, nullable=True)
    due_date = Column(String, nullable=True)
    source = Column(String, nullable=True)
    vehicle_plate = Column(String, nullable=True)
    violation = Column(String, nullable=True)
    explanation_en = Column(Text, nullable=True)
    explanation_ur = Column(Text, nullable=True)
    challan_no = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="challan_records")
    vehicle = relationship("VehicleRecord", back_populates="challans")


# ── Payments ──────────────────────────────────────────────────────────
class PaymentRecord(Base):
    __tablename__ = "payment_records"
    __table_args__ = (Index("ix_payment_records_user_id", "user_id"), Index("ix_payment_records_status", "status"),)
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=True)  # Fee | Tax | Fine
    title_en = Column(String, nullable=True)
    title_ur = Column(String, nullable=True)
    amount = Column(Float, nullable=True)
    currency = Column(String, default="PKR")
    status = Column(String, default="Pending")  # Paid | Pending | Overdue
    due_date = Column(String, nullable=True)
    paid_date = Column(String, nullable=True)
    method = Column(String, nullable=True)
    category = Column(String, nullable=True)
    official_source = Column(String, nullable=True)
    last_verified = Column(String, nullable=True)
    priority = Column(String, default="normal")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="payment_records")


# ── Checklist (existing, now with user_id) ───────────────────────────
class ChecklistState(Base):
    __tablename__ = "checklist_states"
    __table_args__ = (Index("ix_checklist_states_user_id", "user_id"),)
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    service = Column(String, nullable=False)
    situation = Column(String, nullable=False)
    completed_ids = Column(JSON, default=list)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="checklist_states")
