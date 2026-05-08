import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-5 py-12 bg-[#0c0c12]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#c084fc]/[0.04] via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[300px] w-[500px] rounded-full bg-[#c084fc]/[0.08] blur-[100px]" />
      <Link href="/" className="relative mb-8 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#c084fc] to-[#7c3aed] shadow-lg shadow-[#c084fc]/20">
          <span className="text-[13px] font-bold text-white">T</span>
        </div>
        <span className="font-display text-lg font-semibold tracking-tight text-white">tuen</span>
      </Link>
      <div className="relative w-full max-w-[380px] rounded-xl border border-white/[0.05] bg-[#12121a] p-7 shadow-xl shadow-black/20">
        {children}
      </div>
    </div>
  );
}
