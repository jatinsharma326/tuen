"use client";

import { useState, useEffect } from "react";
import { Copy, Check, BookOpen, Image, Mic, FileAudio, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}
      className="rounded-md p-1.5 text-text-muted hover:text-text-secondary hover:bg-surface-2 transition-colors"
    >
      {ok ? <Check size={12} className="text-success" /> : <Copy size={12} />}
    </button>
  );
}

function Code({ lang, code }: { lang: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle">
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface-1/60 px-4 py-2">
        <span className="text-[11px] font-medium text-text-muted">{lang}</span>
        <CopyBtn text={code} />
      </div>
      <pre className="overflow-x-auto bg-surface-1/30 p-5 font-mono text-[12px] leading-relaxed text-text-tertiary">{code}</pre>
    </div>
  );
}

function Tabs({ tabs, active, setActive }: { id?: string; tabs: Record<string, string>; active: string; setActive: (l: string) => void }) {
  return (
    <div>
      <div className="flex gap-1 mb-3">
        {Object.keys(tabs).map((l) => (
          <button
            key={l}
            onClick={() => setActive(l)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors",
              active === l ? "bg-surface-2 text-text-primary ring-1 ring-border-default" : "text-text-muted hover:text-text-secondary",
            )}
          >
            {l}
          </button>
        ))}
      </div>
      <Code lang={active} code={tabs[active]} />
    </div>
  );
}

function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[12px] font-bold text-accent">
        {num}
      </div>
      <div className="flex-1">
        <h4 className="text-[14px] font-semibold text-text-primary">{title}</h4>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}

export default function DashboardDocsPage() {
  const [apiKey, setApiKey] = useState("YOUR_API_KEY");
  const [lang, setLang] = useState("curl");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("api_keys").select("key").eq("user_id", data.user.id).limit(1).single()
        .then(({ data: k }) => { if (k?.key) setApiKey(k.key); });
    });
  }, []);

  const host = typeof window !== "undefined" ? window.location.origin : "https://YOUR_DOMAIN";

  const endpoints = [
    {
      id: "image",
      icon: Image,
      color: "#7c3aed",
      method: "POST", path: "/api/services/image_gen", name: "Image Generation", limit: "200/day",
      desc: "Generate stunning images from text prompts using FLUX and Stable Diffusion models.",
      params: [
        { name: "prompt", type: "string", req: true, desc: "What to generate. Be descriptive for best results." },
        { name: "aspect_ratio", type: "string", req: false, desc: '"1:1", "16:9", "9:16", "4:3", "3:4". Default: "1:1"' },
        { name: "style", type: "string", req: false, desc: '"none" or "anime". Default: "none"' },
        { name: "model", type: "string", req: false, desc: '"black-forest-labs/FLUX.1-schnell", "FLUX.1-dev", "fal-ai/flux-pro"' },
      ],
      res: '{\n  "image_url": "https://cdn.example.com/output/image.webp",\n  "success": true\n}',
      examples: {
        curl: `curl -X POST ${host}/api/services/image_gen \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "prompt": "a futuristic cyberpunk city at sunset",\n    "aspect_ratio": "16:9",\n    "style": "none"\n  }'`,
        python: `import requests

res = requests.post(
    "${host}/api/services/image_gen",
    headers={"Authorization": "Bearer ${apiKey}"},
    json={
        "prompt": "a futuristic cyberpunk city at sunset",
        "aspect_ratio": "16:9",
        "style": "none"
    }
)
print(res.json()["image_url"])`,
        javascript: `const res = await fetch("${host}/api/services/image_gen", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    prompt: "a futuristic cyberpunk city at sunset",
    aspect_ratio: "16:9",
    style: "none"
  })
});
const { image_url } = await res.json();`,
      },
    },
    {
      id: "tts",
      icon: Mic,
      color: "#0891b2",
      method: "POST", path: "/api/services/tts", name: "Text to Speech", limit: "100/day",
      desc: "Convert any text into natural-sounding speech with multiple voice options.",
      params: [
        { name: "text", type: "string", req: true, desc: "Text to convert to speech. Max 500 characters." },
        { name: "voice", type: "string", req: false, desc: '"en-Carter_man", "en-Emily_woman", "en-James_man", "en-Sarah_woman". Default: "en-Carter_man"' },
        { name: "model", type: "string", req: false, desc: '"vibevoice", "parler-tts/parler-tts-mini-v1". Default: "vibevoice"' },
      ],
      res: '{\n  "audio_url": "https://cdn.example.com/output/audio.mp3",\n  "success": true\n}',
      examples: {
        curl: `curl -X POST ${host}/api/services/tts \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "text": "Welcome to the future of AI.",\n    "voice": "en-Emily_woman"\n  }'`,
        python: `import requests

res = requests.post(
    "${host}/api/services/tts",
    headers={"Authorization": "Bearer ${apiKey}"},
    json={
        "text": "Welcome to the future of AI.",
        "voice": "en-Emily_woman"
    }
)
print(res.json()["audio_url"])`,
        javascript: `const res = await fetch("${host}/api/services/tts", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    text: "Welcome to the future of AI.",
    voice: "en-Emily_woman"
  })
});
const { audio_url } = await res.json();`,
      },
    },
    {
      id: "transcribe",
      icon: FileAudio,
      color: "#d97706",
      method: "POST", path: "/api/services/transcribe", name: "Transcription", limit: "200/day",
      desc: "Convert audio files to text using Whisper-class models. Supports mp3, wav, and m4a.",
      params: [
        { name: "audio_url", type: "string", req: true, desc: "Direct public URL to the audio file (mp3, wav, m4a)." },
        { name: "language", type: "string", req: false, desc: '"en", "es", "fr", "de", "it", "ja", "zh". Default: "en"' },
        { name: "model", type: "string", req: false, desc: '"distil-whisper/distil-large-v3", "openai/whisper-large-v3", "meta-llama/seamless-m4t-v2-large"' },
      ],
      res: '{\n  "text": "Welcome to todays episode...",\n  "success": true\n}',
      examples: {
        curl: `curl -X POST ${host}/api/services/transcribe \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "audio_url": "https://example.com/podcast.mp3",\n    "language": "en"\n  }'`,
        python: `import requests

res = requests.post(
    "${host}/api/services/transcribe",
    headers={"Authorization": "Bearer ${apiKey}"},
    json={
        "audio_url": "https://example.com/podcast.mp3",
        "language": "en"
    }
)
print(res.json()["text"])`,
        javascript: `const res = await fetch("${host}/api/services/transcribe", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    audio_url: "https://example.com/podcast.mp3",
    language: "en"
  })
});
const { text } = await res.json();`,
      },
    },
  ];

  return (
    <div className="space-y-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-blue/10">
            <BookOpen size={18} className="text-accent-blue" />
          </div>
          <div>
            <h1 className="font-display text-[22px] font-bold tracking-tight">API Docs</h1>
            <p className="text-[13px] text-text-muted">Your key is pre-filled in all examples below</p>
          </div>
        </div>
      </motion.div>

      {/* Auth key banner */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="rounded-xl border border-accent/15 bg-accent/5 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold text-text-secondary">Your API Key</p>
              <code className="text-[12px] text-text-muted font-mono">{apiKey}</code>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(apiKey)}
                className="rounded-lg bg-accent px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-accent-dark transition-colors"
              >
                Copy key
              </button>
              <a
                href="/dashboard/api-keys"
                className="rounded-lg border border-border-subtle px-3 py-1.5 text-[11px] font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Manage keys
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick start */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
        <h2 className="font-display text-[18px] font-bold tracking-tight">Quick Start</h2>
        <div className="space-y-5">
          <Step num={1} title="Copy your API key above">
            <p className="text-[13px] text-text-tertiary">Use the Copy key button, or grab a different key from <a href="/dashboard/api-keys" className="text-accent hover:underline">API Keys</a>.</p>
          </Step>
          <Step num={2} title="Send a POST request">
            <p className="text-[13px] text-text-tertiary mb-2">Include your key in the Authorization header:</p>
            <Code lang="curl" code={`curl -X POST ${host}/api/services/image_gen \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "a cat astronaut"}'`} />
          </Step>
          <Step num={3} title="Get the result URL">
            <p className="text-[13px] text-text-tertiary">The response contains <code className="text-text-secondary">image_url</code>, <code className="text-text-secondary">audio_url</code>, or <code className="text-text-secondary">text</code> depending on the service.</p>
          </Step>
        </div>
      </motion.div>

      {/* Endpoints */}
      <div className="space-y-16">
        {endpoints.map((ep, i) => {
          const Icon = ep.icon;
          return (
            <motion.section
              key={ep.path}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${ep.color}10` }}>
                  <Icon size={16} style={{ color: ep.color }} />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-md bg-success/10 px-2 py-1 font-mono text-[11px] font-medium text-success">{ep.method}</span>
                  <code className="font-mono text-[13px] text-text-primary">{ep.path}</code>
                  <span className="badge-premium bg-surface-2 text-text-muted border-border-default">{ep.limit}</span>
                </div>
              </div>
              <p className="text-[13px] text-text-tertiary">{ep.desc}</p>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted mb-2">Parameters</p>
                <div className="overflow-hidden rounded-xl border border-border-subtle text-[13px]">
                  {ep.params.map((p, pi) => (
                    <div key={p.name} className={`flex items-start gap-4 px-5 py-3 ${pi < ep.params.length - 1 ? "border-b border-border-subtle" : ""}`}>
                      <code className="shrink-0 w-[100px] text-text-primary">{p.name}{p.req ? " *" : ""}</code>
                      <span className="shrink-0 w-[60px] text-[11px] text-text-muted">{p.type}</span>
                      <span className="text-text-tertiary">{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted mb-2">Example</p>
                <Tabs id={ep.path} tabs={ep.examples} active={lang} setActive={setLang} />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted mb-2">Response</p>
                <Code lang="json" code={ep.res} />
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* n8n guide */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2">
            <Zap size={16} className="text-text-secondary" />
          </div>
          <h2 className="font-display text-[18px] font-bold tracking-tight">Using with n8n</h2>
        </div>
        <div className="space-y-5">
          <Step num={1} title="Add an HTTP Request node">
            <p className="text-[13px] text-text-tertiary">Drag an <strong>HTTP Request</strong> node into your n8n workflow.</p>
          </Step>
          <Step num={2} title="Configure authentication">
            <div className="overflow-hidden rounded-xl border border-border-subtle text-[13px]">
              <div className="grid grid-cols-[140px_1fr] gap-x-4 border-b border-border-subtle bg-surface-1/60 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted">
                <span>Field</span><span>Value</span>
              </div>
              {[
                { field: "Method", value: "POST" },
                { field: "URL", value: `${host}/api/services/image_gen` },
                { field: "Auth", value: "Header Auth" },
                { field: "Name", value: "Authorization" },
                { field: "Value", value: `Bearer ${apiKey}` },
              ].map((r, i) => (
                <div key={r.field} className={`grid grid-cols-[140px_1fr] gap-x-4 px-5 py-2.5 ${i < 4 ? "border-b border-border-subtle" : ""}`}>
                  <span className="text-text-secondary font-medium">{r.field}</span>
                  <code className="text-text-tertiary truncate">{r.value}</code>
                </div>
              ))}
            </div>
          </Step>
          <Step num={3} title="Set the JSON body">
            <p className="text-[13px] text-text-tertiary mb-2">Body type: <strong>JSON</strong></p>
            <Code lang="json" code={`{\n  "prompt": "{{ $json.prompt }}",\n  "aspect_ratio": "1:1"\n}`} />
          </Step>
          <Step num={4} title="Access the result">
            <p className="text-[13px] text-text-tertiary">
              Use <code className="text-text-secondary">{"{{ $json.image_url }}"}</code> in the next node.
              For TTS: <code className="text-text-secondary">{"{{ $json.audio_url }}"}</code>.
              For Transcribe: <code className="text-text-secondary">{"{{ $json.text }}"}</code>.
            </p>
          </Step>
        </div>
      </motion.section>

      {/* Errors */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted mb-2">Error codes</p>
        <div className="overflow-hidden rounded-xl border border-border-subtle text-[13px]">
          {[
            { c: "401", d: "Missing or invalid API key" },
            { c: "402", d: "Limit reached — wait for reset" },
            { c: "429", d: "Rate limit or daily limit exceeded" },
            { c: "500", d: "Generation failed — not counted against limits" },
          ].map((e) => (
            <div key={e.c} className="flex gap-4 border-b border-border-subtle px-5 py-3 last:border-0">
              <code className="text-text-primary w-[40px]">{e.c}</code>
              <span className="text-text-tertiary">{e.d}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
