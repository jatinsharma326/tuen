"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils/cn";
import { NAV_LINKS } from "@/lib/constants/navigation";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header className={cn(
      "fixed top-0 z-50 w-full transition-all duration-300",
      scrolled ? "border-b border-border-subtle/60 bg-surface-0/80 backdrop-blur-xl" : "bg-transparent",
    )}>
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-yellow shadow-lg shadow-accent/25">
            <span className="text-[12px] font-bold text-surface-0">A</span>
          </div>
          <span className="font-display text-[16px] font-semibold tracking-tight">aiops</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={cn(
              "rounded-lg px-3.5 py-2 text-[13px] transition-colors",
              pathname === link.href ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary",
            )}>{link.label}</Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link href="/sign-in" className="text-[13px] text-text-tertiary hover:text-text-secondary transition-colors">Log in</Link>
          <Link href="/sign-up" className="btn-primary rounded-lg px-4 py-2 text-[13px]">Get Started</Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 text-text-secondary hover:bg-surface-1">
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border-subtle bg-surface-0/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 px-5 py-4">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="py-2.5 text-sm text-text-tertiary hover:text-text-primary">{link.label}</Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border-subtle pt-4">
              <Link href="/sign-in" className="py-2.5 text-sm text-text-tertiary">Log in</Link>
              <Link href="/sign-up" className="btn-primary rounded-lg py-2.5 text-center text-sm">Get Started</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
