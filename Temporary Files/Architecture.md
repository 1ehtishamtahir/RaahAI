# RaahAI — Architecture

This document describes the technical architecture of RaahAI in detail: system components, data flow, and how each piece connects.

---

## 1. High-Level System Architecture

```mermaid
flowchart TB
    subgraph Client["🖥️ Client Layer"]
        UI["Next.js + React + Tailwind CSS<br/>Web App (Urdu/English UI)"]
    end

    subgraph Gateway["🚪 API Layer"]
        API["FastAPI Backend<br/>REST Endpoints"]
    end

    subgraph AI["🤖 AI Processing Layer"]
        LLM["Qwen (Alibaba Cloud)<br/>Language Understanding & Generation"]
        EMB["Qwen Embeddings"]
        OCR["PaddleOCR / Tesseract<br/>Form Field Extraction"]
        STT["Whisper<br/>Speech-to-Text"]
        TTS["TTS Engine<br/>Text-to-Speech"]
        RAG["RAG Pipeline<br/>Retrieval + Grounding + Citation"]
    end

    subgraph Data["💾 Data Layer"]
        PG[("PostgreSQL<br/>Users, Sessions, Checklists")]
        VDB[("ChromaDB<br/>Vector Store — Gov. Docs")]
    end

    subgraph External["🏛️ Trusted Sources"]
        GOV["Official Government<br/>Documents & Procedures<br/>(NADRA, Passport Directorate, SECP)"]
    end

    subgraph Deploy["☁️ Deployment"]
        VERCEL["Vercel — Frontend"]
        RENDER["Render — Backend"]
        SUPABASE["Supabase — DB Hosting"]
    end

    UI -->|"Chat / Upload / Voice"| API
    API --> LLM
    API --> OCR
    API --> STT
    API --> TTS
    API --> RAG
    RAG --> EMB
    EMB --> VDB
    RAG --> VDB
    RAG --> LLM
    GOV -.->|"ingested & embedded (offline pipeline)"| VDB
    API --> PG

    UI -.deployed on.- VERCEL
    API -.deployed on.- RENDER
    PG -.hosted on.- SUPABASE

    style Client fill:#1a1a2e,color:#fff
    style Gateway fill:#16213e,color:#fff
    style AI fill:#0f3460,color:#fff
    style Data fill:#533483,color:#fff
    style External fill:#2d2d2d,color:#fff
    style Deploy fill:#222,color:#fff
```

---

## 2. Component Breakdown

### 2.1 Client Layer (Frontend)
- **Framework:** Next.js + React
- **Styling:** Tailwind CSS
- **Responsibilities:**
  - Chat interface (Urdu/English toggle)
  - File upload UI (forms/documents)
  - Voice input/output controls
  - Checklist display
  - Rendering citations under AI answers

### 2.2 API Layer (Backend)
- **Framework:** FastAPI
- **Responsibilities:**
  - Route requests to the right AI service (chat, OCR, voice)
  - Manage sessions and user state
  - Enforce validation (file size/type, input sanitization)
  - Orchestrate the RAG pipeline

### 2.3 AI Processing Layer

| Component | Purpose |
|---|---|
| **RAG Pipeline** | Core logic: takes a query, retrieves matching official-source chunks from ChromaDB, sends them + the query to Qwen, returns a grounded answer with citations |
| **Qwen (LLM)** | Generates natural-language answers and field explanations |
| **Qwen Embeddings** | Converts text (government docs + user queries) into vectors for similarity search |
| **OCR Engine** | Extracts text/fields from uploaded form images (PaddleOCR primary, Tesseract fallback) |
| **Whisper (STT)** | Converts spoken user input into text |
| **TTS Engine** | Converts AI text responses into spoken audio |

### 2.4 Data Layer
- **PostgreSQL:** Structured data — user sessions, checklist state, uploaded-form metadata (not raw sensitive data)
- **ChromaDB:** Vector store holding embedded chunks of official government documents, used for retrieval

### 2.5 External Sources
- Official government websites/documents (NADRA, Passport Directorate, SECP) — ingested offline into ChromaDB, not fetched live during a user request

### 2.6 Deployment
- **Vercel:** Hosts the Next.js frontend
- **Render:** Hosts the FastAPI backend
- **Supabase:** Hosts PostgreSQL

---

## 3. Data Flow — Chat with RAG

```mermaid
sequenceDiagram
    actor User
    participant FE as Next.js Frontend
    participant BE as FastAPI Backend
    participant RAG as RAG Pipeline
    participant VDB as ChromaDB
    participant LLM as Qwen LLM

    User->>FE: Type/speak question
    FE->>BE: POST /chat {query, lang}
    BE->>RAG: Forward query
    RAG->>VDB: Embed query, similarity search
    VDB-->>RAG: Top-k matching document chunks
    alt Relevant match found
        RAG->>LLM: Query + retrieved context
        LLM-->>RAG: Grounded answer
        RAG-->>BE: Answer + citation(s)
    else No good match
        RAG-->>BE: "I don't have verified information on this"
    end
    BE-->>FE: Response
    FE-->>User: Answer with source shown
```

---

## 4. Data Flow — Document Upload & OCR

```mermaid
sequenceDiagram
    actor User
    participant FE as Next.js Frontend
    participant BE as FastAPI Backend
    participant OCR as OCR Engine
    participant LLM as Qwen LLM
    participant PG as PostgreSQL

    User->>FE: Upload form (image/PDF)
    FE->>BE: POST /ocr {file}
    BE->>OCR: Preprocess (deskew/contrast) + extract fields
    OCR-->>BE: Structured field data (+ confidence scores)
    alt Low-confidence field
        BE-->>FE: Flag field for manual confirmation
        FE-->>User: Ask user to confirm/correct
    end
    BE->>LLM: Explain extracted fields in plain language
    LLM-->>BE: Field-by-field explanation
    BE->>PG: Store session/checklist state (not raw CNIC image/number)
    BE-->>FE: Explanation + updated checklist
    FE-->>User: Shows explanation, masked sensitive fields
```

---

## 5. Voice Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant BE as Backend
    participant STT as Whisper
    participant RAG as RAG Pipeline
    participant TTS as TTS Engine

    User->>FE: Speaks question
    FE->>BE: POST /voice {audio}
    BE->>STT: Transcribe audio
    STT-->>BE: Text query
    BE->>RAG: Process as normal chat query
    RAG-->>BE: Text answer + citation
    BE->>TTS: Convert answer to speech
    TTS-->>BE: Audio response
    BE-->>FE: Audio + text + citation
    FE-->>User: Plays spoken answer, shows text
```

---

## 6. Security & Privacy Notes

- CNIC and other sensitive identifiers are **not persisted** beyond the session
- Sensitive fields are **masked** in the UI (e.g. `XXXXX-1234567-X`)
- Government source ingestion happens **offline**, not via live scraping during user requests, reducing risk of serving unverified/live content
- RAG pipeline includes a **grounding guardrail**: if no relevant match is found in ChromaDB, the system explicitly declines rather than falling back to the LLM's ungrounded parametric knowledge

---

## 7. Scalability Notes (Post-MVP)

- ChromaDB can be swapped for a managed vector DB (e.g. Pinecone/Weaviate) as document volume grows
- OCR pipeline can be queued (e.g. via a task queue) if form upload volume increases
- Additional services (Driving License, Tax Filing) can be added as new document collections in ChromaDB + new checklist logic, without changing the core architecture
