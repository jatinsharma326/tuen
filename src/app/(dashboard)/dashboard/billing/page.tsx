"use client";

import { useEffect, useState } from "react";
import { Check, ArrowUpRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { PLANS, getPlan, formatPrice } from "@/lib/constants/plans";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: Record<string, string>;
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError: (err: Error) => void;
      }) => { render: (el: string) => void };
    };
  }
}

function PayPalButton({ planId, onSuccess }: { planId: string; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) { setError("PayPal not configured"); return; }
    if (window.paypal) { renderButton(); return; }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.onload = renderButton;
    script.onerror = () => setError("Failed to load PayPal");
    document.body.appendChild(script);

    function renderButton() {
      if (!window.paypal) return;
      window.paypal.Buttons({
        style: {
          layout: "horizontal",
          color: "gold",
          shape: "rect",
          label: "pay",
        },
        createOrder: async () => {
          setLoading(true);
          const res = await fetch("/api/payments/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId }),
          });
          const data = await res.json();
          setLoading(false);
          if (!res.ok) throw new Error(data.error);
          return data.orderID;
        },
        onApprove: async (data) => {
          setLoading(true);
          const res = await fetch("/api/payments/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderID: data.orderID }),
          });
          const result = await res.json();
          setLoading(false);
          if (res.ok) { onSuccess(); } else { setError(result.error); }
        },
        onError: (err) => { setError(err.message); setLoading(false); },
      }).render("#paypal-button-container");
    }

    return () => { document.getElementById("paypal-button-container")?.replaceChildren(); };
  }, [planId]);

  if (error) return <p className="text-[12px] text-error">{error}</p>;
  return (
    <div className="space-y-3">
      {loading && (
        <div className="flex items-center justify-center gap-2 py-2 text-[12px] text-text-muted">
          <Loader2 size={14} className="animate-spin" /> Processing...
        </div>
      )}
      <div id="paypal-button-container" />
    </div>
  );
}

export default function BillingPage() {
  const [planId, setPlanId] = useState("trial");
  const [daily, setDaily] = useState(0);
  const [weekly, setWeekly] = useState(0);
  const [monthly, setMonthly] = useState(0);
  const [showPayPal, setShowPayPal] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState("");
  const [paid, setPaid] = useState(false);

  const refresh = () => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("profiles").select("plan").eq("id", data.user.id).single()
        .then(({ data: p }) => { setPlanId(p?.plan ?? "trial"); setPaid(false); setShowPayPal(false); });
      fetch("/api/usage/counts").then(r => r.json()).then((c) => {
        setDaily(c.daily); setWeekly(c.weekly); setMonthly(c.monthly);
      }).catch(() => {});
    });
  };

  useEffect(() => { refresh(); }, []);

  const current = getPlan(planId);

  const handleUpgrade = (targetPlanId: string) => {
    setUpgradeTarget(targetPlanId);
    setShowPayPal(true);
  };

  const pct = current.monthlyTotalLimit > 0 ? Math.min(100, (monthly / current.monthlyTotalLimit) * 100) : 0;

  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-[22px] font-bold tracking-tight">Billing</h1>
        <p className="mt-1 text-[13px] text-text-muted">Manage your subscription and usage limits</p>
      </motion.div>

      {paid && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-success/20 bg-success/5 px-5 py-4">
          <p className="text-[13px] font-semibold text-success">Payment successful! Your plan has been upgraded.</p>
        </motion.div>
      )}

      {/* Current plan */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-panel-elevated rounded-2xl p-6">
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
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-blue" />
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
              {daily.toLocaleString()}<span className="text-[13px] font-normal text-text-muted ml-1">requests</span>
            </p>
          </div>
          <div className="glass-panel-elevated rounded-2xl p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted">Weekly</p>
            <p className="mt-2 font-display text-[22px] font-extrabold tracking-tight">
              {weekly.toLocaleString()}<span className="text-[13px] font-normal text-text-muted ml-1">/ {current.weeklyTotalLimit.toLocaleString()}</span>
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (weekly / current.weeklyTotalLimit) * 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }} className="h-full rounded-full bg-accent-blue" />
            </div>
          </div>
          <div className="glass-panel-elevated rounded-2xl p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted">Monthly</p>
            <p className="mt-2 font-display text-[22px] font-extrabold tracking-tight">
              {monthly.toLocaleString()}<span className="text-[13px] font-normal text-text-muted ml-1">/ {current.monthlyTotalLimit.toLocaleString()}</span>
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: "easeOut" }} className="h-full rounded-full bg-gradient-to-r from-accent to-accent-blue" />
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
            const isUpgrading = showPayPal && upgradeTarget === plan.id;
            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.06 }}
                className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 ${
                  isCurrent ? "glass-panel-elevated border-accent/25" : "glass-panel-subtle hover:border-border-default"
                }`}
                style={isCurrent ? { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 0 40px -12px rgba(124,58,237,0.1)" } : {}}>
                {isCurrent && <div className="absolute -top-px left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />}
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-[16px] font-semibold">{plan.name}</h3>
                  {isCurrent && <span className="badge-premium bg-accent/10 text-accent border-accent/20">Current</span>}
                </div>
                <p className="font-display text-[28px] font-extrabold tracking-tight">
                  {formatPrice(plan.priceCents)}
                  {plan.priceCents > 0 && <span className="text-[13px] font-normal text-text-muted ml-1">/mo</span>}
                </p>
                <p className="mt-1 text-[12px] text-text-muted">{plan.monthlyTotalLimit.toLocaleString()} requests/month</p>
                <ul className="mt-5 space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[12px] text-text-tertiary">
                      <Check size={12} className="mt-0.5 shrink-0 text-accent" />{f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-border-subtle">
                  {isCurrent ? (
                    <span className="flex w-full items-center justify-center gap-1 rounded-xl border border-border-default py-2.5 text-[13px] text-text-muted">
                      Current plan
                    </span>
                  ) : !isUpgrading ? (
                    <button onClick={() => handleUpgrade(plan.id)}
                      className="btn-white flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-[13px]">
                      {plan.priceCents > current.priceCents ? "Upgrade" : "Switch"}
                      <ArrowUpRight size={12} />
                    </button>
                  ) : null}
                  {isUpgrading && (
                    <PayPalButton planId={plan.id} onSuccess={() => { setPaid(true); refresh(); }} />
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
