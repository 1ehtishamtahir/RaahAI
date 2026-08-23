"use client";
import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { eligibilityApi } from "@/lib/api";
import { ClipboardCheck, CheckCircle, XCircle, FileText, ChevronDown, ChevronUp } from "lucide-react";

export default function EligibilityPage() {
  const { lang, t } = useLang();
  const [age, setAge] = useState(25);
  const [isPakistani, setIsPakistani] = useState(true);
  const [hasCnic, setHasCnic] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function check() {
    setLoading(true);
    try {
      const data = await eligibilityApi({ age, is_pakistani: isPakistani, has_cnic: hasCnic });
      setResults(data);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }

  return (
    <AppShell>
      <div className="bg-white rounded-2xl border border-border p-6">
        <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2">
          <ClipboardCheck size={20} /> {lang === "ur" ? "\u062e\u062f\u0645\u062a \u06a9\u06cc \u0627\u06be\u0644\u06cc\u062a" : "Service Eligibility"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {lang === "ur" ? "\u0627\u067e\u0646\u06cc \u0645\u0644\u0645\u0627\u0646\u0627\u062a \u062f\u0631\u062c \u06a9\u0631\u06cc\u0646 \u062a\u0627\u06a9\u06c1 \u062f\u06cc\u06a9\u06be\u06cc\u0646" : "Enter your details to check which services you qualify for"}
        </p>

        {/* Form */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1">{lang === "ur" ? "\u0639\u0645\u0631" : "Age"}</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1">{lang === "ur" ? "\u067e\u0627\u06a9\u0633\u062a\u0627\u0646\u06cc \u0634\u0647\u0631\u06cc" : "Pakistani Citizen"}</label>
            <button
              onClick={() => setIsPakistani(!isPakistani)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
                isPakistani ? "border-raah-green bg-raah-mint text-raah-deep" : "border-border bg-white text-text-secondary"
              }`}
            >
              {isPakistani ? (lang === "ur" ? "\u06c1\u0627\u0646" : "Yes") : (lang === "ur" ? "\u0646\u0647\u06cc\u0646" : "No")}
            </button>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1">{lang === "ur" ? "CNIC \u06c8" : "Has CNIC"}</label>
            <button
              onClick={() => setHasCnic(!hasCnic)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
                hasCnic ? "border-raah-green bg-raah-mint text-raah-deep" : "border-border bg-white text-text-secondary"
              }`}
            >
              {hasCnic ? (lang === "ur" ? "\u06c1\u0627\u0646" : "Yes") : (lang === "ur" ? "\u0646\u0647\u06cc\u0646" : "No")}
            </button>
          </div>
        </div>

        <button
          onClick={check}
          disabled={loading}
          className="mt-4 px-6 py-2.5 bg-raah-green text-white rounded-xl font-medium text-sm hover:bg-raah-deep transition disabled:opacity-50"
        >
          {loading ? (lang === "ur" ? "\u062a\u0634\u063a\u06cc\u0644 \u06c1\u0648 \u0631\u06c1\u0627 \u06c8..." : "Checking...") : (lang === "ur" ? "\u0627\u0647\u0644\u06cc\u062a \u062a\u0634\u0642\u06cc\u0642 \u06a9\u0631\u06cc\u0646" : "Check Eligibility")}
        </button>

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-6 space-y-3">
            {results.map((svc) => (
              <div
                key={svc.service}
                className={`border rounded-xl p-4 transition ${
                  svc.eligible ? "border-raah-green/30 bg-raah-soft/50" : "border-red-200 bg-red-50/50"
                }`}
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpanded(expanded === svc.service ? null : svc.service)}
                >
                  <div className="flex items-center gap-3">
                    {svc.eligible ? (
                      <CheckCircle size={20} className="text-raah-green" />
                    ) : (
                      <XCircle size={20} className="text-red-500" />
                    )}
                    <div>
                      <div className="font-semibold text-sm">{lang === "ur" ? svc.name_ur : svc.name_en}</div>
                      <div className="text-xs text-text-muted mt-0.5">
                        {lang === "ur" ? "\u0641\u06cc\u0633: " : "Fee: "}{svc.fee_normal} | {lang === "ur" ? "\u0641\u0648\u0631\u06cc: " : "Urgent: "}{svc.fee_urgent}
                      </div>
                    </div>
                  </div>
                  {expanded === svc.service ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {expanded === svc.service && (
                  <div className="mt-4 space-y-3">
                    {svc.reasons.length > 0 && (
                      <div className="p-3 rounded-lg bg-white border border-border">
                        <div className="text-xs font-medium text-text-muted mb-2">{lang === "ur" ? "\u0634\u0631\u0627\u0637" : "Requirements"}</div>
                        {svc.reasons.map((r: string, i: number) => (
                          <div key={i} className="text-sm text-red-600 flex items-start gap-1 mt-1">
                            <XCircle size={12} className="mt-0.5 shrink-0" /> {r}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-3 rounded-lg bg-white border border-border">
                      <div className="text-xs font-medium text-text-muted mb-2">{lang === "ur" ? "\u0636\u0631\u0648\u0631\u06cc \u062f\u0633\u062a\u0627\u0648\u06cc\u0632\u0627\u062a" : "Required Documents"}</div>
                      {svc.required_documents.map((d: string, i: number) => (
                        <div key={i} className="text-sm text-text-secondary flex items-start gap-1 mt-1">
                          <FileText size={12} className="mt-0.5 shrink-0 text-raah-green" /> {d}
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-border">
                      <div className="text-xs font-medium text-text-muted mb-2">{lang === "ur" ? "\u0627\u0631\u062c\u0627\u0645 \u06a9\u0631\u0646\u06d2 \u06a9\u0627 \u0637\u0631\u06cc\u0642\u06c1" : "Steps to Apply"}</div>
                      {svc.steps.map((s: string, i: number) => (
                        <div key={i} className="text-sm text-text-secondary flex items-start gap-2 mt-1">
                          <span className="text-raah-green font-bold">{i + 1}.</span> {s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
