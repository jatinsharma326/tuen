import { Check } from "lucide-react";
import Link from "next/link";
import { PLANS, formatPrice, SERVICE_LIMITS } from "@/lib/constants/plans";

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-[#0c0c12]">
      {/* Top gradient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 opacity-20"
        style={{ background: "radial-gradient(ellipse at center, rgba(192,132,252,0.15), transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-6xl px-5 py-24">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-[1px] w-6 bg-[#c084fc]" />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c084fc]/70"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Pricing
          </span>
        </div>
        <h1
          className="text-4xl font-bold tracking-tight text-white md:text-5xl"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Simple, transparent pricing
        </h1>
        <p
          className="mt-3 max-w-lg text-sm text-white/40"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          Start free. Upgrade when you need more power.
        </p>

        <div className="mt-14 grid gap-6 max-w-2xl mx-auto sm:grid-cols-2">
          {PLANS.map((plan) => (
            <div key={plan.id} className="relative flex flex-col rounded-2xl border border-white/[0.05] bg-[#12121a] p-6">
              {plan.id === "pro" && (
                <>
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#c084fc]/50 to-transparent" />
                  <span className="mb-3 w-fit rounded-full border border-[#c084fc]/20 bg-[#c084fc]/10 px-2.5 py-0.5 text-xs text-[#c084fc]" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                    Popular
                  </span>
                </>
              )}
              <h2 className="text-sm font-medium text-white">{plan.name}</h2>
              <p className="mt-4 font-display text-3xl font-medium text-white">
                {formatPrice(plan.priceCents)}
                {plan.priceCents > 0 && (
                  <span className="text-sm font-normal text-white/30">/mo</span>
                )}
              </p>
              <p className="mt-1 text-xs text-white/30">
                {plan.monthlyTotalLimit.toLocaleString()} requests/month
              </p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-white/70">
                    <Check size={14} className="mt-0.5 shrink-0 text-[#c084fc]" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <Link
                  href={plan.priceCents === 0 ? "/sign-up" : "/dashboard/billing"}
                  className={`block w-full rounded-xl py-2.5 text-center text-sm font-medium transition-all ${
                    plan.id === "pro"
                      ? "bg-[#c084fc] text-white hover:bg-[#a855f7] hover:shadow-[0_0_20px_rgba(192,132,252,0.2)]"
                      : "border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.15]"
                  }`}
                >
                  {plan.priceCents === 0 ? "Start Free Trial" : `Get ${plan.name}`}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20">
          <h2 className="font-display text-lg font-medium text-white">Per-service daily limits</h2>
          <p className="mt-2 text-sm text-white/30">
            Trial limits shown below. Pro limits are 20x higher across all services.
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.05] bg-[#12121a]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-white/30">Service</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-white/30">Trial</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-white/30">Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/[0.05]">
                  <td className="px-4 py-3 text-sm text-white/70">Image Generation</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-white/30">10/day</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-white/30">200/day</td>
                </tr>
                <tr className="border-b border-white/[0.05]">
                  <td className="px-4 py-3 text-sm text-white/70">Text to Speech</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-white/30">5/day</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-white/30">100/day</td>
                </tr>
                <tr className="border-b border-white/[0.05]">
                  <td className="px-4 py-3 text-sm text-white/70">Transcription</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-white/30">5/day</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-white/30">200/day</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-white/70">LLM Chat</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-white/30">5/day</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-white/30">50/day</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
