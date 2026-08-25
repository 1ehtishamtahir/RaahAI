"use client";
import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { useAuth } from "@/lib/AuthContext";
import { alertsApi, deleteAlertApi, updateAlertApi } from "@/lib/api";
import { Bell, AlertTriangle, CheckCircle, XCircle, Plus, Trash2, ExternalLink, Eye, Download, Upload, FileImage, Calendar, ShieldCheck, Check, Pencil } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STATUS_CONFIG: Record<string, { color: string; icon: any; label_en: string; label_ur: string }> = {
  valid: { color: "text-raah-green bg-raah-mint", icon: CheckCircle, label_en: "Valid", label_ur: "عمل" },
  expiring_soon: { color: "text-yellow-600 bg-yellow-50", icon: AlertTriangle, label_en: "Expiring Soon", label_ur: "جلد ختم" },
  expired: { color: "text-red-600 bg-red-50", icon: XCircle, label_en: "Expired", label_ur: "موقت" },
};

export default function AlertsPage() {
  const { lang } = useLang();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ document_type: "passport", custom_type_name: "", holder_name: "", cnic: "", issue_date: "", expiry_date: "" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    alertsApi().then(setAlerts).catch(() => setAlerts([])).finally(() => setLoading(false));
  }

  useEffect(() => { setAlerts([]); load(); }, [user?.id]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    if (f && f.size > 5 * 1024 * 1024) {
      setError("Image too large (max 5MB)");
      return;
    }
    setFile(f);
    setError(null);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0] || null;
    if (f) {
      if (f.size > 5 * 1024 * 1024) {
        setError("Image too large (max 5MB)");
        return;
      }
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setError(null);
    }
  }

  function validate() {
    if (!form.holder_name.trim()) return "Holder name is required";
    if (!form.cnic.trim()) return "CNIC is required";
    if (!/^\d{5}-\d{7}-\d$/.test(form.cnic.trim()) && !/^\d{13}$/.test(form.cnic.replace(/-/g,""))) return "CNIC format: 42101-1234567-1 or 13 digits";
    if (!form.issue_date) return "Issue date is required";
    if (!form.expiry_date) return "Expiry date is required";
    if (new Date(form.expiry_date) <= new Date(form.issue_date)) return "Expiry must be after issue date";
    if (form.document_type === "other" && !form.custom_type_name.trim()) return "Please enter a document name";
    return null;
  }

  async function addAlert() {
    const v = validate();
    if (v) { setError(v); return; }
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, holder_name: form.holder_name.trim(), cnic: form.cnic.trim() };
      if (file) {
        const fd = new FormData();
        fd.append("document_type", form.document_type);
        if (form.document_type === "other") fd.append("custom_type_name", form.custom_type_name.trim());
        fd.append("holder_name", form.holder_name.trim());
        fd.append("cnic", form.cnic.trim());
        fd.append("issue_date", form.issue_date);
        fd.append("expiry_date", form.expiry_date);
        fd.append("file", file);
        const res = await fetch(`${API}/alerts/upload`, { method: "POST", body: fd });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await fetch(`${API}/alerts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
      }
      resetForm();
      setSuccess("Document added successfully!");
      setTimeout(()=>setSuccess(null), 3000);
      load();
    } catch (e: any) {
      setError(e.message || "Failed to add document");
    } finally {
      setSaving(false);
    }
  }

  async function updateAlert() {
    const v = validate();
    if (v) { setError(v); return; }
    if (!editId) return;
    setSaving(true);
    setError(null);
    try {
      await updateAlertApi(editId, {
        document_type: form.document_type,
        custom_type_name: form.document_type === "other" ? form.custom_type_name.trim() : undefined,
        holder_name: form.holder_name.trim(),
        cnic: form.cnic.trim(),
        issue_date: form.issue_date,
        expiry_date: form.expiry_date,
      });
      resetForm();
      setSuccess("Document updated successfully!");
      setTimeout(()=>setSuccess(null), 3000);
      load();
    } catch (e: any) {
      setError(e.message || "Failed to update document");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(alert: any) {
    setEditId(alert.id);
    setForm({
      document_type: alert.document_type,
      custom_type_name: alert.document_type === "other" ? alert.document_name_en : "",
      holder_name: alert.holder_name,
      cnic: alert.cnic,
      issue_date: alert.issue_date,
      expiry_date: alert.expiry_date,
    });
    setFile(null);
    setPreview(null);
    setShowForm(true);
    setError(null);
  }

  function resetForm() {
    setForm({ document_type: "passport", custom_type_name: "", holder_name: "", cnic: "", issue_date: "", expiry_date: "" });
    setFile(null);
    setPreview(null);
    setShowForm(false);
    setEditId(null);
    setError(null);
  }

  async function remove(id: string) {
    if(!confirm("Delete this document?")) return;
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
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-raah-green text-white rounded-xl text-sm font-medium hover:bg-raah-deep transition"
          >
            <Plus size={16} /> {lang === "ur" ? "نئی دستاویز" : "Add Document"}
          </button>
        </div>

        {success && <div className="mt-4 p-3 rounded-xl bg-raah-mint border border-raah-green/20 text-sm text-raah-deep flex items-center gap-2"><Check size={16}/> {success}</div>}
        {error && !showForm && <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

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
          <div className="mt-4 p-5 rounded-xl border-2 border-raah-green/30 bg-raah-soft">
            <div className="font-semibold text-sm mb-3 flex items-center gap-2">{editId ? <><Pencil size={14}/> Edit Document</> : <><FileImage size={14}/> Add New Document</>}</div>
            {error && <div className="mb-3 p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-text-secondary">Document Type *</label>
                <select
                  value={form.document_type}
                  onChange={(e) => setForm({ ...form, document_type: e.target.value, custom_type_name: e.target.value !== "other" ? "" : form.custom_type_name })}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-raah-green/20"
                >
                  <option value="passport">Passport</option>
                  <option value="cnic">CNIC</option>
                  <option value="business">Business Registration</option>
                  <option value="other">Others</option>
                </select>
              </div>
              {form.document_type === "other" && (
                <div>
                  <label className="text-xs font-medium text-text-secondary">Document Name *</label>
                  <input
                    value={form.custom_type_name}
                    onChange={(e) => setForm({ ...form, custom_type_name: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/20"
                    placeholder="e.g. Driving License, Property papers..."
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-text-secondary">Holder Name *</label>
                <input
                  value={form.holder_name}
                  onChange={(e) => setForm({ ...form, holder_name: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/20"
                  placeholder="Ehtisham Tahir"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary">CNIC *</label>
                <input
                  value={form.cnic}
                  onChange={(e) => setForm({ ...form, cnic: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/20"
                  placeholder="42101-1234567-1"
                />
                <div className="text-[11px] text-text-muted mt-1">Format: 42101-1234567-1</div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary flex items-center gap-1"><Calendar size={12}/> Issue Date *</label>
                <input
                  type="date"
                  value={form.issue_date}
                  onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary flex items-center gap-1"><Calendar size={12}/> Expiry Date *</label>
                <input
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary flex items-center gap-1"><FileImage size={12}/> Document Image</label>
                <div
                  onDragOver={e=>{e.preventDefault(); setDragOver(true);}}
                  onDragLeave={()=>setDragOver(false)}
                  onDrop={onDrop}
                  className={`w-full mt-1 flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-xl border-2 border-dashed text-sm cursor-pointer transition ${dragOver?"border-raah-green bg-raah-mint":"border-raah-green/30 bg-white hover:bg-raah-mint"}`}
                >
                  <Upload size={20} className="text-raah-green"/>
                  <span className="text-text-secondary text-xs text-center">{file ? file.name : "Drag & drop or click to upload (JPG/PNG/PDF, max 5MB)"}</span>
                  <span className="text-[11px] text-text-muted">Optional but recommended for view/download</span>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={onFileChange} id="doc-file" />
                  <label htmlFor="doc-file" className="px-3 py-1 rounded-full bg-white border border-border text-xs cursor-pointer">Choose File</label>
                </div>
                {preview && (
                  <div className="mt-2 relative">
                    <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-xl border border-border" />
                    <button onClick={()=>{setFile(null); setPreview(null);}} className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white"><XCircle size={14}/></button>
                    <div className="text-[11px] text-raah-green mt-1 flex items-center gap-1"><ShieldCheck size={12}/> Image ready — will be saved with document</div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={editId ? updateAlert : addAlert} disabled={saving} className="px-6 py-2.5 bg-raah-green text-white rounded-xl text-sm font-medium hover:bg-raah-deep disabled:opacity-50 flex items-center gap-2">
                {saving ? "Saving..." : editId ? <><Check size={14}/> Update Document</> : <><Check size={14}/> Save Document</>}
              </button>
              <button onClick={resetForm} className="px-4 py-2.5 border border-border rounded-xl text-sm text-text-secondary hover:bg-gray-50">
                Cancel
              </button>
            </div>
            <div className="text-[11px] text-text-muted mt-2">* Required fields. Document will be checked for expiry and status auto-calculated.</div>
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
            <div className="border border-dashed border-border rounded-xl p-8 text-center">
              <FileImage size={32} className="mx-auto text-text-muted"/>
              <div className="text-sm text-text-secondary mt-2">No documents yet</div>
              <div className="text-xs text-text-muted mt-1">Add your first document with image to enable view/download and expiry tracking</div>
              <button onClick={()=>setShowForm(true)} className="mt-3 px-4 py-2 bg-raah-green text-white rounded-full text-xs">Add Document</button>
            </div>
          ) : (
            alerts.map((alert) => {
              const status = STATUS_CONFIG[alert.status] || STATUS_CONFIG.valid;
              const StatusIcon = status.icon;
              return (
                <div key={alert.id} className="border border-border rounded-xl p-4 flex items-start justify-between hover:border-raah-green/30 transition hover:shadow-sm">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${status.color}`}>
                      <StatusIcon size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{lang === "ur" ? alert.document_name_ur : alert.document_name_en}</div>
                      <div className="text-xs text-text-muted mt-0.5">{alert.holder_name} | CNIC: {alert.cnic}</div>
                      <div className="text-xs text-text-muted mt-1 flex items-center gap-1">
                        <Calendar size={12}/> Expires: {alert.expiry_date}
                        {alert.status === "expired" && (
                          <span className="text-red-600 font-medium ml-2">
                            ({Math.abs(alert.days_until_expiry)} days ago)
                          </span>
                        )}
                        {alert.status === "expiring_soon" && (
                          <span className="text-yellow-600 font-medium ml-2">
                            ({alert.days_until_expiry} days left)
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {alert.has_image ? (
                          <>
                            <button onClick={()=>setViewImage(`${API}/alerts/${alert.id}/image`)} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-raah-green text-white text-xs font-medium hover:bg-raah-deep transition">
                              <Eye size={12}/> View
                            </button>
                            <a href={`${API}/alerts/${alert.id}/download`} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-border text-xs text-text-secondary hover:border-raah-green/30 hover:text-raah-green transition">
                              <Download size={12}/> Download
                            </a>
                          </>
                        ) : (
                          <span className="text-xs text-text-muted flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-50 border border-border"><FileImage size={12}/> No image — edit to add</span>
                        )}
                        <a
                          href={alert.renewal_url}
                          target="_blank"
                          rel="noopener"
                          className="flex items-center gap-1 text-xs text-raah-green hover:text-raah-deep border border-raah-green/20 px-3 py-1.5 rounded-full bg-white hover:bg-raah-mint transition"
                        >
                          <ExternalLink size={12} /> Renew Now
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(alert)}
                      className="text-text-muted hover:text-raah-green transition p-1 hover:bg-raah-mint rounded-full"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => remove(alert.id)}
                      className="text-text-muted hover:text-red-500 transition p-1 hover:bg-red-50 rounded-full"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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
              <div className="font-semibold text-sm flex items-center gap-2"><Eye size={14}/> Document Image</div>
              <button onClick={()=>setViewImage(null)} className="p-1 rounded-full hover:bg-raah-soft"><XCircle size={16}/></button>
            </div>
            <img src={viewImage} alt="document" className="w-full max-h-[70vh] object-contain rounded-xl border border-border bg-raah-soft" />
            <div className="mt-3 flex gap-2 justify-end">
              <a href={viewImage.replace("/image","/download")} className="px-4 py-2 rounded-xl border border-border text-sm flex items-center gap-1"><Download size={14}/> Download</a>
              <button onClick={()=>setViewImage(null)} className="px-4 py-2 rounded-xl bg-raah-green text-white text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
