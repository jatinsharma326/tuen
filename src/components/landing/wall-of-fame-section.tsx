"use client";

import { useEffect, useRef } from "react";

function MatrixRain() {
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

    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    const fontSize = 14;
    const columns = Math.ceil(can.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    function draw() {
      c.fillStyle = "rgba(5, 5, 5, 0.05)";
      c.fillRect(0, 0, can.width, can.height);

      c.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head is bright
        c.fillStyle = "#c084fc";
        c.fillText(char, x, y);

        // Trail fades
        if (drops[i] > 1) {
          c.fillStyle = `rgba(57, 255, 20, ${0.3 / drops[i]})`;
          c.fillText(char, x, y - fontSize);
        }

        if (y > can.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

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
      className="absolute inset-0 h-full w-full"
    />
  );
}

const DEVELOPERS = [
  "alex_dev", "sarah_ml", "chen_ai", "jordan_viz", "maria_nlp",
  "kai_gpu", "taylor_llm", "rio_deploy", "nina_opt", "leo_infra",
  "maya_data", "noah_edge", "zoe_tune", "max_speed", "ava_cloud",
];

export function WallOfFameSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#0c0c12] py-24">
      {/* Matrix rain background */}
      <div className="absolute inset-0 opacity-40">
        <MatrixRain />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-8">
        {/* Section header */}
        <div className="mb-16 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <div className="h-[1px] w-6 bg-white/20" />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              Section 04
            </span>
            <div className="h-[1px] w-6 bg-white/20" />
          </div>
          <h2
            className="text-4xl font-bold tracking-tight text-white md:text-5xl"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Wall of Fame
          </h2>
          <p
            className="mt-3 text-sm text-white/30"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Builders shipping inference at scale
          </p>
        </div>
      </div>

      {/* Scrolling marquee */}
      <div className="relative z-10">
        <div className="flex overflow-hidden">
          <div className="flex animate-marquee gap-6 whitespace-nowrap pr-6">
            {[...DEVELOPERS, ...DEVELOPERS].map((dev, i) => (
              <div
                key={`${dev}-${i}`}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-5 py-3 backdrop-blur-sm"
              >
                {/* Avatar placeholder - procedural circle */}
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xs font-bold text-white/40"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))`,
                  }}
                >
                  {dev.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div
                    className="text-sm font-medium text-white/70"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    @{dev}
                  </div>
                  <div
                    className="text-[9px] uppercase tracking-wider text-white/25"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    Active Shipper
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Second row - opposite direction */}
        <div className="mt-4 flex overflow-hidden">
          <div className="flex animate-marquee-reverse gap-6 whitespace-nowrap pr-6">
            {[...DEVELOPERS.slice().reverse(), ...DEVELOPERS.slice().reverse()].map((dev, i) => (
              <div
                key={`${dev}-rev-${i}`}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-5 py-3 backdrop-blur-sm"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xs font-bold text-white/40"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))`,
                  }}
                >
                  {dev.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div
                    className="text-sm font-medium text-white/70"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    @{dev}
                  </div>
                  <div
                    className="text-[9px] uppercase tracking-wider text-white/25"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    Active Shipper
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
