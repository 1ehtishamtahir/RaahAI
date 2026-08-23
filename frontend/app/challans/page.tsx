"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { challansApi } from "@/lib/api";
import { AlertTriangle, CheckCircle, Clock, Info } from "lucide-react";
import Link from "next/link";

function ChallansInner(){
  const {lang}=useLang();
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusParam = searchParams.get("status");
  const [data,setData]=useState<any>(null);

  useEffect(()=>{ challansApi(statusParam || undefined).then(setData).catch(()=>{}); },[statusParam]);

  function setFilter(s?: string){
    if(!s) router.push("/challans");
    else router.push(`/challans?status=${s}`);
  }

  const title = !statusParam ? "Challans" : statusParam === "Pending" ? "Pending Challans" : statusParam === "Paid" ? "Paid Challans" : "Challan Details";
  const subtitle = !statusParam ? "All challans with explanations — click sidebar to filter" : statusParam === "Pending" ? "Unpaid challans requiring action" : statusParam === "Paid" ? "Already paid challans" : "Detailed explanations per challan";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Link href="/challans" className="hover:text-raah-green">Challans</Link>
            {statusParam && <><span>›</span><span className="font-medium text-raah-deep">{statusParam}</span></>}
          </div>
          <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2 mt-1"><AlertTriangle size={20}/> {title}</h1>
          <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setFilter(undefined)} className={`px-3 py-1.5 rounded-full text-xs border ${!statusParam?"bg-raah-green text-white border-raah-green":"bg-white border-border"}`}>All</button>
          <button onClick={()=>setFilter("Pending")} className={`px-3 py-1.5 rounded-full text-xs border ${statusParam==="Pending"?"bg-amber-500 text-white border-amber-500":"bg-white border-border"}`}>Pending</button>
          <button onClick={()=>setFilter("Paid")} className={`px-3 py-1.5 rounded-full text-xs border ${statusParam==="Paid"?"bg-raah-green text-white border-raah-green":"bg-white border-border"}`}>Paid</button>
        </div>
      </div>

      {data?.summary && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-border rounded-xl p-4 text-center"><div className="text-2xl font-bold">{data.summary.total}</div><div className="text-xs text-text-muted">Total</div></div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-amber-600">{data.summary.pending}</div><div className="text-xs text-text-muted">Pending • PKR {data.summary.pending_amount?.toLocaleString()}</div></div>
          <div className="bg-raah-mint border border-raah-green/20 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-raah-green">{data.summary.paid}</div><div className="text-xs text-text-muted">Paid</div></div>
        </div>
      )}

      <div className="space-y-3">
        {(data?.challans||[]).map((c:any)=>(
          <div key={c.id} className="bg-white border border-border rounded-xl p-4 hover:border-raah-green/30 transition">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.status==="Pending"?"bg-amber-100 text-amber-600":"bg-raah-mint text-raah-green"}`}>{c.status==="Pending"?<AlertTriangle size={18}/>:<CheckCircle size={18}/>}</div>
                <div>
                  <div className="font-semibold text-sm">{c.id} • {c.vehicle}</div>
                  <div className="text-xs text-text-muted">{c.category} • {c.source}</div>
                  <div className="text-sm mt-1">{c.violation}</div>
                  <div className="text-xs text-text-secondary mt-1 flex gap-2"><span className="flex items-center gap-1"><Clock size={12}/>Due {c.due_date}</span> <span>• PKR {c.amount.toLocaleString()}</span> <span>• Issued {c.issue_date}</span></div>
                  <div className="text-xs mt-2 p-2 rounded-lg bg-raah-soft border border-border flex gap-2"><Info size={12} className="mt-0.5 shrink-0 text-raah-green"/><span>{lang==="ur"?c.explanation_ur:c.explanation_en}</span></div>
                  <div className="text-[11px] text-text-muted mt-2">Pay at: Traffic Police app / Excise office • Official source: {c.source}</div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${c.status==="Pending"?"bg-amber-100 text-amber-700":"bg-raah-mint text-raah-green"}`}>{c.status}</span>
            </div>
          </div>
        ))}
        {data && data.challans.length===0 && <div className="text-center text-sm text-text-muted py-8">No challans found for {statusParam}</div>}
        {!data && <div className="text-sm text-text-muted animate-pulse">Loading challans...</div>}
      </div>
    </div>
  );
}

export default function ChallansPage(){
  return (
    <AppShell>
      <Suspense fallback={<div className="p-6 text-sm text-text-muted animate-pulse">Loading Challans...</div>}>
        <ChallansInner />
      </Suspense>
    </AppShell>
  );
}
