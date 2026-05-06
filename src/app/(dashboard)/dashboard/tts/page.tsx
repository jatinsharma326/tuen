"use client";

import { useState, useEffect, Suspense } from "react";
import { Loader2, Download, Volume2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const MODELS = [
  { label: "VibeVoice", value: "vibevoice", desc: "Fast, expressive TTS" },
  { label: "Parler TTS", value: "parler-tts/parler-tts-mini-v1", desc: "High-fidelity voices" },
  { label: "VoxCPM", value: "voxcpm", desc: "Expressive TTS with natural voice descriptions" },
];

const VOICES = [
  { label: "Carter (M)", value: "en-Carter_man" },
  { label: "Emily (F)", value: "en-Emily_woman" },
  { label: "James (M)", value: "en-James_man" },
  { label: "Sarah (F)", value: "en-Sarah_woman" },
];

function TtsForm() {
  const searchParams = useSearchParams();
  const initialModel = searchParams.get("model") || "vibevoice";

  const [text, setText] = useState("");
  const [model, setModel] = useState(initialModel);
  const [voice, setVoice] = useState("en-Carter_man");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const qModel = searchParams.get("model");
    if (qModel) setModel(qModel);
  }, [searchParams]);

  useEffect(() => {
    if (model === "voxcpm") {
      setVoice("English, middle-aged male, deep voice, calm and professional");
    } else {
      setVoice("en-Carter_man");
    }
  }, [model]);

  const generate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setAudioUrl(null);
    try {
      const res = await fetch("/api/services/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setAudioUrl(data?.audio_url || data?.audio?.url || null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-cyan/10">
              <Volume2 size={18} className="text-accent-cyan" />
            </div>
            <div>
              <h1 className="font-display text-[22px] font-bold tracking-tight">Text to Speech</h1>
              <p className="text-[13px] text-text-muted">Convert text into natural speech</p>
            </div>
          </div>
          <span className="badge-premium bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20">2 credits per run</span>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          {/* Model */}
          <div className="space-y-3">
            <label className="text-[13px] font-medium text-text-secondary">Model</label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {MODELS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setModel(m.value)}
                  className={`model-card text-left p-4 ${model === m.value ? "model-card-active" : ""}`}
                >
                  <span className={`text-[13px] font-semibold ${model === m.value ? "text-text-primary" : "text-text-secondary"}`}>
                    {m.label}
                  </span>
                  <p className="mt-1 text-[11px] text-text-muted">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-text-secondary">Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste text to convert..."
              rows={5}
              className="input-premium w-full resize-none"
            />
          </div>

          {/* Voice */}
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-text-secondary">Voice</label>
            {model === "voxcpm" ? (
              <input
                type="text"
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                placeholder="English, middle-aged male, deep voice, calm and professional"
                className="input-premium w-full"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {VOICES.map((v) => (
                  <button
                    key={v.value}
                    onClick={() => setVoice(v.value)}
                    className={`rounded-lg px-3.5 py-2 text-[12px] font-medium transition-all ${
                      voice === v.value
                        ? "bg-text-primary text-surface-0 shadow-lg shadow-black/5"
                        : "border border-border-subtle bg-surface-1 text-text-muted hover:text-text-secondary hover:border-border-default"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Generate */}
          <button
            onClick={generate}
            disabled={!text.trim() || loading}
            className="btn-white w-full rounded-xl py-2.5 text-[13px] disabled:opacity-40"
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 size={15} className="animate-spin" /> Generating...
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                <Volume2 size={15} /> Generate Speech
              </span>
            )}
          </button>

          {error && (
            <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-[12px] text-error">
              {error}
            </div>
          )}
        </motion.div>

        {/* Output */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">Output</span>
              {audioUrl && (
                <a
                  href={audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1.5 text-[11px] font-medium text-text-secondary ring-1 ring-border-default hover:text-text-primary hover:ring-border-strong transition-all"
                >
                  <Download size={12} /> Download
                </a>
              )}
            </div>

            {audioUrl ? (
              <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-1/50 p-5">
                <audio controls src={audioUrl} className="w-full" />
              </div>
            ) : !loading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-default bg-surface-1/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2">
                  <Volume2 size={22} className="text-text-muted" />
                </div>
                <p className="text-[12px] text-text-muted">Your audio will appear here</p>
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-border-subtle bg-surface-1/30">
                <Loader2 size={28} className="animate-spin text-accent-cyan" />
                <p className="text-[12px] text-text-muted">Synthesizing speech...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function TtsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-text-muted" size={28} />
      </div>
    }>
      <TtsForm />
    </Suspense>
  );
}
