"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { NAV_LINKS } from "@/lib/constants/navigation";
import { createClient, getAuthUser } from "@/lib/supabase/client";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    const supabase = createClient();
    getAuthUser(supabase).then((authUser) => {
      if (authUser) {
        setUser({
          name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
          email: authUser.email || "",
        });
      } else {
        setUser(null);
      }
    });
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
          email: session.user.email || "",
        });
      } else {
        setUser(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <header className={cn(
      "fixed top-0 z-50 w-full transition-all duration-300",
      scrolled ? "border-b border-white/[0.05] bg-[#0c0c12]/80 backdrop-blur-xl" : "bg-transparent",
    )}>
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#c084fc] to-[#7c3aed] shadow-lg shadow-[#c084fc]/25">
            <span className="text-[12px] font-bold text-white">T</span>
          </div>
          <span className="font-display text-[16px] font-semibold tracking-tight text-white">tuen.fun</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={cn(
              "rounded-lg px-3.5 py-2 text-[13px] transition-colors",
              pathname === link.href ? "text-white" : "text-white/40 hover:text-white/70",
            )}>{link.label}</Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[13px] text-white/70 transition-all hover:border-[#c084fc]/30 hover:text-white"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#c084fc] to-[#7c3aed] text-[9px] font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="text-[13px] text-white/40 hover:text-white/70 transition-colors">Log in</Link>
              <Link href="/sign-up" className="rounded-lg bg-[#c084fc] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#a855f7] transition-colors">Get Started</Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 text-white/60 hover:bg-white/[0.03]">
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-white/[0.05] bg-[#0c0c12]/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 px-5 py-4">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="py-2.5 text-sm text-white/40 hover:text-white">{link.label}</Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/[0.05] pt-4">
              {user ? (
                <Link href="/dashboard" className="flex items-center gap-2 rounded-lg bg-white/[0.03] py-2.5 px-3 text-sm text-white">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#c084fc] to-[#7c3aed] text-[9px] font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/sign-in" className="py-2.5 text-sm text-white/40">Log in</Link>
                  <Link href="/sign-up" className="rounded-lg bg-[#c084fc] py-2.5 text-center text-sm text-white">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
