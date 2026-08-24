"use client";
import { Bell, Sun, Menu, LogOut, X, FileText, AlertTriangle, CreditCard, Clock, ChevronRight, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import { useAuth } from "@/lib/AuthContext";
import { notificationsApi, notificationsCountApi } from "@/lib/api";

const TYPE_ICONS: Record<string, typeof Bell> = {
  document: FileText,
  challan: AlertTriangle,
  payment: CreditCard,
};

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-green-500",
};

export default function TopHeader({ onMenu }: { onMenu?: () => void }) {
  const { lang, setLang } = useLang();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    notificationsCountApi().then((d) => setNotifCount(d.count || 0)).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!showNotifs) return;
    setLoading(true);
    notificationsApi()
      .then((d) => setNotifications(d.notifications || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [showNotifs, user]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    }
    if (showNotifs) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNotifs]);

  function handleNotifClick(href: string) {
    setShowNotifs(false);
    router.push(href);
  }

  return (
    <header className="h-[72px] bg-white border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50">
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

        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === "en" ? "ur" : "en")}
          className="h-9 px-3 rounded-full border border-border flex items-center gap-1.5 hover:bg-raah-soft transition text-xs font-medium"
          title={lang === "en" ? "اردو میں تبدیل کریں" : "Switch to English"}
        >
          <Globe size={14} />
          {lang === "en" ? "اردو" : "EN"}
        </button>

        {/* Notification Bell + Dropdown */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center relative hover:bg-raah-soft transition"
          >
            <Bell size={16} />
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] bg-white rounded-2xl border border-border shadow-xl overflow-hidden z-50">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-raah-deep" />
                  <span className="font-semibold text-sm text-raah-deep">
                    {lang === "ur" ? "اطلاعات" : "Notifications"}
                  </span>
                  {notifCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-raah-mint text-raah-green text-[10px] font-bold">
                      {notifCount}
                    </span>
                  )}
                </div>
                <button onClick={() => setShowNotifs(false)} className="p-1 rounded-lg hover:bg-raah-soft transition">
                  <X size={14} className="text-text-muted" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto max-h-[400px]">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-gray-100" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-100 rounded w-3/4" />
                          <div className="h-2 bg-gray-50 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell size={24} className="mx-auto text-text-muted mb-2" />
                    <p className="text-sm text-text-muted">
                      {lang === "ur" ? "کوئی اطلاعات نہیں" : "No notifications"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((n) => {
                      const Icon = TYPE_ICONS[n.type] || Bell;
                      return (
                        <button
                          key={n.id}
                          onClick={() => handleNotifClick(n.href)}
                          className="w-full px-4 py-3 flex gap-3 text-left hover:bg-raah-soft/50 transition"
                        >
                          <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center shrink-0">
                            <Icon size={14} className="text-raah-deep" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[n.priority] || "bg-gray-400"}`} />
                              <span className="font-medium text-xs truncate">
                                {lang === "ur" ? n.title_ur : n.title}
                              </span>
                            </div>
                            <div className="text-[11px] text-text-muted mt-0.5 truncate">
                              {lang === "ur" ? n.desc_ur : n.desc}
                            </div>
                            {n.time && (
                              <div className="flex items-center gap-1 text-[10px] text-text-muted mt-1">
                                <Clock size={9} />
                                {n.time}
                              </div>
                            )}
                          </div>
                          <ChevronRight size={12} className="text-text-muted shrink-0 self-center" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-border px-4 py-2.5">
                  <button
                    onClick={() => handleNotifClick("/notifications")}
                    className="w-full text-center text-xs font-medium text-raah-green hover:underline"
                  >
                    {lang === "ur" ? "تمام اطلاعات دیکھیں" : "View all notifications"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

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
