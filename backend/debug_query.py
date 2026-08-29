import sys
sys.path.insert(0, 'D:\\1-Projects\\RaahAI - Bano Qabil Hackathon\\RaahAI\\backend')

from app.core.database import SessionLocal, Base, engine
Base.metadata.create_all(bind=engine)

from app.models.db_models import User
from app.services.chat_orchestrator import _query_database, _extract_entities
from app.services.intent_classifier import classify_intent

db = SessionLocal()
user = db.query(User).filter_by(email='test@example.com').first()

query = 'Show my vehicles'
intent_info = classify_intent(query)
entities = _extract_entities(query)
print('Query:', query)
print('Intent:', intent_info['intent'])
print('Entities:', entities)

result = _query_database(intent_info['intent'], entities, user.id, db, query=query)
print('Result keys:', list(result.keys()))
for k, v in result.items():
    if isinstance(v, list):
        print(f'  {k}: {len(v)} records')
        if v:
            print(f'    First: {v[0]}')
    else:
        print(f'  {k}: {v}')
db.close()
