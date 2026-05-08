"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

function ParticleCanvas({ trigger }: { trigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (trigger === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const colors = ["#c084fc", "#06b6d4", "#ef4444", "#ffffff"];

    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      particlesRef.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.5 + Math.random() * 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 1 + Math.random() * 3,
      });
    }
  }, [trigger]);

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

    function animate() {
      c.clearRect(0, 0, can.width, can.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.life -= 0.016 / p.maxLife;

        if (p.life <= 0) return false;

        c.globalAlpha = p.life;
        c.fillStyle = p.color;
        c.beginPath();
        c.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        c.fill();

        return true;
      });

      c.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
    />
  );
}

export function DeploySection() {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [particles, setParticles] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  // Keyboard thock sound simulation (using Web Audio API)
  const playThock = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 150 + Math.random() * 50;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {
      // Audio not supported
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      setSubmitted(true);
      setParticles((p) => p + 1);
      playThock();

      // Simulate API call
      setTimeout(() => {
        setSubmitted(false);
        setInput("");
      }, 3000);
    } else if (e.key.length === 1) {
      playThock();
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#0c0c12] px-4 py-32 md:px-8">
      {/* Background circuit pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      <ParticleCanvas trigger={particles} />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        {/* Section header */}
        <div className="mb-3 flex items-center justify-center gap-3">
          <div className="h-[1px] w-6 bg-[#ef4444]" />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ef4444]/70"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Section 05
          </span>
          <div className="h-[1px] w-6 bg-[#ef4444]" />
        </div>

        <h2
          className="text-4xl font-bold tracking-tight text-white md:text-6xl"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Deploy Now
        </h2>
        <p
          className="mt-4 text-sm text-white/30"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          One command. Instant access. No credit card required to start.
        </p>

        {/* Terminal input */}
        <div className="mt-12">
          <div
            className="relative rounded-lg border border-white/10 bg-[#12121a] p-6 text-left"
            onClick={() => inputRef.current?.focus()}
          >
            {/* Terminal header */}
            <div className="mb-4 flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-[#ef4444]/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#ef4444]/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#ef4444]/60" />
              <span
                className="ml-2 text-[10px] text-white/20"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                tuen-cli
              </span>
            </div>

            {/* Prompt */}
            <div className="flex items-center gap-2">
              <span
                className="shrink-0 text-[#c084fc]"
                style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "14px" }}
              >
                &gt;
              </span>
              <span
                className="shrink-0 text-white/50"
                style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "14px" }}
              >
                register --email
              </span>
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="email"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder=""
                  disabled={submitted}
                  className="w-full bg-transparent text-white outline-none"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "14px",
                    caretColor: "transparent",
                  }}
                  autoComplete="off"
                />
                {/* Custom cursor */}
                {!submitted && (
                  <span
                    className="pointer-events-none absolute left-0 top-0 h-[1.2em] w-[2px]"
                    style={{
                      backgroundColor: cursorVisible ? "#c084fc" : "transparent",
                      transform: `translateX(${input.length * 8.4 + 2}px)`,
                      transition: "background-color 0.1s",
                    }}
                  />
                )}
              </div>
            </div>

            {/* Heartbeat brackets loading */}
            {submitted && (
              <div className="mt-4 flex items-center gap-2">
                <span
                  className="animate-pulse text-[#06b6d4]"
                  style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "12px" }}
                >
                  [<span className="mx-0.5 inline-block animate-pulse">◆</span>]
                </span>
                <span
                  className="text-[11px] text-white/40"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  Provisioning API key...
                </span>
              </div>
            )}

            {/* Success message */}
            {submitted && (
              <div className="mt-3 text-[11px] text-[#c084fc]/70" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                ✓ Check your inbox for the activation link.
              </div>
            )}
          </div>

          {/* Hint */}
          <p
            className="mt-4 text-[10px] text-white/20"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Press Enter to execute. Sound on recommended.
          </p>
        </div>
      </div>
    </section>
  );
}
