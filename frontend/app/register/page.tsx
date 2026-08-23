"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/LangContext";
import { Shield, User, Mail, Lock, Phone, MapPin, GraduationCap, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const { lang } = useLang();
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", cnic: "", province: "", city: "", education: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Name, email and password are required");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(form);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const provinces = ["Punjab", "Sindh", "KPK", "Balochistan", "Islamabad", "Gilgit-Baltistan", "Azad Kashmir"];

  return (
    <div className="min-h-screen bg-[#FBFDFC] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-raah-green text-white flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-bold text-raah-deep">RaahAI</h1>
          <p className="text-sm text-text-secondary mt-1">{lang==="ur"?"نیا اکاؤنٹ بنائیں":"Create your account"}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <form onSubmit={handleRegister} className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium text-text-secondary">{lang==="ur"?"نام":"Full Name"} *</label>
                <div className="relative mt-1">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"/>
                  <input value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/30" placeholder="Ehtisham Tahir"/>
                </div>
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium text-text-secondary">{lang==="ur"?"ای میل":"Email"} *</label>
                <div className="relative mt-1">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"/>
                  <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/30" placeholder="you@example.com"/>
                </div>
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium text-text-secondary">{lang==="ur"?"پاس ورڈ":"Password"} *</label>
                <div className="relative mt-1">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"/>
                  <input type={showPass?"text":"password"} value={form.password} onChange={(e) => update("password", e.target.value)} className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/30" placeholder="Min 6 characters"/>
                  <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">{showPass?<EyeOff size={16}/>:<Eye size={16}/>}</button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary">{lang==="ur"?"فون":"Phone"}</label>
                <div className="relative mt-1">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"/>
                  <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/30" placeholder="0300-1234567"/>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary">CNIC</label>
                <input value={form.cnic} onChange={(e) => update("cnic", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/30" placeholder="42101-1234567-1"/>
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary">{lang==="ur"?"صوبہ":"Province"}</label>
                <div className="relative mt-1">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"/>
                  <select value={form.province} onChange={(e) => update("province", e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-raah-green/30">
                    <option value="">Select</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary">{lang==="ur"?"شہر":"City"}</label>
                <input value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/30" placeholder="Karachi"/>
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium text-text-secondary">{lang==="ur"?"تعلیم":"Education"}</label>
                <div className="relative mt-1">
                  <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"/>
                  <select value={form.education} onChange={(e) => update("education", e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-raah-green/30">
                    <option value="">Select</option>
                    <option value="Matric">Matric</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Master">Master</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-raah-green text-white rounded-xl font-medium text-sm hover:bg-raah-deep transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (lang==="ur"?"رجسٹر ہو رہا ہے...":"Creating account...") : (lang==="ur"?"رجسٹر کریں":"Create Account")}
              {!loading && <ArrowRight size={16}/>}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text-secondary">
            {lang==="ur"?"پہلے سے اکاؤنٹ ہے؟":"Already have an account?"}{" "}
            <Link href="/login" className="text-raah-green font-medium hover:underline">{lang==="ur"?"لاگ ان":"Sign In"}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
