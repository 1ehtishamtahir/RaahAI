"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const banners = [
  { src: "/banners/ChatGPT Image Aug 27, 2026, 11_05_17 PM.png", alt: "RaahAI Banner 1" },
  { src: "/banners/ChatGPT Image Aug 27, 2026, 11_05_20 PM.png", alt: "RaahAI Banner 2" },
  { src: "/banners/ChatGPT Image Aug 27, 2026, 11_05_22 PM.png", alt: "RaahAI Banner 3" },
  { src: "/banners/ChatGPT Image Aug 27, 2026, 11_05_37 PM.png", alt: "RaahAI Banner 4" },
];

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + banners.length) % banners.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [paused, next]);

  return (
    <section
      className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative rounded-[20px] overflow-hidden shadow-card group bg-[#EAF7EE]">
        {/* Banner images - natural size, centered */}
        <div className="relative w-full min-h-[200px] sm:min-h-[300px] lg:min-h-[400px]">
          {banners.map((b, i) => (
            <div
              key={b.src}
              className={`w-full transition-opacity duration-500 ${i === current ? "opacity-100 relative" : "opacity-0 absolute inset-0"}`}
            >
              <div className="relative w-full min-h-[200px] sm:min-h-[300px] lg:min-h-[400px]">
                <Image
                  src={b.src}
                  alt={b.alt}
                  fill
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Nav arrows */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-black/60"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-black/60"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-white w-5" : "bg-white/50"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
