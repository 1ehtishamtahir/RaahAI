"""Build a comprehensive text context from the logged-in user's database data."""
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.db_models import (
    User, Document, VehicleRecord, ChallanRecord, PaymentRecord,
    FamilyMember, FamilyProgram, ChecklistState,
)


def build_user_context(user_id: str, db: Session) -> str:
    """Return a structured string of all user data for AI context injection."""
    now = datetime.now()
    parts = []

    # ── Profile ───────────────────────────────────────────────────
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        parts.append(f"""## Citizen Profile
- Name: {user.name}
- Email: {user.email}
- CNIC: {user.cnic or 'Not provided'}
- Province: {user.province or 'Not provided'}
- City: {user.city or 'Not provided'}
- Education: {user.education or 'Not provided'}""")

    # ── Documents ─────────────────────────────────────────────────
    docs = db.query(Document).filter(Document.user_id == user_id).all()
    if docs:
        lines = ["## My Documents (Wallet)"]
        for d in docs:
            status = "valid"
            exp = ""
            if d.expiry_date:
                try:
                    days = (datetime.strptime(d.expiry_date, "%Y-%m-%d") - now).days
                    if days < 0:
                        status = "expired"
                    elif days <= 30:
                        status = "expiring_soon"
                    exp = f", expires {d.expiry_date} ({'expired' if days < 0 else f'{days} days left'})"
                except Exception:
                    exp = f", expires {d.expiry_date}"
            name = d.document_name_en or d.custom_type_name or d.document_type
            lines.append(f"- {name} ({d.document_type}): status={status}{exp}")
        parts.append("\n".join(lines))

    # ── Vehicles ──────────────────────────────────────────────────
    vehicles = db.query(VehicleRecord).filter(VehicleRecord.user_id == user_id).all()
    if vehicles:
        lines = ["## My Vehicles"]
        for v in vehicles:
            lines.append(
                f"- {v.registration_no} ({v.vehicle_type or 'vehicle'}): "
                f"make={v.make or '?'}, model={v.model or '?'}, year={v.year or '?'}, "
                f"token_tax={v.token_tax_status or 'unknown'}, "
                f"token_due={v.token_due or 'N/A'}"
            )
        parts.append("\n".join(lines))

    # ── Challans ──────────────────────────────────────────────────
    challans = db.query(ChallanRecord).filter(ChallanRecord.user_id == user_id).all()
    if challans:
        lines = ["## My Challans"]
        for c in challans:
            lines.append(
                f"- {c.id}: vehicle={c.vehicle_plate or 'N/A'}, category={c.category}, "
                f"violation={c.violation}, amount=PKR {c.amount}, "
                f"status={c.status}, due={c.due_date or 'N/A'}, source={c.source}"
            )
        parts.append("\n".join(lines))

    # ── Payments ──────────────────────────────────────────────────
    payments = db.query(PaymentRecord).filter(PaymentRecord.user_id == user_id).all()
    if payments:
        lines = ["## My Payments"]
        for p in payments:
            lines.append(
                f"- {p.title_en or p.type}: amount=PKR {p.amount}, "
                f"status={p.status}, due={p.due_date or 'N/A'}, "
                f"paid_date={p.paid_date or 'N/A'}, category={p.category}"
            )
        parts.append("\n".join(lines))

    # ── Family ────────────────────────────────────────────────────
    family = db.query(FamilyMember).filter(FamilyMember.user_id == user_id).all()
    if family:
        lines = ["## My Family Members"]
        for m in family:
            lines.append(
                f"- {m.name}: relation={m.relation}, age={m.age}, "
                f"education={m.education or 'N/A'}, cnic={m.cnic_masked or 'N/A'}"
            )
        parts.append("\n".join(lines))

    # ── Family Programs ───────────────────────────────────────────
    programs = db.query(FamilyProgram).filter(FamilyProgram.user_id == user_id).all()
    if programs:
        lines = ["## My Enrolled/Eligible Programs"]
        for p in programs:
            lines.append(
                f"- {p.program_name}: member={p.member_name}, "
                f"status={p.status}, amount={p.amount}, "
                f"next_step={p.next_step or 'N/A'}"
            )
        parts.append("\n".join(lines))

    # ── Checklist States ──────────────────────────────────────────
    checklists = db.query(ChecklistState).filter(ChecklistState.user_id == user_id).all()
    if checklists:
        lines = ["## My Checklist Progress"]
        for cl in checklists:
            done = sum(1 for s in (cl.states or []) if s.get("done"))
            total = len(cl.states or [])
            lines.append(f"- {cl.service}: {done}/{total} steps completed")
        parts.append("\n".join(lines))

    context = "\n\n".join(parts) if parts else "No personal data available yet."

    # Truncate if too long (keep under ~3000 chars for token safety)
    if len(context) > 3000:
        context = context[:3000] + "\n... [truncated]"

    return context
