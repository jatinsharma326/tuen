"use client";

import { useEffect, useState } from "react";
import { Check, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { PLANS, getPlan, formatPrice } from "@/lib/constants/plans";

export default function BillingPage() {
  const [planId, setPlanId] = useState("trial");
  const [daily, setDaily] = useState(0);
  const [weekly, setWeekly] = useState(0);
  const [monthly, setMonthly] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("profiles").select("plan").eq("id", data.user.id).single()
        .then(({ data: p }) => setPlanId(p?.plan ?? "trial"));
      fetch("/api/usage/counts").then(r => r.json()).then((c) => {
        setDaily(c.daily);
        setWeekly(c.weekly);
        setMonthly(c.monthly);
      }).catch(() => {});
    });
  }, []);

  const current = getPlan(planId);
  const pct = current.monthlyTotalLimit > 0 ? Math.min(100, (monthly / current.monthlyTotalLimit) * 100) : 0;

  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-[22px] font-bold tracking-tight">Billing</h1>
        <p className="mt-1 text-[13px] text-text-muted">Manage your subscription and usage limits</p>
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
              <span className="text-[13px] text-text-muted">{formatPrice(current.priceCents)}{current.priceCents > 0 ? "/mo" : ""}</span>
            </div>
            <p className="mt-1 text-[12px] text-text-muted">
              {monthly.toLocaleString()} of {current.monthlyTotalLimit.toLocaleString()} requests used this month
            </p>
          </div>
          <div className="w-full md:w-72">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-text-muted">Monthly usage</span>
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

      {/* Usage totals */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="font-display text-[18px] font-bold tracking-tight mb-5">Overall limits</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="glass-panel-elevated rounded-2xl p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted">Daily</p>
            <p className="mt-2 font-display text-[22px] font-extrabold tracking-tight">
              {daily.toLocaleString()}
              <span className="text-[13px] font-normal text-text-muted ml-1">requests</span>
            </p>
          </div>
          <div className="glass-panel-elevated rounded-2xl p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted">Weekly</p>
            <p className="mt-2 font-display text-[22px] font-extrabold tracking-tight">
              {weekly.toLocaleString()}
              <span className="text-[13px] font-normal text-text-muted ml-1">/ {current.weeklyTotalLimit.toLocaleString()}</span>
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (weekly / current.weeklyTotalLimit) * 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-accent-blue"
              />
            </div>
          </div>
          <div className="glass-panel-elevated rounded-2xl p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted">Monthly</p>
            <p className="mt-2 font-display text-[22px] font-extrabold tracking-tight">
              {monthly.toLocaleString()}
              <span className="text-[13px] font-normal text-text-muted ml-1">/ {current.monthlyTotalLimit.toLocaleString()}</span>
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
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
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="font-display text-[18px] font-bold tracking-tight mb-5">Available plans</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {PLANS.map((plan, i) => {
            const isCurrent = plan.id === planId;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.06 }}
                className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 ${
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
                  <h3 className="text-[16px] font-semibold">{plan.name}</h3>
                  {isCurrent && (
                    <span className="badge-premium bg-accent/10 text-accent border-accent/20">Current</span>
                  )}
                </div>
                <p className="font-display text-[28px] font-extrabold tracking-tight">
                  {formatPrice(plan.priceCents)}
                  {plan.priceCents > 0 && <span className="text-[13px] font-normal text-text-muted ml-1">/mo</span>}
                </p>
                <p className="mt-1 text-[12px] text-text-muted">
                  {plan.monthlyTotalLimit.toLocaleString()} requests/month
                </p>
                <ul className="mt-5 space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[12px] text-text-tertiary">
                      <Check size={12} className="mt-0.5 shrink-0 text-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-border-subtle">
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
    </div>
  );
}
