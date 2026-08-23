# memory.md — RaahAI Project Memory

> Persistent context for RaahAI. This file is the single source of truth for what has been read, decided, and scaffolded. Keep it updated after every major change.

**Last Updated:** 2026-08-23 (v4.0 — 7 new features)
**Workspace:** `D:\1-Projects\RaahAI - Bano Qabil Hackathon\RaahAI`
**Hackathon:** Bano Qabil AI Hackathon 2026
**Version:** 4.0 (15 features, 68/68 tests pass, pushed to GitHub)

---

## 1. Project Identity

- **Name:** RaahAI
- **Tagline:** Your Smart Guide to Government Services
- **One-liner:** AI-powered Government Assistant for Pakistani citizens to understand procedures, scan forms via OCR, use voice, and get personalized checklists with citations from official sources.
- **Logo:** `Logo/LOGO.png` → copied to `frontend/public/logo.png`
- **Languages:** Urdu (including Roman Urdu), English, RTL Urdu support via `LangContext`.

## 2. Source Specs (read from `Temporary Files/`)

All specs were copied to `docs/` for permanence:

| File | Original | Copied To | Lines | Summary |
|------|----------|-----------|-------|---------|
| PRD | `Temporary Files/PRD_RaahAI.md` | `docs/PRD_RaahAI.md` | 86 | Vision, problem, core features, MVP scope (Passport, CNIC, Business Registration), tech stack, success metrics, demo flow, future. |
| Architecture | `Temporary Files/Architecture.md` | `docs/Architecture.md` | 210 | Mermaid diagrams for high-level, chat RAG, OCR, voice flows; component breakdown; security notes; scalability. |
| Design | `Temporary Files/Dessign.md` *(typo preserved)* | `docs/Design.md` | 915 | 34 sections: civic-tech aesthetic, 3-zone desktop layout, color/typography, sidebar/header/chat/right-panel specs, OCR/voice flows, RTL, breakpoints, component list, structure. |
| Phases | `Temporary Files/RaahAI_Phases.md` | `docs/Phases.md` | 127 | Phase 0 setup → Phase 1 chat+RAG → Phase 2 OCR → Phase 3 checklist → Phase 4 voice → Phase 5 polish → Phase 6 rehearsal + future phases. |

**Data source:** `Data for RAG/RaahAI_Knowledge_Base.pdf` + `backend/data/seed_chunks.json` (9 curated chunks for offline demo).

## 3. MVP Scope (must-have for demo)

- Services: **Passport** (new/renewal), **CNIC** (new/renewal/modification), **Business Registration** (SECP)
- Features: Chat with RAG + citations, OCR upload → field explanation → masking, dynamic checklist, bilingual, voice
- Success: <3s chat response, 85%+ OCR accuracy, citations shown, end-to-end demo works.

## 4. Tech Stack (Gemini migration 2026-08-22)

- **Frontend:** Next.js 14 (App Router) + React + Tailwind CSS — `npm install` done, `tsc --noEmit` 0 errors, `frontend/.env.local` set, live http://localhost:3001
- **Backend:** FastAPI — `backend/.env` set, `Base.metadata.create_all` on boot, live http://localhost:8000
- **DB:** PostgreSQL (Supabase in prod, falls back to `sqlite:///./raahai.db` if psycopg2 missing)
- **Vector:** ChromaDB (persistent at `backend/chroma_db/`, falls back to in-memory keyword search if C++ build tools missing)
- **AI:** **Google Gemini 1.5 Flash** (`gemini-1.5-flash`, `text-embedding-004`) — primary via `google-generativeai` 0.8.3 / `google-genai` 0.8.0; Qwen (`qwen-plus`) kept as fallback; high-quality structured mock if `GEMINI_API_KEY` missing (`gemini.py:54`)
- **OCR:** PaddleOCR primary, Tesseract fallback; OpenCV preprocessing (deskew/contrast), confidence <0.6 → needs_confirmation, CNIC masked `XXXXX-XXXXXXX-X`
- **Speech:** Whisper (STT) + gTTS/edge-tts (backend `voice.py:18`) + frontend Web Speech API fallback (`voice/page.tsx`)
- **Deploy:** Vercel (frontend), Render (backend), Supabase (postgres)

## 5. Architecture Decisions & Grounding

- **RAG pipeline:** `query → embed (Gemini `text-embedding-004` → hash fallback) → Chroma/in-memory similarity (top-k 4) → Gemini `gemini-1.5-flash` generation with context + system prompt → answer + citations`. If no chunk passes threshold, **grounding guardrail** returns explicit refusal in user's language (no hallucination). Previous Qwen logic preserved in `qwen.py` as fallback.
- **Offline ingestion:** `scripts/ingest.py` (chunk 500, overlap 50, PyMuPDF/pypdf) + `scripts/seed_chroma.py` (hash embeddings, offline, uses `backend/data/seed_chunks.json`) — both work with Gemini embeddings when `GEMINI_API_KEY` set
- **Security:** Sensitive fields not persisted beyond session; UI masking; PostgreSQL stores only session metadata / checklist state, not raw images/CNIC numbers; file validation (MIME + size 10MB).
- **Design mapping:** Colors `Raah Green #087F3E`, Deep `#075C2D`, Mint `#EAF7EE`, Soft Mint `#F3FAF5`, Success `#159447`, neutrals `#17201B/#66716B/#98A29C/#E3E9E5/#FBFDFC`; fonts Inter + Noto Sans + Noto Sans Arabic; radii 16–20px; sidebar 308px, right panel 390–420px.

## 6. What Was Scaffolded (v4.0 — 100%)

### Root
- `README.md`, `.gitignore`, `docker-compose.yml`, `docs/` (4 specs), `memory.md`

### Backend (`backend/`)
- `requirements.txt` (+ gtts, edge-tts, pypdf, pymupdf, `google-generativeai==0.8.3`, `google-genai==0.8.0`), `.env.example`, `.env`, `Dockerfile`, `alembic.ini`
- `app/core/config.py` — pydantic-settings cached (now `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_EMBEDDING_MODEL` + legacy Qwen)
- `app/core/database.py` + `app/models/db_models.py` — Session, ChatHistory, ChecklistState (fallback to sqlite)
- `app/models/schemas.py` — all schemas (Chat, OCR, Checklist, Voice, Fees, Eligibility, Feedback, Alerts)
- `app/services/gemini.py` — **primary** (new + legacy SDK, structured mock, `call_gemini()`), `qwen.py` kept as fallback (`call_qwen` legacy)
- `app/services/embeddings.py` — **Gemini primary** (`text-embedding-004` via `genai.embed_content`) + Qwen fallback + hash fallback (768-dim)
- `app/services/vectorstore.py` — PersistentClient with in-memory keyword fallback (no C++ tools)
- `app/services/rag.py` — `rag_answer()` with Roman Urdu detection, greeting/thanks handling, grounding guardrails
- `app/services/ocr.py` — preprocess + heuristic labeling (cv2 optional, mock fallback) + `explain_fields` now via Gemini + Smart Document Matcher
- `app/services/checklist.py` — TEMPLATES
- `app/services/voice.py` — Whisper + gTTS + edge-tts + empty fallback
- `app/routers/chat.py` (`POST /chat`), `ocr_router.py` (`POST /ocr` + `POST /ocr/ask`), `voice.py` (`POST /voice`), `checklist.py` (`GET /checklist` + `POST /checklist/update`)
- `app/routers/fees.py` (`POST /fees` + `GET /fees/all`) — passport/CNIC/business × normal/urgent/executive
- `app/routers/eligibility.py` (`POST /eligibility`) — age-based service eligibility with docs + steps
- `app/routers/feedback.py` (`POST /feedback` + `GET /feedback/stats`) — thumbs up/down with stats
- `app/routers/offices.py` (`GET /offices` + `GET /offices/cities` + `GET /offices/{id}`) — 12 offices across 6 cities
- `app/routers/alerts.py` (`GET /alerts` + `POST /alerts` + `DELETE /alerts/{id}`) — document expiry tracker
- `app/main.py` — CORS (3000,3001), `Base.metadata.create_all`, `/health`, all 10 routers
- `data/seed_chunks.json` — 9 chunks (passport×3, cnic×3, business×2, privacy×1)
- `scripts/ingest.py`, `scripts/seed_chroma.py`, `scripts/seed_checklist.py`

### Frontend (`frontend/`)
- `package.json`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json` (paths `@/*`), `next.config.mjs`, `.env.example`, `.env.local`, `Dockerfile`
- `styles/globals.css` + `lib/utils.ts`, `lib/api.ts` (12 API functions), `lib/i18n.ts` (expanded en/ur), `lib/LangContext.tsx` (localStorage + `dir` toggle)
- `components/layout/AppShell.tsx` (useLang), `Sidebar.tsx` (useLang, **14 nav items** with Urdu translations, language pills), `TopHeader.tsx` (useLang)
- `components/chat/ChatWindow.tsx` (useLang, history localStorage, staged loading, quick-prompt chips), `UserMessage.tsx`, `AIMessage.tsx` (**feedback buttons** with API persistence), `SourceBadge.tsx`, `ChatInput.tsx`
- `components/checklist/ChecklistCard.tsx`, `ChecklistItem.tsx`, `ProgressBar.tsx`
- `components/services/ServiceCard.tsx`
- `components/documents/UploadCard.tsx` (onComplete callback for OCR page integration)
- `components/ui/Skeleton.tsx`, `components/ui/ErrorState.tsx`
- `app/layout.tsx` (LangProvider), `app/page.tsx` (rightPanel), `app/ocr/page.tsx` (**service detection + follow-up questions**), `app/voice/page.tsx`, `app/checklist/page.tsx`, `app/documents/page.tsx`, `app/history/page.tsx`, `app/saved/page.tsx`, `app/notifications/page.tsx`, `app/settings/page.tsx`, `app/help/page.tsx`, `app/services/page.tsx`
- `app/fees/page.tsx` — Fee Calculator with service/urgency selection + breakdown
- `app/eligibility/page.tsx` — Age-based eligibility check with expandable results
- `app/offices/page.tsx` — Filterable office directory (city + type)
- `app/alerts/page.tsx` — Document expiry tracker with add/delete + renewal links
- Verified: `npx tsc --noEmit` exit 0, `python -m py_compile` all 23 py OK, `frontend/public/logo.png` copied

## 7. API Contract (backend ↔ frontend)

| Endpoint | Method | Payload | Returns |
|----------|--------|---------|---------|
| `/health` | GET | — | `{status, service, version}` |
| `/chat` | POST | `{query, lang, session_id?, service?}` | `{answer, citations[], grounded, session_id}` |
| `/ocr` | POST (multipart) | `file, lang` | `{fields[{label,value,confidence,needs_confirmation,explanation}], raw_text, masked_fields, matched_service}` |
| `/ocr/ask` | POST (multipart) | `field_label, field_value, question, lang` | `{answer, field, value}` |
| `/voice` | POST (multipart) | `audio, lang` | `{transcript, answer, citations[], audio_url?}` |
| `/checklist` | GET | `?service&situation&completed=comma&session_id` | `{service,situation,items[], progress, completed_count, total_count}` |
| `/checklist/update` | POST | `{service,situation,checked_ids[]}` + `?session_id` | same |
| `/fees` | POST | `{service, urgency, pages?}` | `{service, service_name_en, service_name_ur, urgency, government_fee, bank_charges, total, currency, payment_method, processing_time, notes[], valid_upto}` |
| `/fees/all` | GET | — | `[{service, service_name_en, service_name_ur, urgency, government_fee, bank_charges, total, processing_time}]` |
| `/eligibility` | POST | `{age, is_pakistani?, has_cnic?}` | `[{service, name_en, name_ur, eligible, reasons[], required_documents[], steps[], fee_normal, fee_urgent}]` |
| `/feedback` | POST | `{message_id, rating, comment?, session_id?}` | `{status, message}` |
| `/feedback/stats` | GET | — | `{total, up, down, percentage}` |
| `/offices` | GET | `?city=&type=` | `[{id, name_en, name_ur, type, city, address, phone, hours, lat, lng}]` |
| `/offices/cities` | GET | — | `["Faisalabad", "Islamabad", ...]` |
| `/offices/{id}` | GET | — | `{id, name_en, name_ur, type, city, address, phone, hours, lat, lng}` |
| `/alerts` | GET | — | `[{id, document_type, document_name_en, document_name_ur, holder_name, cnic, issue_date, expiry_date, days_until_expiry, status, renewal_url, notes[]}]` |
| `/alerts` | POST | `{document_type, holder_name, cnic, issue_date, expiry_date}` | same as GET item |
| `/alerts/{id}` | DELETE | — | `{status: "ok"}` |

CORS origins from `CORS_ORIGINS` env (default `http://localhost:3000,http://localhost:3001`).

## 8. Key Design Tokens (for frontend dev)

- **Palette** — see §4; use `tailwind.config.ts` `raah.*` and `text.*`.
- **Layout** — desktop: Sidebar 308px | Main flex | Right 410px; tablet: hide right panel; mobile: header + chat + bottom nav (Chat|Scan|Voice|More).
- **Typography** — page 24–28/700, section 18–20/650, card 16–18/600, body 14–16/400.
- **UX principles** — answers scannable with headings Required Documents / Process / Fees / Eligibility / Important Notes / Source; every answer has Source pill; checklist shows `In Progress` + progress bar; voice is minimal (◉ Listening...); OCR flow Upload→Detection→Extraction→Recognition→Explanation→Checklist; input fixed bottom with safety notice.

## 9. Phases Status (v4.0 — 100%)

- [x] **Phase 0 Setup** — repo structure, Next.js + FastAPI skeletons, DB config, chroma wrapper, Qwen stub verified.
- [x] **Phase 1 Chat+RAG** — `seed_chunks.json` + `seed_chroma.py` (offline hash embeddings), structured mock in `qwen.py:29` (service-aware, Urdu/English), `tsc` 0 errors, `chatApi` wired.
- [x] **Phase 2 OCR** — `ocr.py` + `ocr_router.py` (validation, PDF→PNG), `UploadCard.tsx` staged loading + masked CNIC + Try Again + privacy note.
- [x] **Phase 3 Checklist** — TEMPLATES + `checklist.py` router with DB persistence (`session_id` → `checklist_states`), `ChecklistCard.tsx` loading/error + `localStorage` ready.
- [x] **Phase 4 Voice** — `voice.py` (whisper→gTTS→edge-tts→fallback), `voice/page.tsx` (MediaRecorder→voiceApi, useLang, speechSynthesis lang), `TopHeader` Voice Mode i18n.
- [x] **Phase 5 Polish** — `Skeleton.tsx`, `ErrorState.tsx`, staged Loadings (`searchOfficial`, `preparing`, `readingDoc`, `understanding`), error Try Again, history/saved/notifications/settings/help/services pages, RTL via `LangContext` (`document.dir`), responsive.
- [x] **Phase 6 Rehearsal** — demo script: `Passport banwane ke liye kya documents chahiye?` → structured answer + Source: DGIP → Upload form → OCR masked → checklist 3/5 → voice. Judge Q&A prepared (privacy, accuracy, sources) in `settings` + `help`.
- [x] **Phase 7 New Features (v4.0)** — Fee Calculator, Eligibility Checker, Regional Offices, Document Expiry Alerts, Feedback System, Roman Urdu Detection, Smart Document Matcher, OCR Follow-up Questions. 68/68 tests pass. Pushed to GitHub.

## 10. Environment & Runbook

```bash
# Backend
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt  # chroma/paddle may fail without C++ tools — backend auto-falls back
cp .env.example .env  # fill GEMINI_API_KEY (https://aistudio.google.com/app/apikey) — optional, mock works
# GEMINI_API_KEY=AIza...  GEMINI_MODEL=gemini-1.5-flash  GEMINI_EMBEDDING_MODEL=models/text-embedding-004
uvicorn app.main:app --reload --port 8000  # http://localhost:8000/docs, /health
# Demo without real models still works: "[DEMO — set GEMINI_API_KEY for live Gemini]" mock

# Chroma seed (offline, no key needed — hash fallback)
python scripts/seed_chroma.py
# OR full PDF ingest (needs PyMuPDF/pypdf, uses Gemini embeddings if key set)
python scripts/ingest.py --source "../Data for RAG/RaahAI_Knowledge_Base.pdf"

# Frontend
cd frontend
npm install  # already done, tsc 0 errors
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev  # http://localhost:3001 (3000 fallback)
# verify
npx tsc --noEmit  # 0 errors
curl http://localhost:8000/health
curl -X POST http://localhost:8000/chat -H "Content-Type: application/json" -d '{"query":"What documents for passport?","lang":"en"}'
```

**Required env:** `GEMINI_API_KEY` (optional, mock shows `[DEMO — set GEMINI_API_KEY for live Gemini]`), `DASHSCOPE_API_KEY` (legacy fallback), `DATABASE_URL`, `CHROMA_PATH`, `NEXT_PUBLIC_API_URL`.

## 11. Next Actions (post-v4.0, optional)

1. **Deploy** — Vercel `frontend/`, Render `backend/`, Supabase `DATABASE_URL`, set `CORS_ORIGINS` + `GEMINI_API_KEY` env on Render.
2. **Demo video** — 30-60 sec screen recording showing: chat → OCR → checklist → fees → eligibility → offices → Urdu → dark mode.
3. **README polish** — Add screenshots/GIFs, architecture diagram, live demo link.
4. **Submit** — Upload to Bano Qabil portal with all required fields.

## 12. Decisions Log

- Kept `Temporary Files/` intact (source of truth) + mirrored to `docs/` (normalized Design name) per user request to preserve originals.
- Chose hash-based dummy embeddings for local dev without API key to keep RAG testable; added `seed_chroma.py` for one-command offline seeding.
- Used `lucide-react` icons mapping to design's ●▣⌗♩ glyphs for clean civic-tech look.
- Frontend uses `AppShell` composition with `rightPanel` prop to achieve 3-zone layout without prop drilling.
- OCR router named `ocr_router.py` (not `ocr.py`) to avoid clash with `services/ocr.py`.
- Voice route returns `data:audio/mp3;base64` so frontend can play without extra endpoint; frontend also uses `speechSynthesis` with `ur-PK`/`en-US` voices as fallback.
- Added `LangContext` with `localStorage` + `document.dir` for global Urdu RTL instead of per-component state.
- Created missing 6 pages to complete 11 MVP screens per `Dessign.md:863`.
- Verified `tsc --noEmit` 0 and `py_compile` all OK before marking 100%.
- **2026-08-22 Gemini migration:** Replaced Qwen (`qwen-plus`, `dashscope`) with Gemini (`gemini-1.5-flash`, `text-embedding-004`) as primary per user request. Kept `qwen.py` as fallback, created `gemini.py` handling both `google.genai` new + `google.generativeai` legacy SDKs, updated `embeddings.py` to try Gemini→Qwen→hash, `rag.py` to call `gemini.call_gemini`, `ocr_router.py` to use Gemini `explain_fields`, `config.py` + `.env` + `requirements.txt` + `README.md` updated. Backend verified: `POST /chat` now returns `[DEMO - set GEMINI_API_KEY for live Gemini]` instead of Qwen, both live on 3001/8000.
- **2026-08-23 v4.0 features:** Added 7 new features (Fee Calculator, Eligibility Checker, Regional Offices, Document Expiry Alerts, Feedback System, Roman Urdu Detection, Smart Document Matcher + OCR Follow-up). All in-memory for demo speed. Backend: 5 new routers (fees, eligibility, feedback, offices, alerts) + updated rag.py + ocr_router.py. Frontend: 4 new pages (fees, eligibility, offices, alerts) + enhanced AIMessage + OCR page + Sidebar (14 nav items). 68/68 tests pass. Roman Urdu auto-detection works (`passport kaise banwana` → translated → answered in Urdu). Pushed to GitHub.

## 13. Contacts & Links

- **Team:** Ehtisham Tahir (Free Plan) — profile in Sidebar mock.
- **Specs:** See `docs/` + originals in `Temporary Files/`.
- **Issues/feedback:** https://github.com/anomalyco/opencode (per developer instructions).

---

### How to update this file
After each phase, append: date, what changed, why, and mark Phase checklist. This file is read by AI at session start to restore context.
