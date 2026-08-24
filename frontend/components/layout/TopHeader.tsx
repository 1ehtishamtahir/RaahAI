"use client";
import { Bell, Sun, Menu, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/LangContext";
import { useAuth } from "@/lib/AuthContext";
import { notificationsCountApi } from "@/lib/api";

export default function TopHeader({ onMenu }: { onMenu?: () => void }) {
  const { lang } = useLang();
  const { user, logout } = useAuth();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    notificationsCountApi().then((d) => setNotifCount(d.count || 0)).catch(() => {});
  }, [user]);

  return (
    <header className="h-[72px] bg-white border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="lg:hidden p-2 rounded-lg border border-border">
          <Menu size={18} />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="RaahAI" width={36} height={36} className="rounded-xl" priority />
          <span className="text-lg font-bold text-raah-deep tracking-tight">RaahAI</span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            const isDark = document.documentElement.classList.toggle("dark");
            localStorage.setItem("raahai-theme", isDark ? "dark" : "light");
            document.documentElement.style.colorScheme = isDark ? "dark" : "light";
          }}
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-raah-soft transition"
          title="Toggle theme"
        >
          <Sun size={16} />
        </button>
        <Link href="/notifications" className="w-9 h-9 rounded-full border border-border flex items-center justify-center relative hover:bg-raah-soft transition">
          <Bell size={16} />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
              {notifCount > 9 ? "9+" : notifCount}
            </span>
          )}
        </Link>
        <div className="w-9 h-9 rounded-full bg-raah-mint text-raah-green flex items-center justify-center text-sm font-bold">
          {user?.name?.charAt(0) || "U"}
        </div>
        <button onClick={logout} className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-red-50 text-text-muted hover:text-red-500 transition" title="Logout">
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
