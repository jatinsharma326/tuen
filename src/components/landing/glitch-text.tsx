"use client";

import { useEffect, useState, useRef } from "react";

const HEX_CHARS = "0123456789ABCDEF";

interface GlitchTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  onComplete?: () => void;
}

export function GlitchText({ text, className = "", delay = 0, speed = 30, onComplete }: GlitchTextProps) {
  const [display, setDisplay] = useState("");
  const [revealed, setRevealed] = useState(0);
  const [started, setStarted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!started || revealed < text.length || completedRef.current) return;

    completedRef.current = true;
    const timer = setTimeout(() => {
      onCompleteRef.current?.();
    }, 0);

    return () => clearTimeout(timer);
  }, [revealed, text.length, started]);

  useEffect(() => {
    completedRef.current = false;
    setDisplay("");
    setRevealed(0);
    setStarted(false);

    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [text, delay]);

  useEffect(() => {
    if (!started) return;

    intervalRef.current = setInterval(() => {
      setRevealed((prev) => Math.min(prev + 1, text.length));
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [started, text.length, speed]);

  useEffect(() => {
    if (revealed >= text.length && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [revealed, text.length, started]);

  useEffect(() => {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      if (i < revealed) {
        result += text[i];
      } else {
        result += HEX_CHARS[Math.floor(Math.random() * 16)];
      }
    }
    setDisplay(result);
  }, [revealed, text]);

  return (
    <span className={className} aria-label={text}>
      {display.split("").map((char, i) => (
        <span
          key={i}
          className={i < revealed ? "text-white" : "text-[#c084fc]/60"}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}
