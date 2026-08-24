"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { notificationsApi } from "@/lib/api";
import { Bell, FileText, AlertTriangle, CreditCard, Clock, ChevronRight } from "lucide-react";

const TYPE_ICONS: Record<string, typeof Bell> = {
  document: FileText,
  challan: AlertTriangle,
  payment: CreditCard,
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-50 border-red-200",
  medium: "bg-amber-50 border-amber-200",
  low: "bg-green-50 border-green-200",
};

const TYPE_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-green-500",
};

export default function NotificationsPage() {
  const { lang } = useLang();
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    notificationsApi()
      .then((d) => setItems(d.notifications || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <AppShell>
      <div className="bg-white rounded-2xl border border-border p-6">
        <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2">
          <Bell size={20} /> {lang === "ur" ? "اطلاعات" : "Notifications"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {lang === "ur" ? "آپ کی درخواستوں اور سرکاری نوٹسیس کے بارے میں اپ ڈیٹس۔" : "Updates about your requests and official notices."}
        </p>

        {loading ? (
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border rounded-xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-6 border border-dashed border-border rounded-xl p-12 text-center">
            <Bell size={32} className="mx-auto text-text-muted mb-3" />
            <p className="text-sm text-text-muted">
              {lang === "ur" ? "کوئی اطلاعات نہیں" : "No notifications yet"}
            </p>
            <p className="text-xs text-text-muted mt-1">
              {lang === "ur" ? "جب آپ کے دستاویز یا ادائیگیاں اپ ڈیٹ ہوں گی تو یہاں دکھائی دیں گی" : "You'll see updates here when your documents or payments need attention"}
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {items.map((n) => {
              const Icon = TYPE_ICONS[n.type] || Bell;
              return (
                <button
                  key={n.id}
                  onClick={() => n.href && router.push(n.href)}
                  className={`w-full border rounded-xl p-4 flex gap-3 text-left hover:shadow-sm transition ${PRIORITY_COLORS[n.priority] || "border-border"}`}
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-raah-deep" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${TYPE_DOT[n.priority] || "bg-gray-400"}`} />
                      <span className="font-medium text-sm truncate">
                        {lang === "ur" ? n.title_ur : n.title}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted mt-0.5">
                      {lang === "ur" ? n.desc_ur : n.desc}
                    </div>
                    {n.time && (
                      <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
                        <Clock size={10} />
                        {n.time}
                      </div>
                    )}
                  </div>
                  {n.href && (
                    <ChevronRight size={16} className="text-text-muted shrink-0 self-center" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
