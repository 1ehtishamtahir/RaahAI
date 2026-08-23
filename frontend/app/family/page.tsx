"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { familyProfileApi } from "@/lib/api";
import { Users, User, Award, Home } from "lucide-react";

export default function FamilyPage(){
  const {lang}=useLang();
  const [data,setData]=useState<any>(null);
  useEffect(()=>{familyProfileApi().then(setData).catch(()=>{});},[]);
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><Users size={20}/> Family Programs</h1>
          <p className="text-sm text-text-secondary mt-1">Household Profile • Program Matching per family member</p>
        </div>

        {data && (
          <>
            <div className="bg-white border border-border rounded-2xl p-6">
              <div className="font-semibold text-sm flex items-center gap-2"><Home size={14}/> Household: {data.id}</div>
              <div className="text-xs text-text-muted mt-1">Head: {data.head.name} • {data.head.cnic} • {data.head.city}, {data.head.province}</div>
              <div className="grid md:grid-cols-4 gap-3 mt-4">
                {data.members.map((m:any)=>(
                  <div key={m.id} className="border border-border rounded-xl p-3 text-center">
                    <div className="w-10 h-10 rounded-full bg-raah-mint mx-auto flex items-center justify-center text-raah-green"><User size={16}/></div>
                    <div className="font-semibold text-sm mt-2">{m.name}</div>
                    <div className="text-xs text-text-muted">{m.relation} • {m.age}y • {m.education}</div>
                    <div className="text-[11px] text-text-muted mt-1">{m.cnic}</div>
                    <div className="mt-2 flex flex-wrap gap-1 justify-center">
                      {m.eligible_programs.map((p:string)=><span key={p} className="text-[10px] px-2 py-1 rounded-full bg-raah-soft border border-border">{p}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-border rounded-2xl p-6">
              <div className="font-semibold text-sm flex items-center gap-2"><Award size={14}/> Program Matching</div>
              <div className="space-y-2 mt-3">
                {data.programs.map((p:any,i:number)=>(
                  <div key={i} className="border border-border rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{p.program}</div>
                      <div className="text-xs text-text-muted">{p.member} • {p.amount}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${p.status==="Enrolled"?"bg-raah-mint text-raah-green":"bg-amber-100 text-amber-700"}`}>{p.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
