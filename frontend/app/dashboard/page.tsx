"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { citizenDashboardApi } from "@/lib/api";
import Link from "next/link";
import { Shield, Car, AlertTriangle, CreditCard, FileText, GraduationCap, Users, Bell, ArrowRight, CheckCircle, Clock } from "lucide-react";

const MENU = [
  { key: "identity", href: "/identity", icon: Shield, color: "bg-emerald-600", label_en: "Identity", label_ur: "شناخت", desc_en: "CNIC, Passport, FRC, Birth & more", desc_ur: "شناختی کارڈ، پاسپورٹ، ایف آر سی" },
  { key: "vehicle", href: "/vehicle", icon: Car, color: "bg-blue-600", label_en: "Vehicle", label_ur: "گاڑی", desc_en: "Registration, Transfer, Token Tax", desc_ur: "رجسٹریشن، ٹرانسفر، ٹوکن ٹیکس" },
  { key: "challans", href: "/challans", icon: AlertTriangle, color: "bg-amber-600", label_en: "Challans", label_ur: "چالان", desc_en: "Pending & Paid Challans", desc_ur: "زیر التواء اور ادا شدہ چالان" },
  { key: "payments", href: "/payments", icon: CreditCard, color: "bg-violet-600", label_en: "Gov Payments", label_ur: "سرکاری ادائیگیاں", desc_en: "Fees, Taxes, Timeline", desc_ur: "فیس، ٹیکس، ٹائم لائن" },
  { key: "documents", href: "/ocr", icon: FileText, color: "bg-teal-600", label_en: "Documents", label_ur: "دستاویزات", desc_en: "Scanner, Wallet, Checklist", desc_ur: "اسکینر، والٹ، چیک لسٹ" },
  { key: "opportunities", href: "/opportunities", icon: GraduationCap, color: "bg-indigo-600", label_en: "Opportunities", label_ur: "مواقع", desc_en: "Scholarships & Youth Programs", desc_ur: "اسکالرشپ اور یوتھ پروگرام" },
  { key: "family", href: "/family", icon: Users, color: "bg-rose-600", label_en: "Family Programs", label_ur: "فیملی پروگرام", desc_en: "Household & Program Matching", desc_ur: "گھرانہ اور پروگرام میچنگ" },
  { key: "updates", href: "/updates", icon: Bell, color: "bg-orange-600", label_en: "Gov Updates", label_ur: "سرکاری اپ ڈیٹس", desc_en: "Radar & Policy Categories", desc_ur: "ریڈار اور پالیسی زمرہ جات" },
];

export default function DashboardPage() {
  const { lang } = useLang();
  const [data, setData] = useState<any>(null);
  useEffect(() => { citizenDashboardApi().then(setData).catch(() => {}); }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-raah-green to-emerald-700 rounded-2xl p-6 text-white">
          <div className="text-sm opacity-80">Citizen Command Center</div>
          <div className="text-2xl font-bold mt-1">Welcome, {data?.citizen?.name || "Ehtisham Tahir"} 👋</div>
          <div className="text-sm opacity-80 mt-1">{data?.citizen?.cnic || "42101-1234567-1"} • {data?.citizen?.city || "Karachi"}</div>
          <div className="mt-3 flex gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-white/20">Your Government. Your Data. Your AI Copilot.</span>
          </div>
        </div>

        {/* Summary */}
        {data?.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="text-xs text-text-muted">Identity</div>
              <div className="font-bold text-raah-deep">{data.summary.identity.cnic_status} • {data.summary.identity.passport_status}</div>
              <div className="text-xs text-amber-600 mt-1 flex items-center gap-1"><Clock size={12}/>{data.summary.identity.pending} pending</div>
            </div>
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="text-xs text-text-muted">Vehicles</div>
              <div className="font-bold text-raah-deep">{data.summary.vehicle.count} vehicles</div>
              <div className="text-xs text-amber-600 mt-1">{data.summary.vehicle.pending_token} token pending</div>
            </div>
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="text-xs text-text-muted">Challans</div>
              <div className="font-bold text-raah-deep">{data.summary.challans.pending} pending</div>
              <div className="text-xs text-red-600 mt-1">PKR {data.summary.challans.pending_amount?.toLocaleString()}</div>
            </div>
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="text-xs text-text-muted">Payments</div>
              <div className="font-bold text-raah-deep">{data.summary.payments.pending} pending</div>
              <div className="text-xs text-amber-600 mt-1">PKR {data.summary.payments.pending_amount?.toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Menu Grid */}
        <div>
          <h2 className="font-bold text-raah-deep mb-3">Your Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MENU.map((m) => (
              <Link key={m.key} href={m.href} className="bg-white border border-border rounded-2xl p-4 hover:shadow-md hover:border-raah-green/30 transition group">
                <div className={`w-10 h-10 rounded-xl ${m.color} text-white flex items-center justify-center mb-3`}><m.icon size={18}/></div>
                <div className="font-semibold text-sm text-raah-deep">{lang==="ur"?m.label_ur:m.label_en}</div>
                <div className="text-xs text-text-muted mt-1 line-clamp-1">{lang==="ur"?m.desc_ur:m.desc_en}</div>
                <div className="text-xs text-raah-green mt-2 flex items-center gap-1 group-hover:gap-2 transition-all">Open <ArrowRight size={12}/></div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        {data?.quick_actions && (
          <div className="bg-white border border-border rounded-2xl p-4">
            <div className="font-semibold text-sm mb-3">Quick Actions</div>
            <div className="flex gap-2 flex-wrap">
              {data.quick_actions.map((a:any) => (
                <Link key={a.href} href={a.href} className="px-4 py-2 rounded-full bg-raah-mint border border-raah-green/20 text-sm text-raah-deep hover:bg-raah-green hover:text-white transition">
                  {lang==="ur"?a.label_ur:a.label_en}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Trust bar */}
        <div className="text-[11px] text-text-muted text-center border-t border-border pt-4">
          ✓ Official sources only • <span className="text-raah-green">Sources shown + last-verified</span> • AI recommendation ≠ official decision
        </div>
      </div>
    </AppShell>
  );
}
