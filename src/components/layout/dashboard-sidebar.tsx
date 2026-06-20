"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Image,
  Mic,
  FileAudio,
  Key,
  Settings,
  LogOut,
  History,
  CreditCard,
  BookOpen,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createClient, getAuthUser } from "@/lib/supabase/client";
import { getPlan } from "@/lib/constants/plans";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SERVICES = [
  { href: "/dashboard/generate", label: "Image Generation", icon: Image, color: "#c084fc" },
  { href: "/dashboard/tts", label: "Text to Speech", icon: Mic, color: "#06b6d4" },
  { href: "/dashboard/transcribe", label: "Transcribe", icon: FileAudio, color: "#f59e0b" },
];

const MANAGE = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/generations", label: "History", icon: History },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/docs", label: "API Docs", icon: BookOpen },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [plan, setPlan] = useState("trial");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    getAuthUser(supabase).then((authUser) => {
      if (!authUser) return;
      supabase.from("profiles").select("plan").eq("id", authUser.id).single()
        .then(({ data: p }) => { setPlan(p?.plan ?? "trial"); });
    });
  }, [pathname]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const NavLink = ({ href, label, icon: Icon, color }: { href: string; label: string; icon: typeof Image; color?: string }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-all",
          isActive
            ? "bg-[#c084fc]/10 text-[#c084fc] font-medium"
            : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
        )}
      >
        {isActive && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[#c084fc]" />}
        <Icon size={15} style={isActive ? { color: color || "#c084fc" } : {}} className={cn("transition-colors", isActive ? "" : "text-white/30 group-hover:text-white/60")} />
        <span>{label}</span>
        {isActive && <ChevronRight size={12} className="ml-auto opacity-40" />}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#12121a] text-white/60 lg:hidden"
      >
        {mobileOpen ? <X size={16} /> : <Menu size={16} />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[260px] border-r border-white/[0.05] bg-[#0c0c12] transition-transform duration-300 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#c084fc] to-[#7c3aed] shadow-lg shadow-[#c084fc]/20">
            <span className="text-[11px] font-bold text-white">T</span>
          </div>
          <Link href="/" className="font-display text-[15px] font-semibold tracking-tight text-white">
            tuen.fun
          </Link>
          <span className="ml-auto rounded-full border border-[#c084fc]/20 bg-[#c084fc]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#c084fc]">
            Pro
          </span>
        </div>

        <nav className="flex-1 space-y-6 px-3 pt-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>
          <div>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white/25" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>Services</p>
            <div className="space-y-0.5">{SERVICES.map((l) => <NavLink key={l.href} {...l} />)}</div>
          </div>
          <div>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white/25" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>Manage</p>
            <div className="space-y-0.5">{MANAGE.map((l) => <NavLink key={l.href} {...l} />)}</div>
          </div>
        </nav>

        {/* Bottom panel */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/[0.05] bg-[#12121a] px-3 py-3 space-y-2">
          <Link
            href="/dashboard/billing"
            className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-3.5 py-2.5 transition-colors hover:bg-white/[0.03]"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c084fc]/10">
                <Sparkles size={13} className="text-[#c084fc]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold tabular-nums text-white">{getPlan(plan).monthlyTotalLimit.toLocaleString()} <span className="font-normal text-white/30">req/mo</span></p>
                <p className="text-[10px] text-white/30 capitalize">{plan} plan</p>
              </div>
            </div>
            <ChevronRight size={12} className="text-white/20" />
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-white/30 transition-colors hover:text-[#ef4444] hover:bg-[#ef4444]/5"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
