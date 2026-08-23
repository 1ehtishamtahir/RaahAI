"use client";
import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { officesApi, officesCitiesApi } from "@/lib/api";
import { MapPin, Phone, Clock, Building2, Filter } from "lucide-react";

const TYPE_LABELS: Record<string, { en: string; ur: string; color: string }> = {
  nadra: { en: "NADRA", ur: "\u0646\u0627\u0688\u0631\u0627", color: "bg-blue-100 text-blue-700" },
  dgip: { en: "DGIP", ur: "\u0688\u06cc \u062c\u06cc \u0622\u0626\u06cc \u067e\u06cc", color: "bg-green-100 text-green-700" },
  secp: { en: "SECP", ur: "\u0627\u06cc\u0633 \u0627\u06cc \u0633\u06cc \u067e\u06cc", color: "bg-purple-100 text-purple-700" },
};

export default function OfficesPage() {
  const { lang } = useLang();
  const [offices, setOffices] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    officesCitiesApi().then(setCities).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    officesApi(selectedCity || undefined, selectedType || undefined)
      .then(setOffices)
      .catch(() => setOffices([]))
      .finally(() => setLoading(false));
  }, [selectedCity, selectedType]);

  return (
    <AppShell>
      <div className="bg-white rounded-2xl border border-border p-6">
        <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2">
          <Building2 size={20} /> {lang === "ur" ? "\u0639\u0644\u0627\u0642\u0627\u0626\u06cc \u062f\u0641\u062a\u0631" : "Regional Offices"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {lang === "ur" ? "\u0646\u0627\u0688\u0631\u0627\u060c \u0688\u06cc \u062c\u06cc \u0622\u0626\u06cc \u067e\u06cc \u0627\u0648\u0631 \u0627\u06cc\u0633 \u0627\u06cc \u0633\u06cc \u067e\u06cc \u06a9\u06d2 \u062f\u0641\u062a\u0631" : "Find NADRA, DGIP and SECP offices near you"}
        </p>

        {/* Filters */}
        <div className="mt-6 flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Filter size={14} /> {lang === "ur" ? "\u0641\u0644\u062a\u0631:" : "Filter:"}
          </div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-raah-green/30"
          >
            <option value="">{lang === "ur" ? "\u062a\u0645\u0645\u0647 \u0634\u06c1\u0631" : "All Cities"}</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="flex gap-1">
            {Object.entries(TYPE_LABELS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setSelectedType(selectedType === key ? "" : key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedType === key ? val.color : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                }`}
              >
                {lang === "ur" ? val.ur : val.en}
              </button>
            ))}
          </div>
        </div>

        {/* Office List */}
        <div className="mt-6 space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-border rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))
          ) : offices.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-8 text-center text-text-muted text-sm">
              {lang === "ur" ? "\u06a9\u0648\u0626\u06cc \u062f\u0641\u062a\u0631 \u0646\u0647\u06cc\u0646 \u0645\u0644\u0627" : "No offices found"}
            </div>
          ) : (
            offices.map((office: any) => {
              const typeInfo = TYPE_LABELS[office.type] || { en: office.type, ur: office.type, color: "bg-gray-100 text-gray-700" };
              return (
                <div key={office.id} className="border border-border rounded-xl p-4 hover:shadow-sm transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeInfo.color}`}>
                          {lang === "ur" ? typeInfo.ur : typeInfo.en}
                        </span>
                        <span className="text-xs text-text-muted">{office.city}</span>
                      </div>
                      <div className="font-semibold text-sm mt-2">{lang === "ur" ? office.name_ur : office.name_en}</div>
                    </div>
                    {office.lat && office.lng && (
                      <a
                        href={`https://www.google.com/maps?q=${office.lat},${office.lng}`}
                        target="_blank"
                        rel="noopener"
                        className="text-raah-green hover:text-raah-deep text-xs flex items-center gap-1"
                      >
                        <MapPin size={12} /> Map
                      </a>
                    )}
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm text-text-secondary">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-text-muted" />
                      <span>{office.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="shrink-0 text-text-muted" />
                      <span>{office.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="shrink-0 text-text-muted" />
                      <span>{office.hours}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
