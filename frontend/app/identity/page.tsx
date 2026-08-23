"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { identityListApi, identityFlowApi, identityStatusApi } from "@/lib/api";
import Link from "next/link";
import { Shield, FileText, Baby, Heart, Skull, ArrowRight, Clock, CheckCircle, CreditCard, Smartphone, Building2, ExternalLink, X } from "lucide-react";

const ICONS: Record<string, any> = { cnic: Shield, passport: Shield, frc: FileText, birth_registration: Baby, marriage_registration: Heart, death_registration: Skull };

function IdentityInner() {
  const { lang } = useLang();
  const searchParams = useSearchParams();
  const router = useRouter();
  const svcParam = searchParams.get("svc");
  const subParam = searchParams.get("sub");
  const [list, setList] = useState<any>(null);
  const [flow, setFlow] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPay, setShowPay] = useState(false);

  useEffect(() => { identityListApi().then(setList).catch(()=>{}); }, []);
  useEffect(() => {
    if (svcParam) {
      setError(null);
      identityFlowApi(svcParam).then(setFlow).catch(()=>{ setFlow(null); setError(`Unknown service: ${svcParam}`); });
      if (subParam === "status") {
        identityStatusApi(svcParam).then(setStatus).catch(()=>{});
      } else {
        setStatus(null);
      }
    } else {
      setFlow(null);
      setStatus(null);
      setError(null);
    }
  }, [svcParam, subParam]);

  function select(svc: string) {
    router.push(`/identity?svc=${svc}`);
  }

  // Overview: no svc selected -> show grid of all services
  if (!svcParam) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><Shield size={20}/> Identity</h1>
          <p className="text-sm text-text-secondary mt-1">CNIC, Passport, FRC, Birth, Marriage, Death — each with Mission Mode (Requirement → Tracking)</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(list?.services || ["cnic","passport","frc","birth_registration","marriage_registration","death_registration"]).map((svc:string) => {
            const Icon = ICONS[svc] || Shield;
            const isPrimary = list?.primary?.includes(svc);
            return (
              <button key={svc} onClick={()=>select(svc)} className={`text-left p-4 rounded-2xl border-2 transition ${isPrimary?"border-raah-green bg-raah-mint ring-1 ring-raah-green/20":"border-border bg-white hover:border-raah-green/30"}`}>
                <Icon size={20} className={isPrimary?"text-raah-green":"text-text-muted"}/>
                <div className="font-semibold text-sm mt-2 capitalize">{svc.replace(/_/g," ")}</div>
                {isPrimary && <span className="text-[10px] px-2 py-0.5 rounded-full bg-raah-green text-white">Primary</span>}
                <div className="text-xs text-raah-green mt-2">Open →</div>
              </button>
            );
          })}
        </div>
        <div className="text-xs text-text-muted text-center">Select a service from the left menu or above to view its Mission Flow</div>
      </div>
    );
  }

  // Detail: svc selected -> show only that service's info (no overview grid)
  const subTabs = svcParam === "cnic" ? [
    { key: "new", label: "New CNIC" },
    { key: "renewal", label: "Renewal" },
    { key: "modification", label: "Modification" },
    { key: "status", label: "Track Status" },
  ] : svcParam === "passport" ? [
    { key: "new", label: "New Passport" },
    { key: "renewal", label: "Renewal" },
    { key: "status", label: "Track Status" },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Link href="/identity" className="hover:text-raah-green">Identity</Link>
        <span>›</span>
        <span className="font-medium text-raah-deep capitalize">{svcParam.replace(/_/g," ")}</span>
        {subParam && <><span>›</span><span className="capitalize">{subParam}</span></>}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error} — <Link href="/identity" className="underline">Back to Overview</Link>
        </div>
      )}

      {flow && (
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-raah-deep">{lang==="ur"?flow.name_ur:flow.name_en}</div>
              <div className="text-xs text-text-muted mt-1">{flow.official_source} • Verified {flow.last_verified}</div>
            </div>
          </div>

          {subTabs.length > 0 && (
            <div className="flex gap-2 mt-4 border-b border-border pb-2">
              {subTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => router.push(`/identity?svc=${svcParam}&sub=${tab.key}`)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border ${subParam===tab.key?"bg-raah-green text-white border-raah-green":"bg-white border-border text-text-secondary hover:border-raah-green/30"}`}
                >
                  {tab.label}
                </button>
              ))}
              <button onClick={() => router.push(`/identity?svc=${svcParam}`)} className={`px-3 py-1.5 rounded-full text-xs border ${!subParam?"bg-raah-mint border-raah-green/30 text-raah-deep":"bg-white border-border text-text-muted"}`}>Overview</button>
            </div>
          )}

          {subParam === "status" && status ? (
            <div className="mt-6 p-4 rounded-xl bg-raah-soft border border-raah-green/20">
              <div className="font-semibold text-sm flex items-center gap-2"><Clock size={14}/> Tracking: {status.application_no}</div>
              <div className="text-sm mt-2">Status: <span className="font-bold text-amber-600">{status.status}</span> • Current step: {status.current_step}</div>
              <div className="w-full bg-border rounded-full h-2 mt-3">
                <div className="bg-raah-green h-2 rounded-full" style={{width: `${status.progress*100}%`}}></div>
              </div>
              <div className="text-xs text-text-muted mt-2">Last updated: {status.last_updated} • Estimated completion: {status.estimated_completion}</div>
              <div className="text-xs text-raah-green mt-1">{status.official_source} • Verified {status.last_verified}</div>
            </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-3 md:grid-cols-6 gap-2">
                {flow.mission_steps.map((s:any) => (
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
                  <ul className="mt-2 space-y-1 text-text-secondary text-xs list-disc pl-4">{flow.required_documents.map((d:string)=> <li key={d}>{d}</li>)}</ul>
                </div>
                <div className="p-3 rounded-xl bg-white border border-border">
                  <div className="font-semibold text-xs text-text-muted">Eligibility</div>
                  <ul className="mt-2 space-y-1 text-text-secondary text-xs list-disc pl-4">{flow.eligibility.map((d:string)=> <li key={d}>{d}</li>)}</ul>
                  <div className="mt-3 text-xs"><span className="text-text-muted">Fee:</span> {flow.fee_normal} | {flow.fee_urgent}</div>
                  <button onClick={()=>setShowPay(true)} className="mt-3 w-full py-1.5 rounded-full bg-raah-green text-white text-xs font-medium hover:bg-raah-deep flex items-center justify-center gap-1"><CreditCard size={12}/> Pay Fee Now</button>
                </div>
                <div className="p-3 rounded-xl bg-white border border-border">
                  <div className="font-semibold text-xs text-text-muted">Application Method</div>
                  <ol className="mt-2 space-y-1 text-text-secondary text-xs list-decimal pl-4">{flow.application_method.map((d:string)=> <li key={d}>{d}</li>)}</ol>
                  <a href={flow.tracking_url} target="_blank" className="text-xs text-raah-green mt-2 inline-block">Track → {flow.tracking_url}</a>
                </div>
              </div>

              {/* How to Pay */}
              <div className="mt-4 p-4 rounded-xl bg-white border border-border">
                <div className="font-semibold text-xs flex items-center gap-2"><CreditCard size={12} className="text-raah-green"/> How to Pay Fee</div>
                <div className="grid md:grid-cols-3 gap-2 mt-3">
                  <div className="p-2 rounded-lg bg-raah-soft border border-border text-center">
                    <Smartphone size={14} className="mx-auto text-raah-green"/>
                    <div className="text-xs font-medium mt-1">{svcParam==="passport"?"NBP App / Branch":svcParam==="cnic"||svcParam==="frc"?"Pak-ID App":"Union Council"}</div>
                    <div className="text-[11px] text-text-muted mt-1">{svcParam==="passport"?"Pay at National Bank branch or DGIP portal":svcParam==="cnic"||svcParam==="frc"?"Pay via Pak-ID app or NADRA center":"Pay at Union Council counter"}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-center">
                    <CreditCard size={14} className="mx-auto text-blue-600"/>
                    <div className="text-xs font-medium mt-1">Card / Wallet</div>
                    <div className="text-[11px] text-text-muted mt-1">JazzCash, EasyPaisa, Visa/Mastercard accepted</div>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-center">
                    <Building2 size={14} className="mx-auto text-amber-600"/>
                    <div className="text-xs font-medium mt-1">Bank Counter</div>
                    <div className="text-[11px] text-text-muted mt-1">NBP, HBL, UBL — show application no, get receipt</div>
                  </div>
                </div>
                <div className="text-[11px] text-text-muted mt-2">Keep fee receipt — required at center visit. Source: {flow.official_source} • Verified {flow.last_verified}</div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Pay Modal */}
      {showPay && flow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={()=>setShowPay(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="font-bold text-raah-deep">Pay Fee — {flow.name_en.split("—")[0].trim()}</div>
              <button onClick={()=>setShowPay(false)} className="p-1 rounded-full hover:bg-raah-soft"><X size={16}/></button>
            </div>
            <div className="text-sm text-text-secondary mt-1">Fee: {flow.fee_normal} • {flow.fee_urgent}</div>
            <div className="mt-4 space-y-2">
              <a href={svcParam==="passport"?"https://dgip.gov.pk":svcParam==="cnic"||svcParam==="frc"?"https://id.nadra.gov.pk":"#"} target="_blank" className="flex items-center justify-between p-3 rounded-xl border border-raah-green bg-raah-mint hover:bg-raah-green hover:text-white transition">
                <span className="text-sm font-medium flex items-center gap-2"><ExternalLink size={14}/> {svcParam==="passport"?"Pay at DGIP / NBP":svcParam==="cnic"||svcParam==="frc"?"Pay via Pak-ID / NADRA":"Pay at Union Council"}</span>
                <ExternalLink size={14}/>
              </a>
              <div className="p-3 rounded-xl border border-border bg-white text-xs text-text-secondary">
                <div className="font-semibold">Steps:</div>
                <ol className="list-decimal pl-4 mt-1 space-y-1">
                  <li>Generate challan / fee voucher from official portal</li>
                  <li>Pay via app, card, or bank counter</li>
                  <li>Keep receipt — show at center on visit day</li>
                </ol>
              </div>
            </div>
            <button onClick={()=>setShowPay(false)} className="mt-4 w-full py-2 rounded-xl bg-raah-green text-white text-sm font-medium">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IdentityPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-6 text-sm text-text-muted animate-pulse">Loading Identity...</div>}>
        <IdentityInner />
      </Suspense>
    </AppShell>
  );
}
