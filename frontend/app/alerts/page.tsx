"use client";
import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { alertsApi, deleteAlertApi } from "@/lib/api";
import { Bell, AlertTriangle, CheckCircle, XCircle, Plus, Trash2, ExternalLink, Eye, Download, Upload, FileImage } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STATUS_CONFIG: Record<string, { color: string; icon: any; label_en: string; label_ur: string }> = {
  valid: { color: "text-raah-green bg-raah-mint", icon: CheckCircle, label_en: "Valid", label_ur: "عمل" },
  expiring_soon: { color: "text-yellow-600 bg-yellow-50", icon: AlertTriangle, label_en: "Expiring Soon", label_ur: "جلد ختم" },
  expired: { color: "text-red-600 bg-red-50", icon: XCircle, label_en: "Expired", label_ur: "موقت" },
};

export default function AlertsPage() {
  const { lang } = useLang();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ document_type: "passport", holder_name: "", cnic: "", issue_date: "", expiry_date: "" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);

  function load() {
    setLoading(true);
    alertsApi().then(setAlerts).catch(() => setAlerts([])).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  async function addAlert() {
    if (!form.holder_name || !form.cnic || !form.issue_date || !form.expiry_date) return;
    if (file) {
      const fd = new FormData();
      fd.append("document_type", form.document_type);
      fd.append("holder_name", form.holder_name);
      fd.append("cnic", form.cnic);
      fd.append("issue_date", form.issue_date);
      fd.append("expiry_date", form.expiry_date);
      fd.append("file", file);
      const res = await fetch(`${API}/alerts/upload`, { method: "POST", body: fd });
      if (!res.ok) {
        alert("Failed to add document: " + await res.text());
        return;
      }
    } else {
      const res = await fetch(`${API}/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        alert("Failed to add document");
        return;
      }
    }
    setForm({ document_type: "passport", holder_name: "", cnic: "", issue_date: "", expiry_date: "" });
    setFile(null);
    setPreview(null);
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
              <Bell size={20} /> {lang === "ur" ? "دستاویز والٹ" : "My Documents (Wallet)"}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {lang === "ur" ? "اپنی دستاویزات تصاویر کے ساتھ محفوظ کریں — دیکھیں، ڈاؤن لوڈ کریں، اور تجدید یاد دہانی" : "Store your documents with images — view, download, expiry alerts & renewal"}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-raah-green text-white rounded-xl text-sm font-medium hover:bg-raah-deep transition"
          >
            <Plus size={16} /> {lang === "ur" ? "نئی دستاویز" : "Add Document"}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-raah-mint border border-raah-green/20 text-center">
            <div className="text-2xl font-bold text-raah-green">{valid}</div>
            <div className="text-xs text-text-muted mt-1">{lang === "ur" ? "عمل" : "Valid"}</div>
          </div>
          <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-center">
            <div className="text-2xl font-bold text-yellow-600">{expiring}</div>
            <div className="text-xs text-text-muted mt-1">{lang === "ur" ? "جلد ختم" : "Expiring Soon"}</div>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
            <div className="text-2xl font-bold text-red-600">{expired}</div>
            <div className="text-xs text-text-muted mt-1">{lang === "ur" ? "موقت" : "Expired"}</div>
          </div>
        </div>

        {showForm && (
          <div className="mt-4 p-4 rounded-xl border border-raah-green bg-raah-soft">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-muted">{lang === "ur" ? "دستاویز کی قسم" : "Document Type"}</label>
                <select
                  value={form.document_type}
                  onChange={(e) => setForm({ ...form, document_type: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm bg-white"
                >
                  <option value="passport">{lang === "ur" ? "پاسپورٹ" : "Passport"}</option>
                  <option value="cnic">{lang === "ur" ? "شناختی کارڈ" : "CNIC"}</option>
                  <option value="business">{lang === "ur" ? "کاروبار" : "Business Registration"}</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted">{lang === "ur" ? "نام" : "Name"}</label>
                <input
                  value={form.holder_name}
                  onChange={(e) => setForm({ ...form, holder_name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm"
                  placeholder={lang === "ur" ? "نام دار" : "Holder name"}
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
                <label className="text-xs text-text-muted">{lang === "ur" ? "جاری صدور" : "Issue Date"}</label>
                <input
                  type="date"
                  value={form.issue_date}
                  onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted">{lang === "ur" ? "ختمامیت" : "Expiry Date"}</label>
                <input
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted flex items-center gap-1"><FileImage size={12}/> Document Image (optional)</label>
                <label className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-raah-green/30 bg-white text-sm cursor-pointer hover:bg-raah-mint">
                  <Upload size={14} className="text-raah-green"/>
                  <span className="text-text-secondary truncate">{file ? file.name : "Upload image (JPG/PNG/PDF, max 5MB)"}</span>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={onFileChange} />
                </label>
                {preview && <img src={preview} alt="preview" className="mt-2 w-full h-24 object-cover rounded-lg border border-border" />}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={addAlert} className="px-4 py-2 bg-raah-green text-white rounded-lg text-sm font-medium hover:bg-raah-deep">
                {lang === "ur" ? "محفوظ" : "Save"}
              </button>
              <button onClick={() => { setShowForm(false); setFile(null); setPreview(null); }} className="px-4 py-2 border border-border rounded-lg text-sm text-text-secondary hover:bg-gray-50">
                {lang === "ur" ? "رد" : "Cancel"}
              </button>
            </div>
          </div>
        )}

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
              {lang === "ur" ? "ابھی کوئی دستاویز نہیں" : "No documents added yet — add your first document with image"}
            </div>
          ) : (
            alerts.map((alert) => {
              const status = STATUS_CONFIG[alert.status] || STATUS_CONFIG.valid;
              const StatusIcon = status.icon;
              return (
                <div key={alert.id} className="border border-border rounded-xl p-4 flex items-start justify-between hover:border-raah-green/30 transition">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${status.color}`}>
                      <StatusIcon size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{lang === "ur" ? alert.document_name_ur : alert.document_name_en}</div>
                      <div className="text-xs text-text-muted mt-0.5">{alert.holder_name} | CNIC: {alert.cnic}</div>
                      <div className="text-xs text-text-muted mt-1">
                        {lang === "ur" ? "ختمامیت: " : "Expires: "}{alert.expiry_date}
                        {alert.status === "expired" && (
                          <span className="text-red-600 font-medium ml-2">
                            ({Math.abs(alert.days_until_expiry)} {lang === "ur" ? "دن" : "days"} {lang === "ur" ? "پہلے" : "ago"})
                          </span>
                        )}
                        {alert.status === "expiring_soon" && (
                          <span className="text-yellow-600 font-medium ml-2">
                            ({alert.days_until_expiry} {lang === "ur" ? "دن" : "days"} {lang === "ur" ? "باقی" : "left"})
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {alert.has_image ? (
                          <>
                            <button onClick={()=>setViewImage(`${API}/alerts/${alert.id}/image`)} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-raah-mint border border-raah-green/20 text-xs text-raah-deep hover:bg-raah-green hover:text-white transition">
                              <Eye size={12}/> View
                            </button>
                            <a href={`${API}/alerts/${alert.id}/download`} target="_blank" className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-border text-xs text-text-secondary hover:border-raah-green/30">
                              <Download size={12}/> Download
                            </a>
                          </>
                        ) : (
                          <span className="text-xs text-text-muted flex items-center gap-1"><FileImage size={12}/> No image</span>
                        )}
                        <a
                          href={alert.renewal_url}
                          target="_blank"
                          rel="noopener"
                          className="flex items-center gap-1 text-xs text-raah-green hover:text-raah-deep border border-raah-green/20 px-3 py-1.5 rounded-full bg-white"
                        >
                          <ExternalLink size={12} /> {lang === "ur" ? "تجدید کریں" : "Renew Now"}
                        </a>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(alert.id)}
                    className="text-text-muted hover:text-red-500 transition p-1 shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {viewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={()=>setViewImage(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-sm">Document Image</div>
              <button onClick={()=>setViewImage(null)} className="p-1 rounded-full hover:bg-raah-soft">✕</button>
            </div>
            <img src={viewImage} alt="document" className="w-full max-h-[70vh] object-contain rounded-xl border border-border bg-raah-soft" />
            <div className="mt-3 flex gap-2 justify-end">
              <a href={viewImage.replace("/image","/download")} target="_blank" className="px-4 py-2 rounded-xl border border-border text-sm">Download</a>
              <button onClick={()=>setViewImage(null)} className="px-4 py-2 rounded-xl bg-raah-green text-white text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
