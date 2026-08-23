from sqlalchemy import Column, String, DateTime, Boolean, Text, JSON, Integer
import uuid
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
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

class Session(Base):
    __tablename__ = "sessions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    lang = Column(String, default="en")
    service = Column(String, nullable=True)
    checklist_state = Column(JSON, nullable=True)

class ChatHistory(Base):
    __tablename__ = "chat_history"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, nullable=False)
    role = Column(String, nullable=False)  # user | assistant
    content = Column(Text, nullable=False)
    citations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChecklistState(Base):
    __tablename__ = "checklist_states"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, nullable=False)
    service = Column(String, nullable=False)
    situation = Column(String, nullable=False)
    completed_ids = Column(JSON, default=list)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
