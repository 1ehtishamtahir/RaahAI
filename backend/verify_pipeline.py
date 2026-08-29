"""
Detailed pipeline verification test.
Shows the complete flow: User -> Intent -> Retrieval -> Database/RAG -> Context -> LLM -> Answer
"""
import sys
import asyncio

sys.path.insert(0, "D:\\1-Projects\\RaahAI - Bano Qabil Hackathon\\RaahAI\\backend")

from app.services.chat_orchestrator import process_question, _extract_entities, _query_database
from app.services.intent_classifier import classify_intent
from app.core.database import SessionLocal


def test_pipeline(query, user_id=None):
    """Run a single query through the full pipeline and show detailed results."""
    print(f"\n{'='*70}")
    print(f"QUERY: {query}")
    print(f"{'='*70}")
    
    db = SessionLocal()
    try:
        # Step 1: Intent Classification
        intent_info = classify_intent(query)
        print(f"\n[STEP 1] Intent Classification:")
        print(f"  Intent: {intent_info['intent'].value}")
        print(f"  Confidence: {intent_info['confidence']:.0%}")
        print(f"  Reasons: {intent_info['reasons'][:3]}")
        
        # Step 2: Entity Extraction
        entities = _extract_entities(query)
        print(f"\n[STEP 2] Entity Extraction:")
        if entities:
            for k, v in entities.items():
                print(f"  {k}: {v}")
        else:
            print(f"  No specific entities extracted")
        
        # Step 3: Database Query (if user_id provided)
        if user_id:
            print(f"\n[STEP 3] Database Query (user_id={user_id[:8]}...):")
            db_results = _query_database(intent_info['intent'], entities, user_id, db)
            for key, value in db_results.items():
                if isinstance(value, list):
                    print(f"  {key}: {len(value)} records")
                    for item in value[:2]:  # Show first 2
                        if isinstance(item, dict):
                            print(f"    - {item}")
                elif isinstance(value, dict):
                    print(f"  {key}: {value}")
        else:
            print(f"\n[STEP 3] Database Query: SKIPPED (no user_id)")
        
        # Step 4: Full Pipeline
        print(f"\n[STEP 4] Full Pipeline Result:")
        async def run():
            return await process_question(
                query=query,
                user_id=user_id,
                db=db,
                lang="en",
            )
        result = asyncio.run(run())
        
        safe_answer = result['answer'].encode('ascii', 'ignore').decode('ascii')
        print(f"  Intent: {result['intent']}")
        print(f"  Grounded: {result['grounded']}")
        print(f"  Sources: {len(result['sources'])}")
        print(f"  Answer: {safe_answer[:300]}")
        
        # Step 5: Verify
        print(f"\n[STEP 5] Verification:")
        print(f"  Has intent: {'intent' in result}")
        print(f"  Has answer: {'answer' in result}")
        print(f"  Has grounded flag: {'grounded' in result}")
        print(f"  Has sources: {'sources' in result}")
        
        return result
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        return None
    finally:
        db.close()


def main():
    print("\n" + "="*70)
    print("RaahAI Database-Grounded RAG - Pipeline Verification")
    print("="*70)
    
    # Get test user
    db = SessionLocal()
    from app.models.db_models import User
    user = db.query(User).filter(User.email == "test@example.com").first()
    db.close()
    
    if not user:
        print("No test user found! Run seed_test_data.py first.")
        return
    
    user_id = user.id
    print(f"Using test user: {user.name} (ID: {user_id[:8]}...)")
    
    # Test 1: Database Query - Show vehicles
    test_pipeline("Show my vehicles", user_id)
    
    # Test 2: Database Query - Show challans
    test_pipeline("What challans do I have?", user_id)
    
    # Test 3: Database Query - Show payments
    test_pipeline("Show my pending payments", user_id)
    
    # Test 4: RAG Query - Passport process
    test_pipeline("What documents do I need for passport renewal?")
    
    # Test 5: Hybrid Query
    test_pipeline("What is my passport status and what documents do I need?", user_id)
    
    # Test 6: Greeting
    test_pipeline("Hello")
    
    # Test 7: No user ID
    test_pipeline("Show my vehicles", None)
    
    print("\n" + "="*70)
    print("Pipeline verification complete!")
    print("="*70)


if __name__ == "__main__":
    main()
