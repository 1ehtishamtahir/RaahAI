"use client";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { Settings as SettingsIcon, Globe, Shield, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { lang, setLang } = useLang();
  return (
    <AppShell>
      <div className="bg-white rounded-2xl border border-border p-6 max-w-2xl">
        <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><SettingsIcon size={20} /> Settings</h1>

        <div className="mt-6 space-y-6">
          <div className="border border-border rounded-xl p-4">
            <div className="font-medium flex items-center gap-2"><Globe size={16} /> Language</div>
            <p className="text-xs text-text-secondary mt-1">Choose your preferred language. Urdu supports RTL layout.</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setLang("en")} className={`flex-1 py-2 rounded-xl border text-sm font-medium ${lang === "en" ? "bg-raah-green text-white border-raah-green" : "bg-white border-border"}`}>English</button>
              <button onClick={() => setLang("ur")} className={`flex-1 py-2 rounded-xl border text-sm font-medium ${lang === "ur" ? "bg-raah-green text-white border-raah-green" : "bg-white border-border"}`}>اردو</button>
            </div>
          </div>

          <div className="border border-border rounded-xl p-4">
            <div className="font-medium flex items-center gap-2"><Shield size={16} /> Privacy</div>
            <p className="text-xs text-text-secondary mt-1">RaahAI masks CNIC numbers (XXXXX-XXXXXXX-X) and does not persist sensitive fields beyond the session. Uploaded documents are not stored after the session ends.</p>
            <div className="text-xs bg-raah-mint rounded-lg p-3 mt-3 border border-raah-green/20">
              <strong>Grounding:</strong> Answers include Source badges. If no official match is found, RaahAI says “I don’t have verified information” instead of guessing.
            </div>
          </div>

          <div className="border border-border rounded-xl p-4">
            <div className="font-medium flex items-center gap-2"><Trash2 size={16} /> Data</div>
            <button
              onClick={() => {
                localStorage.clear();
                alert("Local data cleared.");
              }}
              className="mt-3 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-full text-sm hover:bg-red-100"
            >
              Clear Local Storage
            </button>
            <p className="text-xs text-text-muted mt-2">Clears history, checklist progress, and language preference stored in this browser.</p>
          </div>

          <div className="text-xs text-text-muted border-t border-border pt-4">
            <div>Backend: <code className="bg-raah-soft px-1 rounded">{process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}</code></div>
            <div className="mt-1">Version 1.0 • Bano Qabil Hackathon 2026</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
