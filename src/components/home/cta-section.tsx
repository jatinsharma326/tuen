"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-border-subtle py-32">
      <div className="absolute inset-0 bg-surface-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-accent/10 blur-[140px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[400px] rounded-full bg-accent-blue/20 blur-[100px] pointer-events-none mix-blend-screen" />
      
      <div className="mesh-bg absolute inset-0 z-0 opacity-30 mix-blend-screen pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 mx-auto max-w-4xl px-5 text-center"
      >
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-blue shadow-[0_0_40px_rgba(124,58,237,0.3)]">
          <Zap size={28} className="text-surface-0 drop-shadow-md" />
        </div>
        
        <h2 className="font-display text-4xl font-extrabold tracking-tight md:text-6xl text-text-primary">
          Start building the{" "}
          <span className="bg-gradient-to-r from-accent via-accent-blue to-accent-light bg-clip-text text-transparent">
            future.
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-[18px] text-text-secondary font-light">
          Join thousands of developers building next-generation applications with tuen. 50 free credits on sign up.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/sign-up" className="btn-primary rounded-full px-8 py-3.5 text-[15px] shadow-[0_0_30px_rgba(124,58,237,0.2)]">
            Create free account
          </Link>
          <Link href="/pricing" className="rounded-full border border-border-default glass-panel px-8 py-3.5 text-[15px] text-text-primary transition-all hover:bg-surface-1">
            View pricing details
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
