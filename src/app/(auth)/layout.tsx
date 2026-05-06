import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-5 py-12 bg-surface-1">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.04] via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[300px] w-[500px] rounded-full bg-accent/[0.08] blur-[100px]" />
      <Link href="/" className="relative mb-8 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-light shadow-lg shadow-accent/20">
          <span className="text-[13px] font-bold text-surface-0">A</span>
        </div>
        <span className="font-display text-lg font-semibold tracking-tight text-text-primary">aiops</span>
      </Link>
      <div className="relative w-full max-w-[380px] rounded-xl border border-border-subtle bg-surface-0 p-7 shadow-xl shadow-black/5">
        {children}
      </div>
    </div>
  );
}
