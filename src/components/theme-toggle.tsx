"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useState, useEffect, useRef } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const options: { value: "light" | "dark" | "system"; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const active = options.find((o) => o.value === theme);
  const ActiveIcon = active?.icon || Sun;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-surface-1/60 text-text-muted transition-colors hover:text-text-secondary hover:bg-surface-2"
        title="Toggle theme"
      >
        <ActiveIcon size={15} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-40 overflow-hidden rounded-xl border border-border-subtle bg-surface-0 shadow-xl shadow-black/5">
          {options.map((o) => {
            const Icon = o.icon;
            const isActive = theme === o.value;
            return (
              <button
                key={o.value}
                onClick={() => {
                  setTheme(o.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[13px] transition-colors ${
                  isActive
                    ? "bg-accent/8 text-accent font-medium"
                    : "text-text-secondary hover:bg-surface-1"
                }`}
              >
                <Icon size={14} />
                {o.label}
                {isActive && <span className="ml-auto text-[10px] text-accent">Active</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
