from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import base64

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
    has_image: bool = False
    image_filename: Optional[str] = None

class AddAlertRequest(BaseModel):
    document_type: str
    holder_name: str
    cnic: str
    issue_date: str
    expiry_date: str
    custom_type_name: Optional[str] = None

class UpdateAlertRequest(BaseModel):
    document_type: Optional[str] = None
    holder_name: Optional[str] = None
    cnic: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    custom_type_name: Optional[str] = None

# In-memory image store: id -> {data: bytes, filename: str, content_type: str}
_image_store: dict[str, dict] = {}

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
        "has_image": False,
        "image_filename": None,
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
        "has_image": False,
        "image_filename": None,
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
        "has_image": False,
        "image_filename": None,
    },
]

DOC_NAMES = {
    "passport": ("Passport", "\u067e\u0627\u0633\u067e\u0648\u0631\u0679", "https://dgip.gov.pk"),
    "cnic": ("CNIC", "\u0634\u0646\u0627\u062e\u062a\u06cc \u06a9\u0627\u0631\u062f", "https://www.nadra.gov.pk"),
    "business": ("SECP Registration", "\u0627\u06cc\u0633 \u0627\u06cc \u0633\u06cc \u067e\u06cc \u0631\u062c\u0633\u0637\u0631\u0634\u0646", "https://www.secp.gov.pk"),
    "other": ("Other Document", "\u062f\u063a\u0631 \u062f\u0633\u062a\u0627\u0648\u06cc\u0632", "#"),
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
    if req.document_type == "other" and req.custom_type_name:
        names = (req.custom_type_name, req.custom_type_name, "#")
    else:
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
        "has_image": False,
        "image_filename": None,
    }
    _alerts.append(alert)
    return alert

@router.post("/upload", response_model=DocumentAlert)
async def upload_alert(
    document_type: str = Form(...),
    holder_name: str = Form(...),
    cnic: str = Form(...),
    issue_date: str = Form(...),
    expiry_date: str = Form(...),
    custom_type_name: Optional[str] = Form(None),
    file: UploadFile = File(None),
):
    status, days = _check_status(expiry_date)
    if document_type == "other" and custom_type_name:
        names = (custom_type_name, custom_type_name, "#")
    else:
        names = DOC_NAMES.get(document_type, (document_type, document_type, "#"))
    has_image = False
    filename = None
    if file and file.filename:
        data = await file.read()
        # Limit 5MB
        if len(data) > 5 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Image too large (max 5MB)")
        has_image = True
        filename = file.filename
        # Store in memory
        alert_id = f"alert{len(_alerts)+1}"
        _image_store[alert_id] = {"data": data, "filename": filename, "content_type": file.content_type or "image/jpeg"}
    else:
        alert_id = f"alert{len(_alerts)+1}"

    alert = {
        "id": alert_id,
        "document_type": document_type,
        "document_name_en": names[0],
        "document_name_ur": names[1],
        "holder_name": holder_name,
        "cnic": cnic,
        "issue_date": issue_date,
        "expiry_date": expiry_date,
        "days_until_expiry": days,
        "status": status,
        "renewal_url": names[2],
        "notes": [],
        "has_image": has_image,
        "image_filename": filename,
    }
    _alerts.append(alert)
    if has_image:
        _image_store[alert["id"]] = _image_store.pop(alert_id, _image_store.get(alert_id, {}))
        # Fix if alert_id changed due to pop
        if alert["id"] not in _image_store and has_image:
            _image_store[alert["id"]] = {"data": data, "filename": filename, "content_type": file.content_type or "image/jpeg"}
    return alert

@router.get("/{alert_id}/image")
def get_image(alert_id: str):
    img = _image_store.get(alert_id)
    if not img:
        raise HTTPException(status_code=404, detail="No image for this document")
    return Response(content=img["data"], media_type=img["content_type"], headers={"Content-Disposition": f'inline; filename="{img["filename"]}"'})

@router.get("/{alert_id}/download")
def download_image(alert_id: str):
    img = _image_store.get(alert_id)
    if not img:
        raise HTTPException(status_code=404, detail="No image for this document")
    return Response(content=img["data"], media_type="application/octet-stream", headers={"Content-Disposition": f'attachment; filename="{img["filename"]}"'})

@router.put("/{alert_id}", response_model=DocumentAlert)
def update_alert(alert_id: str, req: UpdateAlertRequest):
    for a in _alerts:
        if a["id"] == alert_id:
            if req.document_type is not None:
                a["document_type"] = req.document_type
                if req.document_type == "other" and req.custom_type_name:
                    a["document_name_en"] = req.custom_type_name
                    a["document_name_ur"] = req.custom_type_name
                    a["renewal_url"] = "#"
                elif req.document_type != "other":
                    names = DOC_NAMES.get(req.document_type, (req.document_type, req.document_type, "#"))
                    a["document_name_en"] = names[0]
                    a["document_name_ur"] = names[1]
                    a["renewal_url"] = names[2]
            if req.holder_name is not None:
                a["holder_name"] = req.holder_name
            if req.cnic is not None:
                a["cnic"] = req.cnic
            if req.issue_date is not None:
                a["issue_date"] = req.issue_date
            if req.expiry_date is not None:
                a["expiry_date"] = req.expiry_date
            status, days = _check_status(a["expiry_date"])
            a["status"] = status
            a["days_until_expiry"] = days
            return a
    raise HTTPException(status_code=404, detail="Document not found")

@router.delete("/{alert_id}")
def delete_alert(alert_id: str):
    global _alerts
    _alerts = [a for a in _alerts if a["id"] != alert_id]
    _image_store.pop(alert_id, None)
    return {"status": "ok"}
