from fastapi import APIRouter, UploadFile, File, Form
from app.models.schemas import VoiceResponse, Citation
from app.services.voice import transcribe_audio, synthesize_speech
from app.services.rag import rag_answer
import base64

router = APIRouter(prefix="/voice", tags=["voice"])

@router.post("", response_model=VoiceResponse)
async def voice_chat(audio: UploadFile = File(...), lang: str = Form("en")):
    data = await audio.read()
    transcript = transcribe_audio(data, lang=lang)
    if transcript.startswith("[STT"):
        # fallback: treat as empty
        transcript = transcript
        answer = "Speech recognition is not configured. Please install Whisper and try again."
        return VoiceResponse(transcript=transcript, answer=answer, citations=[])

    answer, citations, _ = await rag_answer(transcript, lang=lang)
    audio_bytes = synthesize_speech(answer, lang=lang)
    audio_b64 = base64.b64encode(audio_bytes).decode() if audio_bytes else None
    return VoiceResponse(
        transcript=transcript,
        answer=answer,
        citations=[Citation(title=c["title"], snippet=c.get("snippet")) for c in citations],
        audio_url=f"data:audio/mp3;base64,{audio_b64}" if audio_b64 else None
    )
