"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem("raahai_splash_shown")) return;
    sessionStorage.setItem("raahai_splash_shown", "1");
    setShow(true);
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 500);
    const t3 = setTimeout(() => setPhase(3), 800);
    const t4 = setTimeout(() => setShow(false), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-all duration-300 ${phase >= 3 ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-raah-green/5 rounded-full animate-pulse"/>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-emerald-500/5 rounded-full animate-pulse" style={{animationDelay:"0.5s"}}/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-2 border-raah-green/10 splash-ripple"/>
      </div>
      <div className="relative mb-8">
        <div className="absolute -inset-4 rounded-3xl border-[3px] border-transparent splash-spin" style={{borderTopColor:"#087F3E",borderRightColor:"#159447",borderBottomColor:"#075C2D"}}/>
        <div className="w-24 h-24 rounded-2xl bg-white shadow-[0_8px_40px_rgba(8,127,62,0.25)] flex items-center justify-center border border-gray-100 relative z-10">
          <Image src="/logo.png" alt="RaahAI" width={60} height={60} className="rounded-xl" />
        </div>
      </div>
      <h1 className={`text-4xl font-extrabold text-raah-deep tracking-tight transition-all duration-300 ${phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        RaahAI
      </h1>
      <p className={`text-sm text-text-secondary mt-2 transition-all duration-300 delay-75 ${phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        Your Smart Guide to Government Services
      </p>
      <div className={`flex items-center gap-2 mt-10 transition-opacity duration-300 ${phase >= 2 ? "opacity-100" : "opacity-0"}`}>
        <span className="w-2.5 h-2.5 rounded-full bg-raah-green splash-bounce" style={{animationDelay:"0s"}}/>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 splash-bounce" style={{animationDelay:"0.15s"}}/>
        <span className="w-2.5 h-2.5 rounded-full bg-raah-deep splash-bounce" style={{animationDelay:"0.3s"}}/>
      </div>
    </div>
  );
}
