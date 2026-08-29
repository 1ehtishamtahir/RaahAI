"use client";

import { useState } from "react";
import Link from "next/link";
import BannerCarousel from "@/components/ui/BannerCarousel";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FBFDFC]">
      {/* Top Announcement */}
      <div className="bg-[#075C2D] text-white text-center py-2 px-4 text-sm flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse inline-block" />
          Bano Qabil AI Hackathon 2026 — Live Demo
        </span>
        <span className="hidden sm:inline opacity-60">•</span>
        <span className="hidden sm:inline opacity-80">راہ — آپ کا راستہ</span>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E3E9E5]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="RaahAI Logo" className="w-10 h-10 rounded-xl object-cover border border-[#E3E9E5] shadow-soft" />
              <div>
                <div className="font-bold text-[#075C2D] leading-none text-[18px]">RaahAI</div>
                <div className="text-[11px] text-[#66716B] leading-none tracking-wide font-medium">Your Smart Guide</div>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-1 bg-[#F3FAF5] p-1 rounded-full border border-[#E3E9E5]">
              <a href="#problem" className="px-4 py-1.5 text-sm font-medium text-[#17201B] hover:text-[#087F3E] transition">Problem</a>
              <a href="#raah" className="px-4 py-1.5 text-sm font-medium text-[#17201B] hover:text-[#087F3E] transition">The Raah</a>
              <a href="#mvp" className="px-4 py-1.5 text-sm font-medium text-[#17201B] hover:text-[#087F3E] transition">Services</a>
              <a href="#trust" className="px-4 py-1.5 text-sm font-medium text-[#17201B] hover:text-[#087F3E] transition">Trust</a>
              <a href="#team" className="px-4 py-1.5 text-sm font-medium text-[#17201B] hover:text-[#087F3E] transition">Team</a>
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-[#66716B] hover:text-[#17201B] px-3 py-2">Sign In</Link>
              <Link href="/dashboard" className="inline-flex items-center gap-2 bg-[#087F3E] hover:bg-[#075C2D] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition shadow-[0_2px_12px_rgba(8,127,62,0.25)]">
                Launch App
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden w-10 h-10 rounded-full border border-[#E3E9E5] bg-white flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 6H17M3 10H17M3 14H17" stroke="#17201B" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 pt-2 border-t border-[#E3E9E5] mt-2 flex flex-col gap-1 bg-white">
              <a href="#problem" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium">Problem</a>
              <a href="#raah" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium">The Raah</a>
              <a href="#mvp" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium">Services</a>
              <a href="#trust" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium">Trust</a>
              <a href="#team" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium">Team</a>
              <Link href="/dashboard" className="mt-2 inline-flex justify-center bg-[#087F3E] text-white font-semibold px-5 py-3 rounded-full">Launch App</Link>
            </div>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F3FAF5] via-[#FBFDFC] to-white pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-[#EAF7EE] rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute top-20 -left-32 w-[500px] h-[500px] bg-[#EAF7EE] rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-16 pb-8">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white border border-[#E3E9E5] rounded-full px-3 py-1.5 shadow-soft mb-6">
                <span className="w-6 h-6 rounded-full bg-[#087F3E] flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2L7.5 4.5L10 5L7.5 6.5L6 9L4.5 6.5L2 5L4.5 4.5L6 2Z" fill="white" /></svg>
                </span>
                <span className="text-xs font-semibold tracking-widest text-[#075C2D] uppercase">Bano Qabil AI Hackathon 2026</span>
                <span className="hidden sm:inline-flex bg-[#EAF7EE] text-[#087F3E] text-[11px] font-bold px-2 py-0.5 rounded-full">● LIVE</span>
              </div>

              <h1 className="text-[36px] sm:text-[44px] lg:text-[54px] font-[800] leading-[0.95] tracking-tight text-[#17201B]">
                Government<br />paperwork,<br />
                <span className="text-[#087F3E]">finally has a</span><br />
                <span className="text-[#087F3E] italic font-extrabold relative">
                  raah.
                  <span className="absolute -bottom-2 left-0 w-full h-2 bg-[#EAF7EE] -z-10 rounded-full" />
                </span>
              </h1>

              <p className="mt-6 text-[16px] lg:text-[18px] leading-7 text-[#66716B] max-w-[560px]">
                RaahAI is an AI guide that walks Pakistani citizens through{" "}
                <span className="font-semibold text-[#17201B]">Passport, CNIC, and Business Registration</span>
                {" — "}answering in{" "}
                <span className="font-semibold text-[#17201B]">Urdu or English</span>, pulling your real data, and citing where every answer comes from.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/dashboard" className="inline-flex items-center gap-2 bg-[#087F3E] hover:bg-[#075C2D] text-white font-semibold px-7 py-3.5 rounded-full shadow-[0_8px_24px_rgba(8,127,62,0.28)] transition">
                  Launch App
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                </Link>
                <a href="#raah" className="inline-flex items-center gap-2 bg-white border border-[#E3E9E5] hover:border-[#087F3E]/30 hover:bg-[#F3FAF5] text-[#17201B] font-semibold px-7 py-3.5 rounded-full transition">
                  See how it works
                </a>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 bg-white border border-[#E3E9E5] rounded-full px-4 py-2 shadow-soft">
                <span className="w-7 h-7 rounded-full bg-[#EAF7EE] flex items-center justify-center text-[#087F3E]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L8 5L12 5L8.7 7.5L9.5 11.5L7 9.2L4.5 11.5L5.3 7.5L2 5L6 5L7 1Z" fill="#087F3E" /></svg>
                </span>
                <span className="text-sm font-medium text-[#17201B]">
                  Every answer is <span className="font-bold">grounded</span> in your data and knowledge base.
                </span>
              </div>
            </div>

            {/* Right Visual - Chat Preview */}
            <div className="relative lg:pl-4">
              <div className="relative bg-white rounded-[24px] border border-[#E3E9E5] shadow-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#E3E9E5] bg-[#FBFDFC]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                    <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#66716B] bg-white border border-[#E3E9E5] rounded-full px-3 py-1">
                    <span className="w-2 h-2 bg-[#159447] rounded-full animate-pulse" />
                    RaahAI Assistant
                  </div>
                  <div className="w-8 h-8" />
                </div>

                <div className="p-5 space-y-4 bg-[#FBFDFC]">
                  <div className="flex justify-end">
                    <div className="bg-[#EAF7EE] border border-[#E3E9E5]/60 rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]">
                      <p className="text-sm text-[#17201B] leading-relaxed font-medium">Passport banwane ke liye kya documents chahiye?</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl rounded-tl-md border border-[#E3E9E5] p-4 shadow-soft">
                    <div className="flex items-center gap-2 mb-3">
                      <img src="/logo.png" alt="RaahAI" className="w-7 h-7 rounded-full object-cover border border-[#E3E9E5]" />
                      <span className="text-sm font-bold text-[#075C2D]">RaahAI</span>
                      <span className="w-4 h-4 rounded-full bg-[#EAF7EE] flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 5L4.5 6.5L7 3.5" stroke="#087F3E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                    </div>
                    <p className="text-sm text-[#17201B] leading-relaxed">Passport banwane ke liye yeh documents chahiye:</p>
                    <ul className="mt-3 space-y-1.5 text-sm text-[#17201B]">
                      <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#087F3E] mt-1.5 shrink-0" />Original CNIC / Smart CNIC</li>
                      <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#087F3E] mt-1.5 shrink-0" />Passport photographs</li>
                      <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#087F3E] mt-1.5 shrink-0" />Fee payment receipt</li>
                    </ul>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-[#66716B]">Source:</span>
                      <span className="inline-flex items-center gap-1 bg-[#EAF7EE] border border-[#087F3E]/15 text-[#087F3E] text-xs font-semibold px-2.5 py-1 rounded-full">DGIP Official</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges below the card, not overlapping */}
              <div className="flex items-center justify-between mt-4 px-2">
                <div className="flex items-center gap-2 bg-[#075C2D] text-white rounded-full px-3 py-2 shadow-card">
                  <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-xs">🇵🇰</span>
                  <span className="text-xs font-bold">Urdu + English</span>
                </div>
                <div className="flex items-center gap-2 bg-white border border-[#E3E9E5] rounded-full px-3 py-2 shadow-card">
                  <span className="w-6 h-6 rounded-xl bg-[#EAF7EE] flex items-center justify-center text-xs">🛡️</span>
                  <span className="text-xs font-bold text-[#17201B]">Official Sources</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BANNER CAROUSEL */}
      <BannerCarousel />

      {/* THE PROBLEM */}
      <section id="problem" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#F3FAF5] border border-[#E3E9E5] rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase text-[#087F3E] mb-3">The Problem</div>
            <h2 className="text-[28px] lg:text-[36px] font-[800] tracking-tight leading-none text-[#17201B]">
              Simple errands turn into<br /><span className="text-[#66716B]">three office visits</span>
            </h2>
          </div>
          <p className="text-[#66716B] text-[15px] leading-6 max-w-[520px]">
            Confusing websites and missing documents cost citizens time they don&apos;t have to spare. RaahAI was built to end that cycle.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { num: "01", title: "English-only instructions", desc: "Official portals rarely explain procedures in Urdu, leaving many citizens guessing.", icon: "🌐", accent: "bg-[#EAF7EE]" },
            { num: "02", title: "Forms nobody explains", desc: "Dense government forms use terms that are hard to decode without help.", icon: "📄", accent: "bg-[#EFF4FF]" },
            { num: "03", title: "Repeated office visits", desc: "One missing document usually means a wasted trip — and starting over.", icon: "🏢", accent: "bg-[#F3EEFF]" },
          ].map((c) => (
            <div key={c.num} className="bg-white rounded-[20px] border border-[#E3E9E5] p-6 shadow-soft hover:shadow-card hover:-translate-y-1 transition">
              <div className="flex items-center justify-between mb-5">
                <div className={`w-11 h-11 rounded-xl ${c.accent} border border-[#E3E9E5] flex items-center justify-center text-lg`}>{c.icon}</div>
                <span className="text-sm font-bold tracking-widest text-[#98A29C]">{c.num}</span>
              </div>
              <h3 className="font-bold text-[#17201B] text-[16px] leading-tight mb-2">{c.title}</h3>
              <p className="text-sm leading-6 text-[#66716B]">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THE RAAH */}
      <section id="raah" className="bg-[#F3FAF5] border-y border-[#E3E9E5]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex bg-white border border-[#E3E9E5] rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase text-[#087F3E] mb-3">The Raah — Your Path</div>
            <h2 className="text-[28px] lg:text-[36px] font-[800] tracking-tight text-[#17201B]">One path, from question to done</h2>
            <p className="text-[#66716B] mt-3 text-[15px] leading-6">RaahAI turns a scattered process into a single, guided route.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-[34px] left-[14%] right-[14%] h-[2px] bg-gradient-to-r from-[#087F3E]/15 via-[#087F3E]/30 to-[#087F3E]/15" />
            {[
              { step: "01", title: "Ask", desc: "Type or speak your question in Urdu or English.", icon: "💬" },
              { step: "02", title: "Understand", desc: "AI classifies intent, searches your data and the knowledge base.", icon: "🔍" },
              { step: "03", title: "Guide", desc: "A personal checklist tracks exactly what's left for your situation.", icon: "🧭" },
              { step: "04", title: "Trust", desc: "Every answer names its source — or says plainly when it doesn't know.", icon: "🛡️" },
            ].map((s) => (
              <div key={s.step} className="relative bg-white rounded-[20px] border border-[#E3E9E5] p-6 shadow-soft text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#087F3E] text-white flex items-center justify-center text-xl mx-auto shadow-[0_6px_16px_rgba(8,127,62,0.3)] relative z-10">{s.icon}</div>
                <div className="inline-flex mt-3 bg-[#EAF7EE] border border-[#087F3E]/10 text-[#087F3E] text-xs font-bold tracking-widest px-2.5 py-1 rounded-full">STEP {s.step}</div>
                <h3 className="font-bold text-[#17201B] mt-3">{s.title}</h3>
                <p className="text-sm text-[#66716B] leading-6 mt-2">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div id="how" className="mt-10 bg-[#075C2D] rounded-[20px] p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-xl">⚡</div>
              <div>
                <div className="font-bold">10-LLM pipeline — ~3 second responses</div>
                <div className="text-sm opacity-80">Intent → DB lookup → RAG → Generation → Quality check, all in parallel.</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white text-[#075C2D] text-sm font-semibold px-4 py-2 rounded-full">Passport renewal?</span>
              <span className="bg-white/15 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full">Mera challan check karo</span>
              <span className="bg-white/15 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full">SECP business registration</span>
            </div>
          </div>
        </div>
      </section>

      {/* MVP SCOPE */}
      <section id="mvp" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex bg-[#F3FAF5] border border-[#E3E9E5] rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase text-[#087F3E] mb-3">What&apos;s Built</div>
          <h2 className="text-[28px] lg:text-[36px] font-[800] tracking-tight text-[#17201B]">Working MVP — not a prototype</h2>
          <p className="text-[#66716B] mt-2">10-LLM pipeline, real DB queries, grounded answers. Login with demo@raahai.com / demo1234.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Passport", desc: "Apply for a new passport or renew an existing one, step by step.", points: ["Fresh application", "Renewal & modification", "Fee & appointment guide"], icon: "🛂", color: "#087F3E", bg: "bg-[#EAF7EE]" },
            { title: "CNIC", desc: "Apply for a new CNIC or update your existing information.", points: ["New CNIC / Juvenile card", "Modification & renewal", "Family registration"], icon: "🪪", color: "#3478E5", bg: "bg-[#EFF4FF]" },
            { title: "Business Registration", desc: "Register a new business with SECP without decoding the process alone.", points: ["Company incorporation", "Name reservation", "Document checklist"], icon: "🏢", color: "#6844C7", bg: "bg-[#F3EEFF]" },
          ].map((s) => (
            <div key={s.title} className="bg-white rounded-[20px] border border-[#E3E9E5] overflow-hidden shadow-soft hover:shadow-card hover:-translate-y-1 transition">
              <div className="h-2 w-full" style={{ background: s.color }} />
              <div className="p-6">
                <div className={`w-12 h-12 rounded-xl ${s.bg} border border-[#E3E9E5] flex items-center justify-center text-xl`}>{s.icon}</div>
                <h3 className="font-bold text-lg text-[#17201B] mt-4">{s.title}</h3>
                <p className="text-sm text-[#66716B] leading-6 mt-1">{s.desc}</p>
                <ul className="mt-4 space-y-2">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-[#17201B]">
                      <span className="w-5 h-5 rounded-full bg-[#F3FAF5] border border-[#E3E9E5] flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 5L4.2 6.7L7.5 3" stroke={s.color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard" className="mt-6 w-full rounded-full border font-semibold py-2.5 text-sm transition hover:opacity-90 flex items-center justify-center" style={{ borderColor: `${s.color}30`, color: s.color, background: `${s.color}0F` }}>
                  Explore {s.title} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white border border-dashed border-[#E3E9E5] rounded-2xl p-4 flex flex-wrap items-center justify-center gap-3 text-sm text-[#66716B]">
          <span className="font-semibold text-[#17201B]">Coming next:</span>
          <span className="bg-[#F3FAF5] border border-[#E3E9E5] px-3 py-1 rounded-full">Driving License</span>
          <span className="bg-[#F3FAF5] border border-[#E3E9E5] px-3 py-1 rounded-full">Tax Filing</span>
          <span className="bg-[#F3FAF5] border border-[#E3E9E5] px-3 py-1 rounded-full">Office Locator</span>
        </div>
      </section>

      {/* TRUST */}
      <section id="trust" className="bg-[#F3FAF5] border-y border-[#E3E9E5]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <div className="inline-flex bg-white border border-[#E3E9E5] rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase text-[#087F3E] mb-3">How It Works</div>
              <h2 className="text-[28px] lg:text-[36px] font-[800] tracking-tight text-[#17201B] leading-none">
                10 AI agents,<br /><span className="text-[#087F3E]">one grounded answer</span>
              </h2>
              <p className="text-[#66716B] mt-4 text-[15px] leading-6">
                Each query goes through intent classification, DB lookup, RAG retrieval, response generation, and quality verification.
              </p>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {[
                  { title: "10-LLM AI Pipeline", desc: "10 specialized AI agents run in parallel — intent detection, DB lookup, RAG retrieval, response generation, and quality checks.", icon: "🤖" },
                  { title: "Your real data", desc: "Pulls your actual vehicles, challans, payments, and documents from the database — not generic answers.", icon: "📊" },
                  { title: "Knowledge-grounded", desc: "Answers come from a government services knowledge base. If nothing matches, RaahAI says so instead of guessing.", icon: "📚" },
                  { title: 'Says "I don\'t know"', desc: "If nothing relevant is found, RaahAI tells you plainly instead of hallucinating an answer.", icon: "💬" },
                ].map((it) => (
                  <div key={it.title} className="bg-white rounded-2xl border border-[#E3E9E5] p-5 shadow-soft">
                    <div className="w-10 h-10 rounded-xl bg-[#F3FAF5] border border-[#E3E9E5] flex items-center justify-center text-lg">{it.icon}</div>
                    <h3 className="font-bold text-sm text-[#17201B] mt-3">{it.title}</h3>
                    <p className="text-sm text-[#66716B] leading-6 mt-1">{it.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-[#075C2D] rounded-[24px] p-6 lg:p-8 text-white relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-[#159447]/30 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="inline-flex bg-white/15 border border-white/15 rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase">How grounding works</div>
                  <h3 className="text-xl font-bold mt-4 leading-tight">
                    Every answer is<br />retrieved first, then explained.
                  </h3>
                  <div className="mt-6 space-y-3">
                    {[
                      { k: "01", t: "Your question → intent classified & entities extracted" },
                      { k: "02", t: "DB query runs (vehicles, challans, payments, documents)" },
                      { k: "03", t: "RAG searches government knowledge base for relevant info" },
                      { k: "04", t: "10 AI agents merge context, generate answer, verify quality" },
                    ].map((r) => (
                      <div key={r.k} className="flex gap-3 bg-white/10 border border-white/10 rounded-xl px-4 py-3">
                        <span className="w-7 h-7 rounded-full bg-white text-[#075C2D] flex items-center justify-center text-xs font-bold shrink-0">{r.k}</span>
                        <span className="text-sm leading-5 opacity-90">{r.t}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 bg-white rounded-xl p-4 text-[#17201B] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EAF7EE] flex items-center justify-center text-[#087F3E] font-bold">✓</div>
                    <div>
                      <div className="text-sm font-bold">&quot;I don&apos;t have verified information on this.&quot;</div>
                      <div className="text-xs text-[#66716B]">Grounding guardrail — no hallucinations.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section id="team" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex bg-[#F3FAF5] border border-[#E3E9E5] rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase text-[#087F3E] mb-3">The Team</div>
          <h2 className="text-[28px] lg:text-[36px] font-[800] tracking-tight text-[#17201B]">Built for Bano Qabil AI Hackathon 2026</h2>
          <p className="text-[#66716B] mt-2">Four people, one weekend, one raah.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { name: "Muhammad Ehtisham Tahir", role: "Team Leader", initials: "ET" },
            { name: "Meer Ahmed", role: "Backend Engineer", initials: "MA" },
            { name: "Abdullah Tufail", role: "AI/ML Engineer", initials: "AT" },
            { name: "Ahmed Malik", role: "Frontend Engineer", initials: "AM" },
          ].map((m) => (
            <div key={m.name} className="bg-white rounded-[20px] border border-[#E3E9E5] p-6 text-center shadow-soft hover:shadow-card transition">
              <div className="w-20 h-20 rounded-full bg-[#EAF7EE] border-4 border-[#F3FAF5] flex items-center justify-center mx-auto">
                <span className="text-lg font-bold text-[#087F3E]">{m.initials}</span>
              </div>
              <div className="font-bold text-[#17201B] mt-4 leading-tight">{m.name}</div>
              <div className="inline-flex mt-2 bg-[#EAF7EE] border border-[#087F3E]/10 text-[#087F3E] text-xs font-bold px-3 py-1 rounded-full">{m.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="launch" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="bg-gradient-to-br from-[#087F3E] via-[#087F3E] to-[#075C2D] rounded-[28px] p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-white rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
            <div className="text-white">
              <div className="inline-flex bg-white/15 border border-white/20 rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase">Ready When You Are</div>
              <h2 className="text-[30px] lg:text-[40px] font-[800] tracking-tight leading-none mt-4">
                Find your way through<br />government services
              </h2>
              <p className="text-white/85 mt-4 text-[15px] leading-6 max-w-xl">
                No sign-up required to see how it works. Launch the app and ask your first question — in Urdu or English.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-[#087F3E] font-bold px-7 py-3.5 rounded-full shadow-lg hover:bg-[#F3FAF5] transition">
                  Launch App
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                </Link>
                <a href="#how" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-full hover:bg-white/15 transition">See demo flow</a>
              </div>
              <div className="mt-6 text-white/90 font-medium" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>راہ — آپ کا راستہ</div>
            </div>

            <div className="bg-white rounded-[20px] p-6 shadow-card">
              <div className="text-xs font-bold tracking-widest uppercase text-[#087F3E]">Try an example</div>
              <div className="mt-3 space-y-2">
                {[
                  "How do I renew my passport?",
                  "CNIC gum ho gaya, kya karun?",
                  "SECP pe business kaise register karte hain?",
                ].map((q) => (
                  <button key={q} onClick={() => { window.location.href = `/ai?q=${encodeURIComponent(q)}`; }} className="w-full text-left bg-[#F3FAF5] hover:bg-[#EAF7EE] border border-[#E3E9E5] rounded-xl px-4 py-3 text-sm font-medium text-[#17201B] transition flex items-center justify-between group">
                    <span>{q}</span>
                    <span className="w-7 h-7 rounded-full bg-white border border-[#E3E9E5] flex items-center justify-center group-hover:bg-[#087F3E] group-hover:text-white group-hover:border-[#087F3E] transition">↗</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-[#66716B] bg-[#FBFDFC] border border-[#E3E9E5] rounded-full px-3 py-2">
                <span className="w-2 h-2 bg-[#159447] rounded-full animate-pulse" />
                No data saved • Answers cited • Urdu + English
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E3E9E5] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="RaahAI Logo" className="w-9 h-9 rounded-xl object-cover border border-[#E3E9E5]" />
                <div className="font-bold text-[#075C2D]">RaahAI</div>
                <span className="text-xs bg-[#F3FAF5] border border-[#E3E9E5] px-2 py-1 rounded-full font-bold tracking-widest uppercase text-[#66716B]">Demo • 2026</span>
              </div>
              <p className="text-sm text-[#66716B] mt-3 max-w-sm leading-6">
                AI-powered government services assistant. 10-LLM pipeline with grounded answers. Built for Bano Qabil AI Hackathon 2026.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <div className="font-bold text-[#17201B] mb-3">Product</div>
                <ul className="space-y-2 text-[#66716B]">
                  <li><a href="#raah" className="hover:text-[#087F3E]">The Raah</a></li>
                  <li><a href="#mvp" className="hover:text-[#087F3E]">Services</a></li>
                  <li><a href="#trust" className="hover:text-[#087F3E]">Trust</a></li>
                </ul>
              </div>
              <div>
                <div className="font-bold text-[#17201B] mb-3">Services</div>
                <ul className="space-y-2 text-[#66716B]">
                  <li>Passport</li>
                  <li>CNIC</li>
                  <li>Business Registration</li>
                </ul>
              </div>
              <div>
                <div className="font-bold text-[#17201B] mb-3">Trust</div>
                <ul className="space-y-2 text-[#66716B]">
                  <li>Privacy by design</li>
                  <li>Official sources</li>
                  <li>Says &ldquo;I don&apos;t know&rdquo;</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#E3E9E5] flex flex-col sm:flex-row justify-between gap-3 text-sm text-[#98A29C]">
            <div>© 2026 RaahAI. Built for demo purposes.</div>
            <div>Muhammad Ehtisham Tahir · Meer Ahmed · Abdullah Tufail · Ahmed Malik</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
