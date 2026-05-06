"use client";

import Link from "next/link";
import { ArrowRight, Image as ImageIcon, Mic, FileAudio, Sparkles, Play } from "lucide-react";
import { motion } from "framer-motion";

const SERVICES = [
  { 
    href: "/dashboard/generate?model=black-forest-labs/FLUX.1-schnell", 
    label: "black-forest-labs/FLUX.1-schnell", 
    type: "Image Generation",
    desc: "State-of-the-art text-to-image with incredible detail and prompt adherence.", 
    icon: ImageIcon, 
    credits: "5 credits", 
    color: "from-accent to-accent-blue",
    bgAccent: "bg-accent/10 text-accent border-accent/20",
    preview: (
      <div className="mt-4 rounded-lg bg-surface-2 border border-border-subtle overflow-hidden flex flex-col">
        <div className="h-32 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center border-b border-border-subtle opacity-80 mix-blend-multiply hover:mix-blend-normal transition-all duration-500" />
        <div className="p-3 text-[11px] font-mono text-text-tertiary flex items-center justify-between bg-surface-1">
          <span className="truncate">"neon cyberpunk street portrait"</span>
          <span className="text-accent-blue">1.2s</span>
        </div>
      </div>
    )
  },
  { 
    href: "/dashboard/tts?model=vibevoice", 
    label: "vibevoice", 
    type: "Text to Speech",
    desc: "Ultra-realistic voice synthesis with emotion and language control.", 
    icon: Mic, 
    credits: "2 credits", 
    color: "from-emerald-400 to-teal-500",
    bgAccent: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    preview: (
      <div className="mt-4 rounded-lg bg-surface-2 border border-border-subtle overflow-hidden p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Play size={12} className="text-emerald-600 ml-0.5" />
          </div>
          <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-emerald-500/50 rounded-full" />
          </div>
        </div>
        <div className="text-[11px] font-mono text-text-tertiary">
          "The singularity is near..."
        </div>
      </div>
    )
  },
  { 
    href: "/dashboard/transcribe?model=distil-whisper/distil-large-v3", 
    label: "distil-whisper/distil-large-v3", 
    type: "Transcription",
    desc: "Robust speech recognition supporting 99 languages and translation.", 
    icon: FileAudio, 
    credits: "3 credits", 
    color: "from-pink-500 to-rose-500",
    bgAccent: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    preview: (
      <div className="mt-4 rounded-lg bg-surface-2 border border-border-subtle overflow-hidden p-4 h-[120px] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-0/80 pointer-events-none" />
        <div className="text-[12px] text-text-secondary leading-relaxed font-mono">
          <span className="text-text-muted">[00:00.00]</span> Welcome to the future.<br/>
          <span className="text-text-muted">[00:02.15]</span> <span className="text-pink-500">Everything is an API.</span><br/>
          <span className="text-text-muted">[00:04.30]</span> Just curl it.
        </div>
      </div>
    )
  },
];

export function ModelsPreview() {
  return (
    <section className="py-32 relative">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-1 px-3 py-1 mb-4"
            >
              <Sparkles size={14} className="text-accent" />
              <span className="text-[12px] font-medium text-text-secondary">Featured Models</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl font-extrabold tracking-tight md:text-4xl text-text-primary"
            >
              Production-ready <span className="text-accent">pipelines</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/models" className="group flex items-center gap-2 text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors">
              Explore all 50+ models
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {SERVICES.map((s, i) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={s.href} className="group block h-full rounded-2xl border border-border-subtle glass-panel p-2 transition-all hover:border-border-strong hover:bg-surface-1">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s.bgAccent}`}>
                      {s.type}
                    </span>
                    <span className="font-mono text-[11px] text-text-muted bg-surface-2 px-2 py-0.5 rounded">{s.credits}</span>
                  </div>
                  
                  <h3 className="text-[16px] font-bold text-text-primary mb-2 group-hover:text-accent transition-colors">{s.label}</h3>
                  <p className="text-[13px] leading-relaxed text-text-tertiary h-10 line-clamp-2">{s.desc}</p>
                </div>
                
                {s.preview}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
