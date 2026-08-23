"use client";
import { useState } from "react";
import { Upload } from "lucide-react";
import { ocrApi } from "@/lib/api";
import { useLang } from "@/lib/LangContext";

export default function UploadCard({ onComplete }: { onComplete?: (data: any) => void }) {
  const { t, lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState<any>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setStage(t.readingDoc);
    try {
      const fileLang = lang || "en";
      setTimeout(() => setStage(t.understanding), 800);
      const res = await ocrApi(file, fileLang);
      setResult(res);
      if (onComplete) onComplete(res);
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
      setStage("");
      e.target.value = "";
    }
  }

  if (result && !result.error) {
    return (
      <div className="bg-gradient-to-br from-raah-mint to-white rounded-2xl border border-raah-green/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-raah-deep">{t.upload}</div>
          <button
            onClick={() => { setResult(null); }}
            className="text-xs text-raah-green hover:text-raah-deep font-medium"
          >
            Upload New
          </button>
        </div>
        <div className="text-xs text-text-secondary mb-3">Document processed. See results above.</div>
        <div className="text-xs bg-white border border-border rounded-xl p-3">
          <div className="font-medium mb-1">Extracted Fields:</div>
          {result.fields?.map((f: any) => (
            <div key={f.label} className="flex justify-between py-0.5 gap-2">
              <span className="text-text-secondary">{f.label}</span>
              <span className="font-mono text-right truncate">{f.needs_confirmation ? "\u26a0\ufe0f " : ""}{result.masked_fields?.[f.label] || f.value}</span>
            </div>
          ))}
          <div className="mt-2 text-[10px] text-text-muted">\ud83d\udd12 CNIC masked \u2022 Not stored after session</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-raah-mint to-white rounded-2xl border border-border p-4">
      <div className="font-semibold mb-1">{t.upload}</div>
      <div className="text-xs text-text-secondary mb-3">Upload your document and let RaahAI extract & explain it for you.</div>
      <label className={`inline-flex items-center gap-2 px-4 py-2 bg-raah-green text-white rounded-full text-sm font-medium cursor-pointer hover:bg-raah-deep ${loading ? "opacity-60 pointer-events-none" : ""}`}>
        <Upload size={14} />
        {loading ? stage || t.readingDoc : "Upload Document"}
        <input type="file" className="hidden" accept="image/*,.pdf" onChange={onFile} />
      </label>
      {loading && <div className="mt-3 h-2 bg-border rounded-full overflow-hidden"><div className="h-full bg-raah-green animate-pulse" style={{ width: "70%" }} /></div>}
      {result?.error && (
        <div className="mt-3 text-xs bg-white border border-border rounded-xl p-3">
          <div className="text-red-600">Unable to process this document.</div>
          <div className="text-text-muted mt-1">{result.error}</div>
          <button onClick={() => setResult(null)} className="mt-2 px-3 py-1 bg-white border border-border rounded-full">Try Again</button>
        </div>
      )}
    </div>
  );
}
