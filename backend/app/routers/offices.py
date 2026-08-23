from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/offices", tags=["offices"])

class Office(BaseModel):
    id: str
    name_en: str
    name_ur: str
    type: str  # nadra, dgip, secp
    city: str
    address: str
    phone: str
    hours: str
    lat: Optional[float] = None
    lng: Optional[float] = None

OFFICES: list[Office] = [
    # NADRA Offices
    Office(id="n1", name_en="NADRA Headquarters", name_ur="نادرا ہیڈ کوارٹرز", type="nadra", city="Islamabad",
           address="State Bank of Pakistan Building, Shahanfaidabad, Islamabad", phone="+92-51-9206700",
           hours="Mon-Sat: 8:30 AM - 5:00 PM", lat=33.6941, lng=73.0479),
    Office(id="n2", name_en="NADRA Mega Center - Karachi", name_ur="نادرا میگا سینٹر - کراچی", type="nadra", city="Karachi",
           address="State Bank of Pakistan Building, I.I. Chundrigar Road, Karachi", phone="+92-21-99211818",
           hours="Mon-Sat: 8:30 AM - 5:00 PM", lat=24.8607, lng=67.0011),
    Office(id="n3", name_en="NADRA Mega Center - Lahore", name_ur="نادرا میگا سینٹر - لاہور", type="nadra", city="Lahore",
           address="23-Davis Road, Lahore", phone="+92-42-99212413",
           hours="Mon-Sat: 8:30 AM - 5:00 PM", lat=31.5204, lng=74.3587),
    Office(id="n4", name_en="NADRA Mega Center - Peshawar", name_ur="نادرا میگا سینٹر - پشاور", type="nadra", city="Peshawar",
           address="2-Club Road, Peshawar", phone="+92-91-9217296",
           hours="Mon-Sat: 8:30 AM - 5:00 PM", lat=34.0151, lng=71.5249),
    Office(id="n5", name_en="NADRA Mega Center - Quetta", name_ur="نادرا میگا سینٹر - کوئٹہ", type="nadra", city="Quetta",
           address="Zarghoon Road, Quetta", phone="+92-81-9201752",
           hours="Mon-Sat: 8:30 AM - 5:00 PM", lat=30.1798, lng=66.9750),
    Office(id="n6", name_en="NADRA Mega Center - Faisalabad", name_ur="نادرا میگا سینٹر - فیصل آباد", type="nadra", city="Faisalabad",
           address="D-Ground, People's Colony, Faisalabad", phone="+92-41-9230400",
           hours="Mon-Sat: 8:30 AM - 5:00 PM", lat=31.4504, lng=73.1350),

    # DGIP Passport Offices
    Office(id="d1", name_en="DGIP Passport Office - Islamabad", name_ur="ڈی جی آئی پی پاسپورٹ دفتر - اسلام آباد", type="dgip", city="Islamabad",
           address="Sector G-5/2, Blue Area, Islamabad", phone="+92-51-9208600",
           hours="Mon-Fri: 8:30 AM - 4:30 PM", lat=33.6961, lng=73.0426),
    Office(id="d2", name_en="DGIP Passport Office - Karachi", name_ur="ڈی جی آئی پی پاسپورٹ دفتر - کراچی", type="dgip", city="Karachi",
           address="PIDC Building, M.T. Khan Road, Karachi", phone="+92-21-99211818",
           hours="Mon-Fri: 8:30 AM - 4:30 PM", lat=24.8520, lng=67.0110),
    Office(id="d3", name_en="DGIP Passport Office - Lahore", name_ur="ڈی جی آئی پی پاسپورٹ دفتر - لاہور", type="dgip", city="Lahore",
           address="GPO Road, Lahore", phone="+92-42-99212413",
           hours="Mon-Fri: 8:30 AM - 4:30 PM", lat=31.5497, lng=74.3436),

    # SECP Offices
    Office(id="s1", name_en="SECP Head Office - Islamabad", name_ur="ایس ای سی پی ہیڈ آفس - اسلام آباد", type="secp", city="Islamabad",
           address="63-C, Jinnah Avenue, Blue Area, Islamabad", phone="+92-51-111-111-272",
           hours="Mon-Fri: 9:00 AM - 5:00 PM", lat=33.6961, lng=73.0426),
    Office(id="s2", name_en="SECP Regional Office - Karachi", name_ur="ایس ای سی پی علاقائی آفس - کراچی", type="secp", city="Karachi",
           address="State Bank of Pakistan Building, I.I. Chundrigar Road, Karachi", phone="+92-21-111-111-272",
           hours="Mon-Fri: 9:00 AM - 5:00 PM", lat=24.8607, lng=67.0011),
    Office(id="s3", name_en="SECP Regional Office - Lahore", name_ur="ایس ای سی پی علاقائی آفس - لاہور", type="secp", city="Lahore",
           address="7-Bank Square, Shahrah-e-Quaid-e-Azam, Lahore", phone="+92-42-111-111-272",
           hours="Mon-Fri: 9:00 AM - 5:00 PM", lat=31.5204, lng=74.3587),
]

@router.get("", response_model=list[Office])
def list_offices(
    city: Optional[str] = Query(None, description="Filter by city"),
    type: Optional[str] = Query(None, description="Filter by type: nadra, dgip, secp"),
):
    results = OFFICES
    if city:
        results = [o for o in results if o.city.lower() == city.lower()]
    if type:
        results = [o for o in results if o.type == type.lower()]
    return results

@router.get("/cities")
def list_cities():
    return sorted(list(set(o.city for o in OFFICES)))

@router.get("/{office_id}", response_model=Office)
def get_office(office_id: str):
    for o in OFFICES:
        if o.id == office_id:
            return o
    return {"error": "Office not found"}
