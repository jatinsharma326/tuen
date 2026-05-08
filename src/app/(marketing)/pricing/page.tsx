import { Check } from "lucide-react";
import Link from "next/link";
import { PLANS, formatPrice, SERVICE_LIMITS } from "@/lib/constants/plans";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-24">
      <p className="text-[13px] uppercase tracking-wide text-accent">Pricing</p>
      <h1 className="mt-3 font-display text-3xl font-medium tracking-tight">
        Try free, upgrade when you need more
      </h1>
      <p className="mt-3 text-sm text-text-tertiary">
        Start with a free trial. Upgrade to Pro for higher limits and priority support.
      </p>

      <div className="mt-14 grid gap-6 max-w-2xl mx-auto sm:grid-cols-2">
        {PLANS.map((plan) => (
          <div key={plan.id} className="flex flex-col bg-surface-1 p-6 rounded-lg border border-border-subtle">
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
              href={plan.priceCents === 0 ? "/sign-up" : "/dashboard/billing"}
              className={`block w-full rounded-md py-2 text-center text-sm font-medium transition-colors ${
                  plan.id === "pro"
                  ? "btn-primary"
                  : "border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong"
              }`}
            >
              {plan.priceCents === 0 ? "Start Free Trial" : `Get ${plan.name}`}
            </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="font-display text-lg font-medium">Per-service daily limits</h2>
        <p className="mt-2 text-sm text-text-muted">
          Trial limits shown below. Pro limits are 20x higher across all services.
        </p>
        <div className="mt-6 overflow-hidden rounded-lg border border-border-subtle">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-1">
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">Service</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">Trial</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">Pro</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-subtle">
                <td className="px-4 py-3 text-sm text-text-secondary">Image Generation</td>
                <td className="px-4 py-3 text-sm tabular-nums text-text-muted">10/day</td>
                <td className="px-4 py-3 text-sm tabular-nums text-text-muted">200/day</td>
              </tr>
              <tr className="border-b border-border-subtle">
                <td className="px-4 py-3 text-sm text-text-secondary">Text to Speech</td>
                <td className="px-4 py-3 text-sm tabular-nums text-text-muted">5/day</td>
                <td className="px-4 py-3 text-sm tabular-nums text-text-muted">100/day</td>
              </tr>
              <tr className="border-b border-border-subtle">
                <td className="px-4 py-3 text-sm text-text-secondary">Transcription</td>
                <td className="px-4 py-3 text-sm tabular-nums text-text-muted">5/day</td>
                <td className="px-4 py-3 text-sm tabular-nums text-text-muted">200/day</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-text-secondary">LLM Chat</td>
                <td className="px-4 py-3 text-sm tabular-nums text-text-muted">5/day</td>
                <td className="px-4 py-3 text-sm tabular-nums text-text-muted">50/day</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
