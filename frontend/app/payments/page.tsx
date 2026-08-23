"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { paymentsTimelineApi } from "@/lib/api";
import { CreditCard, Receipt, Banknote, Clock, Smartphone, Building2, ExternalLink, X } from "lucide-react";

export default function PaymentsPage(){
  const {lang}=useLang();
  const [data,setData]=useState<any>(null);
  const [payFor,setPayFor]=useState<any>(null);
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

        <div className="bg-white border border-border rounded-2xl p-4">
          <div className="font-semibold text-sm flex items-center gap-2"><CreditCard size={14} className="text-raah-green"/> How to Pay</div>
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

        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="font-semibold text-sm mb-3">Payment Timeline</div>
          <div className="relative border-l-2 border-border ml-2 space-y-4">
            {(data?.timeline||[]).map((p:any)=>(
              <div key={p.id} className="ml-6 relative">
                <div className={`absolute -left-[29px] top-1 w-4 h-4 rounded-full border-2 ${p.status==="Paid"?"bg-raah-green border-raah-green":"bg-amber-400 border-amber-400"}`}></div>
                <div className="border border-border rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm flex items-center gap-2">{p.type==="Tax"?<Receipt size={14}/>:p.type==="Fine"?<Banknote size={14}/>:<CreditCard size={14}/>} {lang==="ur"?p.title_ur:p.title_en}</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.status==="Paid"?"bg-raah-mint text-raah-green":"bg-amber-100 text-amber-700"}`}>{p.status}</span>
                      {p.status==="Pending" && <button onClick={()=>setPayFor(p)} className="px-3 py-1 rounded-full bg-raah-green text-white text-xs font-medium hover:bg-raah-deep flex items-center gap-1"><CreditCard size={10}/> Pay</button>}
                    </div>
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

      {payFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={()=>setPayFor(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="font-bold text-raah-deep">Pay — {payFor.title_en}</div>
              <button onClick={()=>setPayFor(null)} className="p-1 rounded-full hover:bg-raah-soft"><X size={16}/></button>
            </div>
            <div className="text-sm text-text-secondary mt-1">PKR {payFor.amount.toLocaleString()} • Due {payFor.due_date} • {payFor.method}</div>
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
