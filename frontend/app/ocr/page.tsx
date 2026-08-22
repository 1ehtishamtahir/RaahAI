import AppShell from "@/components/layout/AppShell";
import UploadCard from "@/components/documents/UploadCard";

export default function OCRPage() {
  return (
    <AppShell>
      <div className="bg-white rounded-2xl border border-border p-6">
        <h1 className="text-xl font-bold text-raah-deep">OCR Scanner</h1>
        <p className="text-sm text-text-secondary mt-1">Upload a government form (image or PDF). RaahAI will extract fields, flag low-confidence ones, and explain them.</p>
        <div className="mt-6 max-w-xl">
          <UploadCard />
        </div>
        <div className="mt-6 text-xs text-text-muted">
          Flow: Upload → Document Detection → OCR Extraction → Field Recognition → AI Explanation → Checklist / Guidance
        </div>
      </div>
    </AppShell>
  );
}
