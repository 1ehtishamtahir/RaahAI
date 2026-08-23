"use client";
import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { alertsApi, addAlertApi, deleteAlertApi } from "@/lib/api";
import { Bell, AlertTriangle, CheckCircle, XCircle, Plus, Trash2, ExternalLink } from "lucide-react";

const STATUS_CONFIG: Record<string, { color: string; icon: any; label_en: string; label_ur: string }> = {
  valid: { color: "text-raah-green bg-raah-mint", icon: CheckCircle, label_en: "Valid", label_ur: "\u0639\u0645\u0644" },
  expiring_soon: { color: "text-yellow-600 bg-yellow-50", icon: AlertTriangle, label_en: "Expiring Soon", label_ur: "\u062c\u0644\u062f \u062e\u062a\u0645" },
  expired: { color: "text-red-600 bg-red-50", icon: XCircle, label_en: "Expired", label_ur: "\u0645\u0648\u0642\u062a" },
};

export default function AlertsPage() {
  const { lang } = useLang();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ document_type: "passport", holder_name: "", cnic: "", issue_date: "", expiry_date: "" });

  function load() {
    setLoading(true);
    alertsApi().then(setAlerts).catch(() => setAlerts([])).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function addAlert() {
    if (!form.holder_name || !form.cnic || !form.issue_date || !form.expiry_date) return;
    await addAlertApi(form);
    setForm({ document_type: "passport", holder_name: "", cnic: "", issue_date: "", expiry_date: "" });
    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    await deleteAlertApi(id);
    load();
  }

  const expired = alerts.filter((a) => a.status === "expired").length;
  const expiring = alerts.filter((a) => a.status === "expiring_soon").length;
  const valid = alerts.filter((a) => a.status === "valid").length;

  return (
    <AppShell>
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2">
              <Bell size={20} /> {lang === "ur" ? "\u062f\u0633\u062a\u0627\u0648\u06cc\u0632 \u0627\u0644\u0631\u062a" : "Document Expiry Alerts"}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {lang === "ur" ? "\u0627\u067e\u0646\u06cc \u062f\u0633\u062a\u0627\u0648\u06cc\u0632\u0648\u06a9\u06cc \u0627\u0646\u062f\u0631\u0627\u0632 \u0631\u0642\u0645 \u0631\u062e\u0646\u06d2" : "Track your document expiry dates and get renewal reminders"}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-raah-green text-white rounded-xl text-sm font-medium hover:bg-raah-deep transition"
          >
            <Plus size={16} /> {lang === "ur" ? "\u0646\u0627 \u062f\u0633\u062a\u0627\u0648\u06cc\u0632" : "Add Document"}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-raah-mint border border-raah-green/20 text-center">
            <div className="text-2xl font-bold text-raah-green">{valid}</div>
            <div className="text-xs text-text-muted mt-1">{lang === "ur" ? "\u0639\u0645\u0644" : "Valid"}</div>
          </div>
          <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-center">
            <div className="text-2xl font-bold text-yellow-600">{expiring}</div>
            <div className="text-xs text-text-muted mt-1">{lang === "ur" ? "\u062c\u0644\u062f \u062e\u062a\u0645" : "Expiring Soon"}</div>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
            <div className="text-2xl font-bold text-red-600">{expired}</div>
            <div className="text-xs text-text-muted mt-1">{lang === "ur" ? "\u0645\u0648\u0642\u062a" : "Expired"}</div>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="mt-4 p-4 rounded-xl border border-raah-green bg-raah-soft">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-muted">{lang === "ur" ? "\u062f\u0633\u062a\u0627\u0648\u06cc\u0632 \u06a9\u06cc \u0642\u0633\u0645" : "Document Type"}</label>
                <select
                  value={form.document_type}
                  onChange={(e) => setForm({ ...form, document_type: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm bg-white"
                >
                  <option value="passport">{lang === "ur" ? "\u067e\u0627\u0633\u067e\u0648\u0631\u0679" : "Passport"}</option>
                  <option value="cnic">{lang === "ur" ? "\u0634\u0646\u0627\u062e\u062a\u06cc \u06a9\u0627\u0631\u062f" : "CNIC"}</option>
                  <option value="business">{lang === "ur" ? "\u06a9\u0627\u0631\u0648\u0628\u0627\u0631" : "Business Registration"}</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted">{lang === "ur" ? "\u0646\u0627\u0645" : "Name"}</label>
                <input
                  value={form.holder_name}
                  onChange={(e) => setForm({ ...form, holder_name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm"
                  placeholder={lang === "ur" ? "\u0646\u0627\u0645 \u062f\u0627\u0646\u0636\u062f\u0627\u0631" : "Holder name"}
                />
              </div>
              <div>
                <label className="text-xs text-text-muted">CNIC</label>
                <input
                  value={form.cnic}
                  onChange={(e) => setForm({ ...form, cnic: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm"
                  placeholder="42101-1234567-1"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted">{lang === "ur" ? "\u062c\u0627\u0631\u06cc \u0635\u062f\u0648\u0631" : "Issue Date"}</label>
                <input
                  type="date"
                  value={form.issue_date}
                  onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted">{lang === "ur" ? "\u062e\u062a\u0645\u0627\u0646\u06cc\u062a" : "Expiry Date"}</label>
                <input
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm"
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={addAlert} className="px-4 py-2 bg-raah-green text-white rounded-lg text-sm font-medium hover:bg-raah-deep">
                {lang === "ur" ? "\u0645\u0641\u0648\u0636" : "Save"}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-text-secondary hover:bg-gray-50">
                {lang === "ur" ? "\u0631\u062f" : "Cancel"}
              </button>
            </div>
          </div>
        )}

        {/* Alert Cards */}
        <div className="mt-6 space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-border rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : alerts.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-8 text-center text-text-muted text-sm">
              {lang === "ur" ? "\u0627\u0628\u06be\u06cc \u06a9\u0648\u0626\u06cc \u062f\u0633\u062a\u0627\u0648\u06cc\u0632 \u0646\u0647\u06cc\u0646" : "No documents added yet"}
            </div>
          ) : (
            alerts.map((alert) => {
              const status = STATUS_CONFIG[alert.status] || STATUS_CONFIG.valid;
              const StatusIcon = status.icon;
              return (
                <div key={alert.id} className="border border-border rounded-xl p-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.color}`}>
                      <StatusIcon size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{lang === "ur" ? alert.document_name_ur : alert.document_name_en}</div>
                      <div className="text-xs text-text-muted mt-0.5">{alert.holder_name} | CNIC: {alert.cnic}</div>
                      <div className="text-xs text-text-muted mt-1">
                        {lang === "ur" ? "\u062e\u062a\u0645\u0627\u0646\u06cc\u062a: " : "Expires: "}{alert.expiry_date}
                        {alert.status === "expired" && (
                          <span className="text-red-600 font-medium ml-2">
                            ({Math.abs(alert.days_until_expiry)} {lang === "ur" ? "\u062f\u0646" : "days"} {lang === "ur" ? "\u067e\u06be\u0644\u06d2" : "ago"})
                          </span>
                        )}
                        {alert.status === "expiring_soon" && (
                          <span className="text-yellow-600 font-medium ml-2">
                            ({alert.days_until_expiry} {lang === "ur" ? "\u062f\u0646" : "days"} {lang === "ur" ? "\u0628\u0627\u0642\u06cc" : "left"})
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <a
                          href={alert.renewal_url}
                          target="_blank"
                          rel="noopener"
                          className="flex items-center gap-1 text-xs text-raah-green hover:text-raah-deep"
                        >
                          <ExternalLink size={12} /> {lang === "ur" ? "\u062a\u062c\u062f\u06cc\u062f \u06a9\u0631\u06cc\u0646" : "Renew Now"}
                        </a>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(alert.id)}
                    className="text-text-muted hover:text-red-500 transition p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
