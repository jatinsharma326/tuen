import Link from "next/link";
import { AuthBackground } from "@/components/auth/auth-background";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a10] px-5 py-12">
      <AuthBackground />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(192,132,252,0.10),transparent_60%)]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-[#c084fc]/[0.10] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[420px] rounded-full bg-[#06b6d4]/[0.06] blur-[120px]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)",
        }}
      />

      <Link
        href="/"
        className="group relative z-10 mb-8 flex items-center gap-2.5"
      >
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#c084fc] to-[#7c3aed] shadow-lg shadow-[#c084fc]/30 transition-all group-hover:shadow-[#c084fc]/60">
          <span
            className="text-[14px] font-bold tracking-tight text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            T
          </span>
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <span
          className="text-xl font-semibold tracking-[0.02em] text-white"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          tuen
        </span>
      </Link>

      <div className="relative z-10 w-full max-w-[400px]">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/[0.12] via-white/[0.05] to-transparent opacity-80" />
        <div className="relative rounded-2xl border border-white/[0.06] bg-[#0f0f17]/90 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="pointer-events-none absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#c084fc]/60 to-transparent" />
          {children}
        </div>

        <p
          className="relative mt-6 text-center text-[11px] uppercase tracking-[0.2em] text-white/30"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          Secured by{" "}
          <span className="text-[#c084fc]/70">tuen</span> auth
        </p>
      </div>
    </div>
  );
}
