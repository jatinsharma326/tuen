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
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SERVICES = [
  { href: "/dashboard/generate", label: "Image Generation", icon: Image, color: "#7c3aed" },
  { href: "/dashboard/tts", label: "Text to Speech", icon: Mic, color: "#0891b2" },
  { href: "/dashboard/transcribe", label: "Transcribe", icon: FileAudio, color: "#d97706" },
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
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState("free");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("profiles").select("credits, plan").eq("id", data.user.id).single()
        .then(({ data: p }) => { setCredits(p?.credits ?? 0); setPlan(p?.plan ?? "free"); });
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
          "sidebar-item group",
          isActive ? "sidebar-item-active" : "text-text-tertiary"
        )}
      >
        <Icon size={15} style={isActive ? { color: color || "#6d28d9" } : {}} className={cn("transition-colors", isActive ? "" : "text-text-muted group-hover:text-text-secondary")} />
        <span>{label}</span>
        {isActive && <ChevronRight size={12} className="ml-auto opacity-40" />}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-surface-0 text-text-secondary lg:hidden"
      >
        {mobileOpen ? <X size={16} /> : <Menu size={16} />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[260px] border-r border-border-subtle bg-surface-0 transition-transform duration-300 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-yellow shadow-lg shadow-accent/20">
            <span className="text-[11px] font-bold text-surface-0">A</span>
          </div>
          <Link href="/" className="font-display text-[15px] font-semibold tracking-tight text-text-primary">
            aiops
          </Link>
          <span className="badge-premium ml-auto bg-accent/10 text-accent border-accent/20">
            <Sparkles size={9} /> Pro
          </span>
        </div>

        <nav className="flex-1 space-y-6 px-3 pt-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>
          <div>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">Services</p>
            <div className="space-y-0.5">{SERVICES.map((l) => <NavLink key={l.href} {...l} />)}</div>
          </div>
          <div>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">Manage</p>
            <div className="space-y-0.5">{MANAGE.map((l) => <NavLink key={l.href} {...l} />)}</div>
          </div>
        </nav>

        {/* Bottom panel */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border-subtle bg-surface-1 px-3 py-3 space-y-2">
          <div className="glass-panel-subtle flex items-center justify-between rounded-xl px-3.5 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                <Sparkles size={13} className="text-accent" />
              </div>
              <div>
                <p className="text-[11px] font-semibold tabular-nums text-text-primary">{credits ?? "—"} <span className="text-text-muted font-normal">credits</span></p>
                <p className="text-[10px] text-text-muted capitalize">{plan} plan</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-text-muted transition-colors hover:text-error hover:bg-error/5"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
