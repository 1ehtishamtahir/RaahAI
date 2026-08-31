"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import ScrollReveal from "@/components/ui/ScrollReveal";

const BannerCarousel = dynamic(() => import("@/components/ui/BannerCarousel"));

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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#F3FAF5] via-white to-[#EAF7EE]/30">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#087F3E] rounded-full blur-[180px] opacity-[0.07] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#087F3E] rounded-full blur-[160px] opacity-[0.05] pointer-events-none" />

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-14 pb-12 lg:pb-14">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-[#087F3E]/10 rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 bg-[#087F3E] rounded-full animate-pulse" />
                <span className="text-[11px] font-bold tracking-widest text-[#075C2D] uppercase">Bano Qabil AI Hackathon 2026</span>
              </div>

              <h1 className="text-[44px] sm:text-[56px] lg:text-[68px] font-[800] leading-[0.88] tracking-[-0.03em] text-[#0F1A14] capitalize">
                your <span className="text-[#087F3E] italic">raah</span><br />
                through government.
              </h1>

              <p className="mt-8 text-[16px] lg:text-[18px] leading-[1.75] text-[#5A6B60] max-w-[480px]">
                Pakistan's AI-powered citizen portal.{" "}
                <span className="font-semibold text-[#0F1A14]">Ask questions, track documents, manage challans</span> — all in one place.{" "}
                Speak in <span className="font-semibold text-[#0F1A14]">Urdu or English</span>.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="/dashboard" className="group inline-flex items-center gap-3 bg-[#087F3E] hover:bg-[#065E30] text-white font-semibold px-9 py-4 rounded-2xl shadow-[0_4px_24px_rgba(8,127,62,0.35)] transition-all hover:shadow-[0_8px_32px_rgba(8,127,62,0.45)] hover:-translate-y-0.5">
                  Launch App
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-0.5"><path d="M3 8H13M10 5L13 8L10 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
                <a href="#raah" className="inline-flex items-center gap-2 text-[#0F1A14] font-semibold px-6 py-4 rounded-2xl hover:bg-[#0F1A14]/5 transition-all">
                  See how it works
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </a>
              </div>

              <div className="mt-8 flex items-center gap-6 text-sm text-[#5A6B60]">
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8C14.5 4.41 11.59 1.5 8 1.5Z" stroke="#087F3E" strokeWidth="1.2"/><path d="M5 8L7 10L11 6" stroke="#087F3E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  AI-powered answers
                </span>
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#087F3E" strokeWidth="1.2"/><path d="M5 8H11M8 5V11" stroke="#087F3E" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  Urdu + English
                </span>
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L9.5 5.5L14 5.5L10.5 8.5L11.5 12.5L8 10L4.5 12.5L5.5 8.5L2 5.5L6.5 5.5L8 1.5Z" stroke="#087F3E" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                  Official sources
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center">
              <img src="/hero/hero.png" alt="RaahAI — AI-powered government services assistant" className="w-full max-w-[520px] h-auto object-contain drop-shadow-[0_24px_48px_rgba(8,127,62,0.15)]" />
            </div>
          </div>
        </div>
      </section>

      {/* HORIZONTAL TICKER - SKEWED */}
      <div className="relative mt-10 -my-8 z-10 mb-14">
        <div className="relative bg-[#075C2D] py-6" style={{ transform: 'skewY(-5deg)' }}>
          <div className="flex animate-[ticker_35s_linear_infinite] whitespace-nowrap" style={{ transform: 'skewY(5deg)' }}>
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex items-center gap-10 px-6">
                {[
                  "Passport",
                  "CNIC",
                  "Business Registration",
                  "Vehicle Management",
                  "Fee Calculator",
                  "Office Locator",
                  "AI Chat",
                  "Document Wallet",
                  "Schemes Discovery",
                  "Checklists",
                ].map((item, i) => (
                  <span key={`${setIdx}-${i}`} className="text-white text-[15px] font-semibold tracking-wide uppercase cursor-default hover:text-[#EAF7EE] transition-colors duration-300">
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BANNER CAROUSEL */}
      <BannerCarousel />

      {/* THE PROBLEM */}
      <section id="problem" className="bg-white border-y border-[#E3E9E5]/60">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <ScrollReveal>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-14">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-[#087F3E] rounded-full px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase text-white mb-5">The Problem</div>
              <h2 className="text-[32px] lg:text-[40px] font-[800] tracking-[-0.02em] leading-[1.05] text-[#0F1A14]">
                Simple errands turn into<br />
                <span className="text-[#087F3E]">three office visits</span>
              </h2>
            </div>
            <div className="lg:pt-10 max-w-md">
              <p className="text-[#5A6B60] text-[16px] leading-[1.8]">
                Confusing websites and missing documents cost citizens time they don&apos;t have to spare. <span className="font-semibold text-[#0F1A14]">RaahAI was built to end that cycle.</span>
              </p>
            </div>
          </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: "01", title: "English-only instructions", desc: "Official portals rarely explain procedures in Urdu, leaving many citizens guessing.", gradient: "from-[#EAF7EE] to-[#D4F1E0]", ring: "ring-[#087F3E]/20", numBg: "bg-[#087F3E]", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#087F3E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
              { num: "02", title: "Forms nobody explains", desc: "Dense government forms use terms that are hard to decode without help.", gradient: "from-[#EFF4FF] to-[#D6E8FF]", ring: "ring-[#3478E5]/20", numBg: "bg-[#3478E5]", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3478E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
              { num: "03", title: "Repeated office visits", desc: "One missing document usually means a wasted trip — and starting over.", gradient: "from-[#F3EEFF] to-[#E4DAFF]", ring: "ring-[#6844C7]/20", numBg: "bg-[#6844C7]", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6844C7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/></svg> },
            ].map((c, i) => (
              <ScrollReveal key={c.num} delay={i * 120}>
              <div className="group relative bg-white rounded-[24px] border border-[#E3E9E5]/40 p-7 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden h-full">
                <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} ring-4 ${c.ring} flex items-center justify-center shadow-sm`}>{c.icon}</div>
                    <span className={`text-[11px] font-bold tracking-wider text-white ${c.numBg} rounded-full px-3 py-1.5 shadow-md`}>{c.num}</span>
                  </div>
                  <h3 className="font-bold text-[#0F1A14] text-[17px] leading-snug mb-2.5">{c.title}</h3>
                  <p className="text-[15px] leading-[1.7] text-[#5A6B60]">{c.desc}</p>
                  
                  <div className="mt-5 h-[2px] w-12 bg-gradient-to-r from-[#087F3E] to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* THE RAAH */}
      <section id="raah" className="bg-white border-y border-[#E3E9E5]/60">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <ScrollReveal>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-14">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-[#087F3E] rounded-full px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase text-white mb-5">The Raah — Your Path</div>
              <h2 className="text-[32px] lg:text-[40px] font-[800] tracking-[-0.02em] leading-[1.05] text-[#0F1A14]">
                One path, from<br />
                <span className="text-[#087F3E]">question to done</span>
              </h2>
            </div>
            <div className="lg:pt-10 max-w-md">
              <p className="text-[#5A6B60] text-[16px] leading-[1.8]">
                RaahAI turns a scattered process into a single, <span className="font-semibold text-[#0F1A14]">guided route.</span>
              </p>
            </div>
          </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-4 gap-5 relative">
            <div className="hidden md:block absolute top-[36px] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-[#087F3E]/10 via-[#087F3E]/25 to-[#087F3E]/10" />
            {[
              { step: "01", title: "Ask", desc: "Type or speak your question in Urdu or English.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
              { step: "02", title: "Understand", desc: "AI classifies intent, searches your data and the knowledge base.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
              { step: "03", title: "Guide", desc: "A personal checklist tracks exactly what's left for your situation.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
              { step: "04", title: "Trust", desc: "Every answer names its source — or says plainly when it doesn't know.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
            ].map((s, i) => (
              <ScrollReveal key={s.step} delay={i * 100}>
              <div className="group relative bg-white rounded-[20px] border border-[#E3E9E5]/60 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_48px_rgba(8,127,62,0.12)] hover:-translate-y-1 transition-all duration-400 text-center h-full">
                <div className="w-14 h-14 rounded-2xl bg-[#087F3E] flex items-center justify-center mx-auto shadow-[0_6px_20px_rgba(8,127,62,0.3)] relative z-10">{s.icon}</div>
                <div className="inline-flex mt-4 bg-[#EAF7EE] text-[#087F3E] text-[10px] font-bold tracking-widest px-3 py-1 rounded-full">STEP {s.step}</div>
                <h3 className="font-bold text-[#0F1A14] text-[17px] mt-3">{s.title}</h3>
                <p className="text-[14px] text-[#5A6B60] leading-[1.7] mt-2">{s.desc}</p>
              </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={400}>
          <div id="how" className="mt-12 bg-[#075C2D] rounded-[24px] p-7 lg:p-9 flex flex-col lg:flex-row items-center justify-between gap-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <div>
                <div className="font-bold text-[16px]">10-LLM pipeline — ~3 second responses</div>
                <div className="text-[14px] opacity-80">Intent → DB lookup → RAG → Generation → Quality check, all in parallel.</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white text-[#075C2D] text-[13px] font-semibold px-5 py-2.5 rounded-full">Passport renewal?</span>
              <span className="bg-white/15 border border-white/20 text-white text-[13px] font-medium px-5 py-2.5 rounded-full">Mera challan check karo</span>
              <span className="bg-white/15 border border-white/20 text-white text-[13px] font-medium px-5 py-2.5 rounded-full">SECP business registration</span>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* MVP SCOPE */}
      <section id="mvp" className="bg-white border-y border-[#E3E9E5]/60">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <ScrollReveal>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-14">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-[#087F3E] rounded-full px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase text-white mb-5">What&apos;s Built</div>
              <h2 className="text-[32px] lg:text-[40px] font-[800] tracking-[-0.02em] leading-[1.05] text-[#0F1A14]">
                Working MVP —<br />
                <span className="text-[#087F3E]">not a prototype</span>
              </h2>
            </div>
            <div className="lg:pt-10 max-w-md">
              <p className="text-[#5A6B60] text-[16px] leading-[1.8]">
                <span className="font-semibold text-[#0F1A14]">Everything a citizen needs — in one place.</span>
              </p>
            </div>
          </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { title: "AI Chat", desc: "10-LLM parallel pipeline with grounded, cited answers in Urdu and English.", points: ["Intent classification", "RAG + DB grounding", "Safety & quality checks"], color: "#087F3E", gradient: "from-[#EAF7EE] to-[#D4F1E0]", icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#087F3E" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
              { title: "Document Wallet", desc: "Upload documents, scan with OCR, track expiry dates, and get alerts.", points: ["Gemini Vision OCR", "Expiry tracking", "Auto field extraction"], color: "#3478E5", gradient: "from-[#EFF4FF] to-[#D6E8FF]", icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#3478E5" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
              { title: "Fee Calculator", desc: "Instant fee breakdowns for passport, CNIC, and business registration.", points: ["3 urgency levels", "Bank charges included", "Processing time estimates"], color: "#E57D20", gradient: "from-[#FFF4E5] to-[#FFE8CC]", icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#E57D20" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
              { title: "Office Locator", desc: "Find NADRA, DGIP, and SECP offices with addresses and working hours.", points: ["6 NADRA centers", "3 passport offices", "3 SECP offices"], color: "#6844C7", gradient: "from-[#F3EEFF] to-[#E4DAFF]", icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#6844C7" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
              { title: "Vehicle Management", desc: "Register vehicles, track token tax, and manage ownership transfers.", points: ["Registration flows", "Token tax tracking", "Challan management"], color: "#C74444", gradient: "from-[#FFECEC] to-[#FFD6D6]", icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#C74444" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17h.01M16 17h.01M3 11l1.5-5h15l1.5 5M3 11v6a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-6M3 11h18" /></svg> },
              { title: "Schemes Discovery", desc: "AI-matched government programs based on your profile and eligibility.", points: ["7+ schemes loaded", "AI recommendations", "Deadline tracking"], color: "#1A8A8A", gradient: "from-[#E5F6F6] to-[#CCF0F0]", icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#1A8A8A" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> },
            ].map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 80}>
              <div className="group relative bg-gradient-to-br from-white to-[#FAFBFA] rounded-[24px] border border-[#E3E9E5]/50 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.09)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl opacity-[0.03] pointer-events-none rounded-bl-[100px]" style={{ background: `linear-gradient(to bottom left, ${s.color}, transparent)` }} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-sm`}>{s.icon}</div>
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full" style={{ color: s.color, background: `${s.color}10` }}>{s.title.split(' ')[0]}</span>
                  </div>
                  <h3 className="font-bold text-[17px] text-[#0F1A14]">{s.title}</h3>
                  <p className="text-[14px] text-[#5A6B60] leading-[1.65] mt-2">{s.desc}</p>
                  <div className="mt-4 pt-4 border-t border-[#E3E9E5]/40">
                    <ul className="space-y-2">
                      {s.points.map((p) => (
                        <li key={p} className="flex items-center gap-2 text-[13px] text-[#0F1A14]">
                          <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: `${s.color}10` }}>
                            <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2.5 5L4.2 6.7L7.5 3" stroke={s.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link href="/dashboard" className="mt-5 w-full rounded-xl font-semibold py-2.5 text-[13px] transition-all hover:opacity-80 flex items-center justify-center gap-1.5 border" style={{ color: s.color, borderColor: `${s.color}25` }}>
                    Explore {s.title}
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </Link>
                </div>
              </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section id="trust" className="bg-white border-y border-[#E3E9E5]/60">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <ScrollReveal direction="left">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#087F3E] rounded-full px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase text-white mb-5">How It Works</div>
              <h2 className="text-[32px] lg:text-[40px] font-[800] tracking-[-0.02em] leading-[1.05] text-[#0F1A14]">
                10 AI agents,<br /><span className="text-[#087F3E]">one grounded answer</span>
              </h2>
              <p className="text-[#5A6B60] mt-4 text-[16px] leading-[1.7]">
                Each query goes through intent classification, DB lookup, RAG retrieval, response generation, and quality verification.
              </p>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {[
                  { title: "10-LLM AI Pipeline", desc: "10 specialized AI agents run in parallel — intent detection, DB lookup, RAG retrieval, response generation, and quality checks.", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#087F3E" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
                  { title: "Your real data", desc: "Pulls your actual vehicles, challans, payments, and documents from the database — not generic answers.", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#087F3E" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg> },
                  { title: "Knowledge-grounded", desc: "Answers come from a government services knowledge base. If nothing matches, RaahAI says so instead of guessing.", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#087F3E" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
                  { title: 'Says "I don\'t know"', desc: "If nothing relevant is found, RaahAI tells you plainly instead of hallucinating an answer.", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#087F3E" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                ].map((it) => (
                  <div key={it.title} className="bg-[#FAFBFA] rounded-[16px] border border-[#E3E9E5]/60 p-5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-[#EAF7EE] flex items-center justify-center">{it.icon}</div>
                    <h3 className="font-bold text-[14px] text-[#0F1A14] mt-3">{it.title}</h3>
                    <p className="text-[13px] text-[#5A6B60] leading-[1.65] mt-1.5">{it.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={150}>
            <div className="relative">
              <div className="bg-[#075C2D] rounded-[24px] p-7 lg:p-8 text-white relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-[#159447]/30 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase">How grounding works</div>
                  <h3 className="text-[22px] font-[800] mt-5 leading-tight tracking-[-0.01em]">
                    Every answer is<br />retrieved first, then explained.
                  </h3>
                  <div className="mt-6 space-y-3">
                    {[
                      { k: "01", t: "Your question → intent classified & entities extracted" },
                      { k: "02", t: "DB query runs (vehicles, challans, payments, documents)" },
                      { k: "03", t: "RAG searches government knowledge base for relevant info" },
                      { k: "04", t: "10 AI agents merge context, generate answer, verify quality" },
                    ].map((r) => (
                      <div key={r.k} className="flex gap-3 bg-white/10 rounded-xl px-4 py-3">
                        <span className="w-7 h-7 rounded-full bg-white text-[#075C2D] flex items-center justify-center text-[11px] font-bold shrink-0">{r.k}</span>
                        <span className="text-[14px] leading-[1.5] opacity-90">{r.t}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 bg-white rounded-xl p-4 text-[#0F1A14] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EAF7EE] flex items-center justify-center shrink-0">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#087F3E" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <div className="text-[14px] font-bold">&quot;I don&apos;t have verified information on this.&quot;</div>
                      <div className="text-[12px] text-[#5A6B60]">Grounding guardrail — no hallucinations.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section id="team" className="bg-white border-y border-[#E3E9E5]/60">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <ScrollReveal>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-14">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-[#087F3E] rounded-full px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase text-white mb-5">The Team</div>
              <h2 className="text-[32px] lg:text-[40px] font-[800] tracking-[-0.02em] leading-[1.05] text-[#0F1A14] whitespace-nowrap">
                Built for <span className="text-[#087F3E]">Bano Qabil AI Hackathon 2026</span>
              </h2>
            </div>
            <div className="lg:pt-10 max-w-md">
              <p className="text-[#5A6B60] text-[16px] leading-[1.8]">
                <span className="font-semibold text-[#0F1A14]">Four people, one weekend, one raah.</span>
              </p>
            </div>
          </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: "Muhammad Ehtisham Tahir", role: "Team Leader", initials: "ET", color: "#087F3E" },
              { name: "Meer Ahmed", role: "Backend Engineer", initials: "MA", color: "#3478E5" },
              { name: "Abdullah Tufail", role: "AI/ML Engineer", initials: "AT", color: "#6844C7" },
              { name: "Ahmed Malik", role: "Frontend Engineer", initials: "AM", color: "#E57D20" },
            ].map((m, i) => (
              <ScrollReveal key={m.name} delay={i * 100}>
              <div className="group relative bg-gradient-to-br from-white to-[#FAFBFA] rounded-[20px] border border-[#E3E9E5]/60 p-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-400 h-full">
                <div className="relative mx-auto w-[88px] h-[88px]">
                  <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: `${m.color}10`, border: `2px solid ${m.color}20` }}>
                    <span className="text-[22px] font-[800]" style={{ color: m.color }}>{m.initials}</span>
                  </div>
                </div>
                <div className="font-bold text-[15px] text-[#0F1A14] mt-5 leading-tight">{m.name}</div>
                <div className="inline-flex mt-2.5 text-[12px] font-semibold px-3 py-1 rounded-full" style={{ color: m.color, background: `${m.color}10` }}>{m.role}</div>
              </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="launch" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <ScrollReveal>
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
        </ScrollReveal>
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
