import { Check } from "lucide-react";
import Link from "next/link";
import { PLANS, SERVICE_COSTS, formatPrice } from "@/lib/constants/plans";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-24">
      <p className="text-[13px] uppercase tracking-wide text-accent">Pricing</p>
      <h1 className="mt-3 font-display text-3xl font-medium tracking-tight">
        3x cheaper than the alternatives
      </h1>
      <p className="mt-3 text-sm text-text-tertiary">
        Same models, fraction of the cost. Start free, scale when ready.
      </p>

      <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border-subtle bg-border-subtle md:grid-cols-4">
        {PLANS.map((plan) => (
          <div key={plan.id} className="flex flex-col bg-surface-1 p-6">
            {plan.id === "pro" && (
              <span className="mb-3 w-fit rounded-full border border-accent/20 bg-accent/5 px-2.5 py-0.5 text-xs text-accent">
                Popular
              </span>
            )}
            <h2 className="text-sm font-medium">{plan.name}</h2>
            <p className="mt-4 font-display text-3xl font-medium">
              {formatPrice(plan.priceCents)}
              {plan.priceCents > 0 && (
                <span className="text-sm font-normal text-text-muted">/mo</span>
              )}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {plan.monthlyCredits.toLocaleString()} credits/month
            </p>
            <ul className="mt-6 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13px] text-text-secondary">
                  <Check size={12} className="mt-0.5 shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <Link
                href="/sign-up"
                className={`block w-full rounded-md py-2 text-center text-sm font-medium transition-colors ${
                    plan.id === "pro"
                    ? "btn-primary"
                    : "border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong"
                }`}
              >
                {plan.priceCents === 0 ? "Start Free" : `Get ${plan.name}`}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="font-display text-lg font-medium">Per-service costs</h2>
        <p className="mt-2 text-sm text-text-muted">
          Credits are deducted per request. Here is what each service costs.
        </p>
        <div className="mt-6 overflow-hidden rounded-lg border border-border-subtle">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-1">
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">Service</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">Credits</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">Cost on Starter</th>
              </tr>
            </thead>
            <tbody>
              {SERVICE_COSTS.map((s) => (
                <tr key={s.service} className="border-b border-border-subtle last:border-0">
                  <td className="px-4 py-3 text-sm text-text-secondary">{s.service}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-text-muted">{s.credits}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-text-muted">{s.perCredit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
