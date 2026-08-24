"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Minus, Maximize2 } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { useAuth } from "@/lib/AuthContext";
import { chatApi } from "@/lib/api";
import AIMessage from "./AIMessage";

type Msg = { id: string; role: "user" | "assistant"; text: string; citations?: { title: string; snippet?: string }[]; grounded?: boolean; time: string };

export default function FloatingChat() {
  const { lang } = useLang();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, open, minimized]);

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, minimized]);

  function toggleOpen() {
    if (!open) {
      setMinimized(false);
      if (messages.length === 0) {
        setMessages([{
          id: "welcome",
          role: "assistant",
          text: lang === "ur"
            ? "السلام علیکم! میں راہائی ہوں۔ آپ پاسپورٹ، شناختی کارڈ، یا کاروباری رجسٹریشن کے بارے میں پوچھ سکتے ہیں۔"
            : "Assalam-o-Alaikum! I'm RaahAI. Ask me about **Passport**, **CNIC**, or **Business Registration** in Urdu or English.",
          citations: [],
          grounded: true,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }]);
      }
    }
    setOpen(!open);
  }

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
    { label: "پاسپورٹ فیس؟", q: "پاسپورٹ فیس کتنی ہے؟" },
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleOpen}
        className={`fixed z-[60] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 bottom-20 sm:bottom-6 right-5 sm:right-6 ${
          open
            ? "bg-gray-600 hover:bg-gray-700 text-white"
            : "bg-raah-green hover:bg-raah-deep text-white hover:shadow-xl"
        }`}
        title={open ? "Close chat" : "Chat with RaahAI"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Pulse when closed */}
      {!open && (
        <span className="fixed z-[55] bottom-20 sm:bottom-6 right-5 sm:right-6 w-14 h-14 rounded-full bg-raah-green/20 animate-ping pointer-events-none" />
      )}

      {/* Chat Popup */}
      {open && (
        <>
          {/* Backdrop on mobile */}
          <div className="sm:hidden fixed inset-0 bg-black/20 z-[55]" onClick={toggleOpen} />

          <div className={`fixed z-[60] right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[360px] bg-white rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden ${minimized ? "h-[56px] bottom-20 sm:bottom-24" : "h-[420px] sm:h-[440px] bottom-20 sm:bottom-24"}`}>
            {/* Header — always fixed */}
            <div className="bg-raah-green text-white px-4 py-3 flex items-center justify-between shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle size={16} />
                </div>
                <div>
                  <div className="font-semibold text-sm">RaahAI Assistant</div>
                  <div className="text-[10px] text-white/70">
                    {loading ? (lang === "ur" ? "سوچ رہا ہے..." : "Thinking...") : (lang === "ur" ? "آنلائن • جواب دینے کے لیے تیار" : "Online • Ready to help")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setMinimized(!minimized)} className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition">
                  <Minus size={14} />
                </button>
                <Link href="/ai" onClick={() => setOpen(false)} className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition" title="Open full chat">
                  <Maximize2 size={14} />
                </Link>
                <button onClick={toggleOpen} className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Body — only visible when not minimized */}
            {!minimized && (
              <>
                {/* Scrollable messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                  {messages.map((m) =>
                    m.role === "user" ? (
                      <div key={m.id} className="flex justify-end">
                        <div className="max-w-[82%] bg-raah-soft border border-raah-mint rounded-2xl rounded-br-md px-3.5 py-2.5 text-[13px] leading-relaxed">
                          <div className="whitespace-pre-wrap">{m.text}</div>
                          <div className="text-[10px] text-text-muted text-right mt-1">{m.time}</div>
                        </div>
                      </div>
                    ) : (
                      <AIMessage key={m.id} text={m.text} time={m.time} citations={m.citations} grounded={m.grounded} />
                    )
                  )}
                  {loading && (
                    <div className="flex gap-2 items-center text-xs text-text-muted px-1">
                      <span className="w-2 h-2 bg-raah-green rounded-full animate-ping" />
                      {lang === "ur" ? "جواب تیار ہو رہا ہے..." : "Preparing answer..."}
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Fixed bottom — quick prompts + input */}
                <div className="shrink-0 border-t border-border bg-white rounded-b-2xl">
                  <div className="px-3 pt-2 pb-1 flex gap-1.5 overflow-x-auto scrollbar-thin">
                    {quickPrompts.map((c) => (
                      <button
                        key={c.label}
                        onClick={() => setInput(c.q)}
                        disabled={loading}
                        className="shrink-0 px-2.5 py-1 rounded-full border border-border bg-white text-[11px] hover:bg-raah-mint hover:border-raah-green/30 disabled:opacity-50 transition"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <div className="px-3 pb-3">
                    <div className="flex items-center gap-2 bg-gray-50 border border-border rounded-full px-2 py-2 focus-within:ring-2 focus-within:ring-raah-green/30 focus-within:border-raah-green transition">
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onSend()}
                        placeholder={lang === "ur" ? "اپنا سوال لکھیں..." : "Type your message..."}
                        className="flex-1 outline-none text-[13px] placeholder:text-text-muted bg-transparent min-w-0"
                        disabled={loading}
                      />
                      <button
                        onClick={onSend}
                        disabled={loading || !input.trim()}
                        className="w-8 h-8 rounded-full bg-raah-green text-white flex items-center justify-center hover:bg-raah-deep disabled:opacity-40 shrink-0 transition"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                    <div className="text-center text-[10px] text-text-muted mt-1.5">
                      {lang === "ur" ? "◇ راہائی صرف سرکاری ذرائع پر مبنی تجاویز فراہم کرتی ہے" : "◇ RaahAI provides official-source-based recommendations only"}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
