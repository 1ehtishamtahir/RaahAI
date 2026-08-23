from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/vehicle", tags=["vehicle"])

VEHICLES = [
    {"id": "VEH-001", "registration_no": "ABC-123", "type": "Car", "make": "Toyota Corolla", "model": "2022", "owner": "Ehtisham Tahir", "ownership_status": "Owned", "token_tax_status": "Paid", "token_due": "2026-12-31", "cnic": "42101-1234567-1"},
    {"id": "VEH-002", "registration_no": "XYZ-789", "type": "Motorcycle", "make": "Honda CG 125", "model": "2020", "owner": "Ehtisham Tahir", "ownership_status": "Owned", "token_tax_status": "Pending", "token_due": "2026-09-30", "cnic": "42101-1234567-1"},
]

@router.get("")
def list_vehicles():
    return {"vehicles": VEHICLES, "count": len(VEHICLES)}

@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: str):
    for v in VEHICLES:
        if v["id"] == vehicle_id or v["registration_no"] == vehicle_id:
            return v
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Vehicle not found")

@router.post("/register")
def register_vehicle(payload: dict):
    return {"status": "Submitted", "registration_no": f"LEA-{hash(str(payload))%9000+1000}", "message": "Vehicle registration submitted. Visit Excise office with documents.", "next_steps": ["Visit Excise & Taxation office", "Submit CNIC + invoice + import docs", "Pay registration fee", "Receive number plate"]}

@router.post("/transfer")
def transfer_vehicle(payload: dict):
    return {"status": "Submitted", "message": "Ownership transfer initiated.", "next_steps": ["Seller + buyer visit Excise", "Submit CNICs + transfer deed", "Pay transfer fee (1% of value)", "Receive new registration book"]}

@router.get("/{vehicle_id}/token-tax")
def token_tax(vehicle_id: str):
    v = next((x for x in VEHICLES if x["id"] == vehicle_id), VEHICLES[0])
    return {"registration_no": v["registration_no"], "token_tax_status": v["token_tax_status"], "due_date": v["token_due"], "amount": "PKR 2,500" if v["type"]=="Car" else "PKR 1,000", "pay_at": "Excise office or ePay Punjab/Sindh app", "official_source": "Excise & Taxation Department", "last_verified": "2026-08-01"}
