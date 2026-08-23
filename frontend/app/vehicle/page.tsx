"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { vehiclesApi, vehicleFlowApi } from "@/lib/api";
import { Car, ArrowRightLeft, Receipt, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";

function VehicleInner() {
  const { lang } = useLang();
  const searchParams = useSearchParams();
  const router = useRouter();
  const svc = searchParams.get("svc");
  const [vehicles, setVehicles] = useState<any>(null);
  const [flow, setFlow] = useState<any>(null);

  useEffect(()=>{vehiclesApi().then(setVehicles).catch(()=>{});},[]);
  useEffect(()=>{
    if(svc){ vehicleFlowApi(svc).then(setFlow).catch(()=>setFlow(null)); }
    else setFlow(null);
  },[svc]);

  if (!svc) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><Car size={20}/> Vehicle</h1>
          <p className="text-sm text-text-secondary mt-1">Registration • Ownership Transfer • Token Tax — each with Mission Mode</p>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <button onClick={()=>router.push("/vehicle?svc=registration")} className="text-left bg-white border border-border rounded-xl p-4 hover:border-raah-green/30 hover:shadow-sm transition">
            <div className="font-semibold text-sm flex items-center gap-2"><Car size={14}/> Registration</div>
            <div className="text-xs text-text-muted mt-1">New vehicle registration via Excise</div>
            <div className="text-xs text-raah-green mt-3">Open →</div>
          </button>
          <button onClick={()=>router.push("/vehicle?svc=transfer")} className="text-left bg-white border border-border rounded-xl p-4 hover:border-raah-green/30 hover:shadow-sm transition">
            <div className="font-semibold text-sm flex items-center gap-2"><ArrowRightLeft size={14}/> Transfer</div>
            <div className="text-xs text-text-muted mt-1">Ownership transfer (seller + buyer)</div>
            <div className="text-xs text-raah-green mt-3">Open →</div>
          </button>
          <button onClick={()=>router.push("/vehicle?svc=token_tax")} className="text-left bg-white border border-border rounded-xl p-4 hover:border-raah-green/30 hover:shadow-sm transition">
            <div className="font-semibold text-sm flex items-center gap-2"><Receipt size={14}/> Token Tax</div>
            <div className="text-xs text-text-muted mt-1">Pay via Excise or ePay Punjab/Sindh</div>
            <div className="text-xs text-raah-green mt-3">Open →</div>
          </button>
        </div>
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="font-semibold text-sm mb-3">My Vehicles</div>
          <div className="space-y-3">
            {(vehicles?.vehicles||[]).map((v:any)=>(
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
            {!vehicles?.vehicles?.length && <div className="text-sm text-text-muted animate-pulse">Loading vehicles...</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Link href="/vehicle" className="hover:text-raah-green">Vehicle</Link><span>›</span><span className="font-medium text-raah-deep capitalize">{svc.replace(/_/g," ")}</span>
      </div>
      {flow ? (
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="font-bold text-raah-deep">{lang==="ur"?flow.name_ur:flow.name_en}</div>
          <div className="text-xs text-text-muted mt-1">{flow.official_source} • Verified {flow.last_verified}</div>
          <div className="mt-6 grid grid-cols-3 md:grid-cols-6 gap-2">
            {flow.mission_steps.map((s:any)=>(
              <div key={s.step} className={`p-3 rounded-xl border text-center ${s.status==="done"?"bg-raah-mint border-raah-green/30":"bg-white border-border"}`}>
                <div className="text-xs font-bold text-raah-green">Step {s.step}</div>
                <div className="text-xs font-semibold mt-1">{lang==="ur"?s.title_ur:s.title_en}</div>
                <div className="text-[11px] text-text-muted mt-1 line-clamp-2">{lang==="ur"?s.description_ur:s.description_en}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-xl bg-raah-soft border border-border">
              <div className="font-semibold text-xs text-text-muted">Required Documents</div>
              <ul className="mt-2 space-y-1 text-text-secondary text-xs list-disc pl-4">{flow.required_documents.map((d:string)=><li key={d}>{d}</li>)}</ul>
            </div>
            <div className="p-3 rounded-xl bg-white border border-border">
              <div className="font-semibold text-xs text-text-muted">Eligibility</div>
              <ul className="mt-2 space-y-1 text-text-secondary text-xs list-disc pl-4">{flow.eligibility.map((d:string)=><li key={d}>{d}</li>)}</ul>
              <div className="mt-3 text-xs"><span className="text-text-muted">Fee:</span> {flow.fee_normal} | {flow.fee_urgent}</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-border">
              <div className="font-semibold text-xs text-text-muted">Application Method</div>
              <ol className="mt-2 space-y-1 text-text-secondary text-xs list-decimal pl-4">{flow.application_method.map((d:string)=><li key={d}>{d}</li>)}</ol>
              <a href={flow.tracking_url} target="_blank" className="text-xs text-raah-green mt-2 inline-block flex items-center gap-1"><ShieldCheck size={12}/> Track → {flow.tracking_url}</a>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl p-6 text-sm text-text-muted animate-pulse">Loading {svc}...</div>
      )}
    </div>
  );
}

export default function VehiclePage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-6 text-sm text-text-muted animate-pulse">Loading Vehicle...</div>}>
        <VehicleInner />
      </Suspense>
    </AppShell>
  );
}
