"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { challansApi } from "@/lib/api";
import { AlertTriangle, CheckCircle, Clock, Info } from "lucide-react";

export default function ChallansPage(){
  const {lang}=useLang();
  const [data,setData]=useState<any>(null);
  const [filter,setFilter]=useState<string|undefined>(undefined);
  useEffect(()=>{challansApi(filter).then(setData).catch(()=>{});},[filter]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><AlertTriangle size={20}/> Challans</h1>
            <p className="text-sm text-text-secondary mt-1">Pending • Paid • Details / Explanation</p>
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

        <div className="space-y-3">
          {(data?.challans||[]).map((c:any)=>(
            <div key={c.id} className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.status==="Pending"?"bg-amber-100 text-amber-600":"bg-raah-mint text-raah-green"}`}>{c.status==="Pending"?<AlertTriangle size={18}/>:<CheckCircle size={18}/>}</div>
                  <div>
                    <div className="font-semibold text-sm">{c.id} • {c.vehicle}</div>
                    <div className="text-xs text-text-muted">{c.category} • {c.source}</div>
                    <div className="text-sm mt-1">{c.violation}</div>
                    <div className="text-xs text-text-secondary mt-1 flex gap-2"><span className="flex items-center gap-1"><Clock size={12}/>Due {c.due_date}</span> <span>• PKR {c.amount.toLocaleString()}</span></div>
                    <div className="text-xs mt-2 p-2 rounded-lg bg-raah-soft border border-border flex gap-2"><Info size={12} className="mt-0.5 shrink-0 text-raah-green"/>{lang==="ur"?c.explanation_ur:c.explanation_en}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status==="Pending"?"bg-amber-100 text-amber-700":"bg-raah-mint text-raah-green"}`}>{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
