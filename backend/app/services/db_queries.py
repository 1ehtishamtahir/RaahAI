"""
Database query tools with enforced authorization.
Every function requires an authenticated user_id and filters results accordingly.
NEVER trust user-provided IDs — always use the authenticated user_id from JWT.
"""
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.models.db_models import (
    User, Document, VehicleRecord, ChallanRecord, PaymentRecord,
    FamilyMember, FamilyProgram, ChecklistState,
)


def get_user_profile(user_id: str, db: Session) -> Optional[Dict]:
    """Get the authenticated user's profile."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone or "Not provided",
        "cnic": user.cnic or "Not provided",
        "province": user.province or "Not provided",
        "city": user.city or "Not provided",
        "education": user.education or "Not provided",
        "date_of_birth": user.date_of_birth or "Not provided",
    }


def get_user_documents(user_id: str, db: Session, document_type: Optional[str] = None) -> List[Dict]:
    """Get the authenticated user's documents, optionally filtered by type."""
    query = db.query(Document).filter(Document.user_id == user_id)
    if document_type:
        query = query.filter(Document.document_type.ilike(f"%{document_type}%"))
    docs = query.all()
    result = []
    for d in docs:
        result.append({
            "id": d.id,
            "document_type": d.document_type,
            "document_name": d.document_name_en or d.custom_type_name or d.document_type,
            "holder_name": d.holder_name,
            "cnic": d.cnic or "Not provided",
            "issue_date": d.issue_date or "Not provided",
            "expiry_date": d.expiry_date or "Not provided",
            "status": "expired" if d.expiry_date and d.expiry_date < str(__import__('datetime').datetime.now().date()) else "valid",
            "renewal_url": d.renewal_url,
            "has_image": d.has_image,
        })
    return result


def get_document_by_id(user_id: str, doc_id: str, db: Session) -> Optional[Dict]:
    """Get a specific document by ID, enforcing user ownership."""
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.user_id == user_id
    ).first()
    if not doc:
        return None
    return {
        "id": doc.id,
        "document_type": doc.document_type,
        "document_name": doc.document_name_en or doc.custom_type_name or doc.document_type,
        "holder_name": doc.holder_name,
        "cnic": doc.cnic or "Not provided",
        "issue_date": doc.issue_date or "Not provided",
        "expiry_date": doc.expiry_date or "Not provided",
        "status": "expired" if doc.expiry_date and doc.expiry_date < str(__import__('datetime').datetime.now().date()) else "valid",
        "renewal_url": doc.renewal_url,
        "has_image": doc.has_image,
    }


def get_user_vehicles(user_id: str, db: Session, registration_no: Optional[str] = None) -> List[Dict]:
    """Get the authenticated user's vehicles, optionally filtered by registration number."""
    query = db.query(VehicleRecord).filter(VehicleRecord.user_id == user_id)
    if registration_no:
        query = query.filter(VehicleRecord.registration_no.ilike(f"%{registration_no}%"))
    vehicles = query.all()
    result = []
    for v in vehicles:
        result.append({
            "id": v.id,
            "registration_no": v.registration_no or "Not provided",
            "vehicle_type": v.vehicle_type or "Not specified",
            "make": v.make or "Not specified",
            "model": v.model or "Not specified",
            "year": v.year or "Not specified",
            "color": v.color or "Not specified",
            "owner_name": v.owner_name or "Not specified",
            "ownership_status": v.ownership_status or "Owned",
            "token_tax_status": v.token_tax_status or "Unknown",
            "token_due": v.token_due or "Not specified",
        })
    return result


def get_vehicle_by_id(user_id: str, vehicle_id: str, db: Session) -> Optional[Dict]:
    """Get a specific vehicle by ID, enforcing user ownership."""
    v = db.query(VehicleRecord).filter(
        VehicleRecord.id == vehicle_id,
        VehicleRecord.user_id == user_id
    ).first()
    if not v:
        return None
    return {
        "id": v.id,
        "registration_no": v.registration_no or "Not provided",
        "vehicle_type": v.vehicle_type or "Not specified",
        "make": v.make or "Not specified",
        "model": v.model or "Not specified",
        "year": v.year or "Not specified",
        "color": v.color or "Not specified",
        "owner_name": v.owner_name or "Not specified",
        "ownership_status": v.ownership_status or "Owned",
        "token_tax_status": v.token_tax_status or "Unknown",
        "token_due": v.token_due or "Not specified",
    }


def get_user_challans(user_id: str, db: Session, status: Optional[str] = None,
                      vehicle_plate: Optional[str] = None) -> List[Dict]:
    """Get the authenticated user's challans, optionally filtered by status or plate."""
    query = db.query(ChallanRecord).filter(ChallanRecord.user_id == user_id)
    if status:
        query = query.filter(ChallanRecord.status.ilike(f"%{status}%"))
    if vehicle_plate:
        query = query.filter(ChallanRecord.vehicle_plate.ilike(f"%{vehicle_plate}%"))
    challans = query.all()
    result = []
    for c in challans:
        result.append({
            "id": c.id,
            "vehicle_plate": c.vehicle_plate or "Not provided",
            "category": c.category or "Not specified",
            "violation": c.violation or "Not specified",
            "amount": c.amount,
            "status": c.status or "Unknown",
            "issue_date": c.issue_date or "Not provided",
            "due_date": c.due_date or "Not provided",
            "source": c.source or "Not specified",
            "explanation": c.explanation_en or "No explanation available",
        })
    return result


def get_challan_by_id(user_id: str, challan_id: str, db: Session) -> Optional[Dict]:
    """Get a specific challan by ID, enforcing user ownership."""
    c = db.query(ChallanRecord).filter(
        ChallanRecord.id == challan_id,
        ChallanRecord.user_id == user_id
    ).first()
    if not c:
        return None
    return {
        "id": c.id,
        "vehicle_plate": c.vehicle_plate or "Not provided",
        "category": c.category or "Not specified",
        "violation": c.violation or "Not specified",
        "amount": c.amount,
        "status": c.status or "Unknown",
        "issue_date": c.issue_date or "Not provided",
        "due_date": c.due_date or "Not provided",
        "source": c.source or "Not specified",
        "explanation": c.explanation_en or "No explanation available",
    }


def get_user_payments(user_id: str, db: Session, status: Optional[str] = None,
                      payment_type: Optional[str] = None) -> List[Dict]:
    """Get the authenticated user's payments, optionally filtered by status or type."""
    query = db.query(PaymentRecord).filter(PaymentRecord.user_id == user_id)
    if status:
        query = query.filter(PaymentRecord.status.ilike(f"%{status}%"))
    if payment_type:
        query = query.filter(PaymentRecord.type.ilike(f"%{payment_type}%"))
    payments = query.all()
    result = []
    for p in payments:
        result.append({
            "id": p.id,
            "type": p.type or "Not specified",
            "title": p.title_en or p.type or "Payment",
            "amount": p.amount,
            "currency": p.currency or "PKR",
            "status": p.status or "Unknown",
            "due_date": p.due_date or "Not provided",
            "paid_date": p.paid_date or "Not paid",
            "method": p.method or "Not specified",
            "category": p.category or "Not specified",
            "priority": p.priority or "normal",
        })
    return result


def get_payment_by_id(user_id: str, payment_id: str, db: Session) -> Optional[Dict]:
    """Get a specific payment by ID, enforcing user ownership."""
    p = db.query(PaymentRecord).filter(
        PaymentRecord.id == payment_id,
        PaymentRecord.user_id == user_id
    ).first()
    if not p:
        return None
    return {
        "id": p.id,
        "type": p.type or "Not specified",
        "title": p.title_en or p.type or "Payment",
        "amount": p.amount,
        "currency": p.currency or "PKR",
        "status": p.status or "Unknown",
        "due_date": p.due_date or "Not provided",
        "paid_date": p.paid_date or "Not paid",
        "method": p.method or "Not specified",
        "category": p.category or "Not specified",
        "priority": p.priority or "normal",
    }


def get_user_family_members(user_id: str, db: Session, name: Optional[str] = None) -> List[Dict]:
    """Get the authenticated user's family members, optionally filtered by name."""
    query = db.query(FamilyMember).filter(FamilyMember.user_id == user_id)
    if name:
        query = query.filter(FamilyMember.name.ilike(f"%{name}%"))
    members = query.all()
    result = []
    for m in members:
        result.append({
            "id": m.id,
            "name": m.name,
            "relation": m.relation or "Not specified",
            "cnic": m.cnic_masked or "Not provided",
            "age": m.age,
            "gender": m.gender or "Not specified",
            "education": m.education or "Not specified",
            "income": m.income or "Not specified",
            "status": m.status or "Active",
        })
    return result


def get_user_family_programs(user_id: str, db: Session, status: Optional[str] = None) -> List[Dict]:
    """Get the authenticated user's family programs, optionally filtered by status."""
    query = db.query(FamilyProgram).filter(FamilyProgram.user_id == user_id)
    if status:
        query = query.filter(FamilyProgram.status.ilike(f"%{status}%"))
    programs = query.all()
    result = []
    for p in programs:
        result.append({
            "id": p.id,
            "program_name": p.program_name,
            "program_name_ur": p.program_name_ur or "",
            "member_name": p.member_name or "All",
            "status": p.status or "Unknown",
            "amount": p.amount or "Not specified",
            "category": p.category or "Not specified",
            "official_source": p.official_source or "Not specified",
            "last_verified": p.last_verified or "Not verified",
            "next_step": p.next_step or "No next step",
        })
    return result


def get_user_checklists(user_id: str, db: Session) -> List[Dict]:
    """Get the authenticated user's checklist progress."""
    try:
        checklists = db.query(ChecklistState).filter(ChecklistState.user_id == user_id).all()
        result = []
        for cl in checklists:
            states = cl.completed_ids or []
            done = sum(1 for s in states if s) if isinstance(states, list) else 0
            total = len(states) if isinstance(states, list) else 0
            result.append({
                "id": cl.id,
                "service": cl.service,
                "situation": cl.situation,
                "completed_count": done,
                "total_count": total,
                "progress": f"{done}/{total}",
            })
        return result
    except Exception:
        return []


# ── Aggregate query for dashboard/overview ────────────────────────────
def get_user_summary(user_id: str, db: Session) -> Dict:
    """Get a comprehensive summary of all user data for AI context."""
    docs = get_user_documents(user_id, db)
    vehicles = get_user_vehicles(user_id, db)
    challans = get_user_challans(user_id, db)
    payments = get_user_payments(user_id, db)
    family = get_user_family_members(user_id, db)
    programs = get_user_family_programs(user_id, db)
    checklists = get_user_checklists(user_id, db)

    return {
        "documents": docs,
        "vehicles": vehicles,
        "challans": challans,
        "payments": payments,
        "family_members": family,
        "family_programs": programs,
        "checklists": checklists,
        "stats": {
            "total_documents": len(docs),
            "expired_documents": sum(1 for d in docs if d["status"] == "expired"),
            "total_vehicles": len(vehicles),
            "pending_challans": sum(1 for c in challans if c["status"] == "Pending"),
            "pending_challan_amount": sum(c["amount"] or 0 for c in challans if c["status"] == "Pending"),
            "pending_payments": sum(1 for p in payments if p["status"] != "Paid"),
            "pending_payment_amount": sum(p["amount"] or 0 for p in payments if p["status"] != "Paid"),
            "total_family_members": len(family),
            "total_programs": len(programs),
        },
    }
