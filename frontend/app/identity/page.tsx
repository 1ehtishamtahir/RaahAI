"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { identityListApi, identityFlowApi } from "@/lib/api";
import Link from "next/link";
import { Shield, FileText, Baby, Heart, Skull, ArrowRight } from "lucide-react";

const ICONS: Record<string, any> = { cnic: Shield, passport: Shield, frc: FileText, birth_registration: Baby, marriage_registration: Heart, death_registration: Skull };

export default function IdentityPage() {
  const { lang } = useLang();
  const [list, setList] = useState<any>(null);
  const [active, setActive] = useState("cnic");
  const [flow, setFlow] = useState<any>(null);

  useEffect(() => { identityListApi().then(setList).catch(()=>{}); }, []);
  useEffect(() => { identityFlowApi(active).then(setFlow).catch(()=>{}); }, [active]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><Shield size={20}/> Identity</h1>
          <p className="text-sm text-text-secondary mt-1">CNIC, Passport, FRC, Birth, Marriage, Death — each with Mission Mode (Requirement → Tracking)</p>
        </div>

        {/* Service cards — CNIC + Passport primary */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(list?.services || ["cnic","passport","frc","birth_registration","marriage_registration","death_registration"]).map((svc:string) => {
            const Icon = ICONS[svc] || Shield;
            const isPrimary = list?.primary?.includes(svc);
            return (
              <button key={svc} onClick={()=>setActive(svc)} className={`text-left p-4 rounded-2xl border-2 transition ${active===svc?"border-raah-green bg-raah-mint":"border-border bg-white hover:border-raah-green/30"} ${isPrimary?"ring-1 ring-raah-green/20":""}`}>
                <Icon size={20} className={active===svc?"text-raah-green":"text-text-muted"}/>
                <div className="font-semibold text-sm mt-2 capitalize">{svc.replace(/_/g," ")}</div>
                {isPrimary && <span className="text-[10px] px-2 py-0.5 rounded-full bg-raah-green text-white">Primary</span>}
              </button>
            );
          })}
        </div>

        {/* Mission Flow */}
        {flow && (
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-raah-deep">{lang==="ur"?flow.name_ur:flow.name_en}</div>
                <div className="text-xs text-text-muted mt-1">{flow.official_source} • Verified {flow.last_verified}</div>
              </div>
              <Link href={`/identity/${flow.service}`} className="text-xs px-3 py-1.5 rounded-full bg-raah-green text-white flex items-center gap-1">Details <ArrowRight size={12}/></Link>
            </div>

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
              </div>
              <div className="p-3 rounded-xl bg-white border border-border">
                <div className="font-semibold text-xs text-text-muted">Application Method</div>
                <ol className="mt-2 space-y-1 text-text-secondary text-xs list-decimal pl-4">{flow.application_method.map((d:string)=> <li key={d}>{d}</li>)}</ol>
                <a href={flow.tracking_url} target="_blank" className="text-xs text-raah-green mt-2 inline-block">Track → {flow.tracking_url}</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
