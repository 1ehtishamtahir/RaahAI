"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useLang } from "@/lib/LangContext";
import { familyProfileApi } from "@/lib/api";
import { Users, User, Award, Home, Shield, Plus, X, Calendar, MapPin } from "lucide-react";

export default function FamilyPage(){
  const {lang}=useLang();
  const [data,setData]=useState<any>(null);
  const [stats,setStats]=useState<any>(null);
  const [showAdd,setShowAdd]=useState(false);
  const [newMember,setNewMember]=useState({name:"", relation:"Sibling", age:18, cnic:"", education:"Matric"});
  const [selectedProgram,setSelectedProgram]=useState<any>(null);

  function load(){
    familyProfileApi().then(setData).catch(()=>{});
    fetch("http://localhost:8000/api/family/stats").then(r=>r.json()).then(setStats).catch(()=>{});
  }
  useEffect(()=>{load();},[]);

  async function addMember(){
    if(!newMember.name || !newMember.cnic) return;
    await fetch("http://localhost:8000/api/family/member", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(newMember)
    });
    setNewMember({name:"", relation:"Sibling", age:18, cnic:"", education:"Matric"});
    setShowAdd(false);
    load();
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-raah-deep flex items-center gap-2"><Users size={20}/> Family Programs</h1>
            <p className="text-sm text-text-secondary mt-1">Household Profile • Program Matching per family member • Masked CNIC for privacy</p>
          </div>
          <button onClick={()=>setShowAdd(!showAdd)} className="px-4 py-2 bg-raah-green text-white rounded-xl text-sm flex items-center gap-2 hover:bg-raah-deep"><Plus size={14}/> Add Member</button>
        </div>

        {stats && (
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white border border-border rounded-xl p-3 text-center"><div className="text-xl font-bold text-raah-deep">{stats.total_members}</div><div className="text-xs text-text-muted">Members</div></div>
            <div className="bg-raah-mint border border-raah-green/20 rounded-xl p-3 text-center"><div className="text-xl font-bold text-raah-green">{stats.programs_enrolled}</div><div className="text-xs text-text-muted">Enrolled</div></div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center"><div className="text-xl font-bold text-amber-600">{stats.programs_eligible}</div><div className="text-xs text-text-muted">Eligible</div></div>
            <div className="bg-white border border-border rounded-xl p-3 text-center"><div className="text-xl font-bold">{stats.total_programs}</div><div className="text-xs text-text-muted">Programs</div></div>
          </div>
        )}

        {showAdd && (
          <div className="bg-white border-2 border-raah-green/30 rounded-2xl p-5">
            <div className="font-semibold text-sm mb-3">Add Family Member</div>
            <div className="grid md:grid-cols-2 gap-3">
              <input value={newMember.name} onChange={e=>setNewMember({...newMember, name:e.target.value})} placeholder="Name" className="px-3 py-2 rounded-xl border border-border text-sm"/>
              <select value={newMember.relation} onChange={e=>setNewMember({...newMember, relation:e.target.value})} className="px-3 py-2 rounded-xl border border-border text-sm bg-white">
                <option>Sibling</option><option>Parent</option><option>Spouse</option><option>Child</option><option>Other</option>
              </select>
              <input type="number" value={newMember.age} onChange={e=>setNewMember({...newMember, age: parseInt(e.target.value)||0})} placeholder="Age" className="px-3 py-2 rounded-xl border border-border text-sm"/>
              <input value={newMember.cnic} onChange={e=>setNewMember({...newMember, cnic:e.target.value})} placeholder="CNIC 42101-1234567-1" className="px-3 py-2 rounded-xl border border-border text-sm"/>
              <select value={newMember.education} onChange={e=>setNewMember({...newMember, education:e.target.value})} className="px-3 py-2 rounded-xl border border-border text-sm bg-white">
                <option>Matric</option><option>Intermediate</option><option>Bachelor</option><option>Master</option>
              </select>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={addMember} className="px-4 py-2 bg-raah-green text-white rounded-xl text-sm">Add</button>
              <button onClick={()=>setShowAdd(false)} className="px-4 py-2 border border-border rounded-xl text-sm">Cancel</button>
            </div>
          </div>
        )}

        {data && (
          <>
            <div className="bg-white border border-border rounded-2xl p-6">
              <div className="font-semibold text-sm flex items-center gap-2"><Home size={14}/> Household: {data.id}</div>
              <div className="text-xs text-text-muted mt-1 flex items-center gap-2"><MapPin size={12}/>{data.head.city}, {data.head.province} • Head: {data.head.name} • {data.head.cnic_masked} • {data.head.education}</div>
              <div className="grid md:grid-cols-4 gap-3 mt-4">
                {data.members.map((m:any)=>(
                  <div key={m.id} className="border border-border rounded-xl p-3 text-center hover:border-raah-green/30 hover:shadow-sm transition">
                    <div className="w-10 h-10 rounded-full bg-raah-mint mx-auto flex items-center justify-center text-raah-green"><User size={16}/></div>
                    <div className="font-semibold text-sm mt-2">{m.name}</div>
                    <div className="text-xs text-text-muted">{m.relation} • {m.age}y • {m.education}</div>
                    <div className="text-[11px] text-text-muted mt-1 flex items-center justify-center gap-1"><Shield size={10} className="text-raah-green"/>{m.cnic_masked}</div>
                    <div className="text-[10px] px-2 py-1 rounded-full bg-raah-soft border border-border mt-2 inline-block">{m.status}</div>
                    <div className="mt-2 flex flex-wrap gap-1 justify-center">
                      {m.eligible_programs.map((p:string)=><span key={p} className="text-[10px] px-2 py-1 rounded-full bg-raah-mint border border-raah-green/20 text-raah-deep">{p}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-border rounded-2xl p-6">
              <div className="font-semibold text-sm flex items-center gap-2"><Award size={14}/> Program Matching — Per Member</div>
              <div className="text-xs text-text-muted mt-1">Click a program to see details, eligibility, and next steps</div>
              <div className="space-y-2 mt-3">
                {data.programs.map((p:any,i:number)=>(
                  <div key={i} onClick={()=>setSelectedProgram(p)} className="border border-border rounded-xl p-3 flex items-center justify-between hover:border-raah-green/30 hover:bg-raah-soft/30 cursor-pointer transition">
                    <div>
                      <div className="font-medium text-sm">{p.program} <span className="text-xs text-text-muted">({p.program_ur})</span></div>
                      <div className="text-xs text-text-muted">{p.member} • {p.amount} • {p.category}</div>
                      <div className="text-[11px] text-raah-green mt-1">Next: {p.next_step} • {p.official_source} • Verified {p.last_verified}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${p.status==="Enrolled"?"bg-raah-mint text-raah-green":"bg-amber-100 text-amber-700"}`}>{p.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={()=>setSelectedProgram(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="font-bold text-raah-deep">{selectedProgram.program}</div>
              <button onClick={()=>setSelectedProgram(null)} className="p-1 rounded-full hover:bg-raah-soft"><X size={16}/></button>
            </div>
            <div className="text-xs text-text-muted mt-1">{selectedProgram.program_ur} • {selectedProgram.category}</div>
            <div className="mt-4 space-y-2 text-sm">
              <div><span className="font-semibold text-xs">Member:</span> {selectedProgram.member}</div>
              <div><span className="font-semibold text-xs">Amount:</span> {selectedProgram.amount}</div>
              <div><span className="font-semibold text-xs">Status:</span> <span className={selectedProgram.status==="Enrolled"?"text-raah-green":"text-amber-600"}>{selectedProgram.status}</span></div>
              <div><span className="font-semibold text-xs">Next Step:</span> {selectedProgram.next_step}</div>
              <div className="text-xs text-raah-green">{selectedProgram.official_source} • Verified {selectedProgram.last_verified}</div>
            </div>
            <div className="mt-4 flex gap-2">
              <a href="https://bisp.gov.pk" target="_blank" className="flex-1 py-2.5 rounded-xl bg-raah-green text-white text-sm text-center">View Official Site</a>
              <button onClick={()=>setSelectedProgram(null)} className="px-4 py-2.5 rounded-xl border border-border text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
