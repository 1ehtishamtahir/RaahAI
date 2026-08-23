"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, FileText, ScanLine, Mic, ListChecks, History, Bookmark, Bell, Settings, HelpCircle, Globe, Calculator, ClipboardCheck, Building2, AlertTriangle, LayoutDashboard, Shield, Car, CreditCard, GraduationCap, Users, Radar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/LangContext";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/", label: "Chat Assistant", icon: MessageCircle },
];

const commandCenter = [
  { href: "/identity", label: "Identity", icon: Shield },
  { href: "/vehicle", label: "Vehicle", icon: Car },
  { href: "/challans", label: "Challans", icon: AlertTriangle },
  { href: "/payments", label: "Gov Payments", icon: CreditCard },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/opportunities", label: "Opportunities", icon: GraduationCap },
  { href: "/family", label: "Family Programs", icon: Users },
  { href: "/updates", label: "Gov Updates", icon: Radar },
];

const toolsNav = [
  { href: "/ocr", label: "OCR Scanner", icon: ScanLine },
  { href: "/voice", label: "Voice Assistant", icon: Mic },
  { href: "/checklist", label: "My Checklist", icon: ListChecks },
  { href: "/fees", label: "Fee Calculator", icon: Calculator },
  { href: "/eligibility", label: "Eligibility Check", icon: ClipboardCheck },
  { href: "/offices", label: "Find Offices", icon: Building2 },
  { href: "/alerts", label: "Expiry Alerts", icon: AlertTriangle },
];

const otherNav = [
  { href: "/history", label: "History", icon: History },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help & Support", icon: HelpCircle },
];

const URDU: Record<string, string> = {
  "Dashboard": "ڈیش بورڈ",
  "Chat Assistant": "چیٹ اسسٹنٹ",
  "Identity": "شناخت",
  "Vehicle": "گاڑی",
  "Challans": "چالان",
  "Gov Payments": "سرکاری ادائیگیاں",
  "Documents": "دستاویزات",
  "Opportunities": "مواقع",
  "Family Programs": "فیملی پروگرام",
  "Gov Updates": "سرکاری اپ ڈیٹس",
  "OCR Scanner": "او ڈی آر اسکینر",
  "Voice Assistant": "وازی اسسٹنٹ",
  "My Checklist": "میری فہرست",
  "Fee Calculator": "فیس کیلکولیٹر",
  "Eligibility Check": "اہلیت چیک",
  "Find Offices": "دفتر تلاش",
  "Expiry Alerts": "ختم الرٹ",
  "History": "تاریخ",
  "Saved": "محفوظ شدہ",
  "Notifications": "اطلاعات",
  "Settings": "ترتیبات",
  "Help & Support": "مدد و معاونت",
};

function NavSection({ items, lang, pathname, title }: { items: typeof mainNav; lang: string; pathname: string; title?: string }) {
  return (
    <>
      {title && <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-3 mt-4 mb-1">{title}</div>}
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        const label = lang === "ur" ? (URDU[item.label] || item.label) : item.label;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition",
              active ? "bg-raah-mint text-raah-deep" : "text-text-secondary hover:bg-raah-soft hover:text-text-primary"
            )}
          >
            <item.icon size={16} className={cn(active ? "text-raah-green" : "text-text-muted")} />
            <span className="flex-1">{label}</span>
            {active && <span className="text-raah-green">›</span>}
          </Link>
        );
      })}
    </>
  );
}

export default function Sidebar() {
  const { lang, setLang } = useLang();
  const pathname = usePathname();
  return (
    <div className="h-screen sticky top-0 flex flex-col bg-white border-r border-border p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 py-3">
        <img src="/logo.png" alt="RaahAI" className="w-9 h-9 rounded-xl bg-raah-green object-cover" onError={(e) => (e.currentTarget.style.display="none")} />
        <div>
          <div className="font-bold text-raah-deep leading-none">RaahAI</div>
          <div className="text-[10px] text-text-secondary leading-none">{lang === "ur" ? "آپ کا AI کاپائلٹ" : "Your AI Copilot"}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 mt-2 overflow-y-auto">
        <NavSection items={mainNav} lang={lang} pathname={pathname} />
        <NavSection items={commandCenter} lang={lang} pathname={pathname} title={lang==="ur"?"سٹیزن کمانڈ سینٹر":"Command Center"} />
        <NavSection items={toolsNav} lang={lang} pathname={pathname} title="Tools" />
        <NavSection items={otherNav} lang={lang} pathname={pathname} />
      </nav>

      {/* Language */}
      <div className="mt-3 p-3 rounded-xl border border-border bg-raah-soft">
        <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
          <Globe size={14} /> Language
        </div>
        <div className="flex rounded-full bg-white border border-border p-1">
          <button
            onClick={() => setLang("ur")}
            className={cn("flex-1 py-1.5 rounded-full text-sm font-medium", lang === "ur" ? "bg-raah-mint text-raah-deep border border-raah-green/20" : "text-text-secondary")}
          >
            اردو
          </button>
          <button
            onClick={() => setLang("en")}
            className={cn("flex-1 py-1.5 rounded-full text-sm font-medium", lang === "en" ? "bg-raah-mint text-raah-deep border border-raah-green/20" : "text-text-secondary")}
          >
            English
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="mt-3 flex items-center gap-3 p-3 rounded-xl border border-border">
        <img src="https://i.pravatar.cc/100?img=12" alt="avatar" className="w-8 h-8 rounded-full" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">Ehtisham Tahir</div>
          <div className="text-xs text-text-muted">Citizen • Free Plan</div>
        </div>
        <span className="text-text-muted">⌄</span>
      </div>
    </div>
  );
}
