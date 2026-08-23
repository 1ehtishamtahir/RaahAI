"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { updatesLatestApi, updatesRecommendedApi } from "@/lib/api";
import { Bell, Radar, Tag, Calendar, ShieldCheck } from "lucide-react";

export default function UpdatesPage(){
  const {lang}=useLang();
  const [latest,setLatest]=useState<any>(null);
  const [rec,setRec]=useState<any>(null);
  const [cat,setCat]=useState("All");
  useEffect(()=>{updatesLatestApi().then(setLatest).catch(()=>{}); updatesRecommendedApi().then(setRec).catch(()=>{});},[]);
  const categories = ["All","Identity","Youth","Transport","Tax","Welfare","Employment"];
  const filtered = cat==="All"? latest?.updates : latest?.updates?.filter((p:any)=>p.category===cat);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><Radar size={20}/> Government Updates</h1>
          <p className="text-sm text-text-secondary mt-1">Government Radar • Policy Categories (Education, Employment, Tax, Transport, Business, Youth, Family, Welfare, Identity)</p>
        </div>

        {rec?.recommended && (
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
            <div className="font-semibold flex items-center gap-2"><Bell size={16}/> Recommended for You</div>
            <div className="mt-3 space-y-2">
              {rec.recommended.map((p:any)=>(
                <div key={p.id} className="bg-white text-text-primary rounded-xl p-3">
                  <div className="font-semibold text-sm">{lang==="ur"?p.title_ur:p.title}</div>
                  <div className="text-xs text-text-muted mt-1">{p.category} • {p.relevance}% relevance • {p.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(c=>(
            <button key={c} onClick={()=>setCat(c)} className={`px-3 py-1.5 rounded-full text-xs border whitespace-nowrap ${cat===c?"bg-raah-green text-white border-raah-green":"bg-white border-border"}`}>{c}</button>
          ))}
        </div>

        <div className="space-y-3">
          {(filtered||[]).map((p:any)=>(
            <div key={p.id} className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-raah-mint text-raah-deep border border-raah-green/20 flex items-center gap-1"><Tag size={12}/>{p.category}</span>
                <span className="text-xs text-text-muted flex items-center gap-1"><Calendar size={12}/>{p.published_date}</span>
              </div>
              <div className="font-semibold text-sm mt-2">{lang==="ur"?p.title_ur:p.title}</div>
              <div className="text-sm text-text-secondary mt-1">{p.description}</div>
              <div className="text-xs text-text-muted mt-2">Impact: {p.impact}</div>
              <div className="text-[11px] text-raah-green mt-1 flex items-center gap-1"><ShieldCheck size={12}/>{p.official_source} • Verified {p.last_verified}</div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
