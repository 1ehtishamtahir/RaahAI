from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.db_models import User, Document

router = APIRouter(prefix="/alerts", tags=["alerts"])

DOC_NAMES = {
    "passport": ("Passport", "\u067e\u0627\u0633\u067e\u0648\u0631\u0679", "https://dgip.gov.pk"),
    "cnic": ("CNIC", "\u0634\u0646\u0627\u062e\u062a\u06cc \u06a9\u0627\u0631\u062f", "https://www.nadra.gov.pk"),
    "business": ("SECP Registration", "\u0627\u06cc\u0633 \u0627\u06cc \u0633\u06cc \u067e\u06cc \u0631\u062c\u0633\u0637\u0631\u0634\u0646", "https://www.secp.gov.pk"),
    "other": ("Other Document", "\u062f\u063a\u0631 \u062f\u0633\u062a\u0627\u0648\u06cc\u0632", "#"),
}

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


def _check_status(expiry_date: str):
    try:
        exp = datetime.strptime(expiry_date, "%Y-%m-%d")
        days = (exp - datetime.now()).days
        if days < 0:
            return "expired", days
        elif days <= 30:
            return "expiring_soon", days
        else:
            return "valid", days
    except Exception:
        return "unknown", 0


def _doc_to_response(d: Document) -> dict:
    status, days = _check_status(d.expiry_date or "2099-01-01")
    return {
        "id": d.id,
        "document_type": d.document_type,
        "document_name_en": d.document_name_en or d.document_type,
        "document_name_ur": d.document_name_ur or d.document_type,
        "holder_name": d.holder_name,
        "cnic": d.cnic or "",
        "issue_date": d.issue_date or "",
        "expiry_date": d.expiry_date or "",
        "days_until_expiry": days,
        "status": status,
        "renewal_url": d.renewal_url or "#",
        "notes": d.notes or [],
        "has_image": d.has_image or False,
        "image_filename": d.image_filename,
    }


@router.get("", response_model=list[DocumentAlert])
def list_alerts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.created_at.desc()).all()
    return [_doc_to_response(d) for d in docs]


@router.post("", response_model=DocumentAlert)
def add_alert(req: AddAlertRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.document_type == "other" and req.custom_type_name:
        names = (req.custom_type_name, req.custom_type_name, "#")
    else:
        names = DOC_NAMES.get(req.document_type, (req.document_type, req.document_type, "#"))
    doc = Document(
        user_id=current_user.id,
        document_type=req.document_type,
        custom_type_name=req.custom_type_name,
        document_name_en=names[0],
        document_name_ur=names[1],
        holder_name=req.holder_name,
        cnic=req.cnic,
        issue_date=req.issue_date,
        expiry_date=req.expiry_date,
        renewal_url=names[2],
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return _doc_to_response(doc)


@router.post("/upload", response_model=DocumentAlert)
async def upload_alert(
    document_type: str = Form(...),
    holder_name: str = Form(...),
    cnic: str = Form(...),
    issue_date: str = Form(...),
    expiry_date: str = Form(...),
    custom_type_name: Optional[str] = Form(None),
    file: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if document_type == "other" and custom_type_name:
        names = (custom_type_name, custom_type_name, "#")
    else:
        names = DOC_NAMES.get(document_type, (document_type, document_type, "#"))

    has_image = False
    filename = None
    image_path = None

    if file and file.filename:
        data = await file.read()
        if len(data) > 5 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Image too large (max 5MB)")
        has_image = True
        filename = file.filename
        import os
        upload_dir = os.path.join("uploads", current_user.id)
        os.makedirs(upload_dir, exist_ok=True)
        image_path = os.path.join(upload_dir, filename)
        with open(image_path, "wb") as f:
            f.write(data)

    doc = Document(
        user_id=current_user.id,
        document_type=document_type,
        custom_type_name=custom_type_name,
        document_name_en=names[0],
        document_name_ur=names[1],
        holder_name=holder_name,
        cnic=cnic,
        issue_date=issue_date,
        expiry_date=expiry_date,
        renewal_url=names[2],
        has_image=has_image,
        image_filename=filename,
        image_path=image_path,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return _doc_to_response(doc)


@router.get("/{alert_id}/image")
def get_image(alert_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == alert_id, Document.user_id == current_user.id).first()
    if not doc or not doc.image_path:
        raise HTTPException(status_code=404, detail="No image for this document")
    import os
    if not os.path.exists(doc.image_path):
        raise HTTPException(status_code=404, detail="Image file not found")
    with open(doc.image_path, "rb") as f:
        data = f.read()
    content_type = "image/jpeg"
    if doc.image_filename:
        ext = doc.image_filename.rsplit(".", 1)[-1].lower()
        content_type = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "pdf": "application/pdf"}.get(ext, "image/jpeg")
    return Response(content=data, media_type=content_type, headers={"Content-Disposition": f'inline; filename="{doc.image_filename}"'})


@router.get("/{alert_id}/download")
def download_image(alert_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == alert_id, Document.user_id == current_user.id).first()
    if not doc or not doc.image_path:
        raise HTTPException(status_code=404, detail="No image for this document")
    import os
    if not os.path.exists(doc.image_path):
        raise HTTPException(status_code=404, detail="Image file not found")
    with open(doc.image_path, "rb") as f:
        data = f.read()
    return Response(content=data, media_type="application/octet-stream", headers={"Content-Disposition": f'attachment; filename="{doc.image_filename}"'})


@router.put("/{alert_id}", response_model=DocumentAlert)
def update_alert(alert_id: str, req: UpdateAlertRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == alert_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if req.document_type is not None:
        doc.document_type = req.document_type
        if req.document_type == "other" and req.custom_type_name:
            doc.document_name_en = req.custom_type_name
            doc.document_name_ur = req.custom_type_name
            doc.renewal_url = "#"
        elif req.document_type != "other":
            names = DOC_NAMES.get(req.document_type, (req.document_type, req.document_type, "#"))
            doc.document_name_en = names[0]
            doc.document_name_ur = names[1]
            doc.renewal_url = names[2]
    if req.holder_name is not None:
        doc.holder_name = req.holder_name
    if req.cnic is not None:
        doc.cnic = req.cnic
    if req.issue_date is not None:
        doc.issue_date = req.issue_date
    if req.expiry_date is not None:
        doc.expiry_date = req.expiry_date
    if req.custom_type_name is not None:
        doc.custom_type_name = req.custom_type_name
    db.commit()
    db.refresh(doc)
    return _doc_to_response(doc)


@router.delete("/{alert_id}")
def delete_alert(alert_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == alert_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.image_path:
        import os
        try:
            os.remove(doc.image_path)
        except OSError:
            pass
    db.delete(doc)
    db.commit()
    return {"status": "ok"}
