"use client";

import { Zap, Shield, Code2, ArrowDownToLine } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  { icon: Zap, gradient: "from-accent to-accent-blue", title: "Fast inference", desc: "Sub-2s responses. No cold starts, no GPU provisioning delays.", span: "col-span-1 md:col-span-2" },
  { icon: Shield, gradient: "from-emerald-400 to-teal-500", title: "Auto-refund on failure", desc: "If a generation fails, your credits are returned instantly.", span: "col-span-1" },
  { icon: Code2, gradient: "from-sky-400 to-blue-500", title: "One API for everything", desc: "Image gen, TTS, transcription — same auth, same format.", span: "col-span-1" },
  { icon: ArrowDownToLine, gradient: "from-rose-400 to-pink-500", title: "Simple integration", desc: "One POST request. Works with curl, Python, JS.", span: "col-span-1 md:col-span-2" },
];

export function FeaturesSection() {
  return (
    <section className="section-alt py-32 relative border-t border-border-subtle">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.04),transparent_70%)] pointer-events-none" />
      <div className="mx-auto max-w-5xl px-5 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[12px] font-bold uppercase tracking-[0.2em] text-accent"
          >
            Why tuen
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 font-display text-4xl font-extrabold tracking-tight md:text-5xl text-text-primary"
          >
            Built for developers <span className="text-text-muted">who ship</span>
          </motion.h2>
        </div>
        
        <div className="mt-16 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div 
              key={f.title} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`group relative overflow-hidden rounded-2xl glass-panel p-8 ${f.span}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -right-10 -top-10 h-40 w-40 bg-surface-2 rounded-full blur-3xl group-hover:bg-accent/8 transition-colors duration-500" />
              
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} shadow-lg shadow-black/5 mb-6 relative z-10 ring-1 ring-border-subtle`}>
                <f.icon size={22} className="text-surface-0 drop-shadow-md" />
              </div>
              
              <h3 className="text-[18px] font-bold text-text-primary relative z-10">{f.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-text-secondary relative z-10">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
