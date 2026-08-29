"""Quick test of 10-LLM pipeline with 3 providers."""
import sys, os, asyncio, time
from dotenv import load_dotenv
load_dotenv()
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "."))

from app.core.database import get_db, engine, Base
from app.services.llm_10_pipeline import run_10llm_pipeline

async def main():
    print("=" * 60)
    print("10-LLM PIPELINE TEST (Cerebras + Groq + Gemini)")
    print("=" * 60)

    Base.metadata.create_all(bind=engine)
    db = next(get_db())

    from app.models.db_models import User
    demo = db.query(User).filter(User.email == "demo@raahai.com").first()
    if not demo:
        from seed_test_data import seed
        seed()
        demo = db.query(User).filter(User.email == "demo@raahai.com").first()
    print(f"User: {demo.id}\n")

    tests = [
        ("Hello", "Greeting"),
        ("Show me my vehicles", "DB - Vehicles"),
        ("My challans", "DB - Challans"),
        ("How to renew passport?", "RAG - Passport"),
        ("What is my CNIC and how to renew it?", "Hybrid"),
    ]

    for query, label in tests:
        print(f"--- {label}: {query}")
        t0 = time.time()
        result = await run_10llm_pipeline(query, demo.id, db, "en")
        elapsed = time.time() - t0
        d = result.get("debug", {})
        answer_preview = result["answer"][:200].replace("\n", " ").encode("ascii", "replace").decode()
        print(f"  Time: {elapsed:.1f}s | Intent: {result['intent']} | Grounded: {result['grounded']} | Sources: {len(result['sources'])}")
        print(f"  LLM1: {d.get('llm1','?')} | LLM2+3: {d.get('llm2+3','?')} | LLM4: {d.get('llm4','?')} | LLM5: {d.get('llm5','?')} | LLM6+7+9: {d.get('llm6+7+9','?')} | LLM8+10: {d.get('llm8+10','?')}")
        print(f"  Answer: {answer_preview}...")
        print()

if __name__ == "__main__":
    asyncio.run(main())
