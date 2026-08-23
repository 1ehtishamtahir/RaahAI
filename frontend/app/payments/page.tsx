"use client";
import { useEffect, useState, useMemo } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { paymentsTimelineApi, paymentsAnalyticsApi } from "@/lib/api";
import { CreditCard, Receipt, Banknote, Clock, Smartphone, Building2, ExternalLink, X, Search, Download, Filter, AlertTriangle, CheckCircle, TrendingUp, Calendar } from "lucide-react";

export default function PaymentsPage(){
  const {lang}=useLang();
  const [data,setData]=useState<any>(null);
  const [analytics,setAnalytics]=useState<any>(null);
  const [payFor,setPayFor]=useState<any>(null);
  const [q,setQ]=useState("");
  const [status,setStatus]=useState<string|undefined>(undefined);
  const [type,setType]=useState<string|undefined>(undefined);
  const [category,setCategory]=useState<string|undefined>(undefined);
  const [sort,setSort]=useState("due_date");
  const [view,setView]=useState<"timeline"|"table">("timeline");

  useEffect(()=>{ paymentsTimelineApi({status, category, type, q: q||undefined, sort}).then(setData).catch(()=>{}); },[status, category, type, q, sort]);
  useEffect(()=>{ paymentsAnalyticsApi().then(setAnalytics).catch(()=>{}); },[]);

  const filteredCount = data?.timeline?.length || 0;

  function exportCSV(){
    if(!data?.timeline) return;
    const rows = [["ID","Title","Type","Category","Amount","Status","Due","Method"].join(",")].concat(
      data.timeline.map((p:any)=> [p.id, `"${p.title_en}"`, p.type, p.category, p.amount, p.status, p.due_date, p.method].join(","))
    );
    const blob = new Blob([rows.join("\n")], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url; a.download="raahai-payments.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><CreditCard size={20}/> Government Payments</h1>
            <p className="text-sm text-text-secondary mt-1">Fees • Taxes • Fines • Timeline — optimized with search, filters & analytics</p>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setView(view==="timeline"?"table":"timeline")} className="px-3 py-1.5 rounded-full border border-border text-xs bg-white hover:bg-raah-soft">{view==="timeline"?"Table View":"Timeline View"}</button>
            <button onClick={exportCSV} className="px-3 py-1.5 rounded-full bg-raah-green text-white text-xs flex items-center gap-1"><Download size={12}/> Export CSV</button>
          </div>
        </div>

        {/* Summary — now 5 cards with overdue/due soon */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white border border-border rounded-xl p-3 text-center"><div className="text-xl font-bold">{data?.summary?.total||0}</div><div className="text-xs text-text-muted">Total</div><div className="text-[10px] text-text-muted">PKR {(data?.summary?.paid_amount||0)+(data?.summary?.pending_amount||0)+(data?.summary?.overdue_amount||0)}</div></div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center"><div className="text-xl font-bold text-amber-600">{data?.summary?.pending||0}</div><div className="text-xs text-text-muted">Pending</div><div className="text-[10px] text-amber-700">PKR {data?.summary?.pending_amount?.toLocaleString()||0}</div></div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center"><div className="text-xl font-bold text-red-600">{data?.summary?.overdue||0}</div><div className="text-xs text-text-muted">Overdue</div><div className="text-[10px] text-red-600">PKR {data?.summary?.overdue_amount?.toLocaleString()||0}</div></div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center"><div className="text-xl font-bold text-orange-600">{data?.summary?.due_soon||0}</div><div className="text-xs text-text-muted">Due Soon (7d)</div></div>
          <div className="bg-raah-mint border border-raah-green/20 rounded-xl p-3 text-center"><div className="text-xl font-bold text-raah-green">{data?.summary?.paid||0}</div><div className="text-xs text-text-muted">Paid</div><div className="text-[10px] text-raah-green">PKR {data?.summary?.paid_amount?.toLocaleString()||0}</div></div>
        </div>

        {/* Analytics */}
        {analytics && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-border rounded-2xl p-4">
              <div className="font-semibold text-xs flex items-center gap-2"><TrendingUp size={12} className="text-raah-green"/> Pending by Category</div>
              <div className="mt-3 space-y-2">
                {Object.entries(analytics.by_category||{}).map(([cat, amt]:any)=>(
                  <div key={cat} className="flex items-center gap-2">
                    <div className="text-xs w-20">{cat}</div>
                    <div className="flex-1 bg-border rounded-full h-2 overflow-hidden">
                      <div className="bg-raah-green h-2 rounded-full" style={{width: `${Math.min(100, (amt as number)/200)}%`}}></div>
                    </div>
                    <div className="text-xs text-text-muted">PKR {amt as number}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-border rounded-2xl p-4">
              <div className="font-semibold text-xs flex items-center gap-2"><AlertTriangle size={12} className="text-amber-600"/> Alerts</div>
              <div className="mt-3 space-y-2 text-xs">
                {analytics.overdue?.length ? <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700">{analytics.overdue.length} overdue — pay now to avoid late fee</div> : <div className="p-2 rounded-lg bg-raah-soft border border-border text-text-muted">No overdue payments</div>}
                {analytics.due_soon?.length ? <div className="p-2 rounded-lg bg-orange-50 border border-orange-200">{analytics.due_soon.map((p:any)=>p.title_en).join(", ")} — due within 7 days</div> : null}
              </div>
            </div>
          </div>
        )}

        {/* Controls: search + filters + sort */}
        <div className="bg-white border border-border rounded-2xl p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 bg-raah-soft border border-border rounded-full px-3 py-2">
              <Search size={14} className="text-text-muted"/>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by title, category..." className="flex-1 bg-transparent outline-none text-sm"/>
              {q && <button onClick={()=>setQ("")} className="text-xs text-text-muted">✕</button>}
            </div>
            <select value={category||""} onChange={e=>setCategory(e.target.value||undefined)} className="px-3 py-2 rounded-full border border-border text-xs bg-white">
              <option value="">All Categories</option>
              <option value="Identity">Identity</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Challans">Challans</option>
              <option value="Business">Business</option>
              <option value="Tax">Tax</option>
            </select>
            <select value={sort} onChange={e=>setSort(e.target.value)} className="px-3 py-2 rounded-full border border-border text-xs bg-white">
              <option value="due_date">Sort: Due Date</option>
              <option value="amount">Sort: Amount</option>
              <option value="priority">Sort: Priority</option>
            </select>
          </div>

          {/* Status + Type pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-text-muted flex items-center gap-1"><Filter size={12}/> Status:</span>
            {[
              {k:undefined, label:"All"},
              {k:"Pending", label:"Pending"},
              {k:"Overdue", label:"Overdue"},
              {k:"Due Soon", label:"Due Soon"},
              {k:"Paid", label:"Paid"},
            ].map(p=>(
              <button key={p.label} onClick={()=>setStatus(p.k)} className={`px-3 py-1 rounded-full text-xs border ${status===p.k?"bg-raah-green text-white border-raah-green":p.k==="Overdue"&&status==="Overdue"?"bg-red-600 text-white border-red-600":"bg-white border-border hover:border-raah-green/30"}`}>{p.label}</button>
            ))}
            <span className="text-xs text-text-muted ml-2">Type:</span>
            {[
              {k:undefined, label:"All"},
              {k:"Fee", label:"Fees"},
              {k:"Tax", label:"Taxes"},
              {k:"Fine", label:"Fines"},
            ].map(p=>(
              <button key={p.label} onClick={()=>setType(p.k)} className={`px-3 py-1 rounded-full text-xs border ${type===p.k?"bg-raah-green text-white border-raah-green":"bg-white border-border hover:border-raah-green/30"}`}>{p.label}</button>
            ))}
            <span className="text-xs text-text-muted ml-auto">{filteredCount} results</span>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-4">
          <div className="font-semibold text-xs flex items-center gap-2"><CreditCard size={12} className="text-raah-green"/> How to Pay</div>
          <div className="grid md:grid-cols-3 gap-2 mt-3">
            <div className="p-2 rounded-lg bg-raah-soft border border-border text-center">
              <Smartphone size={14} className="mx-auto text-raah-green"/>
              <div className="text-xs font-medium mt-1">ePay / App</div>
              <div className="text-[11px] text-text-muted mt-1">epay.punjab.gov.pk or Pak-ID / DGIP app</div>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-center">
              <CreditCard size={14} className="mx-auto text-blue-600"/>
              <div className="text-xs font-medium mt-1">Card / Wallet</div>
              <div className="text-[11px] text-text-muted mt-1">JazzCash, EasyPaisa, Visa/Mastercard</div>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-center">
              <Building2 size={14} className="mx-auto text-amber-600"/>
              <div className="text-xs font-medium mt-1">Bank / Office</div>
              <div className="text-[11px] text-text-muted mt-1">NBP, HBL, UBL or Excise/NADRA center</div>
            </div>
          </div>
        </div>

        {/* Timeline or Table */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="font-semibold text-sm mb-3 flex items-center justify-between">
            <span>{view==="timeline"?"Payment Timeline":"Payments Table"} — {filteredCount} items</span>
            <span className="text-xs text-text-muted flex items-center gap-1"><Calendar size={12}/> Sorted by {sort}</span>
          </div>

          {view==="timeline" ? (
            <div className="relative border-l-2 border-border ml-2 space-y-4">
              {(data?.timeline||[]).map((p:any)=>(
                <div key={p.id} className="ml-6 relative">
                  <div className={`absolute -left-[29px] top-1 w-4 h-4 rounded-full border-2 ${p.due_status==="Overdue"?"bg-red-600 border-red-600":p.due_status==="Due Soon"?"bg-orange-400 border-orange-400":p.status==="Paid"?"bg-raah-green border-raah-green":"bg-amber-400 border-amber-400"}`}></div>
                  <div className={`border rounded-xl p-3 ${p.due_status==="Overdue"?"border-red-200 bg-red-50/50":p.due_status==="Due Soon"?"border-orange-200 bg-orange-50/50":"border-border bg-white"}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {p.type==="Tax"?<Receipt size={14}/>:p.type==="Fine"?<Banknote size={14}/>:<CreditCard size={14}/>}
                        {lang==="ur"?p.title_ur:p.title_en}
                        {p.due_status==="Overdue" && <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] flex items-center gap-1"><AlertTriangle size={10}/> Overdue</span>}
                        {p.due_status==="Due Soon" && <span className="px-2 py-0.5 rounded-full bg-orange-400 text-white text-[10px]">Due Soon</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${p.status==="Paid"?"bg-raah-mint text-raah-green":p.due_status==="Overdue"?"bg-red-100 text-red-700":p.due_status==="Due Soon"?"bg-orange-100 text-orange-700":"bg-amber-100 text-amber-700"}`}>{p.due_status==="Overdue"?"Overdue":p.status}</span>
                        {p.status!=="Paid" && <button onClick={()=>setPayFor(p)} className="px-3 py-1 rounded-full bg-raah-green text-white text-xs font-medium hover:bg-raah-deep flex items-center gap-1"><CreditCard size={10}/> Pay</button>}
                      </div>
                    </div>
                    <div className="text-xs text-text-muted mt-1">PKR {p.amount.toLocaleString()} • {p.category} • {p.type} • {p.method}</div>
                    <div className="text-xs text-text-muted flex items-center gap-1 mt-1"><Clock size={12}/>Due {p.due_date} {p.paid_date?`• Paid ${p.paid_date}`:p.due_status==="Overdue"?`• Overdue by ${Math.abs(Math.ceil((new Date().getTime()-new Date(p.due_date).getTime())/86400000))} days`:""}</div>
                    <div className="text-[11px] text-text-muted mt-1">{p.official_source} • Verified {p.last_verified}</div>
                  </div>
                </div>
              ))}
              {data && data.timeline.length===0 && <div className="text-center text-sm text-text-muted py-6">No payments match your filters — try clearing search/filters</div>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-text-muted border-b border-border">
                  <tr><th className="text-left py-2">Title</th><th className="text-left">Category</th><th className="text-right">Amount</th><th className="text-left">Due</th><th className="text-left">Status</th><th></th></tr>
                </thead>
                <tbody>
                  {(data?.timeline||[]).map((p:any)=>(
                    <tr key={p.id} className="border-b border-border/50 hover:bg-raah-soft/50">
                      <td className="py-2">
                        <div className="font-medium">{lang==="ur"?p.title_ur:p.title_en}</div>
                        <div className="text-xs text-text-muted">{p.type} • {p.method}</div>
                      </td>
                      <td className="text-xs">{p.category}</td>
                      <td className="text-right font-medium">PKR {p.amount.toLocaleString()}</td>
                      <td className={`text-xs ${p.due_status==="Overdue"?"text-red-600 font-bold":p.due_status==="Due Soon"?"text-orange-600":""}`}>{p.due_date} {p.due_status==="Overdue"&&"• Overdue"}</td>
                      <td><span className={`text-xs px-2 py-1 rounded-full ${p.status==="Paid"?"bg-raah-mint text-raah-green":"bg-amber-100 text-amber-700"}`}>{p.due_status==="Overdue"?"Overdue":p.status}</span></td>
                      <td>{p.status!=="Paid" && <button onClick={()=>setPayFor(p)} className="text-xs px-3 py-1 rounded-full bg-raah-green text-white">Pay</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {payFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={()=>setPayFor(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="font-bold text-raah-deep">Pay — {payFor.title_en}</div>
              <button onClick={()=>setPayFor(null)} className="p-1 rounded-full hover:bg-raah-soft"><X size={16}/></button>
            </div>
            <div className="text-sm text-text-secondary mt-1">PKR {payFor.amount.toLocaleString()} • Due {payFor.due_date} • {payFor.method} {payFor.due_status==="Overdue"&&<span className="text-red-600 font-bold">• Overdue</span>}</div>
            <div className="mt-4 space-y-2">
              <a href="https://epay.punjab.gov.pk" target="_blank" className="flex items-center justify-between p-3 rounded-xl border border-raah-green bg-raah-mint hover:bg-raah-green hover:text-white transition">
                <span className="text-sm font-medium flex items-center gap-2"><ExternalLink size={14}/> Pay via ePay / Official Portal</span>
                <ExternalLink size={14}/>
              </a>
              <div className="p-3 rounded-xl border border-border bg-white text-xs text-text-secondary">
                Steps: Generate challan → Pay via app/card/bank → Keep receipt → Status updates in 24h
              </div>
            </div>
            <button onClick={()=>setPayFor(null)} className="mt-4 w-full py-2 rounded-xl bg-raah-green text-white text-sm font-medium">Close</button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
