from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.db_models import (
    User, Document, VehicleRecord, ChallanRecord, PaymentRecord,
    FamilyMember, FamilyProgram,
)
from app.services.gemini import call_gemini

router = APIRouter(prefix="/api/ai", tags=["ai-features"])


def _gemini(prompt: str, lang: str = "en") -> str:
    """Call Gemini with a simple prompt (no RAG chunks)."""
    try:
        return call_gemini(prompt, [], lang=lang)
    except Exception:
        return ""


# ── 1. Smart Document Advisor ─────────────────────────────────────
@router.post("/document-advisor")
def document_advisor(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """User uploads OCR results → AI recommends services, checklist, fees."""
    fields = payload.get("fields", [])
    service_type = payload.get("service_type", "unknown")
    lang = payload.get("lang", "en")

    field_text = "\n".join([f"- {f.get('label','')}: {f.get('value','')}" for f in fields])

    prompt = f"""You are RaahAI, a Pakistani government services assistant.

A user uploaded a document that was OCR-extracted. The detected service type is: {service_type}

Extracted fields:
{field_text}

Based on this document, provide:
1. What this document is (identify it)
2. What government services the user likely needs (e.g., renewal, update, registration)
3. A step-by-step checklist (max 5 steps)
4. Estimated fees (if applicable)
5. Any warnings (e.g., expired, expiring soon)

Respond in {'Urdu' if lang == 'ur' else 'English'}.
Use markdown headings: ### Document Type, ### Recommended Services, ### Checklist, ### Fees, ### Warnings
Keep it concise and actionable."""

    answer = _gemini(prompt, lang)

    # Also fetch user's existing documents for context
    docs = db.query(Document).filter(Document.user_id == current_user.id).all()
    doc_summary = ", ".join([d.document_type for d in docs]) if docs else "none"

    return {
        "advisor": answer,
        "existing_documents": doc_summary,
        "service_type": service_type,
    }


# ── 3. AI Challan Explainer ──────────────────────────────────────
@router.get("/challan-explain/{challan_id}")
def explain_challan(
    challan_id: str,
    lang: str = "en",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AI explains a challan in plain language."""
    c = db.query(ChallanRecord).filter(
        ChallanRecord.id == challan_id, ChallanRecord.user_id == current_user.id
    ).first()
    if not c:
        return {"error": "Challan not found"}

    prompt = f"""You are RaahAI, explaining a traffic/excise challan to a Pakistani citizen.

Challan details:
- Category: {c.category}
- Amount: PKR {c.amount}
- Violation: {c.violation}
- Vehicle: {c.vehicle_plate}
- Source: {c.source}
- Issue date: {c.issue_date}
- Due date: {c.due_date}
- Status: {c.status}

Provide a clear, plain-language explanation in {'Urdu' if lang == 'ur' else 'English'}:
1. What happened (in simple terms)
2. How much to pay and by when
3. Where to pay (online/office options)
4. What happens if not paid on time
5. Any tips to avoid this in future

Use markdown. Keep it friendly and reassuring. Max 200 words."""

    explanation = _gemini(prompt, lang)
    return {
        "challan_id": challan_id,
        "explanation": explanation,
        "amount": c.amount,
        "status": c.status,
    }


# ── 4. Deadline Predictor ────────────────────────────────────────
@router.get("/deadlines")
def predict_deadlines(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AI analyzes all user data and predicts/prioritizes deadlines."""
    now = datetime.now()

    # Gather all time-sensitive data
    docs = db.query(Document).filter(Document.user_id == current_user.id).all()
    challans = db.query(ChallanRecord).filter(
        ChallanRecord.user_id == current_user.id, ChallanRecord.status == "Pending"
    ).all()
    payments = db.query(PaymentRecord).filter(
        PaymentRecord.user_id == current_user.id, PaymentRecord.status != "Paid"
    ).all()
    vehicles = db.query(VehicleRecord).filter(VehicleRecord.user_id == current_user.id).all()

    timeline = []

    for d in docs:
        if d.expiry_date:
            try:
                exp = datetime.strptime(d.expiry_date, "%Y-%m-%d")
                days = (exp - now).days
                timeline.append({
                    "type": "document", "name": d.document_name_en or d.document_type,
                    "date": d.expiry_date, "days_left": days,
                    "status": "expired" if days < 0 else "expiring_soon" if days <= 30 else "valid",
                })
            except Exception:
                pass

    for c in challans:
        timeline.append({
            "type": "challan", "name": f"Challan {c.vehicle_plate or ''}",
            "date": c.due_date or "", "days_left": 0,
            "status": "overdue", "amount": c.amount,
        })

    for p in payments:
        if p.due_date:
            try:
                due = datetime.strptime(p.due_date, "%Y-%m-%d")
                days = (due - now).days
                timeline.append({
                    "type": "payment", "name": p.title_en or p.type,
                    "date": p.due_date, "days_left": days,
                    "status": "overdue" if days < 0 else "due_soon" if days <= 7 else "pending",
                    "amount": p.amount,
                })
            except Exception:
                pass

    for v in vehicles:
        if v.token_due:
            try:
                due = datetime.strptime(v.token_due, "%Y-%m-%d")
                days = (due - now).days
                timeline.append({
                    "type": "vehicle", "name": f"Token tax — {v.registration_no}",
                    "date": v.token_due, "days_left": days,
                    "status": "overdue" if days < 0 else "due_soon" if days <= 14 else "pending",
                })
            except Exception:
                pass

    if not timeline:
        return {"deadlines": [], "ai_plan": "No pending deadlines. You're all clear!", "urgent_count": 0}

    # Build context for Gemini
    items_text = "\n".join([
        f"- [{t['type']}] {t['name']}: {t['date']} ({t['days_left']} days left, {t['status']})"
        + (f" — PKR {t['amount']}" if t.get('amount') else "")
        for t in sorted(timeline, key=lambda x: x['days_left'])
    ])

    prompt = f"""You are RaahAI, a Pakistani government services AI assistant.

The user has these pending deadlines:
{items_text}

Create a prioritized action plan:
1. List items by urgency (most urgent first)
2. For each: what it is, deadline, what to do
3. A suggested order of actions (what to do first, second, etc.)
4. Any warnings for overdue items

Respond in English. Use markdown. Be concise and actionable. Max 300 words."""

    ai_plan = _gemini(prompt, "en")

    urgent_count = sum(1 for t in timeline if t['status'] in ('expired', 'overdue'))

    return {
        "deadlines": sorted(timeline, key=lambda x: x['days_left']),
        "ai_plan": ai_plan,
        "urgent_count": urgent_count,
    }


# ── 6. Smart Eligibility Matcher ─────────────────────────────────
class EligibilityInput(BaseModel):
    age: int = 28
    education: Optional[str] = "Bachelor"
    province: Optional[str] = "Sindh"
    income: Optional[str] = "middle"
    gender: Optional[str] = "male"

@router.post("/eligibility-match")
def match_eligibility(
    input_data: EligibilityInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AI matches user profile against all government programs."""
    # Gather user profile
    family = db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).all()
    programs = db.query(FamilyProgram).filter(FamilyProgram.user_id == current_user.id).all()

    family_text = "\n".join([
        f"- {m.name} ({m.relation}, age {m.age}, education {m.education})"
        for m in family
    ]) or "No family members added"

    existing_programs = ", ".join([p.program_name for p in programs]) or "None"

    prompt = f"""You are RaahAI, matching a Pakistani citizen against government welfare/education/youth programs.

User profile:
- Age: {input_data.age}
- Education: {input_data.education}
- Province: {input_data.province}
- Gender: {input_data.gender}

Family members:
{family_text}

Already enrolled in: {existing_programs}

Based on this profile, recommend ALL relevant Pakistani government programs:
1. Ehsaas/Kafalat (poverty alleviation)
2. BISP Taleemi Wazaif (education scholarships)
3. PM Youth Laptop Scheme
4. Kamyab Jawan (youth loans)
5. Sehat Insaf Card (health insurance)
6. PEEF Scholarships
7. HEC Need-Based Scholarships
8. Naya Pakistan Housing
9. Dhee Rani Program (dowry assistance)
10. Any other relevant provincial programs

For each program:
- Name (English + Urdu)
- Who qualifies
- Benefit amount
- How to apply (1-2 steps)
- Official source URL

Respond in English. Use markdown. Be specific to the user's profile."""

    recommendations = _gemini(prompt, "en")

    return {
        "profile": {
            "age": input_data.age,
            "education": input_data.education,
            "province": input_data.province,
        },
        "recommendations": recommendations,
        "existing_programs": existing_programs,
    }


# ── 8. Dashboard AI Suggestions ──────────────────────────────────
@router.get("/dashboard-suggestions")
def dashboard_suggestions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AI generates smart suggestions based on user's dashboard data."""
    now = datetime.now()

    docs = db.query(Document).filter(Document.user_id == current_user.id).all()
    challans = db.query(ChallanRecord).filter(
        ChallanRecord.user_id == current_user.id, ChallanRecord.status == "Pending"
    ).all()
    payments = db.query(PaymentRecord).filter(
        PaymentRecord.user_id == current_user.id, PaymentRecord.status != "Paid"
    ).all()
    vehicles = db.query(VehicleRecord).filter(VehicleRecord.user_id == current_user.id).all()

    # Build data summary
    summary_parts = []

    if docs:
        expiring = []
        for d in docs:
            if d.expiry_date:
                try:
                    days = (datetime.strptime(d.expiry_date, "%Y-%m-%d") - now).days
                    if days <= 90:
                        expiring.append(f"{d.document_name_en} (expires in {days} days)")
                except Exception:
                    pass
        if expiring:
            summary_parts.append(f"Expiring documents: {', '.join(expiring)}")
        summary_parts.append(f"Total documents: {len(docs)}")

    if challans:
        total = sum(c.amount or 0 for c in challans)
        summary_parts.append(f"Pending challans: {len(challans)} (PKR {total:,})")

    if payments:
        total = sum(p.amount or 0 for p in payments)
        overdue = sum(1 for p in payments if p.status == "Overdue")
        summary_parts.append(f"Pending payments: {len(payments)} (PKR {total:,}, {overdue} overdue)")

    if vehicles:
        pending_tax = sum(1 for v in vehicles if v.token_tax_status == "Pending")
        if pending_tax:
            summary_parts.append(f"Vehicles with pending token tax: {pending_tax}")

    if not summary_parts:
        return {"suggestions": "No data yet. Add documents, vehicles, or challans to get AI suggestions.", "priority_count": 0}

    data_summary = "\n".join([f"- {p}" for p in summary_parts])

    prompt = f"""You are RaahAI, a Pakistani government services AI assistant.

User's current status:
{data_summary}

Generate 2-4 smart, actionable suggestions. For each:
- What to do (action)
- Why it's important (reason)
- Priority: high/medium/low
- Which page to go to (href like /alerts, /challans, /payments, /vehicle)

Respond in English. Use markdown. Be concise. Focus on what's most urgent."""

    suggestions = _gemini(prompt, "en")

    priority_count = sum(1 for p in summary_parts if "overdue" in p.lower() or "expiring" in p.lower())

    return {
        "suggestions": suggestions,
        "priority_count": priority_count,
        "data_summary": summary_parts,
    }
