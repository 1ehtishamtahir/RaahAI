from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from enum import Enum

class ServiceType(str, Enum):
    passport = "passport"
    cnic = "cnic"
    business_registration = "business_registration"

class Language(str, Enum):
    en = "en"
    ur = "ur"

# ---- Chat ----
class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    lang: Language = Language.en
    session_id: Optional[str] = None
    service: Optional[ServiceType] = None

class Citation(BaseModel):
    title: str
    url: Optional[str] = None
    snippet: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    citations: List[Citation] = []
    grounded: bool = True
    session_id: Optional[str] = None

# ---- OCR ----
class OCRField(BaseModel):
    label: str
    value: str
    confidence: float = 1.0
    needs_confirmation: bool = False
    explanation: Optional[str] = None

class OCRResponse(BaseModel):
    fields: List[OCRField]
    raw_text: str
    masked_fields: dict = {}

# ---- Checklist ----
class ChecklistItem(BaseModel):
    id: str
    label: str
    completed: bool = False
    required: bool = True

class ChecklistResponse(BaseModel):
    service: ServiceType
    situation: str  # e.g. "new", "renewal"
    items: List[ChecklistItem]
    progress: float  # 0..1
    completed_count: int
    total_count: int

class ChecklistUpdateRequest(BaseModel):
    service: ServiceType
    situation: str
    checked_ids: List[str]

# ---- Voice ----
class VoiceResponse(BaseModel):
    transcript: str
    answer: str
    citations: List[Citation] = []
    audio_url: Optional[str] = None  # or base64
