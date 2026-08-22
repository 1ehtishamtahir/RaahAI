"use client";
import { useState, useRef, useEffect } from "react";
import UserMessage from "./UserMessage";
import AIMessage from "./AIMessage";
import ChatInput from "./ChatInput";
import { chatApi } from "@/lib/api";
import { useLang } from "@/lib/LangContext";

type Msg = { id: string; role: "user" | "assistant"; text: string; citations?: { title: string; snippet?: string }[]; grounded?: boolean; time: string };

export default function ChatWindow() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Assalam-o-Alaikum! I’m RaahAI. Ask me about **Passport**, **CNIC**, or **Business Registration** in Urdu or English.\n\nExample: *Passport banwane ke liye kya documents chahiye?*",
      citations: [],
      grounded: true,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const { lang, t } = useLang();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function onSend(text: string) {
    const userMsg: Msg = { id: Date.now().toString(), role: "user", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((m) => [...m, userMsg]);
    // persist to history (local) for /history page
    try {
      const hist = JSON.parse(localStorage.getItem("raahai-history") || "[]");
      hist.unshift({ id: Date.now().toString(), title: text.slice(0, 40), date: new Date().toLocaleString(), preview: text });
      localStorage.setItem("raahai-history", JSON.stringify(hist.slice(0, 20)));
      localStorage.setItem("raahai-last", JSON.stringify([...messages, userMsg].slice(-10)));
    } catch {}
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
      try {
        const last = JSON.parse(localStorage.getItem("raahai-last") || "[]");
        localStorage.setItem("raahai-last", JSON.stringify([...last, aiMsg].slice(-10)));
      } catch {}
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: `⚠️ Couldn't reach backend: ${e.message}\n\nTip: start backend with \`uvicorn app.main:app --reload\` and check NEXT_PUBLIC_API_URL. Mock answer: For "${text}" — please ensure ChromaDB is seeded via \`python scripts/seed_chroma.py\` and Qwen key is set.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-72px-48px)] bg-white rounded-[20px] border border-border overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {messages.map((m) =>
          m.role === "user" ? <UserMessage key={m.id} text={m.text} time={m.time} /> : <AIMessage key={m.id} text={m.text} time={m.time} citations={m.citations} grounded={m.grounded} />
        )}
        {loading && (
          <div className="space-y-2">
            <div className="bg-white border border-border rounded-2xl p-4 text-sm text-text-secondary animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 bg-raah-green rounded-full animate-ping" /> {t.searchOfficial}
            </div>
            <div className="text-xs text-text-muted px-2">{t.preparing}</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-3 bg-raah-soft/50">
        {/* Quick prompts */}
        <div className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { label: "Passport renewal?", q: "What documents for passport renewal?" },
            { label: "CNIC new", q: "CNIC new ke liye kya documents chahiye?" },
            { label: "Business SECP", q: "How to register business with SECP?" },
            { label: "پاسپورٹ فیس؟", q: "پاسپورٹ فیس کتنی ہے؟" },
          ].map((c) => (
            <button
              key={c.label}
              onClick={() => onSend(c.q)}
              disabled={loading}
              className="shrink-0 px-3 py-1.5 rounded-full border border-border bg-white text-xs hover:bg-raah-mint hover:border-raah-green/30 disabled:opacity-50"
            >
              {c.label}
            </button>
          ))}
        </div>
        <ChatInput onSend={onSend} disabled={loading} />
        <div className="text-center text-[11px] text-text-muted mt-2">◇ {t.disclaimer}</div>
      </div>
    </div>
  );
}
