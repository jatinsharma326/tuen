"use client";

import { motion } from "framer-motion";

const STATS = [
  { value: "50M+", label: "Inferences served" },
  { value: "<2s", label: "Avg response" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "$0.005", label: "Per credit" },
];

export function StatsSection() {
  return (
    <section className="relative z-10 -mt-10 mb-20 px-5">
      <div className="mx-auto max-w-5xl rounded-2xl glass-panel border border-border-subtle p-1 backdrop-blur-xl shadow-2xl shadow-black/5">
        <div className="grid grid-cols-2 md:grid-cols-4 bg-surface-1/50 rounded-xl divide-y md:divide-y-0 md:divide-x divide-black/5">
          {STATS.map((s, i) => (
            <motion.div 
              key={s.label} 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="px-5 py-8 text-center relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none" />
              <p className="font-display text-3xl font-bold tracking-tight text-text-primary md:text-4xl">{s.value}</p>
              <p className="mt-2 text-[13px] font-medium text-text-tertiary uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
