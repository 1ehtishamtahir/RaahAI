"use client";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { Bookmark } from "lucide-react";

export default function SavedPage() {
  const { t } = useLang();
  const saved = [
    { id: "1", title: "Passport Required Documents", content: "Original CNIC, B-Form, Photographs, Fee receipt", source: "DGIP Official Website" },
    { id: "2", title: "CNIC Fee Structure", content: "Normal: PKR 1000, Urgent: PKR 2000, Executive: PKR 2500", source: "NADRA.gov.pk" },
  ];
  return (
    <AppShell>
      <div className="bg-white rounded-2xl border border-border p-6">
        <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><Bookmark size={20} /> {t.saved}</h1>
        <p className="text-sm text-text-secondary mt-1">Answers you bookmarked for later.</p>
        <div className="mt-6 space-y-3">
          {saved.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-8 text-center text-text-muted text-sm">{t.noSaved}</div>
          ) : (
            saved.map((s) => (
              <div key={s.id} className="border border-border rounded-xl p-4">
                <div className="font-medium text-sm">{s.title}</div>
                <div className="text-sm text-text-secondary mt-1">{s.content}</div>
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-raah-mint text-raah-deep text-xs border border-raah-green/20">{s.source} ↗</span>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
