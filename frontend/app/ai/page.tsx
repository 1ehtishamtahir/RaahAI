"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, MessageCircle, Mic, MicOff, Volume2 } from "lucide-react";
import { useLang } from "@/lib/LangContext";
import { useAuth } from "@/lib/AuthContext";
import { chatApi } from "@/lib/api";
import AIMessage from "@/components/chat/AIMessage";
import Image from "next/image";

type Msg = { id: string; role: "user" | "assistant"; text: string; citations?: { title: string; snippet?: string }[]; grounded?: boolean; time: string };

export default function AIPage() {
  const { lang } = useLang();
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setSpeechSupported("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        text: lang === "ur"
          ? "السلام علیکم! میں راہائی ہوں۔ آپ پاسپورٹ، شناختی کارڈ، گاڑی کی رجسٹریشن، چالان، ادائیگیاں، یا کسی بھی سرکاری سروس کے بارے میں پوچھ سکتے ہیں۔"
          : "Assalam-o-Alaikum! I'm RaahAI. Ask me about **Passport**, **CNIC**, **Vehicle Registration**, **Challans**, **Payments**, or any government service in Urdu or English.",
        citations: [],
        grounded: true,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 200);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setInput(q);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, []);

  async function onSend() {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    const userMsg: Msg = { id: Date.now().toString(), role: "user", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const res = await chatApi(text, lang);
      const aiMsg: Msg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: res.answer,
        citations: res.citations,
        grounded: res.grounded,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((m) => [...m, aiMsg]);
    } catch {
      setMessages((m) => [...m, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "Sorry, I couldn't reach the server. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } finally {
      setLoading(false);
    }
  }

  const quickPrompts = [
    { label: "Passport renewal?", q: "What documents for passport renewal?" },
    { label: "CNIC new", q: "CNIC new banwane ke liye kya chahiye?" },
    { label: "Token tax", q: "Token tax kaise pay karein?" },
    { label: "پاسپورٹ فیس؟", q: "پاسپورٹ فیس کتنی ہے؟" },
    { label: "Business SECP", q: "How to register business with SECP?" },
    { label: "Challan check", q: "Mera challan ka status check karein" },
  ];

  function toggleVoice() {
    if (!speechSupported) return;
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === "ur" ? "ur-PK" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? prev + " " + transcript : transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    setIsRecording(true);
  }

  function speakText(text: string) {
    if (!("speechSynthesis" in window)) return;
    const clean = text.replace(/[*#`>_\-]/g, "").replace(/\n+/g, ". ").slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = lang === "ur" ? "ur-PK" : "en-US";
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }

  return (
    <div className="min-h-screen bg-[#FBFDFC] flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-raah-soft transition">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="RaahAI" width={32} height={32} className="rounded-lg" />
            <div>
              <div className="font-semibold text-sm text-raah-deep">RaahAI</div>
              <div className={`text-[11px] text-text-muted ${lang==="ur"?"font-urdu":""}`}>
                {loading ? (lang === "ur" ? "سوچ رہا ہے..." : "Thinking...") : (lang === "ur" ? "آنلائن" : "Online")}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className={`text-xs text-text-muted ${lang==="ur"?"font-urdu":""}`}>{lang === "ur" ? "سرکاری ذرائع" : "Official Sources"}</span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 max-w-3xl mx-auto w-full space-y-4">
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[75%] bg-raah-soft border border-raah-mint rounded-2xl rounded-br-md px-4 py-3 text-[14px] leading-relaxed">
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div className="text-[11px] text-text-muted text-right mt-1">{m.time}</div>
              </div>
            </div>
          ) : (
            <>
              <AIMessage key={m.id} text={m.text} time={m.time} citations={m.citations} grounded={m.grounded} />
              {m.role === "assistant" && m.id !== "welcome" && (
                <button onClick={() => speakText(m.text)} className="ml-2 mt-1 text-text-muted hover:text-raah-green transition" title="Read aloud">
                  <Volume2 size={14}/>
                </button>
              )}
            </>
          )
        )}
        {loading && (
          <div className={`flex gap-2 items-center text-sm text-text-muted px-2 ${lang==="ur"?"font-urdu":""}`}>
            <span className="w-2 h-2 bg-raah-green rounded-full animate-ping" />
            {lang === "ur" ? "جواب تیار ہو رہا ہے..." : "Preparing answer..."}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-border bg-white p-4">
        <div className="max-w-3xl mx-auto">
          {/* Quick Prompts */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-thin">
            {quickPrompts.map((c) => (
              <button
                key={c.label}
                onClick={() => setInput(c.q)}
                disabled={loading}
                className="shrink-0 px-3 py-1.5 rounded-full border border-border bg-white text-xs hover:bg-raah-mint hover:border-raah-green/30 disabled:opacity-50 transition"
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 bg-gray-50 border border-border rounded-full px-3 py-2.5 focus-within:ring-2 focus-within:ring-raah-green/30 focus-within:border-raah-green transition">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSend()}
              placeholder={lang === "ur" ? "اپنا سوال لکھیں..." : "Ask anything about government services..."}
              className="flex-1 outline-none text-sm placeholder:text-text-muted bg-transparent min-w-0"
              disabled={loading}
            />
            {speechSupported && (
              <button
                onClick={toggleVoice}
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-raah-soft text-text-muted hover:text-raah-green"}`}
                title={isRecording ? "Stop recording" : "Voice input"}
              >
                {isRecording ? <MicOff size={16}/> : <Mic size={16}/>}
              </button>
            )}
            <button
              onClick={onSend}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-full bg-raah-green text-white flex items-center justify-center hover:bg-raah-deep disabled:opacity-40 shrink-0 transition"
            >
              <Send size={18} />
            </button>
          </div>
          <div className={`text-center text-[11px] text-text-muted mt-2 ${lang==="ur"?"font-urdu":""}`}>
            {lang === "ur" ? "◇ راہائی صرف سرکاری ذرائع پر مبنی تجاویز فراہم کرتی ہے" : "◇ RaahAI provides official-source-based recommendations only"}
          </div>
        </div>
      </div>
    </div>
  );
}
