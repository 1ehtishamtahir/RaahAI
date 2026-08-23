"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/LangContext";
import { Shield, User, Mail, Lock, Phone, MapPin, GraduationCap, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const { lang } = useLang();
  const { user, register, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", cnic: "", province: "", city: "", education: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError(lang === "ur" ? "نام، ای میل اور پاس ورڈ درکار ہیں" : "Name, email and password are required");
      return;
    }
    if (form.password.length < 6) {
      setError(lang === "ur" ? "پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے" : "Password must be at least 6 characters");
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FBFDFC] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-raah-green" />
      </div>
    );
  }

  if (user) return null;

  const provinces = ["Punjab", "Sindh", "KPK", "Balochistan", "Islamabad", "Gilgit-Baltistan", "Azad Kashmir"];

  return (
    <div className="min-h-screen bg-[#FBFDFC] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-raah-green text-white flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-bold text-raah-deep">RaahAI</h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "ur" ? "نیا اکاؤنٹ بنائیں" : "Create your account"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                <span className="shrink-0">⚠</span> {error}
              </div>
            )}

            {/* Required fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium text-text-secondary block mb-1.5">
                  {lang === "ur" ? "نام" : "Full Name"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/30 focus:border-raah-green transition"
                    placeholder={lang === "ur" ? "اپنا نام درج کریں" : "Enter your full name"}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium text-text-secondary block mb-1.5">
                  {lang === "ur" ? "ای میل" : "Email"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/30 focus:border-raah-green transition"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium text-text-secondary block mb-1.5">
                  {lang === "ur" ? "پاس ورڈ" : "Password"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/30 focus:border-raah-green transition"
                    placeholder={lang === "ur" ? "کم از کم 6 حروف" : "Min 6 characters"}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="text-[11px] text-text-muted mt-1">
                  {lang === "ur" ? "کم از کم 6 حروف درکار ہیں" : "Must be at least 6 characters"}
                </div>
              </div>
            </div>

            {/* Optional fields */}
            <div className="border-t border-border pt-4">
              <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                {lang === "ur" ? "اختیاری معلومات" : "Optional Information"}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1.5">
                    {lang === "ur" ? "فون" : "Phone"}
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/30 focus:border-raah-green transition"
                      placeholder="0300-1234567"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1.5">CNIC</label>
                  <input
                    value={form.cnic}
                    onChange={(e) => update("cnic", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/30 focus:border-raah-green transition"
                    placeholder="42101-1234567-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1.5">
                    {lang === "ur" ? "صوبہ" : "Province"}
                  </label>
                  <select
                    value={form.province}
                    onChange={(e) => update("province", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-raah-green/30 focus:border-raah-green transition"
                  >
                    <option value="">{lang === "ur" ? "منتخب کریں" : "Select"}</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1.5">
                    {lang === "ur" ? "شہر" : "City"}
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/30 focus:border-raah-green transition"
                    placeholder={lang === "ur" ? "شہر" : "City"}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium text-text-secondary block mb-1.5">
                    {lang === "ur" ? "تعلیم" : "Education"}
                  </label>
                  <select
                    value={form.education}
                    onChange={(e) => update("education", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-raah-green/30 focus:border-raah-green transition"
                  >
                    <option value="">{lang === "ur" ? "منتخب کریں" : "Select"}</option>
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
              className="w-full py-2.5 bg-raah-green text-white rounded-xl font-medium text-sm hover:bg-raah-deep transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {lang === "ur" ? "رجسٹر ہو رہا ہے..." : "Creating account..."}
                </>
              ) : (
                <>
                  {lang === "ur" ? "رجسٹر کریں" : "Create Account"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text-secondary">
            {lang === "ur" ? "پہلے سے اکاؤنٹ ہے؟" : "Already have an account?"}{" "}
            <Link href="/login" className="text-raah-green font-medium hover:underline">
              {lang === "ur" ? "لاگ ان" : "Sign In"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
