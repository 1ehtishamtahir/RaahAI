from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.db_models import User, FamilyMember, FamilyProgram

router = APIRouter(prefix="/api/family", tags=["family"])

def mask_cnic(cnic: str) -> str:
    if not cnic:
        return "XXXXX-XXXXXXX-X"
    if "-" in cnic and len(cnic) >= 13:
        return cnic[:2] + "XXX-XXXXXXX-X"[-11:]
    if len(cnic) == 13:
        return cnic[:4] + "XXXXXXX" + cnic[-1]
    return "XXXXX-XXXXXXX-X"


@router.get("/profile")
def profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    members = db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).all()
    programs = db.query(FamilyProgram).filter(FamilyProgram.user_id == current_user.id).all()
    member_list = []
    for m in members:
        member_list.append({
            "id": m.id,
            "name": m.name,
            "relation": m.relation or "Other",
            "age": m.age,
            "cnic": m.cnic or "",
            "cnic_masked": m.cnic_masked or mask_cnic(m.cnic or ""),
            "education": m.education or "",
            "eligible_programs": [],
            "status": m.status or "Active",
        })
    program_list = []
    for p in programs:
        program_list.append({
            "program": p.program_name,
            "program_ur": p.program_name_ur or p.program_name,
            "member": p.member_name or "All",
            "status": p.status or "Eligible",
            "amount": p.amount or "",
            "category": p.category or "",
            "official_source": p.official_source or "",
            "last_verified": p.last_verified or "",
            "next_step": p.next_step or "",
        })
    head = member_list[0] if member_list else {
        "name": current_user.name, "cnic": current_user.cnic or "",
        "cnic_masked": mask_cnic(current_user.cnic or ""), "age": None,
        "education": current_user.education or "", "province": current_user.province or "",
        "city": current_user.city or "",
    }
    return {
        "id": f"HH-{current_user.id[:8]}",
        "head": head,
        "members": member_list,
        "programs": program_list,
    }


@router.get("/programs")
def programs(category: Optional[str] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(FamilyProgram).filter(FamilyProgram.user_id == current_user.id)
    if category:
        q = q.filter(FamilyProgram.category.ilike(category))
    progs = q.all()
    members = db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).all()
    program_list = [{
        "program": p.program_name, "program_ur": p.program_name_ur or p.program_name,
        "member": p.member_name or "All", "status": p.status or "Eligible",
        "amount": p.amount or "", "category": p.category or "",
        "official_source": p.official_source or "", "last_verified": p.last_verified or "",
        "next_step": p.next_step or "",
    } for p in progs]
    by_member = {}
    for m in members:
        by_member[m.name] = []
    return {"programs": program_list, "by_member": by_member, "count": len(program_list)}


@router.post("/member")
def add_member(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cnic = payload.get("cnic", "")
    member = FamilyMember(
        user_id=current_user.id,
        name=payload.get("name", "New Member"),
        relation=payload.get("relation", "Other"),
        age=payload.get("age", 18),
        cnic=cnic,
        cnic_masked=mask_cnic(cnic) if cnic else "—",
        education=payload.get("education", "Matric"),
        gender=payload.get("gender"),
        income=payload.get("income"),
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    total = db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).count()
    return {
        "status": "added",
        "member": {
            "id": member.id, "name": member.name, "relation": member.relation,
            "age": member.age, "cnic": member.cnic, "cnic_masked": member.cnic_masked,
            "education": member.education, "eligible_programs": [], "status": member.status,
        },
        "total": total,
    }


@router.get("/member/{member_id}")
def member(member_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    m = db.query(FamilyMember).filter(
        FamilyMember.id == member_id, FamilyMember.user_id == current_user.id
    ).first()
    if not m:
        m = db.query(FamilyMember).filter(
            FamilyMember.user_id == current_user.id,
            FamilyMember.name.ilike(member_id.replace("_", " "))
        ).first()
    if not m:
        raise HTTPException(status_code=404, detail="Member not found")
    return {
        "id": m.id, "name": m.name, "relation": m.relation, "age": m.age,
        "cnic": m.cnic or "", "cnic_masked": m.cnic_masked or mask_cnic(m.cnic or ""),
        "education": m.education or "", "eligible_programs": [], "status": m.status,
    }


@router.get("/stats")
def stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    members = db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).all()
    programs = db.query(FamilyProgram).filter(FamilyProgram.user_id == current_user.id).all()
    by_relation = {}
    for m in members:
        by_relation[m.relation or "Other"] = by_relation.get(m.relation or "Other", 0) + 1
    return {
        "total_members": len(members),
        "by_relation": by_relation,
        "programs_enrolled": sum(1 for p in programs if p.status == "Enrolled"),
        "programs_eligible": sum(1 for p in programs if p.status == "Eligible"),
        "total_programs": len(programs),
    }
