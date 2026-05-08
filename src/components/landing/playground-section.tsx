"use client";

import { useEffect, useRef, useState } from "react";

function CodeEditor() {
  const [code, setCode] = useState(`import { TuenClient } from "@tuen/sdk";

const client = new TuenClient({
  apiKey: process.env.TUEN_API_KEY,
});

async function generateImage() {
  const result = await client.images.generate({
    model: "flux-schnell",
    prompt: "A cyberpunk city at night",
    size: "1024x1024",
  });

  return result.url;
}

generateImage().then(console.log);`);

  const lines = code.split("\n");

  function highlight(line: string) {
    // Simple syntax highlighting
    let html = line
      .replace(/(import|from|const|let|var|async|function|return|await|new|if|else|then|catch)/g, '<span style="color:#c084fc">$1</span>')
      .replace(/(".*?"|'.*?'|`.*?`)/g, '<span style="color:#39FF14">$1</span>')
      .replace(/(\d+)/g, '<span style="color:#00E5FF">$1</span>')
      .replace(/(\/\/.*)/g, '<span style="color:rgba(255,255,255,0.25)">$1</span>')
      .replace(/(\{|\}|\(|\)|\[|\])/g, '<span style="color:#FF3131">$1</span>');
    return html;
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-white/10 bg-[#0c0c10] overflow-hidden">
      {/* Editor header */}
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#FF3131]/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#FF3131]/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#FF3131]/60" />
        </div>
        <span
          className="ml-3 text-[10px] text-white/30"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          playground.ts
        </span>
      </div>

      {/* Code area */}
      <div className="flex-1 overflow-auto p-4">
        <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "13px", lineHeight: "1.7" }}>
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="mr-4 inline-block w-6 select-none text-right text-white/20">
                {i + 1}
              </span>
              <span dangerouslySetInnerHTML={{ __html: highlight(line) || "&nbsp;" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-white/5 px-4 py-1.5">
        <span className="text-[9px] text-white/25" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
          TypeScript
        </span>
        <span className="text-[9px] text-white/25" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
          UTF-8
        </span>
      </div>
    </div>
  );
}

function RoboticArmCanvas() {
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

    function draw() {
      const t = (performance.now() - start) / 1000;
      const w = can.width;
      const h = can.height;

      c.clearRect(0, 0, w, h);

      // Background grid
      c.strokeStyle = "rgba(0,229,255,0.04)";
      c.lineWidth = 0.5;
      const grid = 30;
      for (let x = 0; x < w; x += grid) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
      for (let y = 0; y < h; y += grid) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }

      // Robotic arm segments
      const baseX = w * 0.5;
      const baseY = h * 0.85;

      // Joint 1
      const angle1 = Math.sin(t * 0.5) * 0.3 - 0.5;
      const seg1Len = h * 0.25;
      const j1x = baseX + Math.cos(angle1) * seg1Len;
      const j1y = baseY + Math.sin(angle1) * seg1Len;

      // Joint 2
      const angle2 = angle1 + Math.sin(t * 0.7 + 1) * 0.4 + 0.8;
      const seg2Len = h * 0.2;
      const j2x = j1x + Math.cos(angle2) * seg2Len;
      const j2y = j1y + Math.sin(angle2) * seg2Len;

      // End effector (brush)
      const angle3 = angle2 + Math.sin(t * 1.2 + 2) * 0.3 + 0.3;
      const seg3Len = h * 0.12;
      const ex = j2x + Math.cos(angle3) * seg3Len;
      const ey = j2y + Math.sin(angle3) * seg3Len;

      // Draw arm segments
      c.strokeStyle = "rgba(255,255,255,0.3)";
      c.lineWidth = 4;
      c.lineCap = "round";
      c.lineJoin = "round";

      c.beginPath();
      c.moveTo(baseX, baseY);
      c.lineTo(j1x, j1y);
      c.lineTo(j2x, j2y);
      c.lineTo(ex, ey);
      c.stroke();

      // Joints
      [baseX, j1x, j2x, ex].forEach((x, i) => {
        const y = [baseY, j1y, j2y, ey][i];
        c.fillStyle = i === 3 ? "#39FF14" : "#00E5FF";
        c.beginPath();
        c.arc(x, y, i === 3 ? 5 : 6, 0, Math.PI * 2);
        c.fill();
      });

      // Painting strokes (trailing effect)
      c.strokeStyle = "rgba(57,255,20,0.4)";
      c.lineWidth = 2;
      c.beginPath();
      for (let i = 0; i < 20; i++) {
        const tt = t - i * 0.05;
        const a1 = Math.sin(tt * 0.5) * 0.3 - 0.5;
        const x1 = baseX + Math.cos(a1) * seg1Len;
        const y1 = baseY + Math.sin(a1) * seg1Len;
        const a2 = a1 + Math.sin(tt * 0.7 + 1) * 0.4 + 0.8;
        const x2 = x1 + Math.cos(a2) * seg2Len;
        const y2 = y1 + Math.sin(a2) * seg2Len;
        const a3 = a2 + Math.sin(tt * 1.2 + 2) * 0.3 + 0.3;
        const px = x2 + Math.cos(a3) * seg3Len;
        const py = y2 + Math.sin(a3) * seg3Len;
        if (i === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.stroke();

      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full rounded-lg border border-white/10 bg-[#0a0a0c]"
    />
  );
}

export function PlaygroundSection() {
  return (
    <section className="relative w-full bg-[#050505] px-4 py-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-[1px] w-6 bg-[#39FF14]" />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#39FF14]/70"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              Section 03
            </span>
          </div>
          <h2
            className="text-4xl font-bold tracking-tight text-white md:text-5xl"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            The Playground
          </h2>
          <p
            className="mt-3 max-w-lg text-sm text-white/40"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Write code. Watch it execute in real-time. Every keystroke drives the machine.
          </p>
        </div>

        {/* Split screen */}
        <div className="grid gap-4 lg:grid-cols-2" style={{ height: "500px" }}>
          <CodeEditor />
          <RoboticArmCanvas />
        </div>
      </div>
    </section>
  );
}
