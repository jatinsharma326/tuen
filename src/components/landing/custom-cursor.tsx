"use client";

import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const hasPositionRef = useRef(false);
  const isHoveringRef = useRef(false);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    document.body.classList.add("custom-cursor-active");
    return () => document.body.classList.remove("custom-cursor-active");
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const cursor = cursorRef.current;
    if (!cursor) return;
    const cursorElement = cursor;

    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!hasPositionRef.current) {
        posRef.current = targetRef.current;
        hasPositionRef.current = true;
      }
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }
    };
    const onEnter = () => {
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }
    };
    const onLeave = () => {
      if (isVisibleRef.current) {
        isVisibleRef.current = false;
        setIsVisible(false);
      }
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hovering =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        Boolean(target.closest("a")) ||
        Boolean(target.closest("button")) ||
        Boolean(target.closest("[data-cursor='crosshair']"));

      if (hovering !== isHoveringRef.current) {
        isHoveringRef.current = hovering;
        setIsHovering(hovering);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseover", onOver);

    let raf: number;
    function animate() {
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.38;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.38;
      cursorElement.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const onTouch = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };
    window.addEventListener("touchstart", onTouch);
    return () => window.removeEventListener("touchstart", onTouch);
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden mix-blend-difference md:block"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.12s, width 0.16s, height 0.16s",
        willChange: "transform, opacity",
      }}
      suppressHydrationWarning
    >
      {isHovering ? (
        // Crosshair
        <div className="relative h-6 w-6">
          <div className="absolute left-1/2 top-0 h-full w-[1px] -translate-x-1/2 bg-white" />
          <div className="absolute left-0 top-1/2 h-[1px] w-full -translate-y-1/2 bg-white" />
          <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ef4444]" />
        </div>
      ) : (
        // Dot
        <div
          className="h-2 w-2 rounded-full bg-white"
          style={{ boxShadow: "0 0 8px rgba(255,255,255,0.5)" }}
        />
      )}
    </div>
  );
}
