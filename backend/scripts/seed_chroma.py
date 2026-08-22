"""Seed ChromaDB with demo chunks from data/seed_chunks.json without needing DashScope key.
Uses hash-based embeddings (same as embeddings.py fallback) so demo works offline.
"""
import pathlib, json, sys, asyncio
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from app.services.vectorstore import get_collection
from app.services.embeddings import embed_texts

async def main():
    seed_path = pathlib.Path(__file__).resolve().parents[1] / "data" / "seed_chunks.json"
    data = json.loads(seed_path.read_text(encoding="utf-8"))
    print(f"[seed] loading {len(data)} chunks from {seed_path}")
    texts = [d["text"] for d in data]
    ids = [d["id"] for d in data]
    metas = [{"source": d["source"], "service": d["service"]} for d in data]

    col = get_collection()
    # clear old if exists
    try:
        existing = col.get(ids=ids)
        if existing["ids"]:
            col.delete(ids=existing["ids"])
            print(f"[seed] deleted {len(existing['ids'])} old ids")
    except Exception as e:
        print(f"[seed] delete skip: {e}")

    embs = await embed_texts(texts)
    print(f"[seed] embeddings dim={len(embs[0])}")
    col.add(ids=ids, documents=texts, metadatas=metas, embeddings=embs)
    print(f"[seed] added {len(ids)} chunks. count={col.count()}")

if __name__ == "__main__":
    asyncio.run(main())
