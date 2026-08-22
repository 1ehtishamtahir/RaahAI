"""
Ingest official government documents into ChromaDB.
Usage:
  python scripts/ingest.py --source "../Data for RAG/RaahAI_Knowledge_Base.pdf"
  python scripts/ingest.py --source "../Data for RAG/" --chunk-size 500 --overlap 50
"""
import argparse
import pathlib
import re
import uuid
import sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from app.services.vectorstore import get_collection
from app.services.embeddings import embed_texts
import asyncio

try:
    import fitz  # PyMuPDF
    HAS_FITZ = True
except ImportError:
    HAS_FITZ = False

def extract_text_from_pdf(path: pathlib.Path) -> str:
    if HAS_FITZ:
        doc = fitz.open(str(path))
        return "\n".join([page.get_text() for page in doc])
    # fallback: try pypdf
    try:
        from pypdf import PdfReader
        reader = PdfReader(str(path))
        return "\n".join([p.extract_text() or "" for p in reader.pages])
    except Exception as e:
        raise RuntimeError(f"Install PyMuPDF or pypdf to read PDFs: {e}")

def chunk_text(text: str, size: int = 500, overlap: int = 50) -> list[str]:
    # simple word-based chunking
    words = text.split()
    chunks = []
    step = size - overlap
    for i in range(0, len(words), step):
        chunk = " ".join(words[i:i+size])
        if len(chunk.strip()) > 50:
            chunks.append(chunk.strip())
    return chunks

async def ingest_file(path: pathlib.Path, chunk_size: int, overlap: int):
    text = extract_text_from_pdf(path) if path.suffix.lower() == ".pdf" else path.read_text(encoding="utf-8", errors="ignore")
    chunks = chunk_text(text, size=chunk_size, overlap=overlap)
    print(f"[ingest] {path.name}: {len(chunks)} chunks")
    if not chunks:
        return
    # embed & store
    embeddings = await embed_texts(chunks)
    collection = get_collection()
    ids = [f"{path.stem}-{uuid.uuid4().hex[:8]}-{i}" for i in range(len(chunks))]
    metadatas = [{"source": path.stem, "file": path.name} for _ in chunks]
    collection.add(ids=ids, documents=chunks, metadatas=metadatas, embeddings=embeddings)
    print(f"[ingest] stored {len(chunks)} chunks from {path.name}")

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True, help="PDF file or directory")
    parser.add_argument("--chunk-size", type=int, default=500)
    parser.add_argument("--overlap", type=int, default=50)
    args = parser.parse_args()

    src = pathlib.Path(args.source)
    files = [src] if src.is_file() else list(src.rglob("*.pdf")) + list(src.rglob("*.txt")) + list(src.rglob("*.md"))
    if not files:
        print(f"No files found at {src}")
        return
    for f in files:
        await ingest_file(f, args.chunk_size, args.overlap)
    print("Done.")

if __name__ == "__main__":
    asyncio.run(main())
