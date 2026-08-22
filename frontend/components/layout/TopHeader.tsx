"use client";
import { Mic, Bell, Sun, Menu } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";

export default function TopHeader({ onMenu }: { onMenu?: () => void }) {
  const { t } = useLang();
  return (
    <header className="h-[72px] bg-white border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="lg:hidden p-2 rounded-lg border border-border">
          <Menu size={18} />
        </button>
        <div>
          <div className="font-semibold flex items-center gap-2">
            <span>👋</span> {t.greeting.split("!")[0]}!
          </div>
          <div className="text-sm text-text-secondary">{t.greeting.split("!")[1] || "I'm RaahAI, how can I help you today?"}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/voice" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-raah-green text-raah-green font-medium text-sm hover:bg-raah-mint">
          <Mic size={16} /> {t.voiceMode}
        </Link>
        <button
          onClick={() => {
            const isDark = document.documentElement.classList.toggle("dark");
            localStorage.setItem("raahai-theme", isDark ? "dark" : "light");
            document.documentElement.style.colorScheme = isDark ? "dark" : "light";
          }}
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-raah-soft"
          title="Toggle theme"
        >
          <Sun size={16} />
        </button>
        <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center relative">
          <Bell size={16} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <img src="https://i.pravatar.cc/100?img=12" alt="avatar" className="w-9 h-9 rounded-full hidden sm:block" />
      </div>
    </header>
  );
}
