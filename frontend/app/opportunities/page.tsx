"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { opportunitiesRecommendedApi } from "@/lib/api";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
import { GraduationCap, Search, Filter, Calendar, Award, ShieldCheck, ExternalLink, X } from "lucide-react";

function OpportunitiesInner(){
  const {lang}=useLang();
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlCat = searchParams.get("cat");
  const urlQ = searchParams.get("q") || "";
  const [all,setAll]=useState<any>(null);
  const [rec,setRec]=useState<any>(null);
  const [q,setQ]=useState(urlQ);
  const [cat,setCat]=useState<string|undefined>(urlCat || undefined);
  const [selected,setSelected]=useState<any>(null);

  useEffect(()=>{ setQ(urlQ); },[urlQ]);
  useEffect(()=>{ setCat(urlCat || undefined); },[urlCat]);

  useEffect(()=>{
    const params = new URLSearchParams();
    if(cat) params.append("category", cat);
    if(q) params.append("q", q);
    const url = `${API}/api/opportunities${params.toString()?`?${params}`:""}`;
    fetch(url).then(r=>r.json()).then(setAll).catch(()=>{});
  },[cat,q]);

  useEffect(()=>{
    opportunitiesRecommendedApi().then(setRec).catch(()=>{});
  },[]);

  function setCatAndUrl(c?: string){
    setCat(c);
    const p = new URLSearchParams();
    if(c) p.append("cat", c);
    if(q) p.append("q", q);
    router.push(`/opportunities${p.toString()?`?${p}`:""}`);
  }
  function setQAndUrl(v: string){
    setQ(v);
    const p = new URLSearchParams();
    if(cat) p.append("cat", cat);
    if(v) p.append("q", v);
    router.push(`/opportunities${p.toString()?`?${p}`:""}`);
  }

  const categories = ["All","Scholarships","Student Programs","Youth Programs","Family","Welfare"];

  return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><GraduationCap size={20}/> Opportunities</h1>
            <p className="text-sm text-text-secondary mt-1">Scholarships • Student Programs • Youth Programs • Family & Welfare</p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-border rounded-full px-3 py-2">
            <Search size={14} className="text-text-muted"/>
            <input value={q} onChange={e=>setQAndUrl(e.target.value)} placeholder="Search scholarships, youth..." className="bg-transparent outline-none text-sm w-48"/>
            {q && <button onClick={()=>setQAndUrl("")} className="text-xs">✕</button>}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(c=>(
            <button key={c} onClick={()=>setCatAndUrl(c==="All"?undefined:c)} className={`px-3 py-1.5 rounded-full text-xs border whitespace-nowrap ${cat===c||(c==="All"&&!cat)?"bg-raah-green text-white border-raah-green":"bg-white border-border hover:border-raah-green/30"}`}>{c}</button>
          ))}
        </div>

        {rec?.recommended && !q && !cat && (
          <div className="bg-gradient-to-r from-raah-green to-emerald-700 rounded-2xl p-6 text-white">
            <div className="font-semibold flex items-center gap-2"><Award size={16}/> Recommended for You</div>
            <div className="grid md:grid-cols-3 gap-3 mt-3">
              {rec.recommended.map((s:any)=>(
                <div key={s.id} className="bg-white text-text-primary rounded-xl p-3 border border-white/20">
                  <div className="font-semibold text-sm">{lang==="ur"?s.name_ur:s.name}</div>
                  <div className="text-xs text-text-muted mt-1">{s.category} • {s.amount}</div>
                  <div className="text-xs text-raah-green mt-1">{s.match_score}% match • {s.match_reason}</div>
                  <button onClick={()=>setSelected(s)} className="mt-2 text-xs px-3 py-1 rounded-full bg-raah-green text-white">View Details</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="font-semibold text-sm mb-3 flex items-center justify-between">
            <span>All Schemes — {all?.count||0} found</span>
            <span className="text-xs text-text-muted flex items-center gap-1"><Filter size={12}/> Filtered by {cat||"All"} {q&&`• Search: ${q}`}</span>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {(all?.schemes||[]).map((s:any)=>(
              <div key={s.id} className={`border rounded-xl p-4 hover:shadow-sm transition ${s.deadline_status==="expired"?"border-red-200 bg-red-50/30":s.deadline_status==="expiring_soon"?"border-amber-200 bg-amber-50/30":"border-border bg-white hover:border-raah-green/30"}`}>
                <div className="flex items-start justify-between">
                  <div className="font-semibold text-sm flex-1">{lang==="ur"?s.name_ur:s.name}</div>
                  {s.deadline_status==="expired" && <span className="text-[10px] px-2 py-1 rounded-full bg-red-600 text-white">Expired</span>}
                  {s.deadline_status==="expiring_soon" && <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500 text-white">Expiring Soon</span>}
                </div>
                <div className="text-xs text-text-muted mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-raah-soft border border-border">{s.category}</span>
                  <span>• {s.amount}</span>
                </div>
                <div className="text-xs text-text-muted mt-2 flex items-center gap-1"><ShieldCheck size={10} className="text-raah-green"/>{s.official_source} • Verified {s.last_verified}</div>
                <div className="text-sm text-text-secondary mt-2 line-clamp-2">{s.eligibility_rules}</div>
                <div className="text-xs text-text-muted mt-1">Docs: {s.required_documents}</div>
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-xs flex items-center gap-1 ${s.deadline_status==="expired"?"text-red-600":s.deadline_status==="expiring_soon"?"text-amber-600":"text-text-muted"}`}><Calendar size={12}/>Deadline {s.deadline} {s.days_left>=0?`(${s.days_left}d left)`: `(${Math.abs(s.days_left)}d ago)`}</span>
                  <button onClick={()=>setSelected(s)} className="text-xs px-3 py-1.5 rounded-full bg-raah-green text-white hover:bg-raah-deep">View</button>
                </div>
              </div>
            ))}
            {all && all.schemes.length===0 && <div className="col-span-2 text-center text-sm text-text-muted py-8">No schemes found — try different search or category</div>}
          </div>
        </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={()=>setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="font-bold text-raah-deep">{lang==="ur"?selected.name_ur:selected.name}</div>
              <button onClick={()=>setSelected(null)} className="p-1 rounded-full hover:bg-raah-soft"><X size={16}/></button>
            </div>
            <div className="text-xs text-text-muted mt-1">{selected.category} • {selected.amount} • Deadline {selected.deadline} {selected.days_left>=0?`(${selected.days_left}d left)`: "(Expired)"}</div>
            <div className="mt-4 space-y-3 text-sm">
              <div><span className="font-semibold text-xs text-text-muted">Eligibility:</span><p className="text-text-secondary">{selected.eligibility_rules}</p></div>
              <div><span className="font-semibold text-xs text-text-muted">Required Documents:</span><p className="text-text-secondary">{selected.required_documents}</p></div>
              <div className="text-xs text-raah-green flex items-center gap-1"><ShieldCheck size={12}/>{selected.official_source} • Verified {selected.last_verified}</div>
            </div>
            <div className="mt-4 flex gap-2">
              <a href={selected.apply_url} target="_blank" className="flex-1 py-2.5 rounded-xl bg-raah-green text-white text-sm font-medium text-center hover:bg-raah-deep flex items-center justify-center gap-2"><ExternalLink size={14}/> Apply Now</a>
              <button onClick={()=>setSelected(null)} className="px-4 py-2.5 rounded-xl border border-border text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
      </div>
  );
}

export default function OpportunitiesPage(){
  return (
    <AppShell>
      <Suspense fallback={<div className="p-6 text-sm text-text-muted animate-pulse">Loading Opportunities...</div>}>
        <OpportunitiesInner />
      </Suspense>
    </AppShell>
  );
}
