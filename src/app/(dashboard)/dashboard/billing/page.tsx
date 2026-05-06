"use client";

import { useEffect, useState } from "react";
import { Check, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { PLANS, getPlan, formatPrice } from "@/lib/constants/plans";

export default function BillingPage() {
  const [planId, setPlanId] = useState("free");
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("profiles").select("plan, credits").eq("id", data.user.id).single()
        .then(({ data: p }) => {
          setPlanId(p?.plan ?? "free");
          setCredits(p?.credits ?? 0);
        });
    });
  }, []);

  const current = getPlan(planId);
  const pct = current.monthlyCredits > 0 ? Math.min(100, (credits / current.monthlyCredits) * 100) : 0;

  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-[22px] font-bold tracking-tight">Billing</h1>
        <p className="mt-1 text-[13px] text-text-muted">Manage your plan and credits</p>
      </motion.div>

      {/* Current plan card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel-elevated rounded-2xl p-6"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted">Current plan</p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-display text-[28px] font-extrabold tracking-tight">{current.name}</span>
              <span className="text-[13px] text-text-muted">{formatPrice(current.priceCents)}/mo</span>
            </div>
            <p className="mt-1 text-[12px] text-text-muted">
              {credits.toLocaleString()} of {current.monthlyCredits.toLocaleString()} credits remaining this cycle
            </p>
          </div>
          <div className="w-full md:w-72">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-text-muted">Credits remaining</span>
              <span className="text-[11px] font-semibold text-text-secondary">{Math.round(pct)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-blue"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Plans grid */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="font-display text-[18px] font-bold tracking-tight mb-5">Available plans</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan, i) => {
            const isCurrent = plan.id === planId;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                className={`relative flex flex-col rounded-2xl p-5 transition-all duration-300 ${
                  isCurrent
                    ? "glass-panel-elevated border-accent/25"
                    : "glass-panel-subtle hover:border-border-default"
                }`}
                style={isCurrent ? { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 0 40px -12px rgba(124,58,237,0.1)" } : {}}
              >
                {isCurrent && (
                  <div className="absolute -top-px left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
                )}
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-[14px] font-semibold">{plan.name}</h3>
                  {isCurrent && (
                    <span className="badge-premium bg-accent/10 text-accent border-accent/20">Current</span>
                  )}
                </div>
                <p className="font-display text-[26px] font-extrabold tracking-tight">
                  {formatPrice(plan.priceCents)}
                  {plan.priceCents > 0 && <span className="text-[13px] font-normal text-text-muted ml-1">/mo</span>}
                </p>
                <p className="mt-1 text-[12px] text-text-muted">
                  {plan.monthlyCredits.toLocaleString()} credits
                </p>
                <ul className="mt-4 space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[12px] text-text-tertiary">
                      <Check size={12} className="mt-0.5 shrink-0 text-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 pt-4 border-t border-border-subtle">
                  {isCurrent ? (
                    <span className="flex w-full items-center justify-center gap-1 rounded-xl border border-border-default py-2.5 text-[13px] text-text-muted">
                      Current plan
                    </span>
                  ) : (
                    <button className="btn-white flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-[13px]">
                      {plan.priceCents > current.priceCents ? "Upgrade" : "Switch"}
                      <ArrowUpRight size={12} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <p className="text-[12px] text-text-muted">
        Payment integration coming soon. Contact support to upgrade manually.
      </p>
    </div>
  );
}
