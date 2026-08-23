"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { vehiclesApi } from "@/lib/api";
import { Car, ArrowRightLeft, Receipt, Clock } from "lucide-react";

export default function VehiclePage() {
  const { lang } = useLang();
  const [data, setData] = useState<any>(null);
  useEffect(()=>{vehiclesApi().then(setData).catch(()=>{});},[]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><Car size={20}/> Vehicle</h1>
          <p className="text-sm text-text-secondary mt-1">Registration • Ownership Transfer • Token Tax</p>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div className="bg-white border border-border rounded-xl p-4">
            <div className="font-semibold text-sm flex items-center gap-2"><Car size={14}/> Registration</div>
            <div className="text-xs text-text-muted mt-1">New vehicle registration via Excise</div>
            <button className="mt-3 text-xs px-3 py-1.5 rounded-full bg-raah-green text-white">Register Vehicle</button>
          </div>
          <div className="bg-white border border-border rounded-xl p-4">
            <div className="font-semibold text-sm flex items-center gap-2"><ArrowRightLeft size={14}/> Transfer</div>
            <div className="text-xs text-text-muted mt-1">Ownership transfer (seller + buyer)</div>
            <button className="mt-3 text-xs px-3 py-1.5 rounded-full border border-border">Start Transfer</button>
          </div>
          <div className="bg-white border border-border rounded-xl p-4">
            <div className="font-semibold text-sm flex items-center gap-2"><Receipt size={14}/> Token Tax</div>
            <div className="text-xs text-text-muted mt-1">Pay via Excise or ePay Punjab/Sindh</div>
            <button className="mt-3 text-xs px-3 py-1.5 rounded-full border border-border">Pay Token</button>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="font-semibold text-sm mb-3">My Vehicles</div>
          <div className="space-y-3">
            {(data?.vehicles||[]).map((v:any)=>(
              <div key={v.id} className="border border-border rounded-xl p-4 flex items-center justify-between">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-raah-mint flex items-center justify-center text-raah-green"><Car size={18}/></div>
                  <div>
                    <div className="font-semibold text-sm">{v.registration_no} • {v.make}</div>
                    <div className="text-xs text-text-muted">{v.type} • {v.model} • {v.ownership_status}</div>
                    <div className="text-xs mt-1 flex items-center gap-1"><Clock size={12}/> Token: <span className={v.token_tax_status==="Paid"?"text-raah-green":"text-amber-600"}>{v.token_tax_status}</span> • Due {v.token_due}</div>
                  </div>
                </div>
                <div className="text-xs text-raah-green">View →</div>
              </div>
            ))}
            {!data?.vehicles?.length && <div className="text-sm text-text-muted animate-pulse">Loading vehicles...</div>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
