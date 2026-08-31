"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, FileText, ScanLine, Mic, ListChecks, History, Bookmark, Bell, Settings, HelpCircle, Globe, Calculator, ClipboardCheck, Building2, AlertTriangle, LayoutDashboard, Shield, Car, CreditCard, GraduationCap, Users, Radar, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/LangContext";
import { useAuth } from "@/lib/AuthContext";

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
            <span className={`flex-1 ${lang==="ur"?"font-urdu":""}`}>{label}</span>
            {active && <span className="text-raah-green">›</span>}
          </Link>
        );
      })}
    </>
  );
}

export default function Sidebar() {
  const { lang, setLang } = useLang();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  return (
    <div className="h-screen sticky top-0 flex flex-col bg-white dark:bg-[#111d15] border-r border-border p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 py-3">
        <img src="/logo.png" alt="RaahAI" className="w-9 h-9 rounded-xl bg-raah-green object-cover" onError={(e) => (e.currentTarget.style.display="none")} />
        <div>
          <div className="font-bold text-raah-deep leading-none dark:text-raah-green">RaahAI</div>
          <div className="text-[10px] text-text-secondary leading-none dark:text-text-muted">{lang === "ur" ? "آپ کا AI کاپائلٹ" : "Your AI Copilot"}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 mt-2 overflow-y-auto">
        <NavSection items={mainNav} lang={lang} pathname={pathname} />
        <NavSection items={commandCenter} lang={lang} pathname={pathname} title={lang==="ur"?"سٹیزن کمانڈ سینٹر":"Command Center"} />
        <NavSection items={toolsNav} lang={lang} pathname={pathname} title={lang==="ur"?"ٹولز":"Tools"} />
        <NavSection items={otherNav} lang={lang} pathname={pathname} />
      </nav>

      {/* Language */}
      <div className="mt-3 p-3 rounded-xl border border-border bg-raah-soft dark:bg-[#162a1e]">
        <div className="flex items-center gap-2 text-xs text-text-secondary mb-2 dark:text-text-muted">
          <Globe size={14} /> Language
        </div>
        <div className="flex rounded-full bg-white dark:bg-[#1a2e20] border border-border p-1">
          <button
            onClick={() => setLang("ur")}
            className={cn("flex-1 py-1.5 rounded-full text-sm font-medium", lang === "ur" ? "bg-raah-mint text-raah-deep border border-raah-green/20 dark:bg-[#1a3326] dark:text-raah-green" : "text-text-secondary dark:text-text-muted")}
          >
            اردو
          </button>
          <button
            onClick={() => setLang("en")}
            className={cn("flex-1 py-1.5 rounded-full text-sm font-medium", lang === "en" ? "bg-raah-mint text-raah-deep border border-raah-green/20 dark:bg-[#1a3326] dark:text-raah-green" : "text-text-secondary dark:text-text-muted")}
          >
            English
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="mt-3 flex items-center gap-3 p-3 rounded-xl border border-border dark:border-[#2a4a35]">
        <div className="w-8 h-8 rounded-full bg-raah-mint dark:bg-[#1a3326] text-raah-green flex items-center justify-center text-sm font-bold">{user?.name?.charAt(0) || "C"}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate dark:text-text-primary">{user?.name || "Citizen"}</div>
          <div className="text-xs text-text-muted dark:text-text-muted">{user?.email || "citizen@raahai.pk"}</div>
        </div>
        <button onClick={logout} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-text-muted hover:text-red-500 transition" title="Logout">
          <LogOut size={14}/>
        </button>
      </div>
    </div>
  );
}
