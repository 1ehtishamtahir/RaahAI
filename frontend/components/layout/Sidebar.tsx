"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, FileText, ScanLine, Mic, ListChecks, History, Bookmark, Bell, Settings, HelpCircle, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/LangContext";

const nav = [
  { href: "/", label: "Chat Assistant", icon: MessageCircle },
  { href: "/documents", label: "Document Explainer", icon: FileText },
  { href: "/ocr", label: "OCR Scanner", icon: ScanLine },
  { href: "/voice", label: "Voice Assistant", icon: Mic },
  { href: "/checklist", label: "My Checklist", icon: ListChecks },
  { href: "/history", label: "History", icon: History },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help & Support", icon: HelpCircle },
];

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
          <div className="text-[11px] text-text-secondary leading-none">Your Smart Guide to Government Services</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 mt-4 overflow-y-auto">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
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
              <span className="flex-1">{item.label}</span>
              {active && <span className="text-raah-green">›</span>}
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
          <div className="text-xs text-text-muted">Free Plan</div>
        </div>
        <span className="text-text-muted">˅</span>
      </div>

      {/* Decorative */}
      <div className="mt-3 h-24 rounded-xl bg-gradient-to-t from-raah-mint to-white border border-border/50 flex items-end justify-center p-2 text-[10px] text-raah-green/60">
        Minar-e-Pakistan • Crescent • Mosque
      </div>
    </div>
  );
}
