"""
Embeddings via Gemini (primary) + Qwen fallback + hash fallback.
"""
try:
    import httpx
    HAS_HTTPX = True
except Exception:
    httpx = None
    HAS_HTTPX = False

HAS_GENAI = False
HAS_NEW_GENAI = False
genai = None
try:
    from google import genai as new_genai
    HAS_NEW_GENAI = True
    HAS_GENAI = True
except Exception:
    try:
        import google.generativeai as genai
        HAS_GENAI = True
    except Exception:
        genai = None
        HAS_GENAI = False

from typing import List
from app.core.config import get_settings

settings = get_settings()

DASHSCOPE_EMBED_URL = "https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding"

def _hash_fallback(texts: List[str], dim: int = 768) -> List[List[float]]:
    import hashlib, random
    vecs = []
    for t in texts:
        h = int(hashlib.md5(t.encode()).hexdigest()[:8], 16)
        random.seed(h)
        vecs.append([random.uniform(-1, 1) for _ in range(dim)])
    return vecs

async def _embed_gemini(texts: List[str]) -> List[List[float]]:
    if not HAS_GENAI or not settings.gemini_api_key:
        return None
    # Try new SDK
    if HAS_NEW_GENAI:
        try:
            client = new_genai.Client(api_key=settings.gemini_api_key)
            out = []
            for t in texts:
                r = client.models.embed_content(model=settings.gemini_embedding_model, contents=t)
                # new SDK returns r.embeddings[0].values
                emb = None
                if hasattr(r, "embeddings") and r.embeddings:
                    emb = r.embeddings[0].values
                elif isinstance(r, dict) and "embedding" in r:
                    emb = r["embedding"]["values"] if isinstance(r["embedding"], dict) else r["embedding"]
                if emb is not None:
                    out.append(list(emb))
                else:
                    raise ValueError(f"unexpected new embed response: {r}")
            return out
        except Exception as e:
            print(f"[embeddings] gemini new SDK failed: {e}, trying legacy")
    # Legacy
    try:
        genai.configure(api_key=settings.gemini_api_key)
        out = []
        for t in texts:
            r = genai.embed_content(model=settings.gemini_embedding_model, content=t, task_type="retrieval_document")
            emb = r.get("embedding") or r.get("embedding", {}).get("values") if isinstance(r, dict) else getattr(r, "embedding", None)
            if isinstance(emb, dict) and "values" in emb:
                emb = emb["values"]
            if emb is None and isinstance(r, dict) and "embedding" in r:
                emb = r["embedding"]
            if isinstance(r, dict) and "embedding" in r and isinstance(r["embedding"], list):
                emb = r["embedding"]
            if hasattr(r, "embedding"):
                emb = r.embedding
                if hasattr(emb, "values"):
                    emb = emb.values
            if emb is None:
                raise ValueError(f"unexpected embed response: {r}")
            out.append(list(emb))
        return out
    except Exception as e:
        print(f"[embeddings] gemini legacy failed: {e}")
        return None

async def embed_texts(texts: List[str]) -> List[List[float]]:
    # 1) Gemini
    gem = await _embed_gemini(texts)
    if gem is not None:
        return gem
    # 2) Qwen DashScope
    if settings.dashscope_api_key and HAS_HTTPX:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    DASHSCOPE_EMBED_URL,
                    headers={"Authorization": f"Bearer {settings.dashscope_api_key}", "Content-Type": "application/json"},
                    json={"model": settings.qwen_embedding_model, "input": {"texts": texts}},
                )
                resp.raise_for_status()
                data = resp.json()
                return [e["embedding"] for e in data["output"]["embeddings"]]
        except Exception as e:
            print(f"[embeddings] dashscope failed {e}, fallback to hash")
    # 3) hash
    return _hash_fallback(texts)

# Backwards compat helper: keep 768-dim default for chroma compat
async def embed_texts_qwen(texts: List[str]) -> List[List[float]]:
    return await embed_texts(texts)

async def embed_query(query: str) -> List[float]:
    vecs = await embed_texts([query])
    return vecs[0]
