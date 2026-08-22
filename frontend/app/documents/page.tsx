import AppShell from "@/components/layout/AppShell";

export default function DocumentsPage() {
  return (
    <AppShell>
      <div className="bg-white rounded-2xl border border-border p-6">
        <h1 className="text-xl font-bold text-raah-deep">Document Explainer</h1>
        <p className="text-sm text-text-secondary mt-1">Preview your uploaded form and see field-by-field explanations.</p>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="border border-dashed border-border rounded-xl h-80 flex items-center justify-center text-text-muted bg-raah-soft/50">
            Document Preview (Government Form)
          </div>
          <div className="border border-border rounded-xl p-4 space-y-3">
            <div className="text-sm font-medium">Extracted Data</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-border pb-2"><span className="text-text-secondary">Name</span><span>__________</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-text-secondary">CNIC</span><span className="font-mono">XXXXX-XXXXXXX-X</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-text-secondary">DOB</span><span>__________</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Address</span><span>__________</span></div>
            </div>
            <div className="text-xs text-text-muted">Click a field to see AI explanation. Upload via OCR Scanner to populate.</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
