"use client";
import AppShell from "@/components/layout/AppShell";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { useAuth } from "@/lib/AuthContext";
import { Shield, Car, AlertTriangle, CreditCard, FileText, GraduationCap, Users, Radar, ScanLine, Mic, Calculator, ClipboardCheck, Building2, Bell, Clock } from "lucide-react";

const services = [
  { href: "/identity", label: "Identity", labelUr: "شناخت", icon: Shield, color: "#087F3E", desc: "CNIC, Passport, Registration" },
  { href: "/vehicle", label: "Vehicle", labelUr: "گاڑی", icon: Car, color: "#3478E5", desc: "Registration, Transfer, Token" },
  { href: "/challans", label: "Challans", labelUr: "چالان", icon: AlertTriangle, color: "#D94F30", desc: "View & Pay Traffic Fines" },
  { href: "/payments", label: "Payments", labelUr: "ادائیگیاں", icon: CreditCard, color: "#159447", desc: "Gov Fees & Taxes" },
  { href: "/documents", label: "Documents", labelUr: "دستاویزات", icon: FileText, color: "#6844C7", desc: "Upload, Scan & Explain" },
  { href: "/opportunities", label: "Opportunities", labelUr: "مواقع", icon: GraduationCap, color: "#087F3E", desc: "Scholarships & Programs" },
  { href: "/family", label: "Family", labelUr: "فیملی", icon: Users, color: "#6844C7", desc: "Family Benefit Finder" },
  { href: "/updates", label: "Gov Updates", labelUr: "اپ ڈیٹس", icon: Radar, color: "#075C2D", desc: "Latest Announcements" },
];

const tools = [
  { href: "/ocr", label: "OCR Scanner", labelUr: "اسکینر", icon: ScanLine, color: "#6844C7" },
  { href: "/voice", label: "Voice Assistant", labelUr: "وازی اسسٹنٹ", icon: Mic, color: "#D94F30" },
  { href: "/checklist", label: "My Checklist", labelUr: "فہرست", icon: ClipboardCheck, color: "#087F3E" },
  { href: "/fees", label: "Fee Calculator", labelUr: "فیس کیلکولیٹر", icon: Calculator, color: "#3478E5" },
  { href: "/eligibility", label: "Eligibility", labelUr: "اہلیت", icon: ClipboardCheck, color: "#159447" },
  { href: "/offices", label: "Find Offices", labelUr: "دفتر", icon: Building2, color: "#075C2D" },
  { href: "/alerts", label: "Expiry Alerts", labelUr: "ختم الرٹ", icon: Bell, color: "#D94F30" },
];

export default function Page() {
  const { lang } = useLang();
  const { user } = useAuth();

  const subtitle = lang === "ur"
    ? "آپ کے سرکاری خدمات کا ذاتی گائیڈ"
    : "Your personal guide to government services";

  const cnic = user?.cnic || "";
  const city = user?.city || "";

  return (
    <AppShell
      rightPanel={undefined}
    >
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-br from-raah-green to-raah-deep rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{lang === "ur" ? "خوش آمدید" : "Welcome"}, {user?.name || "Citizen"}</h1>
              {(cnic || city) && (
                <p className="text-sm text-white/70 mt-1 font-medium">
                  {cnic && <span>CNIC: {cnic}</span>}
                  {cnic && city && <span className="mx-2">|</span>}
                  {city && <span>{lang === "ur" ? "شہر" : "City"}: {city}</span>}
                </p>
              )}
              <p className="text-sm text-white/60 mt-0.5">{subtitle}</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
              <Clock size={14} />
              <span className="text-xs font-medium">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
            </div>
          </div>
        </div>

        {/* Service Hub */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-raah-deep">
              {lang === "ur" ? "سرکاری خدمات" : "Government Services"}
            </h2>
            <span className="text-xs text-text-muted">{services.length} {lang === "ur" ? "سروسز" : "services"}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {services.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="bg-white rounded-xl border border-border p-4 hover:shadow-md hover:border-raah-green/30 transition group"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white mb-3" style={{ background: s.color }}>
                  <s.icon size={18} />
                </div>
                <div className="font-semibold text-sm text-raah-deep group-hover:text-raah-green transition">
                  {lang === "ur" ? s.labelUr : s.label}
                </div>
                <div className="text-xs text-text-muted mt-0.5">{s.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Tools */}
        <div>
          <h2 className="font-bold text-raah-deep mb-3">
            {lang === "ur" ? "ٹولز" : "Quick Tools"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {tools.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="flex items-center gap-2 bg-white rounded-xl border border-border px-3 py-2 hover:shadow-sm hover:border-raah-green/30 transition text-sm"
              >
                <t.icon size={14} style={{ color: t.color }} />
                <span className="font-medium text-text-primary">{lang === "ur" ? t.labelUr : t.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
