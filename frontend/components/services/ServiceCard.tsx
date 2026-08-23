"use client";
import { useLang } from "@/lib/LangContext";

const services = [
  { id: "passport", title: "Passport", desc: "Apply for new passport or renewal", color: "#087F3E", icon: "🛂" },
  { id: "cnic", title: "CNIC", desc: "Apply for new CNIC or update information", color: "#3478E5", icon: "🪪" },
  { id: "business_registration", title: "Business Registration", desc: "Register your business with SECP", color: "#6844C7", icon: "💼" },
];

export default function ServiceCard() {
  const { t } = useLang();
  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">{t.services}</div>
      </div>
      <div className="space-y-2">
        {services.map((s) => (
          <a key={s.id} href={`/checklist?service=${s.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-raah-soft transition">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg" style={{ background: s.color }}>
              {s.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{s.title}</div>
              <div className="text-xs text-text-secondary">{s.desc}</div>
            </div>
            <span className="text-text-muted">›</span>
          </a>
        ))}
      </div>
    </div>
  );
}
