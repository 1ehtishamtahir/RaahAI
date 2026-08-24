"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + Math.random() * 15 + 5;
      });
    }, 80);

    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setShow(false), 300);
    }, 1800);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-raah-green via-emerald-600 to-raah-deep transition-opacity duration-300 ${
        progress >= 100 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Logo */}
      <div className="relative mb-6 animate-bounce">
        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
          <Image src="/logo.png" alt="RaahAI" width={56} height={56} className="rounded-xl" />
        </div>
      </div>

      {/* Brand */}
      <h1 className="text-3xl font-bold text-white tracking-tight mb-1">RaahAI</h1>
      <p className="text-sm text-emerald-100/80 mb-8">Your Smart Guide to Government Services</p>

      {/* Progress Bar */}
      <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-200 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Loading Text */}
      <p className="text-xs text-emerald-100/60 mt-4 animate-pulse">
        {progress < 30
          ? "Initializing..."
          : progress < 60
          ? "Loading services..."
          : progress < 90
          ? "Preparing your dashboard..."
          : "Almost ready..."}
      </p>
    </div>
  );
}
