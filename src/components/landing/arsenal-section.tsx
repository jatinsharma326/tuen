"use client";

import { useEffect, useRef, useState } from "react";

interface ModelCardProps {
  title: string;
  type: string;
  latency: string;
  curl: string;
  canvasGenerator: (ctx: CanvasRenderingContext2D, time: number, w: number, h: number) => void;
  size?: "tall" | "wide" | "normal";
}

function ModelCanvas({ generator }: { generator: ModelCardProps["canvasGenerator"] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const can = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const c = ctx;

    const resize = () => {
      const rect = can.getBoundingClientRect();
      can.width = rect.width * 2;
      can.height = rect.height * 2;
    };
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    function loop() {
      const t = (performance.now() - start) / 1000;
      generator(c, t, can.width, can.height);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [generator]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ imageRendering: "auto" }}
    />
  );
}

function imageGenCanvas(ctx: CanvasRenderingContext2D, time: number, w: number, h: number) {
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = "rgba(0,229,255,0.05)";
  ctx.lineWidth = 0.5;
  const gridSize = 30;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // Latent noise resolving into image
  const progress = (Math.sin(time * 0.5) * 0.5 + 0.5); // 0 to 1 cycle
  const cx = w / 2;
  const cy = h / 2;

  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2 + time * 0.3;
    const radius = 80 + Math.sin(time + i * 0.5) * 30;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    // Noise pixels
    const alpha = (1 - progress) * 0.4;
    ctx.fillStyle = `rgba(${100 + Math.random() * 155}, ${100 + Math.random() * 155}, ${200 + Math.random() * 55}, ${alpha})`;
    ctx.fillRect(x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 40, 2, 2);

    // Resolved image blobs
    const blobAlpha = progress * 0.6;
    const hue = (i * 6 + time * 20) % 360;
    ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${blobAlpha})`;
    ctx.beginPath();
    ctx.arc(x, y, 8 + Math.sin(time * 2 + i) * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Central glow
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 150);
  glow.addColorStop(0, `rgba(0,229,255,${0.3 * progress})`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

function llmCanvas(ctx: CanvasRenderingContext2D, time: number, w: number, h: number) {
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, w, h);

  const lines = [
    "import { generate } from 'tuen';",
    "",
    "const response = await generate({",
    "  model: 'llama-3.1-70b',",
    "  prompt: 'Explain quantum computing',",
    "  max_tokens: 2048,",
    "  temperature: 0.7,",
    "});",
    "",
    "console.log(response.text);",
  ];

  const charWidth = 7;
  const lineHeight = 18;
  const padding = 20;
  const charsPerFrame = 3;
  const totalChars = lines.reduce((a, b) => a + b.length + 1, 0);
  const currentChar = Math.floor((time * 15) % (totalChars + 30));

  let charCount = 0;
  ctx.font = '12px "JetBrains Mono", monospace';

  lines.forEach((line, lineIdx) => {
    const y = padding + lineIdx * lineHeight;

    // Line number
    ctx.fillStyle = "rgba(100,100,120,0.4)";
    ctx.fillText(String(lineIdx + 1).padStart(2, "0"), 8, y);

    let x = padding + 20;
    for (let i = 0; i < line.length; i++) {
      if (charCount >= currentChar) return;
      charCount++;

      const ch = line[i];
      // Syntax highlighting
      if (line.startsWith("import") || line.startsWith("const") || line.startsWith("console")) {
        ctx.fillStyle = "#c084fc";
      } else if (ch === "'" || ch === '"' || line.includes("'")) {
        ctx.fillStyle = "#39FF14";
      } else if (!isNaN(Number(ch)) && ch !== " ") {
        ctx.fillStyle = "#00E5FF";
      } else if (ch === "(" || ch === ")" || ch === "{" || ch === "}") {
        ctx.fillStyle = "#FF3131";
      } else {
        ctx.fillStyle = "#e4e4e7";
      }
      ctx.fillText(ch, x, y);
      x += charWidth;
    }
  });

  // Cursor
  if (Math.floor(time * 2) % 2 === 0) {
    const cursorLine = Math.floor(currentChar / 40);
    const cursorX = padding + 20 + (currentChar % 40) * charWidth;
    const cursorY = padding + cursorLine * lineHeight;
    ctx.fillStyle = "#39FF14";
    ctx.fillRect(cursorX, cursorY - 10, 7, 14);
  }
}

function videoCanvas(ctx: CanvasRenderingContext2D, time: number, w: number, h: number) {
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  // Rotating wireframe cube
  const size = Math.min(w, h) * 0.25;
  const rot = time * 0.8;

  const vertices = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
  ];

  const projected = vertices.map((v) => {
    const x = v[0] * Math.cos(rot) - v[2] * Math.sin(rot);
    const z = v[0] * Math.sin(rot) + v[2] * Math.cos(rot);
    const y = v[1] * Math.cos(rot * 0.5) - z * Math.sin(rot * 0.5);
    const z2 = v[1] * Math.sin(rot * 0.5) + z * Math.cos(rot * 0.5);
    const scale = 400 / (400 + z2 * 100);
    return [cx + x * size * scale, cy + y * size * scale];
  });

  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];

  ctx.strokeStyle = "rgba(0,229,255,0.6)";
  ctx.lineWidth = 1;
  edges.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(projected[a][0], projected[a][1]);
    ctx.lineTo(projected[b][0], projected[b][1]);
    ctx.stroke();
  });

  // Vertices glow
  projected.forEach((p) => {
    ctx.fillStyle = "rgba(57,255,20,0.8)";
    ctx.beginPath();
    ctx.arc(p[0], p[1], 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Frame counter
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillText(`Frame: ${Math.floor(time * 60).toString().padStart(4, "0")} | 60fps`, 10, h - 10);
}

function ttsCanvas(ctx: CanvasRenderingContext2D, time: number, w: number, h: number) {
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, w, h);

  // Waveform
  const bars = 40;
  const barWidth = (w - 40) / bars;
  const baseY = h / 2;

  for (let i = 0; i < bars; i++) {
    const x = 20 + i * barWidth;
    const freq = i * 0.3 + time * 5;
    const amp = Math.sin(freq) * Math.cos(freq * 0.7) * Math.sin(freq * 1.3 + time);
    const height = Math.abs(amp) * (h * 0.4) + 5;

    const hue = 160 + i * 2;
    ctx.fillStyle = `hsla(${hue}, 90%, 60%, 0.8)`;
    ctx.fillRect(x + barWidth * 0.2, baseY - height / 2, barWidth * 0.6, height);
  }

  // Frequency labels
  ctx.fillStyle = "rgba(100,100,120,0.5)";
  ctx.font = '8px "JetBrains Mono", monospace';
  ctx.fillText("20Hz", 20, h - 8);
  ctx.fillText("20kHz", w - 40, h - 8);
}

function transcribeCanvas(ctx: CanvasRenderingContext2D, time: number, w: number, h: number) {
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, w, h);

  // Spectrogram
  const rows = 20;
  const cols = 30;
  const cellW = (w - 40) / cols;
  const cellH = (h - 40) / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const noise = Math.sin(row * 0.5 + col * 0.3 + time * 3) * 0.5 + 0.5;
      const noise2 = Math.cos(row * 0.7 - col * 0.4 + time * 2) * 0.5 + 0.5;
      const intensity = noise * noise2;

      const r = Math.floor(intensity * 0);
      const g = Math.floor(intensity * 255);
      const b = Math.floor(intensity * 229);
      ctx.fillStyle = `rgba(${r},${g},${b},${intensity * 0.8})`;
      ctx.fillRect(20 + col * cellW, 20 + row * cellH, cellW - 1, cellH - 1);
    }
  }
}

const MODELS: ModelCardProps[] = [
  {
    title: "Flux Schnell",
    type: "IMAGE GENERATION",
    latency: "340ms",
    curl: `curl https://api.tuen.fun/v1/images/generations \\\n  -H "Authorization: Bearer $KEY" \\\n  -d '{"model":"flux-schnell","prompt":"cyberpunk city"}'`,
    canvasGenerator: imageGenCanvas,
    size: "tall",
  },
  {
    title: "Llama 3.1 70B",
    type: "LLM",
    latency: "12ms/token",
    curl: `curl https://api.tuen.fun/v1/chat/completions \\\n  -H "Authorization: Bearer $KEY" \\\n  -d '{"model":"llama-3.1-70b","messages":[{"role":"user","content":"Hello"}]}'`,
    canvasGenerator: llmCanvas,
    size: "normal",
  },
  {
    title: "VibeVoice",
    type: "TEXT TO SPEECH",
    latency: "89ms",
    curl: `curl https://api.tuen.fun/v1/audio/speech \\\n  -H "Authorization: Bearer $KEY" \\\n  -d '{"model":"vibevoice","input":"Hello world","voice":"alloy"}'`,
    canvasGenerator: ttsCanvas,
    size: "normal",
  },
  {
    title: "Cohere Transcribe",
    type: "TRANSCRIPTION",
    latency: "120ms",
    curl: `curl https://api.tuen.fun/v1/audio/transcriptions \\\n  -H "Authorization: Bearer $KEY" \\\n  -F file=@audio.mp3 \\\n  -F model="cohere-transcribe"`,
    canvasGenerator: transcribeCanvas,
    size: "wide",
  },
  {
    title: "Nucleus Video",
    type: "VIDEO GENERATION",
    latency: "2.4s",
    curl: `curl https://api.tuen.fun/v1/video/generations \\\n  -H "Authorization: Bearer $KEY" \\\n  -d '{"model":"nucleus","prompt":"robot walking"}'`,
    canvasGenerator: videoCanvas,
    size: "normal",
  },
];

function ArsenalCard({ model }: { model: ModelCardProps }) {
  const [hovered, setHovered] = useState(false);

  const sizeClasses = {
    tall: "row-span-2",
    wide: "col-span-2",
    normal: "",
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border border-white/5 bg-[#0a0a0c] ${sizeClasses[model.size || "normal"]} min-h-[220px]`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-cursor="crosshair"
    >
      {/* Canvas background */}
      <ModelCanvas generator={model.canvasGenerator} />

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12">
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#39FF14]/70"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            {model.type}
          </span>
          <span className="text-[9px] text-white/30">|</span>
          <span
            className="text-[9px] text-[#00E5FF]/70"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            {model.latency}
          </span>
        </div>
        <h3
          className="mt-1 text-lg font-semibold text-white"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {model.title}
        </h3>
      </div>

      {/* Glassmorphic curl overlay on hover */}
      <div
        className="absolute inset-0 z-20 flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300"
        style={{
          background: hovered ? "rgba(5,5,5,0.85)" : "rgba(5,5,5,0)",
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? "auto" : "none",
        }}
      >
        <div className="w-full max-w-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#39FF14]" />
            <span
              className="text-[10px] uppercase tracking-wider text-[#39FF14]/70"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              cURL Request
            </span>
          </div>
          <pre
            className="overflow-x-auto rounded border border-white/10 bg-black/60 p-3 text-[10px] leading-relaxed text-[#00E5FF]/90"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            <code>{model.curl}</code>
          </pre>
          <button
            className="mt-3 w-full rounded border border-[#39FF14]/30 bg-[#39FF14]/10 py-2 text-[11px] font-medium text-[#39FF14] transition-all hover:bg-[#39FF14]/20"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            onClick={() => navigator.clipboard.writeText(model.curl.replace(/\\\n\s*/g, " "))}
          >
            [ copy to clipboard ]
          </button>
        </div>
      </div>
    </div>
  );
}

export function ArsenalSection() {
  return (
    <section className="relative w-full bg-[#050505] px-4 py-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="h-[1px] w-6 bg-[#FF3131]" />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#FF3131]/70"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                Section 01
              </span>
            </div>
            <h2
              className="text-4xl font-bold tracking-tight text-white md:text-5xl"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              The Arsenal
            </h2>
            <p
              className="mt-3 max-w-md text-sm text-white/40"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              Production-grade endpoints. No warm-up. No queueing. Inference at the speed of thought.
            </p>
          </div>
          <a
            href="/models"
            className="group flex items-center gap-2 text-[11px] uppercase tracking-wider text-white/40 transition-colors hover:text-[#00E5FF]"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            View all models
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>

        {/* Masonry grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODELS.map((model) => (
            <ArsenalCard key={model.title} model={model} />
          ))}
        </div>
      </div>
    </section>
  );
}
