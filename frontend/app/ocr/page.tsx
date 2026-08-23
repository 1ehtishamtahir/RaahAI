"use client";
import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import UploadCard from "@/components/documents/UploadCard";
import { useLang } from "@/lib/LangContext";
import { CheckCircle, AlertTriangle, MessageCircle, Send, Sparkles } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Field = {
  label: string;
  value: string;
  confidence: number;
  needs_confirmation: boolean;
  explanation?: string;
};

type OCRResult = {
  fields: Field[];
  raw_text: string;
  masked_fields: Record<string, string>;
  matched_service?: { service: string; confidence: number; reasons: string[]; scores: Record<string, number> };
};

const SERVICE_MAP: Record<string, { en: string; ur: string; color: string }> = {
  passport: { en: "Passport", ur: "\u067e\u0627\u0633\u067e\u0648\u0631\u0679", color: "bg-green-100 text-green-700 border-green-200" },
  cnic: { en: "CNIC", ur: "\u0634\u0646\u0627\u062e\u062a\u06cc \u06a9\u0627\u0631\u062f", color: "bg-blue-100 text-blue-700 border-blue-200" },
  business_registration: { en: "Business", ur: "\u06a9\u0627\u0631\u0648\u0628\u0627\u0631", color: "bg-purple-100 text-purple-700 border-purple-200" },
};

export default function OCRPage() {
  const { lang } = useLang();
  const [result, setResult] = useState<OCRResult | null>(null);
  const [followQ, setFollowQ] = useState("");
  const [followA, setFollowA] = useState("");
  const [followLoading, setFollowLoading] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);

  function handleOCRComplete(data: OCRResult) {
    setResult(data);
  }

  async function askFollowUp(field: Field) {
    if (!followQ.trim()) return;
    setFollowLoading(true);
    setFollowA("");
    try {
      const fd = new FormData();
      fd.append("field_label", field.label);
      fd.append("field_value", field.value);
      fd.append("question", followQ);
      fd.append("lang", lang);
      const res = await fetch(`${API}/ocr/ask`, { method: "POST", body: fd });
      const data = await res.json();
      setFollowA(data.answer);
    } catch {
      setFollowA("Could not process your question. Please try again.");
    }
    setFollowLoading(false);
  }

  return (
    <AppShell>
      <div className="bg-white rounded-2xl border border-border p-6">
        <h1 className="text-xl font-bold text-raah-deep">
          {lang === "ur" ? "\u0627\u0648 \u0688\u06cc \u0627\u0688\u0631 \u0627\u0633\u0686\u0646\u0631" : "OCR Scanner"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {lang === "ur" ? "\u0633\u0631\u06a9\u0627\u0631\u06cc \u0641\u0627\u0631\u0645 \u0627\u067e\u0644\u0648\u0688 \u06a9\u0631\u06cc\u0646\u060c \u0631\u0627\u06c1 \u0622\u0626\u06cc \u0641\u06cc\u0644\u0688\u0632 \u0646\u06a9\u0627\u0644\u0624\u062c\u06cc\u0646 \u06a9\u0631\u06d2\u061c\u061c \u0627\u0648\u0631 \u0628\u0631\u0627\u06c1\u06cc \u0633\u0648\u0627\u0644 \u067e\u0648\u0686\u06be\u06cc\u0646 \u06a9\u0631\u06cc\u0646" : "Upload a government form. RaahAI will extract fields, identify the service, and explain each field."}
        </p>

        <div className="mt-6 max-w-xl">
          <UploadCard onComplete={handleOCRComplete} />
        </div>

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-4">
            {/* Service Match */}
            {result.matched_service && result.matched_service.service && (
              <div className="p-4 rounded-xl bg-raah-soft border border-raah-green/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-raah-green" />
                  <span className="font-semibold text-sm text-raah-deep">
                    {lang === "ur" ? "\u0634\u063a\u0644 \u062f\u0631\u06cc\u0627\u0628 \u06a9\u0631\u062f\u0627 \u062c\u0627 \u0626\u0627\u06cc\u0627" : "Service Detected"}
                  </span>
                </div>
                {(() => {
                  const svcInfo = SERVICE_MAP[result.matched_service.service];
                  return svcInfo ? (
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${svcInfo.color}`}>
                      {lang === "ur" ? svcInfo.ur : svcInfo.en}
                      <span className="text-xs opacity-70">({Math.round(result.matched_service.confidence * 100)}%)</span>
                    </div>
                  ) : null;
                })()}
                {result.matched_service.reasons && (
                  <div className="text-xs text-text-muted mt-2">
                    {result.matched_service.reasons.map((r: string, i: number) => (
                      <span key={i}> {r}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Extracted Fields */}
            <div>
              <h2 className="font-semibold text-sm text-raah-deep mb-3">
                {lang === "ur" ? "\u0646\u06a9\u0644\u06d2 \u063a\u06cc\u0631 \u06c1\u0648\u06a9\u06c1\u06d4 \u0641\u06cc\u0644\u0688\u0632" : "Extracted Fields"}
              </h2>
              <div className="space-y-2">
                {result.fields.map((f, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedField(selectedField?.label === f.label ? null : f)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      selectedField?.label === f.label
                        ? "border-raah-green bg-raah-mint"
                        : "border-border bg-white hover:border-raah-green/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          f.confidence >= 0.9 ? "bg-raah-mint text-raah-green" : "bg-yellow-50 text-yellow-600"
                        }`}>
                          {f.confidence >= 0.9 ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                        </div>
                        <div>
                          <div className="text-xs text-text-muted">{f.label}</div>
                          <div className="font-medium text-sm">{f.value}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-medium ${f.confidence >= 0.9 ? "text-raah-green" : "text-yellow-600"}`}>
                          {Math.round(f.confidence * 100)}%
                        </div>
                        {f.explanation && (
                          <div className="text-xs text-text-muted mt-0.5 max-w-[200px] truncate">{f.explanation}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up Question */}
            {selectedField && (
              <div className="p-4 rounded-xl border border-raah-green bg-raah-soft">
                <div className="text-sm font-medium text-raah-deep mb-2">
                  {lang === "ur" ? "\u0633\u0648\u0627\u0644 \u067e\u0648\u0686\u06be\u06cc\u0646" : "Ask about"}: {selectedField.label} ({selectedField.value})
                </div>
                {selectedField.explanation && (
                  <div className="text-xs text-text-secondary mb-3 p-2 rounded bg-white border border-border">
                    {selectedField.explanation}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    value={followQ}
                    onChange={(e) => setFollowQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && askFollowUp(selectedField)}
                    placeholder={lang === "ur" ? "\u0627\u0633 \u0641\u06cc\u0644\u0688 \u06a9\u06cc \u0628\u0627\u0631\u06c1 \u0645\u06cc\u0633\u06c1 \u067e\u0648\u0686\u06be\u06cc\u0646..." : "Ask about this field..."}
                    className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/30"
                  />
                  <button
                    onClick={() => askFollowUp(selectedField)}
                    disabled={followLoading || !followQ.trim()}
                    className="px-4 py-2 bg-raah-green text-white rounded-lg text-sm font-medium hover:bg-raah-deep disabled:opacity-50"
                  >
                    <Send size={14} />
                  </button>
                </div>
                {followLoading && (
                  <div className="mt-2 text-xs text-text-muted animate-pulse flex items-center gap-1">
                    <MessageCircle size={12} /> {lang === "ur" ? "\u062c\u0648\u0627\u0628 \u062a\u064a\u0627\u0631 \u06c1\u0648 \u0631\u06c1\u0627 \u06c8..." : "Preparing answer..."}
                  </div>
                )}
                {followA && (
                  <div className="mt-3 p-3 rounded-lg bg-white border border-border text-sm text-text-secondary">
                    {followA}
                  </div>
                )}
              </div>
            )}

            {/* Raw Text */}
            <details className="mt-4">
              <summary className="text-xs text-text-muted cursor-pointer hover:text-text-secondary">
                {lang === "ur" ? "\u062e\u0645 \u062a\u0635\u0631\u064a\u062d" : "Raw Text"}
              </summary>
              <pre className="mt-2 p-3 rounded-lg bg-gray-50 border border-border text-xs text-text-secondary overflow-x-auto whitespace-pre-wrap">
                {result.raw_text}
              </pre>
            </details>
          </div>
        )}
      </div>
    </AppShell>
  );
}
