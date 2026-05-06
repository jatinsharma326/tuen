"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function getBreadcrumbs(pathname: string) {
  if (pathname === "/dashboard") return [{ label: "Dashboard", href: "/dashboard" }];
  const segments = pathname.replace("/dashboard/", "").split("/");
  const map: Record<string, string> = {
    generate: "Image Generation",
    tts: "Text to Speech",
    transcribe: "Transcribe",
    generations: "History",
    "api-keys": "API Keys",
    docs: "API Docs",
    billing: "Billing",
    settings: "Settings",
  };
  return [
    { label: "Dashboard", href: "/dashboard" },
    { label: map[segments[0]] || segments[0], href: pathname },
  ];
}

export function DashboardHeader() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUser({
        name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User",
        email: data.user.email || "",
      });
    });
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border-subtle/60 bg-surface-0/80 px-6 backdrop-blur-xl">
      {/* Breadcrumbs */}
      <nav className="hidden items-center gap-1.5 md:flex">
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} className="text-text-muted" />}
            <Link
              href={crumb.href}
              className={`text-[13px] transition-colors ${
                i === breadcrumbs.length - 1
                  ? "font-medium text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {crumb.label}
            </Link>
          </div>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        <div className="relative hidden sm:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-56 rounded-xl border border-border-subtle bg-surface-1/60 pl-9 pr-3 text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-border-default focus:bg-surface-1 transition-all"
          />
        </div>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-surface-1/60 text-text-muted transition-colors hover:text-text-secondary hover:bg-surface-1">
          <Bell size={15} />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-accent" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-border-subtle/60">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-blue text-[11px] font-bold text-surface-0 shadow-lg shadow-accent/20">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="hidden lg:block">
            <p className="text-[12px] font-medium text-text-primary leading-none">{user?.name || "Loading..."}</p>
            <p className="text-[11px] text-text-muted mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
