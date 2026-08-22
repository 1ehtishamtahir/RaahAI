from typing import List, Dict
from app.core.config import get_settings
from app.services.embeddings import embed_query, embed_texts

settings = get_settings()

# Try chromadb, fallback to in-memory JSON store if not available (no C++ build tools)
try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings
    HAS_CHROMA = True
except Exception as e:
    print(f"[vectorstore] chromadb not available ({e}), using in-memory fallback")
    chromadb = None
    ChromaSettings = None
    HAS_CHROMA = False

_client = None
_collection = None

# Fallback: load seed chunks into memory for keyword search
_FALLBACK_DOCS = None

def _load_fallback_docs():
    global _FALLBACK_DOCS
    if _FALLBACK_DOCS is not None:
        return _FALLBACK_DOCS
    try:
        import json, pathlib
        p = pathlib.Path(__file__).resolve().parents[1].parent / "data" / "seed_chunks.json"
        if p.exists():
            _FALLBACK_DOCS = json.loads(p.read_text(encoding="utf-8"))
            print(f"[vectorstore] loaded {_FALLBACK_DOCS.__len__()} fallback docs from {p}")
        else:
            _FALLBACK_DOCS = []
    except Exception as ex:
        print(f"[vectorstore] fallback load failed: {ex}")
        _FALLBACK_DOCS = []
    return _FALLBACK_DOCS

def get_chroma_client():
    if not HAS_CHROMA:
        return None
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(path=settings.chroma_path, settings=ChromaSettings(anonymized_telemetry=False))
    return _client

def get_collection():
    if not HAS_CHROMA:
        return None
    global _collection
    if _collection is None:
        client = get_chroma_client()
        _collection = client.get_or_create_collection(name=settings.chroma_collection, metadata={"hnsw:space": "cosine"})
    return _collection

async def search(query: str, top_k: int = 4, threshold: float = 0.35) -> List[Dict]:
    """Embed query, search Chroma (or fallback keyword match), return dicts {text, source, distance}."""
    if HAS_CHROMA:
        try:
            collection = get_collection()
            q_emb = await embed_query(query)
            res = collection.query(query_embeddings=[q_emb], n_results=top_k, include=["documents", "metadatas", "distances"])
            docs = res.get("documents", [[]])[0]
            metas = res.get("metadatas", [[]])[0]
            dists = res.get("distances", [[]])[0]
            out = []
            for doc, meta, dist in zip(docs, metas, dists):
                if dist is not None and dist > (1 - threshold):
                    continue
                out.append({"text": doc, "source": meta.get("source", "Official"), "distance": dist, "metadata": meta})
            if out:
                return out
            # fall through to keyword fallback if chroma empty
        except Exception as e:
            print(f"[vectorstore] chroma search failed: {e}, falling back to keyword")

    # Fallback: strict keyword overlap with word boundaries
    docs = _load_fallback_docs()
    if not docs:
        return []
    import re
    q_low = query.lower()
    # Domain keywords — includes English + Urdu script (for RTL queries) + common paraphrases
    DOMAIN_KEYWORDS = {
        "passport", "cnic", "card", "business", "secp", "nadra", "dgip", "document", "b-form", "bform", "crc", "fee", "registration", "renew", "renewal", "new", "modification", "correction", "lost", "photo", "photograph", "picture", "form", "apply", "application", "online", "appointment", "center", "centre", "office", "token", "tracking", "status", "delivery", "urgent", "normal", "executive", "days", "bank", "national", "biometric", "verification", "address", "name", "parent", "guardian", "company", "incorporation", "certificate", "challan", "memorandum", "articles", "license", "tax", "process", "procedure", "required", "situation",
        "پاسپورٹ", "شناختی", "کارڈ", "کاروبار", "فیس", "دستاویز", "دستاویزات", "مطلوبہ", "طریقہ", "عمل", "رجسٹریشن", "تجديد", "نیا", "گم", "تصویر", "فارم", "درخواست", "آن", "لائن", "اپائنٹمنٹ", "مرکز", "دفتر", "ترسیل", "نام", "پتہ", "درستگی"
    }
    GREETING_WORDS = {"hello", "hi", "salam", "assalam", "walaikum", "thanks", "thank", "shukriya", "bye", "good", "السلام", "وعلیکم", "شکریہ"}
    q_tokens = re.findall(r"\b\w+\b", q_low, flags=re.UNICODE)
    # Small-talk is handled in rag.py directly (returns greeting), but for search we still return [] to avoid false grounding
    if any(w in GREETING_WORDS for w in q_tokens) and len(q_tokens) <= 5:
        # Let rag decide if pure greeting vs document query with greeting prefix
        if not any(w in DOMAIN_KEYWORDS for w in q_tokens):
            return []
    has_domain = any(w in DOMAIN_KEYWORDS for w in q_tokens) or any(s in q_low for s in ["passport", "cnic", "secp", "پاسپورٹ", "شناختی"])
    if not has_domain:
        # Out-of-domain like "purchase car" -> no relevant docs
        return []
    # Urdu service mapping for cross-language retrieval
    URDU_SERVICE_MAP = {
        "پاسپورٹ": "passport",
        "شناختی": "cnic",
        "کارڈ": "cnic",
        "کاروبار": "business_registration",
        "کاروباری": "business_registration",
    }
    detected_urdu_service = None
    for ur_word, svc in URDU_SERVICE_MAP.items():
        if ur_word in query:
            detected_urdu_service = svc
            break
    scored = []
    for d in docs:
        text_low = d["text"].lower()
        text_tokens = set(re.findall(r"\b\w+\b", text_low))
        q_words = [w for w in q_tokens if len(w) > 2]
        score = 0
        for w in q_words:
            if w in text_tokens:
                score += 1
            elif len(w) > 4 and w in text_low:
                # lenient for photo->photographs, renew->renewal etc.
                score += 0.7
            elif w in {"passport", "cnic", "secp"} and w in text_low:
                score += 1
        # also boost if service keyword matches exactly (English or Urdu)
        if d.get("service") and d.get("service") in q_low:
            score += 3
        if detected_urdu_service and d.get("service") == detected_urdu_service:
            score += 3
        if score > 0.5:
            scored.append((score, d))
    # Require meaningful overlap: at least 1 (or 2 if no service boost)
    scored = [s for s in scored if s[0] >= 1]
    scored.sort(key=lambda x: x[0], reverse=True)
    out = []
    seen = set()
    for score, d in scored[:top_k]:
        key = d["source"]
        if key in seen:
            continue
        seen.add(key)
        out.append({"text": d["text"], "source": d["source"], "distance": 0.1, "metadata": {"service": d.get("service")}})
    # No generic fallback — return empty if nothing matched (proper grounding)
    return out

async def add_documents(chunks: List[str], metadatas: List[Dict], ids: List[str]):
    if not HAS_CHROMA:
        print("[vectorstore] add_documents skipped (no chroma) — using fallback store")
        return
    collection = get_collection()
    embeddings = await embed_texts(chunks)
    collection.add(documents=chunks, metadatas=metadatas, ids=ids, embeddings=embeddings)
