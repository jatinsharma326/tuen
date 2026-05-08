"use client";

import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import { motion } from "framer-motion";

const LOGOS = ["Vercel", "Supabase", "Stripe", "Linear", "Notion"];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen flex flex-col justify-center">
      <div className="hero-bg" />
      <div className="mesh-bg absolute inset-0 z-0 opacity-40 mix-blend-screen" />
      
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-accent/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-5 pb-20 pt-32 md:pt-40 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-[13px] text-accent backdrop-blur-md shadow-[0_0_20px_rgba(124,58,237,0.12)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Serving 50M+ inferences monthly
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 font-display text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold leading-[1.05] tracking-tight text-text-primary"
        >
          AI inference,{" "}
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-accent via-accent-blue to-accent-light bg-clip-text text-transparent">
            simplified.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-lg text-[17px] leading-relaxed text-text-secondary font-light"
        >
          Image generation, text-to-speech, and transcription through one API.
          Pay per request. No GPUs to manage.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link href="/sign-up" className="btn-primary rounded-full px-8 py-3 text-[15px] shadow-[0_0_30px_rgba(124,58,237,0.2)]">
            Start building free
          </Link>
          <Link href="/docs" className="group flex items-center gap-2 rounded-full border border-border-default glass-panel px-8 py-3 text-[15px] text-text-secondary transition-all hover:border-border-strong hover:text-text-primary hover:bg-surface-1">
            <Terminal size={16} className="text-text-tertiary group-hover:text-text-primary transition-colors" />
            View API docs
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, type: "spring", stiffness: 50 }}
          className="mx-auto max-w-3xl mt-20 relative"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-b from-accent/15 to-transparent rounded-xl blur opacity-50" />
          <div className="relative overflow-hidden rounded-xl border border-border-subtle glass-panel text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3 bg-[#0a0a0a]/90 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57] border border-[#ff5f57]/50" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e] border border-[#febc2e]/50" />
                <span className="h-3 w-3 rounded-full bg-[#28c840] border border-[#28c840]/50" />
              </div>
              <span className="text-[11px] text-text-tertiary font-mono uppercase tracking-widest">bash</span>
            </div>
            <div className="p-6 font-mono text-[14px] leading-[1.8] bg-[#050505]/90">
              <div><span className="text-text-muted">$</span> <span className="text-accent font-semibold">curl</span> <span className="text-text-tertiary">-X POST</span> <span className="text-text-secondary">https://tuen.fun/api/v1/generate</span> \</div>
              <div className="pl-4"><span className="text-text-tertiary">-H</span> <span className="text-emerald-400">&quot;Authorization: Bearer sk_live_...&quot;</span> \</div>
              <div className="pl-4"><span className="text-text-tertiary">-d</span> <span className="text-accent-cyan">{`'{"model": "fal-ai/flux", "prompt": "cyberpunk city"}'`}</span></div>
              <div className="mt-4 border-t border-white/5 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-success font-semibold">200 OK</span>
                  <span className="text-text-muted ml-2">in 1.2s</span>
                </div>
                <span className="text-[11px] text-accent/60 bg-accent/10 px-2 py-0.5 rounded uppercase font-sans tracking-wide">Output</span>
              </div>
              <div className="mt-2"><span className="text-text-muted">{`{`}</span> <span className="text-accent-light">&quot;url&quot;</span><span className="text-text-muted">:</span> <span className="text-emerald-400">&quot;https://cdn.tuen.fun/out/cyber.webp&quot;</span> <span className="text-text-muted">{`}`}</span></div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-24 pt-10"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted mb-8 font-semibold">Trusted by engineering teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {LOGOS.map((name) => (
              <span key={name} className="text-[16px] font-bold text-text-primary tracking-wide">{name}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
