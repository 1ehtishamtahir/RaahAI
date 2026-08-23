"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { Bell, Radar, Tag, Calendar, ShieldCheck, Search, ExternalLink, X } from "lucide-react";

export default function UpdatesPage(){
  const {lang}=useLang();
  const [latest,setLatest]=useState<any>(null);
  const [rec,setRec]=useState<any>(null);
  const [cat,setCat]=useState("All");
  const [q,setQ]=useState("");
  const [selected,setSelected]=useState<any>(null);

  function fetchLatest(){
    const params = new URLSearchParams();
    params.append("limit","20");
    if(cat && cat!=="All") params.append("category", cat);
    if(q) params.append("q", q);
    fetch(`http://localhost:8000/api/updates/latest?${params}`).then(r=>r.json()).then(setLatest).catch(()=>{});
  }

  useEffect(()=>{ fetchLatest(); },[cat,q]);
  useEffect(()=>{ fetch("http://localhost:8000/api/updates/recommended").then(r=>r.json()).then(setRec).catch(()=>{}); },[]);

  const categories = ["All","Education","Employment","Tax","Transport","Business","Youth","Family","Welfare","Identity"];
  const filtered = latest?.updates || [];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><Radar size={20}/> Government Updates</h1>
            <p className="text-sm text-text-secondary mt-1">Government Radar • 9 Policy Categories • Search & official sources</p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-border rounded-full px-3 py-2">
            <Search size={14} className="text-text-muted"/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search policies..." className="bg-transparent outline-none text-sm w-48"/>
            {q && <button onClick={()=>setQ("")} className="text-xs">✕</button>}
          </div>
        </div>

        {rec?.recommended && !q && cat==="All" && (
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
            <div className="font-semibold flex items-center gap-2"><Bell size={16}/> Recommended for You — Radar</div>
            <div className="mt-3 space-y-2">
              {rec.recommended.map((p:any)=>(
                <div key={p.id} onClick={()=>setSelected(p)} className="bg-white text-text-primary rounded-xl p-3 hover:shadow-md cursor-pointer transition">
                  <div className="font-semibold text-sm">{lang==="ur"?p.title_ur:p.title}</div>
                  <div className="text-xs text-text-muted mt-1">{p.category} • {p.relevance}% relevance • {p.reason}</div>
                  <div className="text-[11px] text-raah-green mt-1">{p.official_source} • Verified {p.last_verified}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(c=>(
            <button key={c} onClick={()=>setCat(c)} className={`px-3 py-1.5 rounded-full text-xs border whitespace-nowrap ${cat===c?"bg-raah-green text-white border-raah-green":"bg-white border-border hover:border-raah-green/30"}`}>{c}</button>
          ))}
        </div>

        <div className="text-xs text-text-muted">{filtered.length} updates • {cat} {q&&`• Search: "${q}"`}</div>

        <div className="space-y-3">
          {filtered.map((p:any)=>(
            <div key={p.id} onClick={()=>setSelected(p)} className="bg-white border border-border rounded-xl p-4 hover:border-raah-green/30 hover:shadow-sm cursor-pointer transition">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-raah-mint text-raah-deep border border-raah-green/20 flex items-center gap-1"><Tag size={12}/>{p.category}</span>
                <span className="text-xs text-text-muted flex items-center gap-1"><Calendar size={12}/>{p.published_date}</span>
                <span className="ml-auto text-xs text-raah-green">View →</span>
              </div>
              <div className="font-semibold text-sm mt-2">{lang==="ur"?p.title_ur:p.title}</div>
              <div className="text-sm text-text-secondary mt-1 line-clamp-2">{p.description}</div>
              <div className="text-xs text-text-muted mt-2">Impact: {p.impact}</div>
              <div className="text-[11px] text-raah-green mt-1 flex items-center gap-1"><ShieldCheck size={12}/>{p.official_source} • Verified {p.last_verified}</div>
            </div>
          ))}
          {filtered.length===0 && <div className="text-center text-sm text-text-muted py-8">No updates found — try different search or category</div>}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={()=>setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-xs px-2 py-1 rounded-full bg-raah-mint text-raah-deep border border-raah-green/20">{selected.category}</span>
              <button onClick={()=>setSelected(null)} className="p-1 rounded-full hover:bg-raah-soft"><X size={16}/></button>
            </div>
            <div className="font-bold text-raah-deep mt-3">{lang==="ur"?selected.title_ur:selected.title}</div>
            <div className="text-xs text-text-muted mt-1">{selected.published_date} • {selected.official_source} • Verified {selected.last_verified}</div>
            <div className="text-sm text-text-secondary mt-3">{selected.description}</div>
            <div className="mt-3 p-3 rounded-xl bg-raah-soft border border-border text-xs">
              <div className="font-semibold">Impact:</div>
              <div className="text-text-secondary">{selected.impact}</div>
              <div className="mt-2 font-semibold">Official Source:</div>
              <div className="text-raah-green">{selected.official_source}</div>
            </div>
            <div className="mt-4 flex gap-2">
              <a href={selected.apply_url} target="_blank" className="flex-1 py-2.5 rounded-xl bg-raah-green text-white text-sm font-medium text-center hover:bg-raah-deep flex items-center justify-center gap-2"><ExternalLink size={14}/> Visit Official Site</a>
              <button onClick={()=>setSelected(null)} className="px-4 py-2.5 rounded-xl border border-border text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
