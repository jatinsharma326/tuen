import { Check } from "lucide-react";
import Link from "next/link";
import { DEFAULT_PLAN, formatPrice, SERVICE_LIMITS } from "@/lib/constants/plans";

export default function PricingPage() {
  const plan = DEFAULT_PLAN;
  return (
    <div className="mx-auto max-w-6xl px-5 py-24">
      <p className="text-[13px] uppercase tracking-wide text-accent">Pricing</p>
      <h1 className="mt-3 font-display text-3xl font-medium tracking-tight">
        One plan, everything included
      </h1>
      <p className="mt-3 text-sm text-text-tertiary">
        Simple monthly subscription with generous limits on all services.
      </p>

      <div className="mt-14 max-w-md mx-auto">
        <div className="flex flex-col bg-surface-1 p-6 rounded-lg border border-border-subtle">
          <span className="mb-3 w-fit rounded-full border border-accent/20 bg-accent/5 px-2.5 py-0.5 text-xs text-accent">
            Popular
          </span>
          <h2 className="text-sm font-medium">{plan.name}</h2>
          <p className="mt-4 font-display text-3xl font-medium">
            {formatPrice(plan.priceCents)}
            <span className="text-sm font-normal text-text-muted">/mo</span>
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {plan.monthlyTotalLimit.toLocaleString()} requests/month
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
              className="btn-primary block w-full rounded-md py-2 text-center text-sm font-medium"
            >
              Get {plan.name}
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-display text-lg font-medium">Per-service daily limits</h2>
        <p className="mt-2 text-sm text-text-muted">
          Each request counts toward your daily, weekly, and monthly totals.
        </p>
        <div className="mt-6 overflow-hidden rounded-lg border border-border-subtle">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-1">
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">Service</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">Daily limit</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">Cost</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(SERVICE_LIMITS).map(([key, s]) => (
                <tr key={key} className="border-b border-border-subtle last:border-0">
                  <td className="px-4 py-3 text-sm text-text-secondary">{s.label}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-text-muted">{s.daily}/day</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-text-muted">1 request</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
