"use client";
import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { feeApi } from "@/lib/api";
import { Calculator, Clock, CreditCard, FileText, CheckCircle } from "lucide-react";

const services = [
  { key: "passport", label_en: "Passport", label_ur: "\u067e\u0627\u0633\u067e\u0648\u0631\u0679", icon: FileText },
  { key: "cnic", label_en: "CNIC", label_ur: "\u0634\u0646\u0627\u062e\u062a\u06cc \u06a9\u0627\u0631\u062f", icon: FileText },
  { key: "business_registration", label_en: "Business", label_ur: "\u06a9\u0627\u0631\u0648\u0628\u0627\u0631", icon: FileText },
];

const urgencies = [
  { key: "normal", label_en: "Normal", label_ur: "\u0646\u0639\u0645\u0627\u0644\u06cc", color: "text-raah-green" },
  { key: "urgent", label_en: "Urgent", label_ur: "\u0641\u0648\u0631\u06cc", color: "text-yellow-600" },
  { key: "executive", label_en: "Executive", label_ur: "\u0627\u06cc\u0646\u062a\u062e\u0627\u0628\u06cc", color: "text-purple-600" },
];

export default function FeesPage() {
  const { lang, t } = useLang();
  const [selectedService, setSelectedService] = useState("passport");
  const [selectedUrgency, setSelectedUrgency] = useState("normal");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    feeApi(selectedService, selectedUrgency)
      .then(setResult)
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [selectedService, selectedUrgency]);

  return (
    <AppShell>
      <div className="bg-white rounded-2xl border border-border p-6">
        <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2">
          <Calculator size={20} /> {lang === "ur" ? "\u0641\u06cc\u0633 \u06a9\u0648\u0644\u0648\u0644\u0627 \u062a\u0631\u0633\u06cc\u0645" : "Fee Calculator"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {lang === "ur" ? "\u0627\u067e\u0646\u06cc \u062e\u062f\u0645\u062a \u0627\u0648\u0631 \u0627\u0631\u062c\u0646\u0633 \u06a9\u06cc \u0641\u06cc\u0633 \u062f\u06cc\u06a9\u06be\u06cc\u0646" : "Select your service and urgency to see the total fee"}
        </p>

        {/* Service Selection */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {services.map((s) => (
            <button
              key={s.key}
              onClick={() => setSelectedService(s.key)}
              className={`p-4 rounded-xl border-2 text-center transition ${
                selectedService === s.key
                  ? "border-raah-green bg-raah-mint text-raah-deep"
                  : "border-border bg-white text-text-secondary hover:border-raah-green/30"
              }`}
            >
              <s.icon size={24} className={`mx-auto mb-2 ${selectedService === s.key ? "text-raah-green" : "text-text-muted"}`} />
              <div className="font-semibold text-sm">{lang === "ur" ? s.label_ur : s.label_en}</div>
            </button>
          ))}
        </div>

        {/* Urgency Selection */}
        <div className="mt-6">
          <div className="text-sm font-medium text-text-secondary mb-3">{lang === "ur" ? "\u0627\u0631\u062c\u0646\u0633 \u06a9\u06cc \u0642\u0633\u0645" : "Urgency Level"}</div>
          <div className="flex gap-3">
            {urgencies.map((u) => (
              <button
                key={u.key}
                onClick={() => setSelectedUrgency(u.key)}
                className={`flex-1 p-3 rounded-xl border-2 text-center transition ${
                  selectedUrgency === u.key
                    ? "border-raah-green bg-raah-mint"
                    : "border-border bg-white hover:border-raah-green/30"
                }`}
              >
                <div className={`font-semibold text-sm ${selectedUrgency === u.key ? u.color : "text-text-secondary"}`}>
                  {lang === "ur" ? u.label_ur : u.label_en}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {loading && (
          <div className="mt-6 p-6 rounded-xl bg-raah-soft border border-border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          </div>
        )}

        {result && !loading && (
          <div className="mt-6 p-6 rounded-xl bg-raah-soft border border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-bold text-lg text-raah-deep">
                  {lang === "ur" ? result.service_name_ur : result.service_name_en}
                </div>
                <div className="text-xs text-text-muted mt-1 flex items-center gap-1">
                  <Clock size={12} /> {result.processing_time}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-raah-green">PKR {result.total.toLocaleString()}</div>
                <div className="text-xs text-text-muted">{lang === "ur" ? "\u06a9\u0644 \u0641\u06cc\u0633" : "Total Fee"}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 rounded-lg bg-white border border-border">
                <div className="text-xs text-text-muted">{lang === "ur" ? "\u0633\u0631\u06a9\u0627\u0631\u06cc \u0641\u06cc\u0633" : "Government Fee"}</div>
                <div className="font-bold text-raah-deep mt-1">PKR {result.government_fee.toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-lg bg-white border border-border">
                <div className="text-xs text-text-muted">{lang === "ur" ? "\u0628\u06cc\u0646\u06a9 \u0686\u0627\u0631\u062c" : "Bank Charges"}</div>
                <div className="font-bold text-raah-deep mt-1">PKR {result.bank_charges.toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-white border border-border">
              <div className="text-xs text-text-muted mb-1">{lang === "ur" ? "\u0627\u0637\u0644\u0627\u0639 \u06a9\u0637\u0628" : "Payment Method"}</div>
              <div className="text-sm font-medium flex items-center gap-2">
                <CreditCard size={14} className="text-raah-green" /> {result.payment_method}
              </div>
            </div>

            {result.notes && result.notes.length > 0 && (
              <div className="mt-4">
                <div className="text-xs text-text-muted mb-2">{lang === "ur" ? "\u0646\u0648\u062a\u0633" : "Notes"}</div>
                {result.notes.map((note: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-text-secondary mt-1">
                    <CheckCircle size={14} className="text-raah-green mt-0.5 shrink-0" /> {note}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
