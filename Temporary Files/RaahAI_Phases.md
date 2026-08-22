# RaahAI — Development Phases

This is the build plan broken into phases, so the team knows what to do first, second, and last before the hackathon demo.

---

## Phase 0: Setup (Day 0)

**Goal:** Get the basic skeleton running, nothing fancy yet.

- [ ] Create repo, folder structure (frontend/backend/data)
- [ ] Set up Next.js frontend (blank pages, routing)
- [ ] Set up FastAPI backend (health check endpoint)
- [ ] Set up PostgreSQL database
- [ ] Set up ChromaDB locally
- [ ] Get Qwen API key working (send one test prompt, get a reply)
- [ ] Confirm everyone on the team can run the project locally

**Done when:** Frontend and backend can talk to each other, and Qwen replies to a test message.

---

## Phase 1: Core Chat + RAG (the most important part)

**Goal:** A user can ask a question and get a real, sourced answer.

- [ ] Collect official info for the 3 MVP services (Passport, CNIC, Business Registration) — can be manually typed/copied from official sites for now
- [ ] Break that info into small chunks and store as embeddings in ChromaDB
- [ ] Build the RAG pipeline: question → search ChromaDB → send matched info + question to Qwen → get answer
- [ ] Show the source under every answer (e.g. "Source: NADRA.gov.pk")
- [ ] Add a fallback: if nothing relevant is found, say "I don't have verified information on this" instead of guessing
- [ ] Support both Urdu and English questions

**Done when:** You can ask "How do I renew my passport?" and get a correct, sourced answer in Urdu or English.

---

## Phase 2: Document Explainer + OCR

**Goal:** A user can upload a form and understand it.

- [ ] Build file upload (image/PDF) in the frontend
- [ ] Connect OCR (PaddleOCR or Tesseract) to extract text/fields from the uploaded form
- [ ] Add basic image cleanup before OCR (straighten, adjust brightness) for better accuracy
- [ ] Send extracted fields to Qwen to explain them in plain language
- [ ] If OCR isn't confident about a field, let the user manually correct it
- [ ] Mask sensitive fields like CNIC number on screen (e.g. `XXXXX-1234567-X`)
- [ ] Don't save uploaded documents/images after the session ends

**Done when:** You can upload a real (test) form and the app tells you what each field means.

---

## Phase 3: Personalized Checklist

**Goal:** After chat + document upload, the user gets a checklist of exactly what they need.

- [ ] Build checklist logic based on service type (Passport / CNIC / Business Registration) and situation (new vs. renewal, etc.)
- [ ] Make the checklist update based on what the user already uploaded/answered
- [ ] Display the checklist clearly in the UI

**Done when:** The checklist changes based on the user's actual situation, not just a static list.

---

## Phase 4: Voice Assistant (if time allows)

**Goal:** User can speak instead of typing.

- [ ] Add Whisper for speech-to-text (user's voice → text question)
- [ ] Add TTS for text-to-speech (AI's answer → spoken reply)
- [ ] Test with both Urdu and English speech

**Done when:** A user can speak a question and hear a spoken answer.

*(This phase can be simplified or skipped if time is short — the core demo doesn't depend on it.)*

---

## Phase 5: Polish + Error Handling

**Goal:** Make sure nothing looks broken during the demo.

- [ ] Add friendly error messages (e.g. "Couldn't read this photo clearly, try again or check [official link]")
- [ ] Add loading states so the UI never feels frozen
- [ ] Test response speed — aim for under 3 seconds for chat replies
- [ ] Test OCR accuracy on your chosen demo forms — aim for 85%+ correct fields
- [ ] Clean up UI styling (spacing, colors, mobile view if needed)

**Done when:** The app feels smooth and doesn't break on expected edge cases.

---

## Phase 6: Demo Rehearsal

**Goal:** Practice the exact flow you'll show judges.

- [ ] Pick the exact question, form, and scenario you'll demo
- [ ] Run through the full flow at least 3 times: ask → answer → upload → OCR → explain → checklist
- [ ] End on the "wow" moment — checklist adjusting based on the user's specific situation
- [ ] Prepare answers for likely judge questions (data privacy, accuracy, sources)
- [ ] Have a backup plan (screenshots/recording) in case live demo has issues

**Done when:** The team can run the demo confidently without surprises.

---

## Priority Order Summary

| Priority | Phase | Why |
|---|---|---|
| 🔴 Must-have | Phase 1: Chat + RAG | Core value of the product |
| 🔴 Must-have | Phase 2: OCR + Document Explainer | Second core value |
| 🟠 Should-have | Phase 3: Checklist | Makes the demo feel "smart" |
| 🟡 Nice-to-have | Phase 4: Voice | Impressive but not essential |
| 🔴 Must-have | Phase 5: Polish + Errors | Prevents demo-day failures |
| 🔴 Must-have | Phase 6: Rehearsal | Makes sure everything actually works live |

---

## Future Phases (after hackathon)

- Driving License support
- Tax Filing guidance
- Office Locator
- Appointment Booking
- Push Notifications
