"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { paymentsTimelineApi } from "@/lib/api";
import { CreditCard, Receipt, Banknote, Clock } from "lucide-react";

export default function PaymentsPage(){
  const {lang}=useLang();
  const [data,setData]=useState<any>(null);
  useEffect(()=>{paymentsTimelineApi().then(setData).catch(()=>{});},[]);
  const pending = data?.timeline?.filter((p:any)=>p.status==="Pending")||[];
  const paid = data?.timeline?.filter((p:any)=>p.status==="Paid")||[];
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><CreditCard size={20}/> Government Payments</h1>
          <p className="text-sm text-text-secondary mt-1">Fees • Taxes • Payment Timeline</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-border rounded-xl p-4 text-center"><div className="text-2xl font-bold">{data?.timeline?.length||0}</div><div className="text-xs text-text-muted">Total</div></div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-amber-600">{data?.summary?.pending||0}</div><div className="text-xs text-text-muted">Pending • PKR {data?.summary?.pending_amount?.toLocaleString()}</div></div>
          <div className="bg-raah-mint border border-raah-green/20 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-raah-green">{data?.summary?.paid||0}</div><div className="text-xs text-text-muted">Paid</div></div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="font-semibold text-sm mb-3">Payment Timeline</div>
          <div className="relative border-l-2 border-border ml-2 space-y-4">
            {(data?.timeline||[]).map((p:any)=>(
              <div key={p.id} className="ml-6 relative">
                <div className={`absolute -left-[29px] top-1 w-4 h-4 rounded-full border-2 ${p.status==="Paid"?"bg-raah-green border-raah-green":"bg-amber-400 border-amber-400"}`}></div>
                <div className="border border-border rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm flex items-center gap-2">{p.type==="Tax"?<Receipt size={14}/>:p.type==="Fine"?<Banknote size={14}/>:<CreditCard size={14}/>} {lang==="ur"?p.title_ur:p.title_en}</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${p.status==="Paid"?"bg-raah-mint text-raah-green":"bg-amber-100 text-amber-700"}`}>{p.status}</span>
                  </div>
                  <div className="text-xs text-text-muted mt-1">PKR {p.amount.toLocaleString()} • {p.category} • {p.method}</div>
                  <div className="text-xs text-text-muted flex items-center gap-1 mt-1"><Clock size={12}/>Due {p.due_date} {p.paid_date?`• Paid ${p.paid_date}`:""}</div>
                  <div className="text-[11px] text-text-muted mt-1">{p.official_source} • Verified {p.last_verified}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
