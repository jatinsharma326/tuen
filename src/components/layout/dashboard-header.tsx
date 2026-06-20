"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, ChevronRight, LogOut, CreditCard, Settings } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { createClient, getAuthUser } from "@/lib/supabase/client";

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

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/[0.05] bg-[#0c0c12]/90 px-4 backdrop-blur-xl sm:px-6">
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
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative hidden sm:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-56 rounded-xl border border-white/[0.08] bg-white/[0.03] pl-9 pr-16 text-[13px] text-white placeholder:text-white/25 outline-none transition-all focus:border-[#c084fc]/30 focus:bg-white/[0.05]"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-white/25" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
            ⌘K
          </span>
        </div>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/30 transition-colors hover:bg-white/[0.05] hover:text-white/60">
          <Bell size={15} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#c084fc]" />
        </button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] py-1.5 pl-1.5 pr-3 transition-colors hover:bg-white/[0.05]">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#c084fc] to-[#7c3aed] text-[11px] font-bold text-white shadow-lg shadow-[#c084fc]/20">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="hidden text-left lg:block">
                <p className="text-[12px] font-medium leading-none text-white">{user?.name || "Loading..."}</p>
                <p className="mt-0.5 text-[10px] text-white/30" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                  {user?.email}
                </p>
              </div>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 w-56 rounded-xl border border-white/[0.08] bg-[#12121a] p-1.5 shadow-2xl shadow-black/40 outline-none"
            >
              <div className="px-3 py-2">
                <p className="text-[13px] font-medium text-white">{user?.name || "User"}</p>
                <p className="text-[11px] text-white/30" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                  {user?.email}
                </p>
              </div>
              <DropdownMenu.Separator className="my-1 h-px bg-white/[0.06]" />
              <DropdownMenu.Item asChild>
                <button
                  onClick={() => router.push("/dashboard/settings")}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-white/60 outline-none transition-colors hover:bg-white/[0.03] hover:text-white"
                >
                  <Settings size={14} /> Settings
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <button
                  onClick={() => router.push("/dashboard/billing")}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-white/60 outline-none transition-colors hover:bg-white/[0.03] hover:text-white"
                >
                  <CreditCard size={14} /> Billing
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-white/[0.06]" />
              <DropdownMenu.Item asChild>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-[#ef4444] outline-none transition-colors hover:bg-[#ef4444]/5"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
