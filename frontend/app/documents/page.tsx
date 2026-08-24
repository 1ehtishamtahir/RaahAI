"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { ScanLine, FileText, Wallet, ArrowRight, Clock, Shield, Upload, Eye, Sparkles, Loader2 } from "lucide-react";
import { alertsApi, aiDocumentAdvisor } from "@/lib/api";

export default function DocumentsPage() {
  const { lang } = useLang();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [advisorText, setAdvisorText] = useState("");
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [showAdvisor, setShowAdvisor] = useState(false);
  useEffect(()=>{ alertsApi().then(setAlerts).catch(()=>{}); },[]);

  const expiring = alerts.filter((a:any)=>a.status==="expiring_soon").length;
  const expired = alerts.filter((a:any)=>a.status==="expired").length;

  const handleGetAdvisor = async () => {
    setShowAdvisor(true);
    setAdvisorLoading(true);
    setAdvisorText("");
    try {
      const fields = alerts.map((a: any) => ({ label: a.document_type, value: a.document_name_en || a.custom_type_name || a.document_type }));
      const res = await aiDocumentAdvisor(fields, "general", lang);
      setAdvisorText(res.advisor);
    } catch {
      setAdvisorText("Unable to generate document advice. Please try again.");
    } finally {
      setAdvisorLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><FileText size={20}/> Documents</h1>
          <p className="text-sm text-text-secondary mt-1">Scanner • Explainer • My Documents (Wallet) — unified hub</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-border rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-raah-deep">{alerts.length}</div>
            <div className="text-xs text-text-muted">My Documents</div>
            <div className="text-[10px] text-raah-green">Wallet</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-amber-600">{expiring}</div>
            <div className="text-xs text-text-muted">Expiring Soon</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-red-600">{expired}</div>
            <div className="text-xs text-text-muted">Expired</div>
          </div>
        </div>

        {/* AI Document Advisor */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-emerald-200" />
            <span className="font-semibold text-sm">AI Document Advisor</span>
          </div>
          <p className="text-xs opacity-80 mb-3">Get personalized recommendations based on your documents — what services you need, checklist, and fees.</p>
          {!showAdvisor ? (
            <button onClick={handleGetAdvisor} className="px-4 py-2 bg-white text-emerald-700 rounded-full text-sm font-medium hover:bg-emerald-50 transition">
              Analyze My Documents
            </button>
          ) : (
            <div className="bg-white/10 rounded-xl p-4 mt-2">
              {advisorLoading ? (
                <div className="flex items-center gap-2 text-sm opacity-80"><Loader2 size={14} className="animate-spin"/> Analyzing documents...</div>
              ) : (
                <div className="text-sm leading-relaxed whitespace-pre-line opacity-90">{advisorText}</div>
              )}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/ocr" className="bg-white border border-border rounded-2xl p-6 hover:border-raah-green/30 hover:shadow-sm transition group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center"><ScanLine size={18}/></div>
              <span className="text-xs px-2 py-1 rounded-full bg-raah-mint text-raah-deep border border-raah-green/20">AI Vision</span>
            </div>
            <div className="font-semibold mt-3">Document Scanner (OCR)</div>
            <div className="text-sm text-text-secondary mt-1">Upload image/PDF → extract fields → explain → mask CNIC</div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-full bg-raah-green text-white flex items-center gap-1"><Upload size={12}/> Scan Now</span>
              <span className="text-text-muted">Gemini Vision • PaddleOCR</span>
            </div>
            <div className="text-xs text-raah-green mt-3 flex items-center gap-1">Open Scanner <ArrowRight size={12} className="group-hover:translate-x-1 transition"/></div>
          </Link>

          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center"><FileText size={18}/></div>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">EN / UR</span>
            </div>
            <div className="font-semibold mt-3">Document Explainer</div>
            <div className="text-sm text-text-secondary mt-1">Field-by-field AI explanation in English/Urdu</div>
            <div className="mt-4 border border-dashed border-border rounded-xl p-4 bg-raah-soft/50 space-y-2 text-sm">
              <div className="flex justify-between border-b border-border pb-2"><span className="text-text-secondary">Name</span><span className="font-medium">Ahmed Khan</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-text-secondary">CNIC</span><span className="font-mono flex items-center gap-1"><Shield size={12} className="text-raah-green"/> XXXXX-XXXXXXX-X</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">DOB</span><span>01-01-1990</span></div>
            </div>
            <div className="text-xs text-text-muted mt-2 flex items-center gap-1"><Eye size={12}/> Click a field to see AI explanation • Upload via Scanner to populate • 🔒 Not stored after session</div>
            <Link href="/ocr" className="mt-3 inline-flex items-center gap-1 text-xs text-raah-green hover:underline">Try Scanner →</Link>
          </div>

          <Link href="/alerts" className="bg-white border border-border rounded-2xl p-6 hover:border-raah-green/30 hover:shadow-sm transition group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center"><Wallet size={18}/></div>
              <span className={`text-xs px-2 py-1 rounded-full border ${expired?"bg-red-50 text-red-700 border-red-200":expiring?"bg-amber-50 text-amber-700 border-amber-200":"bg-raah-mint text-raah-deep border-raah-green/20"}`}>
                {expired?`${expired} expired`:expiring?`${expiring} expiring`:"All valid"}
              </span>
            </div>
            <div className="font-semibold mt-3">My Documents (Wallet)</div>
            <div className="text-sm text-text-secondary mt-1">Store docs with images — view, download, expiry alerts & renewal</div>
            <div className="mt-3 space-y-2">
              {alerts.slice(0,2).map((a:any)=>(
                <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-raah-soft border border-border text-xs">
                  <span className="font-medium">{a.document_name_en}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${a.status==="expired"?"bg-red-100 text-red-700":a.status==="expiring_soon"?"bg-amber-100 text-amber-700":"bg-raah-mint text-raah-green"}`}>{a.status}</span>
                </div>
              ))}
              {!alerts.length && <div className="text-xs text-text-muted">No documents yet — add via Wallet</div>}
            </div>
            <div className="text-xs text-raah-green mt-3 flex items-center gap-1">Open Wallet <ArrowRight size={12} className="group-hover:translate-x-1 transition"/></div>
          </Link>
        </div>

        <div className="bg-raah-soft border border-border rounded-xl p-3 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1"><Clock size={12}/> Recent: No scans yet — upload a form to see AI-masked results</span>
          <Link href="/ocr" className="px-3 py-1 rounded-full bg-raah-green text-white">Scan Document</Link>
        </div>

        <div className="text-[11px] text-text-muted text-center">✓ Grounded in official sources • Sources + last-verified shown • Consent before accessing records • 🔒 CNIC masked</div>
      </div>
    </AppShell>
  );
}
