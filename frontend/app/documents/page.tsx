"use client";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { ScanLine, FileText, Wallet, ListChecks, ArrowRight } from "lucide-react";

export default function DocumentsPage() {
  const { lang } = useLang();
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><FileText size={20}/> Documents</h1>
          <p className="text-sm text-text-secondary mt-1">Scanner • Explainer • My Documents (Wallet) • Dynamic Checklist — unified hub</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/ocr" className="bg-white border border-border rounded-2xl p-6 hover:border-raah-green/30 hover:shadow-sm transition group">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center"><ScanLine size={18}/></div>
            <div className="font-semibold mt-3">Document Scanner (OCR)</div>
            <div className="text-sm text-text-secondary mt-1">Upload image/PDF → extract fields → explain → mask CNIC</div>
            <div className="text-xs text-raah-green mt-3 flex items-center gap-1">Open Scanner <ArrowRight size={12} className="group-hover:translate-x-1 transition"/></div>
          </Link>
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center"><FileText size={18}/></div>
            <div className="font-semibold mt-3">Document Explainer</div>
            <div className="text-sm text-text-secondary mt-1">Field-by-field AI explanation in English/Urdu</div>
            <div className="mt-4 border border-dashed border-border rounded-xl p-4 bg-raah-soft/50 space-y-2 text-sm">
              <div className="flex justify-between border-b border-border pb-2"><span className="text-text-secondary">Name</span><span>__________</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-text-secondary">CNIC</span><span className="font-mono">XXXXX-XXXXXXX-X</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">DOB</span><span>__________</span></div>
            </div>
            <div className="text-xs text-text-muted mt-2">Upload via Scanner to populate • 🔒 Not stored after session</div>
          </div>
          <Link href="/alerts" className="bg-white border border-border rounded-2xl p-6 hover:border-raah-green/30 hover:shadow-sm transition group">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center"><Wallet size={18}/></div>
            <div className="font-semibold mt-3">My Documents (Wallet)</div>
            <div className="text-sm text-text-secondary mt-1">Store your docs securely — expiry alerts & renewal links</div>
            <div className="text-xs text-raah-green mt-3 flex items-center gap-1">Open Wallet <ArrowRight size={12} className="group-hover:translate-x-1 transition"/></div>
          </Link>
          <Link href="/checklist" className="bg-white border border-border rounded-2xl p-6 hover:border-raah-green/30 hover:shadow-sm transition group">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center"><ListChecks size={18}/></div>
            <div className="font-semibold mt-3">Dynamic Checklist</div>
            <div className="text-sm text-text-secondary mt-1">Personalized checklist per service & situation — with progress</div>
            <div className="text-xs text-raah-green mt-3 flex items-center gap-1">Open Checklist <ArrowRight size={12} className="group-hover:translate-x-1 transition"/></div>
          </Link>
        </div>

        <div className="text-[11px] text-text-muted text-center">✓ Grounded in official sources • Sources + last-verified shown • Consent before accessing records</div>
      </div>
    </AppShell>
  );
}
