import AppShell from "@/components/layout/AppShell";
import { HelpCircle, Mail, MessageCircle, FileText } from "lucide-react";

export default function HelpPage() {
  return (
    <AppShell>
      <div className="bg-white rounded-2xl border border-border p-6">
        <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><HelpCircle size={20} /> Help & Support</h1>
        <p className="text-sm text-text-secondary mt-1">How RaahAI works and where to get official help.</p>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="border border-border rounded-xl p-4">
            <div className="font-medium flex items-center gap-2"><MessageCircle size={16} className="text-raah-green" /> How to Chat</div>
            <p className="text-sm text-text-secondary mt-2">Ask in Urdu or English: “Passport banwane ka process kya hai?” — RaahAI searches official sources (NADRA, DGIP, SECP) and answers with citations.</p>
          </div>
          <div className="border border-border rounded-xl p-4">
            <div className="font-medium flex items-center gap-2"><FileText size={16} className="text-raah-green" /> OCR Help</div>
            <p className="text-sm text-text-secondary mt-2">Upload a clear photo/PDF of your form. RaahAI extracts fields, flags low-confidence ones for confirmation, and explains them in plain language.</p>
          </div>
        </div>

        <div className="mt-6 border border-border rounded-xl p-4">
          <div className="font-medium">Official Sources</div>
          <ul className="mt-2 space-y-1 text-sm">
            <li><a href="https://dgip.gov.pk" target="_blank" className="text-raah-green underline">DGIP — Passport Directorate ↗</a></li>
            <li><a href="https://nadra.gov.pk" target="_blank" className="text-raah-green underline">NADRA ↗</a></li>
            <li><a href="https://secp.gov.pk" target="_blank" className="text-raah-green underline">SECP ↗</a></li>
          </ul>
          <p className="text-xs text-text-muted mt-3">RaahAI can make mistakes. Always verify important information on the official website.</p>
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm text-text-secondary">
          <Mail size={16} /> support@raahai.pk (mock)
        </div>
      </div>
    </AppShell>
  );
}
