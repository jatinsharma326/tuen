"use client";

import { useEffect, useRef } from "react";

export function AuthBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const c = ctx;
    const can = canvas;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    function resize() {
      can.width = window.innerWidth * dpr;
      can.height = window.innerHeight * dpr;
    }
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    let raf = 0;
    let last = 0;

    const NODE_COUNT = 28;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00015,
      vy: (Math.random() - 0.5) * 0.00015,
    }));

    function draw(ts: number) {
      raf = requestAnimationFrame(draw);
      if (ts - last < 33) return;
      last = ts;

      const t = (ts - start) / 1000;
      const w = can.width;
      const h = can.height;

      c.fillStyle = "#0a0a10";
      c.fillRect(0, 0, w, h);

      const gridSize = 60 * dpr;
      c.strokeStyle = "rgba(192, 132, 252, 0.05)";
      c.lineWidth = 1;
      const offset = (t * 12 * dpr) % gridSize;
      for (let x = -gridSize + offset; x < w; x += gridSize) {
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x, h);
        c.stroke();
      }
      for (let y = -gridSize + offset; y < h; y += gridSize) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(w, y);
        c.stroke();
      }

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > 1) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;
      }

      const maxDist = Math.min(w, h) * 0.18;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const ax = a.x * w;
        const ay = a.y * h;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const bx = b.x * w;
          const by = b.y * h;
          const dx = bx - ax;
          const dy = by - ay;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.18;
            c.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            c.lineWidth = 1;
            c.beginPath();
            c.moveTo(ax, ay);
            c.lineTo(bx, by);
            c.stroke();
          }
        }
      }

      for (const n of nodes) {
        const x = n.x * w;
        const y = n.y * h;
        const pulse = Math.sin(t * 2 + n.x * 10) * 0.5 + 0.5;
        c.fillStyle = `rgba(192, 132, 252, ${0.4 + pulse * 0.4})`;
        c.beginPath();
        c.arc(x, y, 1.8 * dpr, 0, Math.PI * 2);
        c.fill();
      }
    }

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
