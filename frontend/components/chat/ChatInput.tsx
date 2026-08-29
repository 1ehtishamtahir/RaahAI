"use client";
import { useState, useRef, useEffect } from "react";
import { Paperclip, Mic, MicOff, Send } from "lucide-react";
import { useLang } from "@/lib/LangContext";

export default function ChatInput({ onSend, disabled }: { onSend: (t: string) => void; disabled?: boolean }) {
  const { t } = useLang();
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => prev ? prev + " " + transcript : transcript);
        setRecording(false);
      };
      recognition.onerror = () => setRecording(false);
      recognition.onend = () => setRecording(false);
      recognitionRef.current = recognition;
    }
  }, []);

  function toggleVoice() {
    if (!recognitionRef.current) return;
    if (recording) {
      recognitionRef.current.stop();
      setRecording(false);
    } else {
      recognitionRef.current.start();
      setRecording(true);
    }
  }

  function submit() {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
  }

  return (
    <div className="flex items-center gap-2 bg-white border border-border rounded-full px-2 py-2">
      <button onClick={() => fileRef.current?.click()} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-raah-soft text-text-muted">
        <Paperclip size={16} />
      </button>
      <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) onSend(`[Uploaded: ${f.name}] - Please explain this document.`);
      }} />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={t.placeholder}
        className="flex-1 outline-none text-sm placeholder:text-text-muted bg-transparent"
        disabled={disabled}
      />
      <button
        onClick={toggleVoice}
        className={`w-8 h-8 rounded-full flex items-center justify-center border ${recording ? "bg-red-50 border-red-200 text-red-600 animate-pulse" : "hover:bg-raah-soft text-text-muted border-transparent"}`}
        title={recording ? "Stop recording" : "Voice input"}
      >
        {recording ? <MicOff size={16} /> : <Mic size={16} />}
      </button>
      <button
        onClick={submit}
        disabled={disabled || !text.trim()}
        className="w-9 h-9 rounded-full bg-raah-green text-white flex items-center justify-center hover:bg-raah-deep disabled:opacity-40"
      >
        <Send size={16} />
      </button>
    </div>
  );
}
