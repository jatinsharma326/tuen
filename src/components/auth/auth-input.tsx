"use client";

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Eye, EyeOff } from "lucide-react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, label, error, icon, id, type, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (show ? "text" : "password") : type;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-[11px] font-medium uppercase tracking-[0.15em] text-white/50"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            {label}
          </label>
        )}
        <div className="group relative">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-[#c084fc]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            type={inputType}
            className={cn(
              "h-11 w-full rounded-lg border border-white/[0.08] bg-white/[0.02] text-sm text-white placeholder:text-white/25 outline-none transition-all",
              "focus:border-[#c084fc]/40 focus:bg-white/[0.04] focus:shadow-[0_0_0_4px_rgba(192,132,252,0.06)]",
              "disabled:cursor-not-allowed disabled:opacity-40",
              icon ? "pl-10" : "pl-3.5",
              isPassword ? "pr-10" : "pr-3.5",
              error && "border-[#ef4444]/60 focus:border-[#ef4444]/70 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.08)]",
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/70"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {error && (
          <p
            className="flex items-center gap-1.5 text-[11px] text-[#ef4444]"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            <span className="inline-block h-1 w-1 rounded-full bg-[#ef4444]" />
            {error}
          </p>
        )}
      </div>
    );
  },
);

AuthInput.displayName = "AuthInput";
