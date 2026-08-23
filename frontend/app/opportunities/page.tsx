"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { opportunitiesApi, opportunitiesRecommendedApi } from "@/lib/api";
import { GraduationCap, Users, Banknote, Calendar, Award } from "lucide-react";

export default function OpportunitiesPage(){
  const {lang}=useLang();
  const [all,setAll]=useState<any>(null);
  const [rec,setRec]=useState<any>(null);
  useEffect(()=>{opportunitiesApi().then(setAll).catch(()=>{}); opportunitiesRecommendedApi().then(setRec).catch(()=>{});},[]);
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><GraduationCap size={20}/> Opportunities</h1>
          <p className="text-sm text-text-secondary mt-1">Scholarships • Student Programs • Youth Programs</p>
        </div>

        {rec?.recommended && (
          <div className="bg-gradient-to-r from-raah-green to-emerald-700 rounded-2xl p-6 text-white">
            <div className="font-semibold flex items-center gap-2"><Award size={16}/> Recommended for You</div>
            <div className="grid md:grid-cols-3 gap-3 mt-3">
              {rec.recommended.map((s:any)=>(
                <div key={s.id} className="bg-white text-text-primary rounded-xl p-3 border border-white/20">
                  <div className="font-semibold text-sm">{lang==="ur"?s.name_ur:s.name}</div>
                  <div className="text-xs text-text-muted mt-1">{s.category} • {s.amount}</div>
                  <div className="text-xs text-raah-green mt-1">{s.match_score}% match • {s.match_reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="font-semibold text-sm mb-3">All Schemes</div>
          <div className="grid md:grid-cols-2 gap-3">
            {(all?.schemes||[]).map((s:any)=>(
              <div key={s.id} className="border border-border rounded-xl p-4">
                <div className="font-semibold text-sm">{lang==="ur"?s.name_ur:s.name}</div>
                <div className="text-xs text-text-muted mt-1">{s.category} • {s.official_source} • Verified {s.last_verified}</div>
                <div className="text-sm text-text-secondary mt-2">{s.eligibility_rules}</div>
                <div className="text-xs text-text-muted mt-1">Docs: {s.required_documents}</div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs flex items-center gap-1"><Calendar size={12}/>Deadline {s.deadline}</span>
                  <span className="text-xs font-bold text-raah-green">{s.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
