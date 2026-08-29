"""
End-to-end test for the database-grounded RAG chat system.
Tests the complete pipeline: User -> Intent -> Retrieval -> Database/RAG -> Context -> LLM -> Answer
"""
import sys
import asyncio

sys.path.insert(0, "D:\\1-Projects\\RaahAI - Bano Qabil Hackathon\\RaahAI\\backend")

from app.services.intent_classifier import classify_intent, detect_language, is_greeting, Intent
from app.services.db_queries import (
    get_user_profile, get_user_documents, get_user_vehicles,
    get_user_challans, get_user_payments, get_user_family_members,
    get_user_family_programs, get_user_summary
)
from app.services.context_builder import build_structured_context, build_db_context_for_mock
from app.core.database import SessionLocal


def get_db():
    return SessionLocal()


def test_intent_classification():
    print("=" * 60)
    print("TEST 1: Intent Classification")
    print("=" * 60)
    
    test_cases = [
        ("What is the status of my complaint?", Intent.DATABASE_QUERY),
        ("Show my complaints.", Intent.DATABASE_QUERY),
        ("What documents do I need to submit a complaint?", Intent.HYBRID_QUERY),  # RAG for docs + DB context for complaint
        ("What is the status of my application and what documents do I need?", Intent.HYBRID_QUERY),
        ("What does the Citizen Portal do?", Intent.GENERAL_QUERY),
        ("How many challans do I have?", Intent.DATABASE_QUERY),
        ("What is the status of CP-1024?", Intent.DATABASE_QUERY),
        ("Who is handling complaint 104?", Intent.DATABASE_QUERY),
        ("Show all my vehicles.", Intent.DATABASE_QUERY),
        ("What is the process for passport renewal?", Intent.RAG_QUERY),
    ]
    
    passed = 0
    failed = 0
    for query, expected_intent in test_cases:
        result = classify_intent(query)
        actual_intent = result["intent"]
        status = "PASS" if actual_intent == expected_intent else "FAIL"
        if actual_intent == expected_intent:
            passed += 1
        else:
            failed += 1
        print(f"  [{status}] '{query[:50]}' -> {actual_intent.value} (expected {expected_intent.value})")
    
    print(f"\n  Results: {passed}/{len(test_cases)} passed, {failed} failed\n")
    return failed == 0


def test_language_detection():
    print("=" * 60)
    print("TEST 2: Language Detection")
    print("=" * 60)
    
    test_cases = [
        ("What is my complaint status?", "en"),
        ("Mera complaint status kya hai?", "ur"),
        ("Passport kaise banwana hai?", "ur"),
        ("How to renew CNIC?", "en"),
    ]
    
    passed = 0
    failed = 0
    for query, expected_lang in test_cases:
        actual_lang = detect_language(query)
        status = "PASS" if actual_lang == expected_lang else "FAIL"
        if actual_lang == expected_lang:
            passed += 1
        else:
            failed += 1
        print(f"  [{status}] '{query[:40]}' -> {actual_lang} (expected {expected_lang})")
    
    print(f"\n  Results: {passed}/{len(test_cases)} passed, {failed} failed\n")
    return failed == 0


def test_db_queries():
    print("=" * 60)
    print("TEST 3: Database Queries")
    print("=" * 60)
    
    db = get_db()
    try:
        from app.models.db_models import User
        user = db.query(User).first()
        if not user:
            print("  [SKIP] No users in database")
            print("  (Register a user first via /api/citizen/register)\n")
            return False
        
        print(f"  Testing with user: {user.name} (ID: {user.id[:8]}...)")
        
        profile = get_user_profile(user.id, db)
        print(f"  [{'PASS' if profile else 'FAIL'}] get_user_profile: {profile is not None}")
        
        docs = get_user_documents(user.id, db)
        print(f"  [{'PASS' if docs is not None else 'FAIL'}] get_user_documents: {len(docs) if docs else 0} documents")
        
        vehicles = get_user_vehicles(user.id, db)
        print(f"  [{'PASS' if vehicles is not None else 'FAIL'}] get_user_vehicles: {len(vehicles) if vehicles else 0} vehicles")
        
        challans = get_user_challans(user.id, db)
        print(f"  [{'PASS' if challans is not None else 'FAIL'}] get_user_challans: {len(challans) if challans else 0} challans")
        
        payments = get_user_payments(user.id, db)
        print(f"  [{'PASS' if payments is not None else 'FAIL'}] get_user_payments: {len(payments) if payments else 0} payments")
        
        family = get_user_family_members(user.id, db)
        print(f"  [{'PASS' if family is not None else 'FAIL'}] get_user_family_members: {len(family) if family else 0} members")
        
        programs = get_user_family_programs(user.id, db)
        print(f"  [{'PASS' if programs is not None else 'FAIL'}] get_user_family_programs: {len(programs) if programs else 0} programs")
        
        summary = get_user_summary(user.id, db)
        print(f"  [{'PASS' if summary is not None else 'FAIL'}] get_user_summary: {len(summary.get('stats', {}))} stats")
        
        print()
        return True
    except Exception as e:
        print(f"  [ERROR] {e}\n")
        return False
    finally:
        db.close()


def test_context_builder():
    print("=" * 60)
    print("TEST 4: Context Builder")
    print("=" * 60)
    
    db_results = {
        "challans": [
            {
                "id": "challan-123",
                "vehicle_plate": "ABC-1234",
                "violation": "Speeding",
                "amount": 5000,
                "status": "Pending",
                "due_date": "2026-09-01",
            }
        ],
        "documents": [],
    }
    
    rag_results = [
        {
            "text": "Passport renewal requires previous passport and CNIC.",
            "source": "DGIP Official",
        }
    ]
    
    user_profile = {
        "name": "Ahmed Khan",
        "cnic": "35202-1234567-1",
        "city": "Lahore",
    }
    
    context = build_structured_context(
        db_results=db_results,
        rag_results=rag_results,
        user_profile=user_profile,
        intent_info={"intent": "HYBRID_QUERY", "confidence": 0.85},
    )
    
    checks = [
        ("[AUTHENTICATED USER]" in context, "Contains user profile"),
        ("[DATABASE RESULTS]" in context, "Contains database results"),
        ("[KNOWLEDGE BASE]" in context, "Contains knowledge base"),
        ("[DETECTED INTENT]" in context, "Contains intent info"),
        ("[CRITICAL RULES]" in context, "Contains anti-hallucination rules"),
        ("ABC-1234" in context, "Contains vehicle plate from DB"),
        ("DGIP Official" in context, "Contains RAG source"),
        ("NEVER invent" in context, "Contains anti-hallucination rule"),
    ]
    
    passed = 0
    failed = 0
    for check, desc in checks:
        status = "PASS" if check else "FAIL"
        if check:
            passed += 1
        else:
            failed += 1
        print(f"  [{status}] {desc}")
    
    print(f"\n  Results: {passed}/{len(checks)} passed, {failed} failed\n")
    return failed == 0


def test_greeting_detection():
    print("=" * 60)
    print("TEST 5: Greeting Detection")
    print("=" * 60)
    
    test_cases = [
        ("Hello", True),
        ("Assalam-o-Alaikum", True),
        ("Thanks", True),
        ("Shukriya", True),
        ("What is my status?", False),
        ("Show my complaints", False),
        ("Passport kaise banwana hai?", False),
    ]
    
    passed = 0
    failed = 0
    for query, expected in test_cases:
        actual = is_greeting(query)
        status = "PASS" if actual == expected else "FAIL"
        if actual == expected:
            passed += 1
        else:
            failed += 1
        print(f"  [{status}] '{query}' -> {actual} (expected {expected})")
    
    print(f"\n  Results: {passed}/{len(test_cases)} passed, {failed} failed\n")
    return failed == 0


def test_mock_answer_with_db_data():
    print("=" * 60)
    print("TEST 6: Mock Answer with DB Data")
    print("=" * 60)
    
    from app.services.gemini import _mock_answer
    
    db_results = {
        "challans": [
            {
                "id": "challan-1",
                "vehicle_plate": "ABC-1234",
                "violation": "Speeding",
                "amount": 5000,
                "status": "Pending",
                "due_date": "2026-09-01",
                "source": "Traffic Police",
            }
        ],
        "payments": [
            {
                "id": "pay-1",
                "type": "Fee",
                "title": "Passport Fee",
                "amount": 3000,
                "status": "Pending",
                "due_date": "2026-08-30",
            }
        ],
    }
    
    user_context = build_db_context_for_mock(db_results)
    
    answer = _mock_answer("What are my challans?", [], lang="en", user_context=user_context)
    # Remove emojis for safe printing
    safe_answer = answer.encode('ascii', 'ignore').decode('ascii')
    print(f"  Challan query answer (first 200 chars):")
    print(f"  {safe_answer[:200]}")
    
    has_challan_info = "ABC-1234" in answer or "challan" in answer.lower()
    print(f"  [{'PASS' if has_challan_info else 'FAIL'}] Answer contains challan information")
    
    answer = _mock_answer("What payments do I have?", [], lang="en", user_context=user_context)
    safe_answer = answer.encode('ascii', 'ignore').decode('ascii')
    print(f"\n  Payment query answer (first 200 chars):")
    print(f"  {safe_answer[:200]}")
    
    has_payment_info = "Passport Fee" in answer or "payment" in answer.lower()
    print(f"  [{'PASS' if has_payment_info else 'FAIL'}] Answer contains payment information")
    
    print()
    return has_challan_info and has_payment_info


def test_anti_hallucination_prompt():
    print("=" * 60)
    print("TEST 7: Anti-Hallucination System Prompt")
    print("=" * 60)
    
    from app.services.gemini import SYSTEM_PROMPT
    
    rules = [
        ("DATABASE results are marked" in SYSTEM_PROMPT, "DATABASE source labeling"),
        ("KNOWLEDGE BASE results are marked" in SYSTEM_PROMPT, "KNOWLEDGE BASE source labeling"),
        ("NEVER contradict" in SYSTEM_PROMPT, "No contradiction rule"),
        ("NEVER invent" in SYSTEM_PROMPT, "No invention rule"),
        ("No records found" in SYSTEM_PROMPT, "No records found handling"),
        ("I don't have enough information" in SYSTEM_PROMPT, "Insufficient info handling"),
        ("NEVER reveal internal system details" in SYSTEM_PROMPT, "No internal details rule"),
    ]
    
    passed = 0
    failed = 0
    for check, desc in rules:
        status = "PASS" if check else "FAIL"
        if check:
            passed += 1
        else:
            failed += 1
        print(f"  [{status}] {desc}")
    
    print(f"\n  Results: {passed}/{len(rules)} passed, {failed} failed\n")
    return failed == 0


def test_full_pipeline():
    print("=" * 60)
    print("TEST 8: Full Pipeline (Chat Orchestrator)")
    print("=" * 60)
    
    from app.services.chat_orchestrator import process_question
    
    db = get_db()
    try:
        from app.models.db_models import User
        user = db.query(User).first()
        if not user:
            print("  [SKIP] No users in database")
            print("  (Register a user first via /api/citizen/register)\n")
            return False
        
        async def run_test():
            return await process_question(
                query="Show my vehicles",
                user_id=user.id,
                db=db,
                lang="en",
            )
        
        result = asyncio.run(run_test())
        
        print(f"  Intent: {result.get('intent', 'UNKNOWN')}")
        print(f"  Grounded: {result.get('grounded', False)}")
        print(f"  Sources: {len(result.get('sources', []))}")
        safe_answer = result.get('answer', '').encode('ascii', 'ignore').decode('ascii')
        print(f"  Answer (first 200 chars): {safe_answer[:200]}")
        
        checks = [
            ("intent" in result, "Has intent"),
            ("answer" in result, "Has answer"),
            ("grounded" in result, "Has grounded flag"),
            ("sources" in result, "Has sources"),
        ]
        
        passed = sum(1 for c, _ in checks if c)
        failed = len(checks) - passed
        
        for check, desc in checks:
            status = "PASS" if check else "FAIL"
            print(f"  [{status}] {desc}")
        
        print(f"\n  Results: {passed}/{len(checks)} passed, {failed} failed\n")
        return failed == 0
    except Exception as e:
        print(f"  [ERROR] {e}\n")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


def main():
    print("\n" + "=" * 60)
    print("RaahAI Database-Grounded RAG - Test Suite")
    print("=" * 60 + "\n")
    
    results = {}
    results["Intent Classification"] = test_intent_classification()
    results["Language Detection"] = test_language_detection()
    results["Database Queries"] = test_db_queries()
    results["Context Builder"] = test_context_builder()
    results["Greeting Detection"] = test_greeting_detection()
    results["Mock Answer with DB Data"] = test_mock_answer_with_db_data()
    results["Anti-Hallucination Prompt"] = test_anti_hallucination_prompt()
    results["Full Pipeline"] = test_full_pipeline()
    
    print("=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    for name, result in results.items():
        status = "PASS" if result else "FAIL"
        print(f"  [{status}] {name}")
    print(f"\n  Total: {passed}/{total} tests passed")
    print("=" * 60 + "\n")
    
    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
