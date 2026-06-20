"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, ChevronRight, LogOut } from "lucide-react";
import { createClient, getAuthUser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const breadcrumbs = getBreadcrumbs(pathname);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    getAuthUser(supabase).then((authUser) => {
      if (!authUser) return;
      setUser({
        name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
        email: authUser.email || "",
      });
    });
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/[0.05] bg-[#0c0c12]/90 px-6 backdrop-blur-xl">
      {/* Breadcrumbs */}
      <nav className="hidden items-center gap-1.5 md:flex">
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} className="text-white/20" />}
            <Link
              href={crumb.href}
              className={`text-[13px] transition-colors ${
                i === breadcrumbs.length - 1
                  ? "font-medium text-white"
                  : "text-white/30 hover:text-white/60"
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
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-56 rounded-xl border border-white/[0.08] bg-white/[0.03] pl-9 pr-3 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-[#c084fc]/30 focus:bg-white/[0.05] transition-all"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          />
        </div>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/30 transition-colors hover:text-white/60 hover:bg-white/[0.05]">
          <Bell size={15} />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#c084fc]" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.05]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#c084fc] to-[#7c3aed] text-[11px] font-bold text-white shadow-lg shadow-[#c084fc]/20">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="hidden lg:block">
            <p className="text-[12px] font-medium text-white leading-none">{user?.name || "Loading..."}</p>
            <p className="text-[11px] text-white/30 mt-0.5" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>{user?.email}</p>
          </div>
          <button
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              router.push("/");
              router.refresh();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:text-[#ef4444] hover:bg-[#ef4444]/5 transition-colors"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
