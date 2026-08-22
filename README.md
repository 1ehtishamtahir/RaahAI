# RaahAI — Your Smart Guide to Government Services

> **Bano Qabil AI Hackathon 2026** | AI Government Assistant
> Ask in Urdu or English, understand official procedures, upload documents for explanation, and get personalized guidance backed by official information.

![RaahAI](Logo/LOGO.png)

---

## 1. Overview

RaahAI simplifies Pakistani government services (Passport, CNIC, Business Registration in MVP) through an AI-powered assistant. Users chat in Urdu/English, upload government forms for OCR + explanation, use voice input/output, and receive dynamic personalized checklists with citations from trusted sources (NADRA, DGIP, SECP).

**Vision:** Make government services understandable, accessible, and user-friendly for every citizen through AI.

## 2. Core Features

- **AI Government Chat** — RAG-grounded answers via **Gemini (Google)** + ChromaDB (Qwen fallback)
- **Document Explainer** — Plain-language field explanations via Gemini
- **OCR Form Scanner** — PaddleOCR (Tesseract fallback) with confidence flags & masking
- **Voice Assistant** — Whisper STT + TTS (gTTS/edge-tts + Web Speech fallback)
- **Urdu & English** — including RTL Urdu support
- **Personalized Checklist** — adapts to service type + user situation
- **Citations** — every answer shows its official source

## 3. Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Backend | FastAPI |
| DB | PostgreSQL (Supabase, falls back to SQLite for demo) |
| Vector DB | ChromaDB (falls back to in-memory keyword search if not installed) |
| AI | **Google Gemini 1.5 Flash** (`gemini-1.5-flash`, `text-embedding-004`) — primary; Qwen fallback |
| OCR | PaddleOCR / Tesseract (mock fallback) |
| Speech | Whisper (STT) + TTS (gTTS/edge-tts) |
| Deploy | Vercel (frontend), Render (backend), Supabase (DB) |

See `Temporary Files/Architecture.md` for system diagrams.

## 4. Project Structure

```
RaahAI/
├── frontend/               # Next.js App Router
│   ├── app/
│   │   ├── dashboard/
│   │   ├── chat/
│   │   ├── documents/
│   │   ├── ocr/
│   │   ├── voice/
│   │   ├── checklist/
│   │   └── ...
│   ├── components/
│   │   ├── layout/         # AppShell, Sidebar, TopHeader
│   │   ├── chat/           # ChatWindow, UserMessage, AIMessage, ChatInput
│   │   ├── checklist/      # ChecklistCard, ProgressBar
│   │   ├── services/       # ServiceCard
│   │   └── documents/      # UploadCard, DocumentPreview, OCRField
│   └── styles/globals.css
├── backend/                # FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/        # chat, ocr, voice, checklist
│   │   ├── services/       # rag, gemini (primary), qwen (fallback), embeddings, ocr, stt, tts
│   │   ├── models/         # schemas, db models
│   │   └── core/           # config, database
│   ├── scripts/            # seed_chroma.py, ingest.py for ChromaDB
│   ├── data/seed_chunks.json  # 9 curated chunks
│   └── requirements.txt  # includes google-genai + google-generativeai
├── Data for RAG/           # RaahAI_Knowledge_Base.pdf + chunks
├── Logo/
├── Temporary Files/        # PRD, Architecture, Design, Phases (source specs)
├── docs/                   # Consolidated docs (copied from Temporary Files)
├── memory.md               # Project memory & context
└── docker-compose.yml
```

## 5. Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL (or Supabase URL) — optional, falls back to SQLite
- **Gemini API key** — free from https://aistudio.google.com/app/apikey (or leave empty for mock demo)

### Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
pip install -r requirements.txt  # if paddlepaddle/chroma fails, backend auto-falls back to mocks
cp .env.example .env  # fill GEMINI_API_KEY, DATABASE_URL, CHROMA_PATH
# Get Gemini key: https://aistudio.google.com/app/apikey -> GEMINI_API_KEY=AIza...
uvicorn app.main:app --reload --port 8000
# health check: http://localhost:8000/health
# docs: http://localhost:8000/docs
```

Ingest knowledge base (offline, no API key needed):

```bash
python scripts/seed_chroma.py  # 9 demo chunks, hash embeddings
# OR full PDF:
python scripts/ingest.py --source "../Data for RAG/RaahAI_Knowledge_Base.pdf"
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev  # http://localhost:3000
```

### Docker (optional)

```bash
docker-compose up --build
```

## 6. API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/chat` | Chat with RAG (`{query, lang, session_id}`) |
| `POST` | `/ocr` | Upload form image/PDF → extracted fields + explanations |
| `POST` | `/voice` | Audio → STT → RAG → TTS |
| `GET` | `/checklist` | Get checklist for `service`, `situation` |
| `POST` | `/checklist/update` | Update checklist progress |

## 7. Demo Flow (60s)

1. Ask: `Passport banwane ke liye kya documents chahiye?` (Urdu)
2. RaahAI replies with Required Documents + Process + `Source: DGIP Official Website`
3. Upload passport form image → OCR extracts `Name, CNIC, DOB, Address`
4. RaahAI explains each field in plain language (masked CNIC: `XXXXX-1234567-X`)
5. Right panel checklist auto-updates: `3/5 Completed` → `In Progress`

See `Temporary Files/RaahAI_Phases.md` for full phase plan.

## 8. Design System

- **Colors:** Raah Green `#087F3E`, Deep Green `#075C2D`, Mint `#EAF7EE`, Soft Mint `#F3FAF5`
- **Font:** Inter + Noto Sans + Noto Sans Arabic, RTL support for Urdu
- **Layout:** Sidebar (308px) + Chat (flex) + Right Panel (390–420px) on desktop; bottom nav on mobile
- See `Temporary Files/Dessign.md` (34 sections) for complete UI spec.

## 9. Security & Privacy

- CNIC & sensitive fields **masked in UI**, **not persisted** beyond session
- Low-confidence OCR fields flagged for manual confirmation
- RAG grounding guardrail: if no ChromaDB match → `I don't have verified information on this` (no hallucination)

## 10. Deployment

- **Frontend:** Vercel (`frontend/`)
- **Backend:** Render (`backend/` — exposes `PORT`)
- **DB:** Supabase (set `DATABASE_URL`)

---

Built for Bano Qabil Hackathon 2026. See `memory.md` for persistent project memory.
