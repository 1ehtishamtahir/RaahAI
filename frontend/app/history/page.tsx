"use client";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { useAuth } from "@/lib/AuthContext";
import { Clock, MessageCircle, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { chatSessionsApi } from "@/lib/api";

type Hist = { id: string; title: string; date: string; preview: string };

export default function HistoryPage() {
  const { t } = useLang();
  const { user } = useAuth();
  const [history, setHistory] = useState<Hist[]>([]);

  useEffect(() => {
    if (!user) { setHistory([]); return; }
    chatSessionsApi().then((res: any) => {
      const sessions = (res.sessions || []).map((s: any) => ({
        id: s.id,
        title: s.title || "New Chat",
        date: s.updated_at ? new Date(s.updated_at).toLocaleString() : "",
        preview: "",
      }));
      setHistory(sessions);
    }).catch(() => {
      const raw = localStorage.getItem(`raahai-history-${user.id}`);
      if (raw) {
        try { setHistory(JSON.parse(raw)); } catch {}
      } else {
        setHistory([
          { id: "1", title: "Passport renewal documents", date: "Today, 10:30 AM", preview: "Passport banwane ke liye kya documents chahiye?" },
          { id: "2", title: "CNIC modification process", date: "Yesterday, 4:15 PM", preview: "CNIC me name correction ka process kya hai?" },
          { id: "3", title: "Business Registration with SECP", date: "2 days ago", preview: "Business registration ke liye SECP requirements?" },
        ]);
      }
    });
  }, [user?.id]);

  function clear() {
    setHistory([]);
    if (user) localStorage.removeItem(`raahai-history-${user.id}`);
  }

  return (
    <AppShell>
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><Clock size={20} /> {t.history}</h1>
          {history.length > 0 && (
            <button onClick={clear} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full border border-border hover:bg-red-50 hover:text-red-600">
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>
        <p className="text-sm text-text-secondary mt-1">Your past conversations with RaahAI.</p>

        <div className="mt-6 space-y-3">
          {history.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-8 text-center text-text-muted">
              <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t.noHistory}</p>
              <a href="/" className="inline-block mt-3 px-4 py-2 bg-raah-green text-white rounded-full text-sm">Start Chatting</a>
            </div>
          ) : (
            history.map((h) => (
              <a key={h.id} href="/" className="block border border-border rounded-xl p-4 hover:bg-raah-soft transition">
                <div className="font-medium text-sm">{h.title}</div>
                <div className="text-xs text-text-muted mt-0.5">{h.date}</div>
                <div className="text-sm text-text-secondary mt-2 truncate">“{h.preview}”</div>
              </a>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
