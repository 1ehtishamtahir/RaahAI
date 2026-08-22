"use client";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  const { t } = useLang();
  const items = [
    { id: "1", title: "Passport checklist updated", time: "2 hours ago", desc: "Your passport renewal checklist is 60% complete." },
    { id: "2", title: "New SECP guideline", time: "Yesterday", desc: "Business registration fee updated — check official SECP notice." },
  ];
  return (
    <AppShell>
      <div className="bg-white rounded-2xl border border-border p-6">
        <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><Bell size={20} /> {t.notifications}</h1>
        <p className="text-sm text-text-secondary mt-1">Updates about your requests and official notices.</p>
        <div className="mt-6 space-y-3">
          {items.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-8 text-center text-text-muted text-sm">{t.noNotifications}</div>
          ) : (
            items.map((n) => (
              <div key={n.id} className="border border-border rounded-xl p-4 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-raah-mint flex items-center justify-center text-raah-green shrink-0"><Bell size={16} /></div>
                <div>
                  <div className="font-medium text-sm">{n.title}</div>
                  <div className="text-xs text-text-muted">{n.time}</div>
                  <div className="text-sm text-text-secondary mt-1">{n.desc}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
