"use client";

import { useState, useEffect, Suspense } from "react";
import { Download, Loader2, Wand2, Copy, Check } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const MODELS = [
  { label: "FLUX.1 Schnell", value: "black-forest-labs/FLUX.1-schnell", desc: "Fast, high-quality generation" },
  { label: "FLUX.1 Dev", value: "black-forest-labs/FLUX.1-dev", desc: "Best quality, slower" },
  { label: "FLUX Pro", value: "fal-ai/flux-pro", desc: "Highest fidelity output" },
  { label: "Nucleus Image", value: "nucleus-image", desc: "ModelScope Nucleus generation" },
];

const RATIOS = [
  { label: "Square", value: "1:1" },
  { label: "Landscape", value: "16:9" },
  { label: "Portrait", value: "9:16" },
  { label: "4:3", value: "4:3" },
];

const STYLES = [
  { label: "Default", value: "none" },
  { label: "Anime", value: "anime" },
];

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }} className="rounded-md p-1 text-white/30 hover:text-white/70 hover:bg-white/[0.03] transition-colors">
      {ok ? <Check size={10} className="text-success" /> : <Copy size={10} />}
    </button>
  );
}

function GenerateForm() {
  const searchParams = useSearchParams();
  const initialModel = searchParams.get("model") || "black-forest-labs/FLUX.1-schnell";

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(initialModel);
  const [ratio, setRatio] = useState("1:1");
  const [style, setStyle] = useState("none");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const qModel = searchParams.get("model");
    if (qModel) setModel(qModel);
  }, [searchParams]);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const endpoint = model === "nucleus-image"
        ? "/api/services/nucleus_image"
        : "/api/services/image_gen";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspect_ratio: ratio, style, model }),
      });
      const text = await res.text();
      let data: Record<string, unknown> = {};
      try { data = JSON.parse(text); } catch { throw new Error(`Server error: ${res.status} - ${text.slice(0, 200)}`); }
      if (!res.ok) throw new Error(String(data.error || `HTTP ${res.status}`));
      setResult((data.image_url as string) || null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
              <Wand2 size={18} className="text-accent" />
            </div>
            <div>
              <h1 className="font-display text-[22px] font-bold tracking-tight">Image Generation</h1>
              <p className="text-[13px] text-white/30">Generate images from text prompts</p>
            </div>
          </div>
          <span className="badge-premium bg-accent/10 text-accent border-accent/20">200 images/day</span>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left: Form */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          {/* Model */}
          <div className="space-y-3">
            <label className="text-[13px] font-medium text-white/70">Model</label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {MODELS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setModel(m.value)}
                  className={`model-card text-left p-4 ${model === m.value ? "model-card-active" : ""}`}
                >
                  <span className={`text-[13px] font-semibold ${model === m.value ? "text-white" : "text-white/70"}`}>
                    {m.label}
                  </span>
                  <p className="mt-1 text-[11px] text-white/30">{m.desc}</p>
                </button>
              ))}
              {!MODELS.find((m) => m.value === model) && (
                <button onClick={() => setModel(model)} className="model-card model-card-active text-left p-4">
                  <span className="text-[13px] font-semibold text-white">{model}</span>
                </button>
              )}
            </div>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-white/70">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to see..."
              rows={4}
              className="input-premium w-full resize-none"
            />
          </div>

          {/* Options */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-white/70">Aspect Ratio</label>
              <div className="flex flex-wrap gap-2">
                {RATIOS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRatio(r.value)}
                    className={`rounded-lg px-3.5 py-2 text-[12px] font-medium transition-all ${
                      ratio === r.value
                        ? "bg-text-primary text-surface-0 shadow-lg shadow-black/5"
                        : "border border-white/[0.05] bg-[#12121a] text-white/30 hover:text-white/70 hover:border-white/[0.08]"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-white/70">Style</label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value)}
                    className={`rounded-lg px-3.5 py-2 text-[12px] font-medium transition-all ${
                      style === s.value
                        ? "bg-text-primary text-surface-0 shadow-lg shadow-black/5"
                        : "border border-white/[0.05] bg-[#12121a] text-white/30 hover:text-white/70 hover:border-white/[0.08]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={!prompt.trim() || loading}
            className="btn-white w-full rounded-xl py-2.5 text-[13px] disabled:opacity-40"
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 size={15} className="animate-spin" /> Generating...
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                <Wand2 size={15} /> Generate Image
              </span>
            )}
          </button>

          {error && (
            <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-[12px] text-error">
              {error}
            </div>
          )}
        </motion.div>

        {/* Right: API Usage + Output */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
          <div className="rounded-2xl border border-white/[0.05] bg-[#12121a]/30 overflow-hidden">
            <div className="border-b border-white/[0.05] bg-[#12121a]/60 px-4 py-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">cURL</span>
              <CopyBtn text={`curl -X POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/services/${model === "nucleus-image" ? "nucleus_image" : "image_gen"} \\
  -H "Authorization: Bearer tuen_sk_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "${prompt || "a cat astronaut"}", "aspect_ratio": "${ratio}", "style": "${style}"}'`} />
            </div>
            <pre className="p-4 font-mono text-[11px] leading-relaxed text-white/40 overflow-x-auto">
{`curl -X POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/services/${model === "nucleus-image" ? "nucleus_image" : "image_gen"} \\
  -H "Authorization: Bearer tuen_sk_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "${prompt || "a cat astronaut"}", "aspect_ratio": "${ratio}", "style": "${style}"}'`}
            </pre>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/30">Output</span>
              {result && (
                <a
                  href={result}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-white/70 ring-1 ring-border-default hover:text-white hover:ring-border-strong transition-all"
                >
                  <Download size={12} /> Download
                </a>
              )}
            </div>

            {result ? (
              <div className="overflow-hidden rounded-2xl border border-white/[0.05] bg-[#12121a]/50">
                <img src={result} alt="Generated" className="w-full object-cover" />
              </div>
            ) : !loading ? (
              <div className="flex h-80 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/[0.08] bg-[#12121a]/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03]">
                  <Wand2 size={22} className="text-white/30" />
                </div>
                <p className="text-[12px] text-white/30">Your generated image will appear here</p>
              </div>
            ) : (
              <div className="flex h-80 flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.05] bg-[#12121a]/30">
                <Loader2 size={28} className="animate-spin text-accent" />
                <p className="text-[12px] text-white/30">Creating your masterpiece...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-white/30" size={28} />
      </div>
    }>
      <GenerateForm />
    </Suspense>
  );
}
