"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { challansApi } from "@/lib/api";
import { AlertTriangle, CheckCircle, Clock, Info, CreditCard, Smartphone, Building2, ExternalLink, X } from "lucide-react";

export default function ChallansPage(){
  const {lang}=useLang();
  const [data,setData]=useState<any>(null);
  const [filter,setFilter]=useState<string|undefined>(undefined);
  const [payFor, setPayFor] = useState<any>(null);
  useEffect(()=>{ challansApi(filter).then(setData).catch(()=>{}); },[filter]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><Info size={20}/> Challan Details</h1>
            <p className="text-sm text-text-secondary mt-1">All challans with violation details and explanations — Pending & Paid</p>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setFilter(undefined)} className={`px-3 py-1.5 rounded-full text-xs border ${!filter?"bg-raah-green text-white border-raah-green":"bg-white border-border"}`}>All</button>
            <button onClick={()=>setFilter("Pending")} className={`px-3 py-1.5 rounded-full text-xs border ${filter==="Pending"?"bg-amber-500 text-white border-amber-500":"bg-white border-border"}`}>Pending</button>
            <button onClick={()=>setFilter("Paid")} className={`px-3 py-1.5 rounded-full text-xs border ${filter==="Paid"?"bg-raah-green text-white border-raah-green":"bg-white border-border"}`}>Paid</button>
          </div>
        </div>

        {data?.summary && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-border rounded-xl p-4 text-center"><div className="text-2xl font-bold">{data.summary.total}</div><div className="text-xs text-text-muted">Total</div></div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-amber-600">{data.summary.pending}</div><div className="text-xs text-text-muted">Pending • PKR {data.summary.pending_amount?.toLocaleString()}</div></div>
            <div className="bg-raah-mint border border-raah-green/20 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-raah-green">{data.summary.paid}</div><div className="text-xs text-text-muted">Paid</div></div>
          </div>
        )}

        {/* How to Pay Guide */}
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="font-semibold text-sm flex items-center gap-2"><CreditCard size={16} className="text-raah-green"/> How to Pay Challan</div>
          <p className="text-xs text-text-muted mt-1">Pay within 30 days to avoid late fee. Keep receipt for record. Choose any method below:</p>
          <div className="grid md:grid-cols-4 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-raah-soft border border-border text-center">
              <Smartphone size={18} className="mx-auto text-raah-green"/>
              <div className="font-semibold text-xs mt-2">Traffic Police App</div>
              <div className="text-[11px] text-text-muted mt-1">Sindh/Punjab Police app → Enter challan no → Pay via JazzCash/EasyPaisa</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <Smartphone size={18} className="mx-auto text-blue-600"/>
              <div className="font-semibold text-xs mt-2">ePay Punjab / Sindh</div>
              <div className="text-[11px] text-text-muted mt-1">epay.punjab.gov.pk → Challan → Enter ID → Pay via card/wallet</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <Building2 size={18} className="mx-auto text-amber-600"/>
              <div className="font-semibold text-xs mt-2">Bank / NBP</div>
              <div className="text-[11px] text-text-muted mt-1">Visit NBP/UBL/HBL → Show challan → Pay at counter → Get receipt</div>
            </div>
            <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 text-center">
              <Building2 size={18} className="mx-auto text-violet-600"/>
              <div className="font-semibold text-xs mt-2">Excise Office</div>
              <div className="text-[11px] text-text-muted mt-1">Visit Excise & Taxation office → Counter 3 → Pay → Update record</div>
            </div>
          </div>
          <div className="text-[11px] text-text-muted mt-3 flex items-center gap-1"><Info size={12}/> Official sources: Sindh Police — sindhpolice.gov.pk • Excise — excise.gos.pk • Verified 2026-08-10</div>
        </div>

        <div className="space-y-3">
          {(data?.challans||[]).map((c:any)=>(
            <div key={c.id} className="bg-white border border-border rounded-xl p-4 hover:border-raah-green/30 transition">
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.status==="Pending"?"bg-amber-100 text-amber-600":"bg-raah-mint text-raah-green"}`}>{c.status==="Pending"?<AlertTriangle size={18}/>:<CheckCircle size={18}/>}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{c.id} • {c.vehicle}</div>
                    <div className="text-xs text-text-muted">{c.category} • {c.source}</div>
                    <div className="text-sm mt-1">{c.violation}</div>
                    <div className="text-xs text-text-secondary mt-1 flex gap-2"><span className="flex items-center gap-1"><Clock size={12}/>Due {c.due_date}</span> <span>• PKR {c.amount.toLocaleString()}</span> <span>• Issued {c.issue_date}</span></div>
                    <div className="text-xs mt-2 p-2 rounded-lg bg-raah-soft border border-border flex gap-2"><Info size={12} className="mt-0.5 shrink-0 text-raah-green"/><span>{lang==="ur"?c.explanation_ur:c.explanation_en}</span></div>
                    <div className="text-[11px] text-text-muted mt-2">Official source: {c.source} • Verified 2026-08-10</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0 ml-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status==="Pending"?"bg-amber-100 text-amber-700":"bg-raah-mint text-raah-green"}`}>{c.status}</span>
                  {c.status==="Pending" ? (
                    <button onClick={()=>setPayFor(c)} className="px-4 py-1.5 rounded-full bg-raah-green text-white text-xs font-medium hover:bg-raah-deep flex items-center gap-1">
                      <CreditCard size={12}/> Pay Now
                    </button>
                  ) : (
                    <span className="text-xs text-text-muted flex items-center gap-1"><CheckCircle size={12}/> Paid</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {data && data.challans.length===0 && <div className="text-center text-sm text-text-muted py-8">No challans found</div>}
          {!data && <div className="text-sm text-text-muted animate-pulse">Loading challans...</div>}
        </div>
      </div>

      {/* Pay Modal */}
      {payFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={()=>setPayFor(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="font-bold text-raah-deep">Pay Challan — {payFor.id}</div>
              <button onClick={()=>setPayFor(null)} className="p-1 rounded-full hover:bg-raah-soft"><X size={16}/></button>
            </div>
            <div className="text-sm text-text-secondary mt-1">{payFor.violation} • PKR {payFor.amount.toLocaleString()} • Due {payFor.due_date}</div>
            <div className="mt-4 space-y-2">
              <a href="https://epay.punjab.gov.pk" target="_blank" className="flex items-center justify-between p-3 rounded-xl border border-raah-green bg-raah-mint hover:bg-raah-green hover:text-white transition">
                <span className="text-sm font-medium flex items-center gap-2"><Smartphone size={14}/> ePay Punjab / Sindh</span>
                <ExternalLink size={14}/>
              </a>
              <div className="p-3 rounded-xl border border-border bg-white">
                <div className="text-xs font-semibold">Other methods:</div>
                <ul className="text-xs text-text-secondary mt-1 list-disc pl-4 space-y-1">
                  <li>Traffic Police App → Enter {payFor.id} → JazzCash/EasyPaisa</li>
                  <li>NBP/UBL/HBL counter → Show challan print</li>
                  <li>Excise office Counter 3</li>
                </ul>
              </div>
              <div className="text-[11px] text-text-muted">After payment, keep receipt and challan status will update to Paid within 24h. Source: {payFor.source}</div>
            </div>
            <button onClick={()=>setPayFor(null)} className="mt-4 w-full py-2 rounded-xl bg-raah-green text-white text-sm font-medium">Close</button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
