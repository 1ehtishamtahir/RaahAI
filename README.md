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
- **Challan Management** — view, filter, pay traffic challans with friendly IDs (CHL-XXX)
- **Payment Tracking** — fees, taxes, penalties with status tracking
- **Vehicle Management** — registration, token tax status
- **Identity Services** — CNIC, passport, driving license info
- **Family Benefits** — family members, government programs (BISP Ehsaas, etc.)
- **Eligibility Checker** — match users to government programs
- **Fee Calculator** — compute government fees
- **Office Finder** — locate nearby government offices
- **Expiry Alerts** — notifications for expiring documents
- **Gov Updates** — latest government announcements
- **Opportunities** — scholarships & programs finder

## 3. Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Backend | FastAPI |
| DB | PostgreSQL (Supabase, falls back to SQLite for demo) |
| Vector DB | ChromaDB (falls back to in-memory keyword search if not installed) |
| AI | **Google Gemini Flash Lite** (`gemini-flash-lite-latest`, `text-embedding-004`) — primary; Qwen fallback |
| OCR | PaddleOCR / Tesseract (mock fallback) |
| Speech | Whisper (STT) + TTS (gTTS/edge-tts) |
| Auth | JWT (python-jose) + bcrypt password hashing |
| Deploy | Vercel (frontend), Render (backend), Supabase (DB) |

See `Temporary Files/Architecture.md` for system diagrams.

## 4. Project Structure

```
RaahAI/
├── frontend/                   # Next.js App Router
│   ├── app/
│   │   ├── dashboard/          # Main dashboard with service hub
│   │   ├── ai/                 # AI chat interface
│   │   ├── chat/               # Chat sessions
│   │   ├── challans/           # Traffic challan management
│   │   ├── payments/           # Payment tracking
│   │   ├── vehicle/            # Vehicle registration & tax
│   │   ├── identity/           # CNIC, passport, license
│   │   ├── documents/          # Document upload & management
│   │   ├── family/             # Family members & benefits
│   │   ├── eligibility/        # Program eligibility checker
│   │   ├── fees/               # Fee calculator
│   │   ├── offices/            # Government office finder
│   │   ├── alerts/             # Expiry & renewal alerts
│   │   ├── opportunities/      # Scholarships & programs
│   │   ├── updates/            # Government announcements
│   │   ├── ocr/                # OCR form scanner
│   │   ├── voice/              # Voice assistant
│   │   ├── checklist/          # Personalized checklists
│   │   ├── notifications/      # Notification center
│   │   ├── settings/           # User settings
│   │   ├── history/            # Activity history
│   │   ├── saved/              # Saved items
│   │   ├── help/               # Help & support
│   │   ├── login/              # Authentication
│   │   └── register/           # Registration
│   ├── components/
│   │   ├── layout/             # AppShell, Sidebar, TopHeader
│   │   ├── chat/               # ChatWindow, UserMessage, AIMessage, ChatInput
│   │   ├── checklist/          # ChecklistCard, ProgressBar
│   │   ├── services/           # ServiceCard
│   │   └── documents/          # UploadCard, DocumentPreview, OCRField
│   └── styles/globals.css
├── backend/                    # FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/            # 15+ API routers (see API Endpoints below)
│   │   ├── services/           # rag, gemini (primary), qwen (fallback), embeddings, ocr, stt, tts
│   │   ├── models/             # schemas, db models (User, Vehicle, Challan, Payment, etc.)
│   │   └── core/               # config, database, auth
│   ├── scripts/                # seed_chroma.py, ingest.py for ChromaDB
│   ├── data/seed_chunks.json   # 9 curated chunks
│   └── requirements.txt        # includes google-genai + google-generativeai
├── Data for RAG/               # RaahAI_Knowledge_Base.pdf + chunks
├── Logo/
├── Temporary Files/            # PRD, Architecture, Design, Phases (source specs)
├── docs/                       # Consolidated docs (copied from Temporary Files)
├── memory.md                   # Project memory & context
└── docker-compose.yml          # PostgreSQL + ChromaDB + backend + frontend
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
# Full stack (all services):
docker-compose up --build

# Just database services (PostgreSQL + ChromaDB):
docker-compose up -d postgres chroma

# Then run backend & frontend locally
```

## 6. API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/citizen/register` | Register new user |
| `POST` | `/api/citizen/login` | Login & get JWT token |
| `GET` | `/api/citizen/profile` | Get user profile |
| `GET` | `/api/citizen/dashboard` | Dashboard summary |
| `POST` | `/chat` | Chat with RAG (`{query, lang, session_id}`) |
| `GET` | `/api/challans` | List challans (filter by `status`) |
| `GET` | `/api/challans/{id}` | Get challan by CHL-XXX ID |
| `GET` | `/api/payments/timeline` | Payment history & timeline |
| `GET` | `/api/vehicles` | List user vehicles |
| `GET` | `/api/identity` | Identity documents (CNIC, passport) |
| `POST` | `/ocr` | Upload form image/PDF → OCR + explanations |
| `POST` | `/voice` | Audio → STT → RAG → TTS |
| `GET` | `/checklist` | Get checklist for `service`, `situation` |
| `POST` | `/checklist/update` | Update checklist progress |
| `GET` | `/api/ai/challan-explain/{id}` | AI explains a challan in plain language |
| `GET` | `/api/ai/suggestions` | AI-powered action suggestions |
| `GET` | `/api/family/members` | Family members list |
| `GET` | `/api/family/programs` | Government programs for family |
| `GET` | `/api/eligibility/match` | Match user to government programs |
| `GET` | `/api/fees/calculate` | Calculate government fees |
| `GET` | `/api/offices/search` | Find nearby government offices |
| `GET` | `/api/alerts` | Expiry & renewal alerts |
| `GET` | `/api/opportunities` | Scholarships & programs |
| `GET` | `/api/updates` | Government announcements |
| `GET` | `/api/notifications` | User notifications |

## 7. Demo Flow (60s)

1. Register at `/register` or login with demo account:
   - **Email:** `demo2@raahai.com`
   - **Password:** `Demo@1234`
2. Dashboard shows: 2 vehicles, 2 challans, 2 payments, 3 documents, 2 family members
3. Go to **Challans** → see `CHL-006` (Pending, PKR 5,000) and `CHL-007` (Paid)
4. Click **Explain** on a challan → AI explains violation in plain language
5. Go to **AI Chat** → ask: `Passport banwane ke liye kya documents chahiye?`
6. RaahAI replies with Required Documents + Process + `Source: DGIP Official Website`
7. Go to **OCR** → upload passport form image → AI extracts & explains fields
8. Go to **Checklist** → personalized steps auto-update as you complete them

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
