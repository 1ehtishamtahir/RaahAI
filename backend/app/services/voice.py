import tempfile
import os

def transcribe_audio(audio_bytes: bytes, lang: str = "en") -> str:
    """Whisper STT — requires openai-whisper installed. Falls back gracefully."""
    try:
        import whisper
        model = whisper.load_model("base")
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as f:
            f.write(audio_bytes)
            path = f.name
        result = model.transcribe(path, language=None if lang == "ur" else "en")
        os.unlink(path)
        return result.get("text", "").strip()
    except Exception as e:
        return f"[STT unavailable: {e}. Frontend will use Web Speech API fallback.]"

def synthesize_speech(text: str, lang: str = "en") -> bytes:
    """Try gTTS first, then edge-tts, else return empty for frontend Web Speech fallback."""
    # Try gTTS
    try:
        from gtts import gTTS
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as f:
            path = f.name
        # gTTS lang codes: 'en' or 'ur' (urdu supported)
        gtts_lang = "ur" if lang == "ur" else "en"
        tts = gTTS(text=text[:4000], lang=gtts_lang, slow=False)
        tts.save(path)
        data = open(path, "rb").read()
        os.unlink(path)
        return data
    except Exception as e:
        # print(f"[TTS gTTS failed: {e}]")
        pass
    # Try edge-tts (async)
    try:
        import asyncio
        import edge_tts
        async def _edge():
            voice = "ur-PK-AsadNeural" if lang == "ur" else "en-US-AriaNeural"
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as f:
                path = f.name
            communicate = edge_tts.Communicate(text[:4000], voice)
            await communicate.save(path)
            data = open(path, "rb").read()
            os.unlink(path)
            return data
        return asyncio.run(_edge())
    except Exception:
        pass
    return b""
