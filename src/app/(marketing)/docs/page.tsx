"use client";

import { useState } from "react";
import { Copy, Check, ChevronRight, Zap, Image, Mic, FileAudio } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }} className="rounded-md p-1.5 text-text-muted hover:text-text-secondary hover:bg-surface-2 transition-colors">
      {ok ? <Check size={12} className="text-success" /> : <Copy size={12} />}
    </button>
  );
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle">
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface-1/60 px-4 py-2">
        <span className="text-[11px] font-medium text-text-muted">{lang}</span>
        <CopyBtn text={code} />
      </div>
      <pre className="overflow-x-auto bg-surface-1/30 p-5 font-mono text-[12px] leading-relaxed text-text-tertiary">
        {code}
      </pre>
    </div>
  );
}

function Badge({ children }: { children: string }) {
  const color = children === "POST" ? "text-success bg-success/10" : "text-accent-blue bg-accent-blue/10";
  return <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-medium ${color}`}>{children}</span>;
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

const SECTIONS = [
  { id: "quickstart", label: "Quick Start" },
  { id: "auth", label: "Authentication" },
  { id: "image", label: "Image Generation" },
  { id: "tts", label: "Text to Speech" },
  { id: "transcribe", label: "Transcription" },
  { id: "n8n", label: "n8n Integration" },
  { id: "errors", label: "Errors & Limits" },
];

export default function DocsPage() {
  const [tab, setTab] = useState<Record<string, string>>({});
  const getTab = (id: string) => tab[id] || "curl";
  const setLang = (id: string, lang: string) => setTab((p) => ({ ...p, [id]: lang }));

  const LangTabs = ({ id, tabs }: { id: string; tabs: Record<string, string> }) => (
    <div>
      <div className="flex gap-1 mb-3">
        {Object.keys(tabs).map((lang) => (
          <button key={lang} onClick={() => setLang(id, lang)} className={cn(
            "rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors",
            getTab(id) === lang ? "bg-surface-2 text-text-primary ring-1 ring-border-default" : "text-text-muted hover:text-text-secondary"
          )}>
            {lang}
          </button>
        ))}
      </div>
      <CodeBlock lang={getTab(id)} code={tabs[getTab(id)]} />
    </div>
  );

  const DOMAIN = typeof window !== "undefined" ? window.location.origin : "https://your-domain.com";

  return (
    <div className="mx-auto max-w-6xl px-5 py-24">
      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-14">

        <nav className="hidden lg:block sticky top-24 self-start">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted mb-3">On this page</p>
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="flex items-center gap-1.5 py-1.5 text-[13px] text-text-muted hover:text-text-secondary transition-colors">
              <ChevronRight size={10} /> {s.label}
            </a>
          ))}
        </nav>

        <div className="space-y-20">

          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-accent">API Reference</p>
            <h1 className="mt-2 font-display text-[32px] font-extrabold tracking-tight text-text-primary">aiops API Documentation</h1>
            <p className="mt-3 text-[14px] text-text-tertiary leading-relaxed max-w-2xl">
              Generate images, convert text to speech, and transcribe audio using simple REST endpoints.
              Perfect for n8n, Zapier, Make.com, or any custom integration.
            </p>
          </div>

          {/* ─── QUICK START ─── */}
          <section id="quickstart" className="space-y-6">
            <h2 className="font-display text-[22px] font-bold tracking-tight text-text-primary">Quick Start</h2>
            <p className="text-[13px] text-text-tertiary">
              Every user gets an API key automatically. You can find it in your <strong>Dashboard &rarr; API Keys</strong>.
            </p>
            <div className="space-y-6">
              <Step num={1} title="Get your API key">
                <p className="text-[13px] text-text-tertiary">
                  Sign in and go to <a href="/dashboard/api-keys" className="text-accent hover:underline">API Keys</a>. Copy your key — it starts with <code className="text-text-secondary">aiops_sk_</code>.
                </p>
              </Step>
              <Step num={2} title="Make your first request">
                <p className="text-[13px] text-text-tertiary mb-3">
                  Send a POST request with your key in the <code className="text-text-secondary">Authorization</code> header.
                </p>
                <CodeBlock lang="curl" code={`curl -X POST ${DOMAIN}/api/services/image_gen \\
  -H "Authorization: Bearer aiops_sk_xxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "a futuristic city at sunset"}'`} />
              </Step>
              <Step num={3} title="Use the response">
                <p className="text-[13px] text-text-tertiary">
                  The API returns a JSON object with the result URL. For images: <code className="text-text-secondary">image_url</code>. For audio: <code className="text-text-secondary">audio_url</code>.
                </p>
              </Step>
            </div>
          </section>

          {/* ─── AUTH ─── */}
          <section id="auth" className="space-y-4">
            <h2 className="font-display text-[22px] font-bold tracking-tight text-text-primary">Authentication</h2>
            <p className="text-[13px] text-text-tertiary">
              All API requests require an <code className="text-text-secondary">Authorization</code> header with your API key.
            </p>
            <CodeBlock lang="Header" code={`Authorization: Bearer aiops_sk_xxxxxxxxxxxxxxxx`} />
            <div className="rounded-xl border border-warning/20 bg-warning/5 px-4 py-3">
              <p className="text-[12px] text-text-secondary">
                <strong>Security tip:</strong> Never expose your API key in client-side code or public repositories. Use environment variables.
              </p>
            </div>
          </section>

          {/* ─── IMAGE GENERATION ─── */}
          <section id="image" className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <Image size={16} className="text-accent" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <Badge>POST</Badge>
                  <code className="font-mono text-[13px] text-text-primary">/api/services/image_gen</code>
                  <span className="badge-premium bg-surface-2 text-text-muted border-border-default">5 credits</span>
                </div>
              </div>
            </div>
            <p className="text-[13px] text-text-tertiary">
              Generate stunning images from text prompts using FLUX and Stable Diffusion models.
            </p>

            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-text-muted">Request body</h3>
            <div className="overflow-hidden rounded-xl border border-border-subtle text-[13px]">
              <div className="grid grid-cols-[140px_80px_1fr] gap-x-4 border-b border-border-subtle bg-surface-1/60 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted">
                <span>Parameter</span><span>Type</span><span>Description</span>
              </div>
              {[
                { name: "prompt", type: "string", req: true, desc: "What to generate. Be descriptive for best results." },
                { name: "aspect_ratio", type: "string", req: false, desc: '"1:1", "16:9", "9:16", "4:3", "3:4". Default: "1:1"' },
                { name: "style", type: "string", req: false, desc: '"none" or "anime". Default: "none"' },
                { name: "model", type: "string", req: false, desc: '"black-forest-labs/FLUX.1-schnell", "black-forest-labs/FLUX.1-dev", "fal-ai/flux-pro"' },
              ].map((p, i) => (
                <div key={p.name} className={`grid grid-cols-[140px_80px_1fr] gap-x-4 px-5 py-3 ${i < 3 ? "border-b border-border-subtle" : ""}`}>
                  <code className="text-text-primary">{p.name}{p.req ? " *" : ""}</code>
                  <span className="text-text-muted">{p.type}</span>
                  <span className="text-text-tertiary">{p.desc}</span>
                </div>
              ))}
            </div>

            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-text-muted">Example request</h3>
            <LangTabs id="image" tabs={{
              curl: `curl -X POST ${DOMAIN}/api/services/image_gen \\
  -H "Authorization: Bearer aiops_sk_xxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "a futuristic cyberpunk city at sunset, neon lights, 8k detail",
    "aspect_ratio": "16:9",
    "style": "none",
    "model": "black-forest-labs/FLUX.1-schnell"
  }'`,
              python: `import requests

res = requests.post(
    "${DOMAIN}/api/services/image_gen",
    headers={"Authorization": "Bearer aiops_sk_xxxxxxxxxxxxxxxx"},
    json={
        "prompt": "a futuristic cyberpunk city at sunset, neon lights, 8k detail",
        "aspect_ratio": "16:9",
        "style": "none"
    }
)

data = res.json()
print(data["image_url"])  # https://cdn.../image.webp`,
              javascript: `const res = await fetch("${DOMAIN}/api/services/image_gen", {
  method: "POST",
  headers: {
    "Authorization": "Bearer aiops_sk_xxxxxxxxxxxxxxxx",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    prompt: "a futuristic cyberpunk city at sunset, neon lights, 8k detail",
    aspect_ratio: "16:9",
    style: "none"
  })
});

const { image_url } = await res.json();
console.log(image_url);`,
            }} />

            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-text-muted">Response</h3>
            <CodeBlock lang="json" code={`{
  "image_url": "https://cdn.example.com/output/image.webp",
  "success": true
}`} />

            <div className="rounded-xl border border-border-subtle bg-surface-1/30 px-5 py-4">
              <p className="text-[12px] text-text-secondary">
                <strong>Tip:</strong> Use <code className="text-text-primary">aspect_ratio: "1:1"</code> for profile pictures,
                <code className="text-text-primary">"9:16"</code> for mobile wallpapers, and <code className="text-text-primary">"16:9"</code> for desktop backgrounds.
              </p>
            </div>
          </section>

          {/* ─── TEXT TO SPEECH ─── */}
          <section id="tts" className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-cyan/10">
                <Mic size={16} className="text-accent-cyan" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <Badge>POST</Badge>
                  <code className="font-mono text-[13px] text-text-primary">/api/services/tts</code>
                  <span className="badge-premium bg-surface-2 text-text-muted border-border-default">2 credits</span>
                </div>
              </div>
            </div>
            <p className="text-[13px] text-text-tertiary">
              Convert any text into natural-sounding speech with multiple voice options.
            </p>

            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-text-muted">Request body</h3>
            <div className="overflow-hidden rounded-xl border border-border-subtle text-[13px]">
              <div className="grid grid-cols-[140px_80px_1fr] gap-x-4 border-b border-border-subtle bg-surface-1/60 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted">
                <span>Parameter</span><span>Type</span><span>Description</span>
              </div>
              {[
                { name: "text", type: "string", req: true, desc: "Text to convert to speech. Max 500 characters per request." },
                { name: "voice", type: "string", req: false, desc: '"en-Carter_man", "en-Emily_woman", "en-James_man", "en-Sarah_woman". Default: "en-Carter_man"' },
                { name: "model", type: "string", req: false, desc: '"vibevoice", "parler-tts/parler-tts-mini-v1". Default: "vibevoice"' },
              ].map((p, i) => (
                <div key={p.name} className={`grid grid-cols-[140px_80px_1fr] gap-x-4 px-5 py-3 ${i < 2 ? "border-b border-border-subtle" : ""}`}>
                  <code className="text-text-primary">{p.name}{p.req ? " *" : ""}</code>
                  <span className="text-text-muted">{p.type}</span>
                  <span className="text-text-tertiary">{p.desc}</span>
                </div>
              ))}
            </div>

            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-text-muted">Example request</h3>
            <LangTabs id="tts" tabs={{
              curl: `curl -X POST ${DOMAIN}/api/services/tts \\
  -H "Authorization: Bearer aiops_sk_xxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Welcome to the future of AI. Everything you need is just one API call away.",
    "voice": "en-Emily_woman"
  }'`,
              python: `import requests

res = requests.post(
    "${DOMAIN}/api/services/tts",
    headers={"Authorization": "Bearer aiops_sk_xxxxxxxxxxxxxxxx"},
    json={
        "text": "Welcome to the future of AI.",
        "voice": "en-Emily_woman"
    }
)

data = res.json()
print(data["audio_url"])  # https://cdn.../audio.mp3`,
              javascript: `const res = await fetch("${DOMAIN}/api/services/tts", {
  method: "POST",
  headers: {
    "Authorization": "Bearer aiops_sk_xxxxxxxxxxxxxxxx",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    text: "Welcome to the future of AI.",
    voice: "en-Emily_woman"
  })
});

const { audio_url } = await res.json();
console.log(audio_url);`,
            }} />

            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-text-muted">Response</h3>
            <CodeBlock lang="json" code={`{
  "audio_url": "https://cdn.example.com/output/audio.mp3",
  "success": true
}`} />

            <div className="rounded-xl border border-border-subtle bg-surface-1/30 px-5 py-4">
              <p className="text-[12px] text-text-secondary">
                <strong>Voice reference:</strong> Carter & James are male voices. Emily & Sarah are female voices.
                Carter and Emily have a neutral American accent. James is deeper, Sarah is softer.
              </p>
            </div>
          </section>

          {/* ─── TRANSCRIPTION ─── */}
          <section id="transcribe" className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
                <FileAudio size={16} className="text-warning" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <Badge>POST</Badge>
                  <code className="font-mono text-[13px] text-text-primary">/api/services/transcribe</code>
                  <span className="badge-premium bg-surface-2 text-text-muted border-border-default">3 credits</span>
                </div>
              </div>
            </div>
            <p className="text-[13px] text-text-tertiary">
              Convert audio files to text using Whisper-class models. Supports mp3, wav, and m4a formats.
            </p>

            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-text-muted">Request body</h3>
            <div className="overflow-hidden rounded-xl border border-border-subtle text-[13px]">
              <div className="grid grid-cols-[140px_80px_1fr] gap-x-4 border-b border-border-subtle bg-surface-1/60 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted">
                <span>Parameter</span><span>Type</span><span>Description</span>
              </div>
              {[
                { name: "audio_url", type: "string", req: true, desc: "Direct public URL to the audio file (mp3, wav, m4a)." },
                { name: "language", type: "string", req: false, desc: '"en", "es", "fr", "de", "it", "ja", "zh". Default: "en"' },
                { name: "model", type: "string", req: false, desc: '"distil-whisper/distil-large-v3", "openai/whisper-large-v3", "meta-llama/seamless-m4t-v2-large"' },
              ].map((p, i) => (
                <div key={p.name} className={`grid grid-cols-[140px_80px_1fr] gap-x-4 px-5 py-3 ${i < 2 ? "border-b border-border-subtle" : ""}`}>
                  <code className="text-text-primary">{p.name}{p.req ? " *" : ""}</code>
                  <span className="text-text-muted">{p.type}</span>
                  <span className="text-text-tertiary">{p.desc}</span>
                </div>
              ))}
            </div>

            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-text-muted">Example request</h3>
            <LangTabs id="transcribe" tabs={{
              curl: `curl -X POST ${DOMAIN}/api/services/transcribe \\
  -H "Authorization: Bearer aiops_sk_xxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "audio_url": "https://example.com/podcast-episode.mp3",
    "language": "en",
    "model": "distil-whisper/distil-large-v3"
  }'`,
              python: `import requests

res = requests.post(
    "${DOMAIN}/api/services/transcribe",
    headers={"Authorization": "Bearer aiops_sk_xxxxxxxxxxxxxxxx"},
    json={
        "audio_url": "https://example.com/podcast-episode.mp3",
        "language": "en"
    }
)

data = res.json()
print(data["text"])  # "Welcome to the podcast..."`,
              javascript: `const res = await fetch("${DOMAIN}/api/services/transcribe", {
  method: "POST",
  headers: {
    "Authorization": "Bearer aiops_sk_xxxxxxxxxxxxxxxx",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    audio_url: "https://example.com/podcast-episode.mp3",
    language: "en"
  })
});

const { text } = await res.json();
console.log(text);`,
            }} />

            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-text-muted">Response</h3>
            <CodeBlock lang="json" code={`{
  "text": "Welcome to today's episode. We're going to talk about artificial intelligence and its impact on society.",
  "success": true
}`} />

            <div className="rounded-xl border border-border-subtle bg-surface-1/30 px-5 py-4">
              <p className="text-[12px] text-text-secondary">
                <strong>Note:</strong> The audio file must be publicly accessible via a direct URL.
                If your file is private, upload it to a temporary hosting service first (like tmp.link or catbox.moe).
              </p>
            </div>
          </section>

          {/* ─── N8N INTEGRATION ─── */}
          <section id="n8n" className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2">
                <Zap size={16} className="text-text-secondary" />
              </div>
              <h2 className="font-display text-[22px] font-bold tracking-tight text-text-primary">n8n Integration Guide</h2>
            </div>
            <p className="text-[13px] text-text-tertiary">
              Connect aiops to your n8n workflows to automate image generation, voice synthesis, and transcription.
            </p>

            <div className="space-y-6">
              <Step num={1} title="Add an HTTP Request node">
                <p className="text-[13px] text-text-tertiary">
                  In n8n, drag an <strong>HTTP Request</strong> node into your workflow.
                </p>
              </Step>
              <Step num={2} title="Configure the request">
                <div className="space-y-2">
                  <p className="text-[13px] text-text-tertiary">Set these fields:</p>
                  <div className="overflow-hidden rounded-xl border border-border-subtle text-[13px]">
                    <div className="grid grid-cols-[140px_1fr] gap-x-4 border-b border-border-subtle bg-surface-1/60 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted">
                      <span>Field</span><span>Value</span>
                    </div>
                    {[
                      { field: "Method", value: "POST" },
                      { field: "URL", value: `${DOMAIN}/api/services/image_gen` },
                      { field: "Authentication", value: "Generic Credential Type → Header Auth" },
                      { field: "Name", value: "Authorization" },
                      { field: "Value", value: "Bearer aiops_sk_xxxxxxxxxxxxxxxx" },
                    ].map((r, i) => (
                      <div key={r.field} className={`grid grid-cols-[140px_1fr] gap-x-4 px-5 py-2.5 ${i < 4 ? "border-b border-border-subtle" : ""}`}>
                        <span className="text-text-secondary font-medium">{r.field}</span>
                        <code className="text-text-tertiary">{r.value}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </Step>
              <Step num={3} title="Set the JSON body">
                <p className="text-[13px] text-text-tertiary mb-2">Switch the body type to <strong>JSON</strong> and paste:</p>
                <CodeBlock lang="json" code={`{
  "prompt": "{{ $json.prompt }}",
  "aspect_ratio": "1:1"
}`} />
              </Step>
              <Step num={4} title="Use the output">
                <p className="text-[13px] text-text-tertiary">
                  The node returns <code className="text-text-secondary">image_url</code> (or <code className="text-text-secondary">audio_url</code> / <code className="text-text-secondary">text</code>).
                  Access it with <code className="text-text-secondary">{"{{ $json.image_url }}"}</code> in the next node.
                </p>
              </Step>
            </div>

            <div className="rounded-xl border border-accent/15 bg-accent/5 px-5 py-4">
              <p className="text-[12px] text-text-secondary">
                <strong>Pro tip:</strong> Create a <strong>Credential</strong> in n8n with your aiops API key so you can reuse it across multiple workflows without copying the key each time.
              </p>
            </div>
          </section>

          {/* ─── ERRORS & LIMITS ─── */}
          <section id="errors" className="space-y-5">
            <h2 className="font-display text-[22px] font-bold tracking-tight text-text-primary">Errors & Rate Limits</h2>
            <p className="text-[13px] text-text-tertiary">
              All errors return a JSON body with an <code className="text-text-secondary">error</code> field.
              Failed generations are automatically refunded — you never pay for errors.
            </p>

            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-text-muted">Error codes</h3>
            <div className="overflow-hidden rounded-xl border border-border-subtle text-[13px]">
              <div className="grid grid-cols-[80px_1fr] gap-x-4 border-b border-border-subtle bg-surface-1/60 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted">
                <span>Code</span><span>Description</span>
              </div>
              {[
                { code: "401", desc: "Unauthorized — missing or invalid API key" },
                { code: "402", desc: "Insufficient credits — buy more or upgrade your plan" },
                { code: "429", desc: "Rate limit exceeded — slow down or upgrade for higher limits" },
                { code: "500", desc: "Generation failed — credits are automatically refunded" },
              ].map((e) => (
                <div key={e.code} className="grid grid-cols-[80px_1fr] gap-x-4 border-b border-border-subtle px-5 py-3 last:border-0">
                  <code className="text-text-primary">{e.code}</code>
                  <span className="text-text-tertiary">{e.desc}</span>
                </div>
              ))}
            </div>

            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-text-muted">Rate limits by plan</h3>
            <div className="overflow-hidden rounded-xl border border-border-subtle text-[13px]">
              <div className="grid grid-cols-4 gap-x-4 border-b border-border-subtle bg-surface-1/60 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted">
                <span>Plan</span><span>Credits/mo</span><span>Rate limit</span><span>API keys</span>
              </div>
              {[
                { plan: "Free", credits: "50", rate: "5/min", keys: "1" },
                { plan: "Starter", credits: "1,000", rate: "20/min", keys: "3" },
                { plan: "Pro", credits: "5,000", rate: "100/min", keys: "10" },
                { plan: "Enterprise", credits: "15,000", rate: "Unlimited", keys: "Unlimited" },
              ].map((p) => (
                <div key={p.plan} className="grid grid-cols-4 gap-x-4 border-b border-border-subtle px-5 py-3 last:border-0">
                  <span className="font-medium text-text-primary">{p.plan}</span>
                  <span className="text-text-muted">{p.credits}</span>
                  <span className="text-text-muted">{p.rate}</span>
                  <span className="text-text-muted">{p.keys}</span>
                </div>
              ))}
            </div>

            <CodeBlock lang="Error response" code={`{
  "error": "Insufficient credits",
  "credits": 2,
  "cost": 5
}`} />
          </section>

        </div>
      </div>
    </div>
  );
}
