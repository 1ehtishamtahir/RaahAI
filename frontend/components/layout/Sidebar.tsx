"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, FileText, ScanLine, Mic, ListChecks, History, Bookmark, Bell, Settings, HelpCircle, Globe, Calculator, ClipboardCheck, Building2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/LangContext";

const nav = [
  { href: "/", label: "Chat Assistant", icon: MessageCircle },
  { href: "/ocr", label: "OCR Scanner", icon: ScanLine },
  { href: "/voice", label: "Voice Assistant", icon: Mic },
  { href: "/checklist", label: "My Checklist", icon: ListChecks },
  { href: "/fees", label: "Fee Calculator", icon: Calculator },
  { href: "/eligibility", label: "Eligibility Check", icon: ClipboardCheck },
  { href: "/offices", label: "Find Offices", icon: Building2 },
  { href: "/alerts", label: "Expiry Alerts", icon: AlertTriangle },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/history", label: "History", icon: History },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help & Support", icon: HelpCircle },
];

const URDU: Record<string, string> = {
  "Chat Assistant": "\u0686\u06cc\u0679 \u0627\u0633\u0633\u062a\u0627\u0646\u0679",
  "OCR Scanner": "\u0627\u0648 \u0688\u06cc \u0627\u0688\u0631 \u0627\u0633\u0686\u0646\u0631",
  "Voice Assistant": "\u0627\u0648\u0627\u0632\u06cc \u0627\u0633\u0633\u062a\u0627\u0646\u0679",
  "My Checklist": "\u0645\u06cc\u0631\u06cc \u0641\u0647\u0631\u0633\u062a",
  "Fee Calculator": "\u0641\u06cc\u0633 \u06a9\u0648\u0644\u0648\u0644\u0627",
  "Eligibility Check": "\u0627\u0647\u0644\u06cc\u062a \u062a\u0634\u0642\u06cc\u0642",
  "Find Offices": "\u062f\u0641\u062a\u0631 \u062a\u0644\u0627\u0634",
  "Expiry Alerts": "\u062e\u062a\u0645\u0627\u0646\u06cc\u062a \u0627\u0644\u0631\u062a",
  "Documents": "\u062f\u0633\u062a\u0627\u0648\u06cc\u0632\u0627\u062a",
  "History": "\u062a\u0627\u0631\u06cc\u062e",
  "Saved": "\u0645\u062d\u0641\u0648\u0638 \u0634\u062f\u06c1",
  "Notifications": "\u0627\u0637\u0644\u0627\u0639\u0627\u062a",
  "Settings": "\u062a\u0631\u062a\u06cc\u0628\u0627\u062a",
  "Help & Support": "\u0645\u062f\u062f \u0648 \u0645\u0639\u0627\u0648\u0646\u062a",
};

export default function Sidebar() {
  const { lang, setLang } = useLang();
  const pathname = usePathname();
  return (
    <div className="h-screen sticky top-0 flex flex-col bg-white border-r border-border p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 py-4">
        <img src="/logo.png" alt="RaahAI" className="w-9 h-9 rounded-xl bg-raah-green object-cover" onError={(e) => (e.currentTarget.style.display="none")} />
        <div>
          <div className="font-bold text-raah-deep leading-none">RaahAI</div>
          <div className="text-[11px] text-text-secondary leading-none">{lang === "ur" ? "\u0633\u0631\u06a9\u0627\u0631\u06cc \u062e\u062f\u0645\u062a\u0648\u06a9 \u0627\u0633\u062a\u0639\u0645\u0627\u0644 \u06a9\u0627 \u062d\u0648\u0633\u0646\u0631" : "Your Smart Guide to Government Services"}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 mt-4 overflow-y-auto">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const label = lang === "ur" ? (URDU[item.label] || item.label) : item.label;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition",
                active ? "bg-raah-mint text-raah-deep" : "text-text-secondary hover:bg-raah-soft hover:text-text-primary"
              )}
            >
              <item.icon size={18} className={cn(active ? "text-raah-green" : "text-text-muted")} />
              <span className="flex-1">{label}</span>
              {active && <span className="text-raah-green">\u203a</span>}
            </Link>
          );
        })}
      </nav>

      {/* Language */}
      <div className="mt-4 p-3 rounded-xl border border-border bg-raah-soft">
        <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
          <Globe size={14} /> Language
        </div>
        <div className="flex rounded-full bg-white border border-border p-1">
          <button
            onClick={() => setLang("ur")}
            className={cn("flex-1 py-1.5 rounded-full text-sm font-medium", lang === "ur" ? "bg-raah-mint text-raah-deep border border-raah-green/20" : "text-text-secondary")}
          >
            \u0627\u0631\u062f\u0648
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
          <div className="text-xs text-text-muted">Free Plan</div>
        </div>
        <span className="text-text-muted">\u2562</span>
      </div>
    </div>
  );
}
