"use client";
import AppShell from "@/components/layout/AppShell";
import { useState, useRef } from "react";
import { Mic, Square } from "lucide-react";
import { voiceApi } from "@/lib/api";
import { useLang } from "@/lib/LangContext";

export default function VoicePage() {
  const { lang, t } = useLang();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function toggle() {
    if (listening) {
      mediaRef.current?.stop();
      setListening(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      mediaRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        try {
          const res = await voiceApi(blob, lang);
          setTranscript(res.transcript);
          setAnswer(res.answer);
          if (res.audio_url) {
            const audio = new Audio(res.audio_url);
            audio.play().catch(() => {});
          } else if ("speechSynthesis" in window) {
            const utter = new SpeechSynthesisUtterance(res.answer);
            utter.lang = lang === "ur" ? "ur-PK" : "en-US";
            speechSynthesis.speak(utter);
          }
        } catch (e: any) {
          setAnswer(`Voice error: ${e.message}. Tip: Web Speech API fallback will be used if backend is not ready.`);
        }
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      setListening(true);
    } catch {
      // Fallback to Web Speech API if available
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (!SpeechRecognition) {
        setAnswer("Microphone permission denied or not supported.");
        return;
      }
      const rec2 = new SpeechRecognition();
      rec2.lang = lang === "ur" ? "ur-PK" : "en-PK";
      rec2.onresult = (e: any) => setTranscript(e.results[0][0].transcript);
      rec2.onend = () => setListening(false);
      rec2.start();
      setListening(true);
    }
  }

  return (
    <AppShell>
      <div className="bg-white rounded-2xl border border-border p-8 text-center">
        <h1 className="text-xl font-bold">RaahAI Voice</h1>
        <button onClick={toggle} className={`mt-6 w-24 h-24 rounded-full mx-auto flex items-center justify-center text-white text-2xl ${listening ? "bg-red-500 animate-pulse" : "bg-raah-green"}`}>
          {listening ? <Square /> : <Mic />}
        </button>
        <div className="mt-4 text-sm text-text-secondary">{listening ? t.listening : "Tap to speak"}</div>
        {transcript && <div className="mt-6 p-3 bg-raah-soft rounded-xl text-sm">“{transcript}”</div>}
        {answer && <div className="mt-4 p-4 border border-border rounded-xl text-sm text-left whitespace-pre-wrap">{answer}</div>}
        <div className="mt-6 text-xs text-text-muted">Voice → Whisper → Language Understanding → RAG → Qwen → TTS</div>
      </div>
    </AppShell>
  );
}
