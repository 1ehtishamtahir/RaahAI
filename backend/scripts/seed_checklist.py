"""Seed checklist demo data — no DB needed, just prints templates."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
from app.services.checklist import TEMPLATES
import json
print(json.dumps(TEMPLATES, indent=2, ensure_ascii=False))
