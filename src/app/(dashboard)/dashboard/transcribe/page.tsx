"use client";

import { useState, useEffect, Suspense } from "react";
import { Loader2, Copy, Check, FileAudio } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const MODELS = [
  { label: "Distil-Whisper Large", value: "distil-whisper/distil-large-v3", desc: "Fast & accurate" },
  { label: "Whisper Large v3", value: "openai/whisper-large-v3", desc: "Best accuracy" },
  { label: "Seamless M4T", value: "meta-llama/seamless-m4t-v2-large", desc: "Multi-language" },
];

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }} className="rounded-md p-1 text-text-muted hover:text-text-secondary hover:bg-surface-2 transition-colors">
      {ok ? <Check size={10} className="text-success" /> : <Copy size={10} />}
    </button>
  );
}

function TranscribeForm() {
  const searchParams = useSearchParams();
  const initialModel = searchParams.get("model") || "distil-whisper/distil-large-v3";

  const [audioUrl, setAudioUrl] = useState("");
  const [model, setModel] = useState(initialModel);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const qModel = searchParams.get("model");
    if (qModel) setModel(qModel);
  }, [searchParams]);

  const transcribe = async () => {
    if (!audioUrl.trim()) return;
    setLoading(true);
    setError("");
    setTranscript("");
    try {
      const res = await fetch("/api/services/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio_url: audioUrl, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setTranscript(data?.text || "No transcript returned");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/10">
              <FileAudio size={18} className="text-warning" />
            </div>
            <div>
              <h1 className="font-display text-[22px] font-bold tracking-tight">Transcribe</h1>
              <p className="text-[13px] text-text-muted">Convert audio to text with Whisper-class models</p>
            </div>
          </div>
          <span className="badge-premium bg-warning/10 text-warning border-warning/20">200 requests/day</span>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          {/* Model */}
          <div className="space-y-3">
            <label className="text-[13px] font-medium text-text-secondary">Model</label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
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

          {/* Audio URL */}
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-text-secondary">Audio URL</label>
            <input
              type="text"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://example.com/audio.mp3"
              className="input-premium w-full"
            />
            <p className="text-[11px] text-text-muted">Direct link to mp3, wav, m4a, etc.</p>
          </div>

          {/* Generate */}
          <button
            onClick={transcribe}
            disabled={!audioUrl.trim() || loading}
            className="btn-white w-full rounded-xl py-2.5 text-[13px] disabled:opacity-40"
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 size={15} className="animate-spin" /> Transcribing...
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                <FileAudio size={15} /> Transcribe
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
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
          <div className="rounded-2xl border border-border-subtle bg-surface-1/30 overflow-hidden">
            <div className="border-b border-border-subtle bg-surface-1/60 px-4 py-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">cURL</span>
              <CopyBtn text={`curl -X POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/services/transcribe \\
  -H "Authorization: Bearer tuen_sk_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"audio_url": "${audioUrl || "https://example.com/audio.mp3"}", "language": "en"}'`} />
            </div>
            <pre className="p-4 font-mono text-[11px] leading-relaxed text-text-tertiary overflow-x-auto">
{`curl -X POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/services/transcribe \\
  -H "Authorization: Bearer tuen_sk_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"audio_url": "${audioUrl || "https://example.com/audio.mp3"}", "language": "en"}'`}
            </pre>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">Transcript</span>
              {transcript && (
                <button
                  onClick={copyText}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1.5 text-[11px] font-medium text-text-secondary ring-1 ring-border-default hover:text-text-primary hover:ring-border-strong transition-all"
                >
                  {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>

            {transcript ? (
              <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-1/50">
                <div className="max-h-[480px] overflow-y-auto p-5">
                  <p className="text-[13px] leading-[1.7] text-text-primary whitespace-pre-wrap">{transcript}</p>
                </div>
              </div>
            ) : !loading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-default bg-surface-1/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2">
                  <FileAudio size={22} className="text-text-muted" />
                </div>
                <p className="text-[12px] text-text-muted">Transcript will appear here</p>
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-border-subtle bg-surface-1/30">
                <Loader2 size={28} className="animate-spin text-warning" />
                <p className="text-[12px] text-text-muted">Processing audio...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function TranscribePage() {
  return (
    <Suspense fallback={
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-text-muted" size={28} />
      </div>
    }>
      <TranscribeForm />
    </Suspense>
  );
}
