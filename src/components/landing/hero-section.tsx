"use client";

import { useEffect, useRef, useState } from "react";
import { WebGLBackground } from "./webgl-background";
import { GlitchText } from "./glitch-text";
import { TypingText } from "./typing-text";
import { ChevronDown } from "lucide-react";

export function HeroSection() {
  const [showSubtitle, setShowSubtitle] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const scrollY = window.scrollY;
      const height = sectionRef.current.offsetHeight;
      const progress = Math.min(scrollY / height, 1);
      sectionRef.current.style.setProperty("--scroll-progress", String(progress));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: "100vh", minHeight: "600px" }}
    >
      <WebGLBackground />

      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(5,5,5,0.6) 100%)",
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex h-full flex-col items-center justify-center px-4"
        style={{
          transform: "translateY(calc(var(--scroll-progress, 0) * -80px))",
          opacity: "calc(1 - var(--scroll-progress, 0) * 1.5)",
          transition: "none",
        }}
      >
        {/* Label */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-[1px] w-8 bg-[#c084fc]/50" />
          <span
            className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#c084fc]/70"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Inference Engine v2.4.0
          </span>
          <div className="h-[1px] w-8 bg-[#c084fc]/50" />
        </div>

        {/* Main Title */}
        <h1
          className="text-center text-[clamp(4rem,15vw,12rem)] font-bold leading-[0.85] tracking-[0.15em] text-white"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          <GlitchText
            text="TUEN"
            speed={25}
            onComplete={() => setShowSubtitle(true)}
          />
        </h1>

        {/* Subtitle */}
        <div className="mt-8 text-center">
          {showSubtitle && (
            <p
              className="text-[clamp(0.875rem,1.5vw,1.125rem)] text-[#06b6d4]/90"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              <TypingText
                text="Run and tune the world's fastest models. Zero cold boots."
                speed={35}
                cursorColor="#c084fc"
              />
            </p>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/sign-up"
            className="group relative overflow-hidden rounded-sm border border-[#c084fc]/30 bg-[#c084fc]/10 px-8 py-3 text-sm font-semibold tracking-wide text-[#c084fc] transition-all hover:border-[#c084fc]/60 hover:bg-[#c084fc]/20 hover:shadow-[0_0_30px_rgba(57,255,20,0.15)]"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            <span className="relative z-10">[ start_inference ]</span>
          </a>
          <a
            href="/docs"
            className="rounded-sm border border-white/10 px-8 py-3 text-sm font-medium tracking-wide text-white/60 transition-all hover:border-white/30 hover:text-white/90"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            {"< documentation / >"}
          </a>
        </div>

        {/* Latency badge */}
        <div className="mt-10 flex items-center gap-2 rounded-full border border-[#06b6d4]/20 bg-[#06b6d4]/5 px-4 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#06b6d4] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#06b6d4]" />
          </span>
          <span
            className="text-[10px] uppercase tracking-wider text-[#06b6d4]/80"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Global avg: 2.3ms p50
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <span
            className="text-[10px] uppercase tracking-[0.2em] text-white/30"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Scroll
          </span>
          <ChevronDown className="h-4 w-4 animate-bounce text-white/30" />
        </div>
      </div>
    </section>
  );
}
