from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta

router = APIRouter(prefix="/alerts", tags=["alerts"])

class DocumentAlert(BaseModel):
    id: str
    document_type: str
    document_name_en: str
    document_name_ur: str
    holder_name: str
    cnic: str
    issue_date: str
    expiry_date: str
    days_until_expiry: int
    status: str
    renewal_url: str
    notes: list[str] = []

class AddAlertRequest(BaseModel):
    document_type: str
    holder_name: str
    cnic: str
    issue_date: str
    expiry_date: str

_alerts: list[dict] = [
    {
        "id": "alert1",
        "document_type": "passport",
        "document_name_en": "Passport",
        "document_name_ur": "\u067e\u0627\u0633\u067e\u0648\u0631\u0679",
        "holder_name": "Ehtisham Tahir",
        "cnic": "42101-1234567-1",
        "issue_date": "2022-01-15",
        "expiry_date": "2027-01-15",
        "days_until_expiry": 1756,
        "status": "valid",
        "renewal_url": "https://dgip.gov.pk",
        "notes": ["Passport is valid for 5 years from issue date"],
    },
    {
        "id": "alert2",
        "document_type": "cnic",
        "document_name_en": "CNIC",
        "document_name_ur": "\u0634\u0646\u0627\u062e\u062a\u06cc \u06a9\u0627\u0631\u062f",
        "holder_name": "Ehtisham Tahir",
        "cnic": "42101-1234567-1",
        "issue_date": "2020-06-20",
        "expiry_date": "2030-06-20",
        "days_until_expiry": 1883,
        "status": "valid",
        "renewal_url": "https://www.nadra.gov.pk",
        "notes": ["CNIC is valid for 10 years"],
    },
    {
        "id": "alert3",
        "document_type": "business",
        "document_name_en": "SECP Registration",
        "document_name_ur": "\u0627\u06cc\u0633 \u0627\u06cc \u0633\u06cc \u067e\u06cc \u0631\u062c\u0633\u0637\u0631\u0634\u0646",
        "holder_name": "Ehtisham Tahir",
        "cnic": "42101-1234567-1",
        "issue_date": "2024-03-01",
        "expiry_date": "2025-03-01",
        "days_until_expiry": -180,
        "status": "expired",
        "renewal_url": "https://www.secp.gov.pk",
        "notes": ["Annual return filing due", "Annual fee payment required"],
    },
]

DOC_NAMES = {
    "passport": ("Passport", "\u067e\u0627\u0633\u067e\u0648\u0631\u0679", "https://dgip.gov.pk"),
    "cnic": ("CNIC", "\u0634\u0646\u0627\u062e\u062a\u06cc \u06a9\u0627\u0631\u062f", "https://www.nadra.gov.pk"),
    "business": ("SECP Registration", "\u0627\u06cc\u0633 \u0627\u06cc \u0633\u06cc \u067e\u06cc \u0631\u062c\u0633\u0637\u0631\u0634\u0646", "https://www.secp.gov.pk"),
}

def _check_status(expiry_date: str):
    exp = datetime.strptime(expiry_date, "%Y-%m-%d")
    days = (exp - datetime.now()).days
    if days < 0:
        return "expired", days
    elif days <= 30:
        return "expiring_soon", days
    else:
        return "valid", days

@router.get("", response_model=list[DocumentAlert])
def list_alerts():
    for a in _alerts:
        status, days = _check_status(a["expiry_date"])
        a["status"] = status
        a["days_until_expiry"] = days
    return _alerts

@router.post("", response_model=DocumentAlert)
def add_alert(req: AddAlertRequest):
    status, days = _check_status(req.expiry_date)
    names = DOC_NAMES.get(req.document_type, (req.document_type, req.document_type, "#"))
    alert = {
        "id": f"alert{len(_alerts)+1}",
        "document_type": req.document_type,
        "document_name_en": names[0],
        "document_name_ur": names[1],
        "holder_name": req.holder_name,
        "cnic": req.cnic,
        "issue_date": req.issue_date,
        "expiry_date": req.expiry_date,
        "days_until_expiry": days,
        "status": status,
        "renewal_url": names[2],
        "notes": [],
    }
    _alerts.append(alert)
    return alert

@router.delete("/{alert_id}")
def delete_alert(alert_id: str):
    global _alerts
    _alerts = [a for a in _alerts if a["id"] != alert_id]
    return {"status": "ok"}
