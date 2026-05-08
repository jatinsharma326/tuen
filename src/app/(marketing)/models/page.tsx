import { ModelGrid } from "@/components/models/model-grid";

export default function ModelsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 bg-[#0c0c12] min-h-screen">
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
        Model Gallery
      </h1>
      <p
        className="mt-3 max-w-lg text-sm text-white/40"
        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
      >
        Browse and run the best AI models with a single API call.
      </p>
      <div className="mt-12">
        <ModelGrid />
      </div>
    </div>
  );
}
