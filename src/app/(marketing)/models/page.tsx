import { ModelGrid } from "@/components/models/model-grid";

export default function ModelsPage() {
  return (
    <div className="relative min-h-screen bg-[#0c0c12]">
      {/* Top gradient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 opacity-20"
        style={{ background: "radial-gradient(ellipse at center, rgba(192,132,252,0.15), transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-24">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-[1px] w-6 bg-[#c084fc]" />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c084fc]/70"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Model Registry
          </span>
        </div>
        <h1
          className="text-4xl font-bold tracking-tight text-white md:text-5xl"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          The Arsenal
        </h1>
        <p
          className="mt-3 max-w-lg text-sm text-white/40"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          Production-grade endpoints. No warm-up. No queueing. Inference at the speed of thought.
        </p>
        <div className="mt-12">
          <ModelGrid />
        </div>
      </div>
    </div>
  );
}
