"use client";

import { useEffect, useRef } from "react";

function TPSMeter({ label, value, max }: { label: string; value: number; max: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const can = canvas;
    const ctx = can.getContext("2d");
    if (!ctx) return;
    const c = ctx;

    const w = 200;
    const h = 80;
    can.width = w * 2;
    can.height = h * 2;

    const history: number[] = [];
    const start = performance.now();

    function draw() {
      const t = (performance.now() - start) / 1000;
      const currentVal = value + Math.sin(t * 3) * value * 0.1 + Math.random() * value * 0.05;
      history.push(currentVal);
      if (history.length > 50) history.shift();

      c.clearRect(0, 0, can.width, can.height);

      // Background
      c.fillStyle = "rgba(30,30,36,0.6)";
      c.fillRect(0, 0, can.width, can.height);

      // Grid
      c.strokeStyle = "rgba(255,255,255,0.03)";
      c.lineWidth = 1;
      for (let x = 0; x < can.width; x += 40) {
        c.beginPath(); c.moveTo(x, 0); c.lineTo(x, can.height); c.stroke();
      }
      for (let y = 0; y < can.height; y += 40) {
        c.beginPath(); c.moveTo(0, y); c.lineTo(can.width, y); c.stroke();
      }

      // Graph line
      c.strokeStyle = "#06b6d4";
      c.lineWidth = 2;
      c.beginPath();
      history.forEach((v, i) => {
        const x = (i / 49) * can.width;
        const y = can.height - (v / max) * can.height * 0.8 - 10;
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      });
      c.stroke();

      // Fill
      c.fillStyle = "rgba(0,229,255,0.08)";
      c.beginPath();
      history.forEach((v, i) => {
        const x = (i / 49) * can.width;
        const y = can.height - (v / max) * can.height * 0.8 - 10;
        if (i === 0) c.moveTo(x, can.height);
        c.lineTo(x, y);
      });
      c.lineTo(can.width, can.height);
      c.closePath();
      c.fill();

      // Current value text
      c.fillStyle = "#06b6d4";
      c.font = 'bold 20px "JetBrains Mono", monospace';
      c.fillText(`${Math.round(currentVal)}`, 10, 30);
      c.fillStyle = "rgba(0,229,255,0.5)";
      c.font = '10px "JetBrains Mono", monospace';
      c.fillText(label, 10, 50);

      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(rafRef.current);
  }, [value, max, label]);

  return (
    <canvas
      ref={canvasRef}
      className="h-20 w-full rounded border border-white/5"
      style={{ width: "100%", height: "80px" }}
    />
  );
}

function LatencyGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const can = canvas;
    const ctx = can.getContext("2d");
    if (!ctx) return;
    const c = ctx;

    can.width = 400;
    can.height = 120;

    const history: number[] = Array(60).fill(2.3);
    const start = performance.now();

    function draw() {
      const t = (performance.now() - start) / 1000;

      // Simulate sub-5ms latency with tiny jitter
      const jitter = (Math.random() - 0.5) * 0.8;
      const newVal = Math.max(1.8, Math.min(3.2, 2.3 + jitter + Math.sin(t) * 0.2));
      history.push(newVal);
      history.shift();

      c.clearRect(0, 0, can.width, can.height);

      // Background
      c.fillStyle = "rgba(30,30,36,0.6)";
      c.fillRect(0, 0, can.width, can.height);

      // Target line at 2ms
      c.strokeStyle = "rgba(57,255,20,0.15)";
      c.setLineDash([4, 4]);
      c.lineWidth = 1;
      const targetY = can.height - (2 / 5) * (can.height - 20) - 10;
      c.beginPath(); c.moveTo(0, targetY); c.lineTo(can.width, targetY); c.stroke();
      c.setLineDash([]);

      // History line
      c.strokeStyle = "#c084fc";
      c.lineWidth = 2;
      c.beginPath();
      history.forEach((v, i) => {
        const x = (i / 59) * can.width;
        const y = can.height - (v / 5) * (can.height - 20) - 10;
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      });
      c.stroke();

      // Labels
      c.fillStyle = "rgba(255,255,255,0.4)";
      c.font = '9px "JetBrains Mono", monospace';
      c.fillText("5ms", 5, 15);
      c.fillText("0ms", 5, can.height - 5);

      // Current
      const current = history[history.length - 1];
      c.fillStyle = "#c084fc";
      c.font = 'bold 14px "JetBrains Mono", monospace';
      c.fillText(`${current.toFixed(1)}ms`, can.width - 60, 20);

      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded border border-white/5"
      style={{ width: "100%", height: "120px" }}
    />
  );
}

function GPUClusterMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const can = canvas;
    const ctx = can.getContext("2d");
    if (!ctx) return;
    const c = ctx;

    can.width = 400;
    can.height = 200;

    const clusters = [
      { x: 0.2, y: 0.3, name: "US-EAST", load: 0.7 },
      { x: 0.5, y: 0.4, name: "US-WEST", load: 0.4 },
      { x: 0.75, y: 0.25, name: "EU-WEST", load: 0.6 },
      { x: 0.65, y: 0.65, name: "AP-SOUTH", load: 0.8 },
      { x: 0.85, y: 0.55, name: "AP-NORTH", load: 0.3 },
    ];

    const start = performance.now();

    function draw() {
      const t = (performance.now() - start) / 1000;
      c.clearRect(0, 0, can.width, can.height);

      // World map dots (simplified)
      c.fillStyle = "rgba(255,255,255,0.03)";
      for (let i = 0; i < 80; i++) {
        const hx = hash(i, 0) * can.width;
        const hy = hash(i, 1) * can.height;
        c.fillRect(hx, hy, 1.5, 1.5);
      }

      // Connection lines
      c.strokeStyle = "rgba(0,229,255,0.08)";
      c.lineWidth = 0.5;
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const a = clusters[i];
          const b = clusters[j];
          c.beginPath();
          c.moveTo(a.x * can.width, a.y * can.height);
          c.lineTo(b.x * can.width, b.y * can.height);
          c.stroke();
        }
      }

      // Clusters
      clusters.forEach((cluster) => {
        const cx = cluster.x * can.width;
        const cy = cluster.y * can.height;
        const load = cluster.load + Math.sin(t * 2 + cluster.x * 10) * 0.1;

        // Pulse ring
        const pulseR = (Math.sin(t * 3 + cluster.x * 10) * 0.5 + 0.5) * 20 + 10;
        c.strokeStyle = load > 0.7 ? "rgba(255,49,49,0.2)" : "rgba(0,229,255,0.2)";
        c.lineWidth = 1;
        c.beginPath();
        c.arc(cx, cy, pulseR, 0, Math.PI * 2);
        c.stroke();

        // Core
        c.fillStyle = load > 0.7 ? "#ef4444" : "#06b6d4";
        c.beginPath();
        c.arc(cx, cy, 4, 0, Math.PI * 2);
        c.fill();

        // Label
        c.fillStyle = "rgba(255,255,255,0.5)";
        c.font = '8px "JetBrains Mono", monospace';
        c.fillText(cluster.name, cx + 8, cy - 4);
        c.fillStyle = load > 0.7 ? "rgba(255,49,49,0.6)" : "rgba(0,229,255,0.6)";
        c.fillText(`${Math.round(load * 100)}%`, cx + 8, cy + 6);
      });

      rafRef.current = requestAnimationFrame(draw);
    }

    function hash(n: number, seed: number) {
      return Math.abs(Math.sin(n * 12.9898 + seed * 78.233) * 43758.5453 % 1);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded border border-white/5"
      style={{ width: "100%", height: "200px" }}
    />
  );
}

export function ArchitectureSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const progress = 1 - rect.top / window.innerHeight;
      section.style.setProperty("--parallax", String(Math.max(0, Math.min(1, progress))));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-[#0c0c12] py-24">
      {/* Parallax background - server blades effect */}
      <div
        className="absolute inset-0"
        style={{
          transform: "translateY(calc(var(--parallax, 0) * -100px))",
          background: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 60px,
              rgba(0,229,255,0.02) 60px,
              rgba(0,229,255,0.02) 61px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 120px,
              rgba(57,255,20,0.015) 120px,
              rgba(57,255,20,0.015) 121px
            ),
            linear-gradient(180deg, #0c0c12 0%, #0a0a10 50%, #0c0c12 100%)
          `,
        }}
      />

      {/* Animated glow strips */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute h-[1px] w-full"
            style={{
              top: `${15 + i * 14}%`,
              background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? "rgba(0,229,255,0.15)" : "rgba(57,255,20,0.1)"}, transparent)`,
              animation: `pulse-strip ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-8">
        {/* Section header */}
        <div className="mb-16">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-[1px] w-6 bg-[#06b6d4]" />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#06b6d4]/70"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              Section 02
            </span>
          </div>
          <h2
            className="text-4xl font-bold tracking-tight text-white md:text-5xl"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Architecture
          </h2>
          <p
            className="mt-3 max-w-lg text-sm text-white/40"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Bare-metal GPU clusters. Custom inference kernels. No virtualization overhead.
          </p>
        </div>

        {/* Data panels */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* TPS Panel */}
          <div className="rounded-lg border border-white/5 bg-[#12121a]/80 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <span
                className="text-[10px] uppercase tracking-wider text-white/40"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                Throughput (TPS)
              </span>
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-[#06b6d4]" />
            </div>
            <TPSMeter label="tok/sec" value={2847} max={4000} />
            <div className="mt-3 flex justify-between text-[10px] text-white/30" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
              <span>p50: 2,847</span>
              <span>p99: 3,102</span>
            </div>
          </div>

          {/* Latency Panel */}
          <div className="rounded-lg border border-white/5 bg-[#12121a]/80 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <span
                className="text-[10px] uppercase tracking-wider text-white/40"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                Latency (p50)
              </span>
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-[#c084fc]" />
            </div>
            <LatencyGraph />
            <div className="mt-3 flex justify-between text-[10px] text-white/30" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
              <span>Target: &lt;5ms</span>
              <span className="text-[#c084fc]">✓ Within SLO</span>
            </div>
          </div>

          {/* GPU Cluster Map */}
          <div className="rounded-lg border border-white/5 bg-[#12121a]/80 p-5 backdrop-blur-sm md:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <span
                className="text-[10px] uppercase tracking-wider text-white/40"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                Active Clusters
              </span>
              <span className="text-[10px] text-[#06b6d4]" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                5 regions
              </span>
            </div>
            <GPUClusterMap />
          </div>

          {/* Specs panel */}
          <div className="rounded-lg border border-white/5 bg-[#12121a]/80 p-5 backdrop-blur-sm md:col-span-2 lg:col-span-3">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total GPUs", value: "2,048", sub: "H100 / A100 mix", color: "#06b6d4" },
                { label: "Uptime", value: "99.997%", sub: "Last 30 days", color: "#c084fc" },
                { label: "Cold Boot", value: "0ms", sub: "Always warm", color: "#ef4444" },
                { label: "Throughput", value: "12.4M", sub: "Requests/day", color: "#06b6d4" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div
                    className="text-3xl font-bold"
                    style={{ fontFamily: "var(--font-space-grotesk)", color: stat.color }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="mt-1 text-[10px] uppercase tracking-wider text-white/40"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    {stat.label}
                  </div>
                  <div
                    className="mt-0.5 text-[10px] text-white/25"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-strip {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
