"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { citizenDashboardApi, aiDashboardSuggestions, aiDeadlines } from "@/lib/api";
import Link from "next/link";
import { Shield, Car, AlertTriangle, CreditCard, FileText, GraduationCap, Users, Bell, ArrowRight, CheckCircle, Clock, Building2, ClipboardCheck, Sparkles, Calendar } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const MENU = [
  { key: "identity", href: "/identity", icon: Shield, color: "bg-emerald-600", label_en: "Identity", label_ur: "شناخت", desc_en: "CNIC, Passport, FRC, Birth & more", desc_ur: "شناختی کارڈ، پاسپورٹ، ایف آر سی" },
  { key: "vehicle", href: "/vehicle", icon: Car, color: "bg-blue-600", label_en: "Vehicle", label_ur: "گاڑی", desc_en: "Registration, Transfer, Token Tax", desc_ur: "رجسٹریشن، ٹرانسفر، ٹوکن ٹیکس" },
  { key: "challans", href: "/challans", icon: AlertTriangle, color: "bg-amber-600", label_en: "Challans", label_ur: "چالان", desc_en: "Pending & Paid Challans", desc_ur: "زیر التواء اور ادا شدہ چالان" },
  { key: "payments", href: "/payments", icon: CreditCard, color: "bg-violet-600", label_en: "Gov Payments", label_ur: "سرکاری ادائیگیاں", desc_en: "Fees, Taxes, Timeline", desc_ur: "فیس، ٹیکس، ٹائم لائن" },
  { key: "documents", href: "/documents", icon: FileText, color: "bg-teal-600", label_en: "Documents", label_ur: "دستاویزات", desc_en: "Scanner, Wallet, Checklist", desc_ur: "اسکینر، والٹ، چیک لسٹ" },
  { key: "opportunities", href: "/opportunities", icon: GraduationCap, color: "bg-indigo-600", label_en: "Opportunities", label_ur: "مواقع", desc_en: "Scholarships & Youth Programs", desc_ur: "اسکالرشپ اور یوتھ پروگرام" },
  { key: "family", href: "/family", icon: Users, color: "bg-rose-600", label_en: "Family Programs", label_ur: "فیملی پروگرام", desc_en: "Household & Program Matching", desc_ur: "گھرانہ اور پروگرام میچنگ" },
  { key: "updates", href: "/updates", icon: Bell, color: "bg-orange-600", label_en: "Gov Updates", label_ur: "سرکاری اپ ڈیٹس", desc_en: "Radar & Policy Categories", desc_ur: "ریڈار اور پالیسی زمرہ جات" },
  { key: "offices", href: "/offices", icon: Building2, color: "bg-slate-600", label_en: "Office Locator", label_ur: "دفتر تلاش", desc_en: "Find NADRA, DGIP & SECP Offices", desc_ur: "نادرا، ڈی جی آئی پی اور ایس ای سی پی دفتر" },
];

export default function DashboardPage() {
  const { lang } = useLang();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [deadlines, setDeadlines] = useState<any>(null);
  useEffect(() => { citizenDashboardApi().then(setData).catch(() => {}); aiDashboardSuggestions().then(setAiSuggestions).catch(() => {}); aiDeadlines().then(setDeadlines).catch(() => {}); }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-raah-green via-emerald-700 to-raah-deep rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full"/>
          <div className="absolute -right-2 -bottom-10 w-24 h-24 bg-white/5 rounded-full"/>
          {!data ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 w-32 bg-white/20 rounded"/>
              <div className="h-6 w-48 bg-white/20 rounded"/>
              <div className="h-3 w-40 bg-white/20 rounded"/>
            </div>
          ) : (
            <div className="relative z-10">
              <div className="text-xs font-medium uppercase tracking-widest opacity-60 mb-1">Citizen Command Center</div>
              <div className="text-2xl font-bold mt-1">
                Welcome, {user?.name || data?.citizen?.name || "Citizen"}
              </div>
              <div className="text-sm opacity-80 mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300"/>
                {user?.cnic || data?.citizen?.cnic || ""}
                <span className="opacity-40 mx-1">|</span>
                {user?.city || data?.citizen?.city || ""}
              </div>
              <div className="mt-3">
                <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-medium backdrop-blur-sm">Your Government. Your Data. Your AI Copilot.</span>
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        {!data ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white border border-border rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-200"/>
                  <div className="h-3 w-16 bg-gray-200 rounded"/>
                </div>
                <div className="h-4 w-24 bg-gray-200 rounded mt-1"/>
                <div className="h-3 w-20 bg-gray-100 rounded mt-2"/>
              </div>
            ))}
          </div>
        ) : data?.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/identity" className="bg-white border border-border rounded-xl p-4 hover:shadow-md hover:border-raah-green/30 transition group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><Shield size={16} className="text-emerald-600"/></div>
                <span className="text-xs text-text-muted">{lang==="ur"?"شناخت":"Identity"}</span>
              </div>
              <div className="font-bold text-sm text-raah-deep">{data.summary.identity.cnic_status} • {data.summary.identity.passport_status}</div>
              <div className="text-xs text-amber-600 mt-1 flex items-center gap-1"><Clock size={12}/>{data.summary.identity.pending} {lang==="ur"?"زیر التواء":"pending"}</div>
            </Link>

            <Link href="/vehicle" className="bg-white border border-border rounded-xl p-4 hover:shadow-md hover:border-raah-green/30 transition group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><Car size={16} className="text-blue-600"/></div>
                <span className="text-xs text-text-muted">{lang==="ur"?"گاڑی":"Vehicles"}</span>
              </div>
              <div className="font-bold text-sm text-raah-deep">{data.summary.vehicle.count} {lang==="ur"?"گاڑیاں":"vehicles"}</div>
              <div className="text-xs text-amber-600 mt-1">{data.summary.vehicle.pending_token} {lang==="ur"?"ٹوکن زیر التواء":"token pending"}</div>
            </Link>

            <Link href="/challans" className="bg-white border border-border rounded-xl p-4 hover:shadow-md hover:border-raah-green/30 transition group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center"><AlertTriangle size={16} className="text-amber-600"/></div>
                <span className="text-xs text-text-muted">{lang==="ur"?"چالان":"Challans"}</span>
              </div>
              <div className="font-bold text-sm text-raah-deep">{data.summary.challans.pending} {lang==="ur"?"زیر التواء":"pending"}</div>
              <div className="text-xs text-red-600 mt-1">PKR {data.summary.challans.pending_amount?.toLocaleString()}</div>
            </Link>

            <Link href="/payments" className="bg-white border border-border rounded-xl p-4 hover:shadow-md hover:border-raah-green/30 transition group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center"><CreditCard size={16} className="text-violet-600"/></div>
                <span className="text-xs text-text-muted">{lang==="ur"?"ادائیگیاں":"Payments"}</span>
              </div>
              <div className="font-bold text-sm text-raah-deep">{data.summary.payments.pending} {lang==="ur"?"زیر التواء":"pending"}</div>
              <div className="text-xs text-amber-600 mt-1">PKR {data.summary.payments.pending_amount?.toLocaleString()}</div>
            </Link>
          </div>
        )}

        {/* AI Suggestions Widget */}
        {aiSuggestions && aiSuggestions.data_summary && aiSuggestions.data_summary.length > 0 && (
          <div className="bg-gradient-to-r from-raah-deep to-emerald-800 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-emerald-300" />
              <span className="font-semibold text-sm">AI Copilot Suggestions</span>
              {aiSuggestions.priority_count > 0 && (
                <span className="ml-auto text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                  {aiSuggestions.priority_count} urgent
                </span>
              )}
            </div>
            <div className="space-y-2">
              {aiSuggestions.data_summary.map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm opacity-90">
                  <span className="mt-0.5">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            {aiSuggestions.suggestions && (
              <div className="mt-3 text-xs text-emerald-200 leading-relaxed whitespace-pre-line">{aiSuggestions.suggestions}</div>
            )}
          </div>
        )}

        {/* Deadline Timeline */}
        {deadlines && deadlines.deadlines && deadlines.deadlines.length > 0 && (
          <div className="bg-white border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-raah-green" />
              <span className="font-semibold text-sm">Upcoming Deadlines</span>
              {deadlines.urgent_count > 0 && (
                <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {deadlines.urgent_count} urgent
                </span>
              )}
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {deadlines.deadlines.slice(0, 8).map((d: any, i: number) => (
                <div key={i} className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
                  d.status === "expired" || d.status === "overdue" ? "bg-red-50 border border-red-200" :
                  d.status === "expiring_soon" || d.status === "due_soon" ? "bg-amber-50 border border-amber-200" :
                  "bg-raah-soft border border-border"
                }`}>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    d.status === "expired" || d.status === "overdue" ? "bg-red-500" :
                    d.status === "expiring_soon" || d.status === "due_soon" ? "bg-amber-500" : "bg-raah-green"
                  }`}/>
                  <span className="flex-1 truncate">{d.name}</span>
                  <span className="text-xs text-text-muted whitespace-nowrap">{d.date}</span>
                  <span className={`text-xs font-medium whitespace-nowrap ${
                    d.status === "expired" || d.status === "overdue" ? "text-red-600" :
                    d.status === "expiring_soon" || d.status === "due_soon" ? "text-amber-600" : "text-raah-green"
                  }`}>
                    {d.days_left < 0 ? `${Math.abs(d.days_left)}d overdue` : `${d.days_left}d left`}
                  </span>
                  {d.amount && <span className="text-xs font-medium">PKR {d.amount.toLocaleString()}</span>}
                </div>
              ))}
            </div>
            {deadlines.deadlines.length > 8 && (
              <div className="text-xs text-text-muted mt-2 text-center">+{deadlines.deadlines.length - 8} more deadlines</div>
            )}
          </div>
        )}

        {/* Menu Grid */}
        <div>
          <h2 className="font-bold text-raah-deep mb-3">Your Services</h2>
          {!data ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white border border-border rounded-2xl p-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 mb-3"/>
                  <div className="h-4 w-24 bg-gray-200 rounded"/>
                  <div className="h-3 w-32 bg-gray-100 rounded mt-2"/>
                  <div className="h-3 w-16 bg-gray-100 rounded mt-3"/>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {MENU.map((m) => (
                <Link key={m.key} href={m.href} className="bg-white border border-border rounded-2xl p-4 hover:shadow-md hover:border-raah-green/30 transition group">
                  <div className={`w-10 h-10 rounded-xl ${m.color} text-white flex items-center justify-center mb-3`}><m.icon size={18}/></div>
                  <div className={`font-semibold text-sm text-raah-deep ${lang==="ur"?"font-urdu":""}`}>{lang==="ur"?m.label_ur:m.label_en}</div>
                  <div className={`text-xs text-text-muted mt-1 line-clamp-1 ${lang==="ur"?"font-urdu":""}`}>{lang==="ur"?m.desc_ur:m.desc_en}</div>
                  <div className="text-xs text-raah-green mt-2 flex items-center gap-1 group-hover:gap-2 transition-all">Open <ArrowRight size={12}/></div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {!data ? (
          <div className="bg-white border border-border rounded-2xl p-4 animate-pulse">
            <div className="h-4 w-28 bg-gray-200 rounded mb-3"/>
            <div className="flex gap-2">
              {[1,2,3].map(i => <div key={i} className="h-8 w-24 bg-gray-200 rounded-full"/>)}
            </div>
          </div>
        ) : data?.quick_actions && (
          <div className="bg-white border border-border rounded-2xl p-4">
            <div className="font-semibold text-sm mb-3">Quick Actions</div>
            <div className="flex gap-2 flex-wrap">
              {data.quick_actions.map((a:any) => (
                <Link key={a.href} href={a.href} className={`px-4 py-2 rounded-full bg-raah-mint border border-raah-green/20 text-sm text-raah-deep hover:bg-raah-green hover:text-white transition ${lang==="ur"?"font-urdu":""}`}>
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
