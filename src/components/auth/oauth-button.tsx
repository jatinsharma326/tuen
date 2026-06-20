"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1S8.69 6 12 6c1.88 0 3.14.8 3.86 1.5l2.64-2.54C16.8 3.4 14.6 2.4 12 2.4 6.84 2.4 2.7 6.55 2.7 11.7s4.14 9.3 9.3 9.3c5.36 0 8.92-3.77 8.92-9.07 0-.61-.07-1.08-.16-1.56H12z"
      />
    </svg>
  );
}

export function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.83 1.24 1.83 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4 1.02 0 2.04.13 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.56 22.29 24 17.8 24 12.5 24 5.87 18.63.5 12 .5z"
      />
    </svg>
  );
}

interface OAuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider: "google" | "github";
}

export function OAuthButton({ provider, className, ...props }: OAuthButtonProps) {
  const Icon = provider === "google" ? GoogleIcon : GitHubIcon;
  const label = provider === "google" ? "Google" : "GitHub";

  return (
    <button
      type="button"
      className={cn(
        "group relative flex h-11 items-center justify-center gap-2.5 overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02] text-[13px] font-medium text-white/80 transition-all",
        "hover:border-white/20 hover:bg-white/[0.05] hover:text-white",
        "active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>
      <Icon className="h-[18px] w-[18px]" />
      <span>{label}</span>
    </button>
  );
}
