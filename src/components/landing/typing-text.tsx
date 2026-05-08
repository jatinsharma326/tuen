"use client";

import { useEffect, useState } from "react";

interface TypingTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  showCursor?: boolean;
  cursorColor?: string;
}

export function TypingText({
  text,
  className = "",
  delay = 0,
  speed = 40,
  showCursor = true,
  cursorColor = "#39FF14",
}: TypingTextProps) {
  const [display, setDisplay] = useState("");
  const [started, setStarted] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (display.length >= text.length) return;

    const timer = setTimeout(() => {
      setDisplay(text.slice(0, display.length + 1));
    }, speed + Math.random() * 20);

    return () => clearTimeout(timer);
  }, [started, display, text, speed]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={className}>
      {display}
      {showCursor && (
        <span
          className="inline-block w-[2px] h-[1em] ml-[2px] align-middle"
          style={{
            backgroundColor: cursorVisible ? cursorColor : "transparent",
            transition: "background-color 0.1s",
          }}
        />
      )}
    </span>
  );
}
