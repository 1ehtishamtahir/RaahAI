"use client";
import { useState, useRef } from "react";
import { Paperclip, Mic, Send } from "lucide-react";
import { useLang } from "@/lib/LangContext";

export default function ChatInput({ onSend, disabled }: { onSend: (t: string) => void; disabled?: boolean }) {
  const { t } = useLang();
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [recording, setRecording] = useState(false);

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
        onClick={() => setRecording(!recording)}
        className={`w-8 h-8 rounded-full flex items-center justify-center border ${recording ? "bg-red-50 border-red-200 text-red-600" : "hover:bg-raah-soft text-text-muted border-transparent"}`}
        title="Voice"
      >
        <Mic size={16} />
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
