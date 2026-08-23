"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/LangContext";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { lang } = useLang();
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError("Email and password are required"); return; }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FBFDFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-raah-green text-white flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-bold text-raah-deep">RaahAI</h1>
          <p className="text-sm text-text-secondary mt-1">{lang==="ur"?"اپنے اکاؤنٹ میں لاگ ان کریں":"Sign in to your account"}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

            <div>
              <label className="text-sm font-medium text-text-secondary">{lang==="ur"?"ای میل":"Email"}</label>
              <div className="relative mt-1">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"/>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/30"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-secondary">{lang==="ur"?"پاس ورڈ":"Password"}</label>
              <div className="relative mt-1">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"/>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-raah-green/30"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-raah-green text-white rounded-xl font-medium text-sm hover:bg-raah-deep transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (lang==="ur"?"لاگ ان ہو رہا ہے...":"Signing in...") : (lang==="ur"?"لاگ ان":"Sign In")}
              {!loading && <ArrowRight size={16}/>}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text-secondary">
            {lang==="ur"?"پہلے اکاؤنٹ نہیں ہے؟":"Don't have an account?"}{" "}
            <Link href="/register" className="text-raah-green font-medium hover:underline">{lang==="ur"?"رجسٹر کریں":"Sign Up"}</Link>
          </div>
        </div>

        <div className="text-center text-[11px] text-text-muted mt-6">
          ✓ Official sources only • AI recommendation ≠ official decision
        </div>
      </div>
    </div>
  );
}
