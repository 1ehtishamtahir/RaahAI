"use client";
import { useEffect, useState } from "react";
import { checklistApi } from "@/lib/api";
import ChecklistItem from "./ChecklistItem";
import ProgressBar from "./ProgressBar";
import { useLang } from "@/lib/LangContext";

export default function ChecklistCard({ service = "passport", situation = "new" }: { service?: string; situation?: string }) {
  const { t } = useLang();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    checklistApi(service, situation)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        // fallback mock for offline demo
        setError(e.message);
        setData({
          service,
          situation,
          items: [
            { id: "cnic", label: "Original CNIC / Smart CNIC", completed: true },
            { id: "bform", label: "B-Form (if under 18)", completed: true },
            { id: "photos", label: "Photographs", completed: true },
            { id: "prev_passport", label: "Previous Passport (if any)", completed: false },
            { id: "fee", label: "Fee Payment", completed: false },
          ],
          completed_count: 3,
          total_count: 5,
          progress: 0.6,
        });
        setLoading(false);
      });
  }, [service, situation]);

  if (loading && !data) return <div className="bg-white rounded-2xl border border-border p-4 text-sm text-text-muted animate-pulse h-48">Loading checklist...</div>;
  if (!data) return <div className="bg-white rounded-2xl border border-border p-4 text-sm text-red-600">Unable to load checklist. {error}</div>;

  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold flex items-center gap-2">📋 {t.checklist}</div>
        <a href="/checklist" className="text-xs text-raah-green font-medium">{t.viewAll}</a>
      </div>
      <div className="text-sm font-medium flex justify-between">
        <span className="capitalize">{data.service?.replace("_"," ")} ({data.situation})</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{data.progress === 1 ? t.completed : t.inProgress}</span>
      </div>
      <div className="mt-3 space-y-2">
        {data.items.map((it: any) => (
          <ChecklistItem key={it.id} label={it.label} completed={it.completed} />
        ))}
      </div>
      <div className="mt-4">
        <ProgressBar value={data.progress} />
        <div className="text-xs text-text-secondary mt-1">{data.completed_count} / {data.total_count} {t.completed}</div>
      </div>
    </div>
  );
}
