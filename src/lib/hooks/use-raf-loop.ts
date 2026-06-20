"use client";

import { useEffect, useRef } from "react";

type Frame = (timestamp: DOMHighResTimeStamp) => void;

interface Options {
  fps?: number;
  pauseOffscreen?: boolean;
  rootMargin?: string;
}

export function useRafLoop(frame: Frame, options: Options = {}) {
  const { fps = 60, pauseOffscreen = true, rootMargin = "200px" } = options;

  const targetRef = useRef<HTMLElement | null>(null);
  const inViewRef = useRef(true);
  const runningRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const intervalRef = useRef<number>(1000 / fps);

  useEffect(() => {
    intervalRef.current = 1000 / fps;

    if (pauseOffscreen) {
      const root = targetRef.current;
      if (root && typeof IntersectionObserver !== "undefined") {
        const io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              inViewRef.current = entry.isIntersecting;
            }
          },
          { rootMargin },
        );
        io.observe(root);
        runningRef.current = true;
        start();

        return () => {
          io.disconnect();
          stop();
        };
      }
    }

    runningRef.current = true;
    start();

    return () => stop();
  }, [fps, pauseOffscreen, rootMargin]);

  function start() {
    cancelAnimationFrame(rafRef.current ?? 0);
    lastTickRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
  }

  function stop() {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function tick(ts: number) {
    if (!runningRef.current) return;
    rafRef.current = requestAnimationFrame(tick);

    if (!inViewRef.current) return;

    if (ts - lastTickRef.current < intervalRef.current) return;
    lastTickRef.current = ts;

    frame(ts);
  }

  return { targetRef };
}