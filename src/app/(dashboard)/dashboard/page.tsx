"use client";

import Link from "next/link";
import {
  Image,
  Mic,
  FileAudio,
  ArrowRight,
  ArrowUpRight,
  Zap,
  Clock,
  Key,
  TrendingUp,
  BookOpen,
  CreditCard,
  Sparkles,
  Activity,
  ChevronRight,
  Plus,
  Crown,
  Rocket,
  Gauge,
  ShieldCheck,
  TerminalSquare,
  BrainCircuit,
  Layers3,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient, getAuthUser } from "@/lib/supabase/client";
import { getPlan, SERVICE_LIMITS } from "@/lib/constants/plans";

const SERVICES_LIST = [
  {
    href: "/dashboard/generate",
    label: "Image Generation",
    short: "Visual Forge",
    desc: "Generate high-impact images with FLUX and diffusion firepower.",
    icon: Image,
    limitKey: "image" as const,
    color: "#c084fc",
    gradient: "from-[#c084fc] via-[#7c3aed] to-[#ec4899]",
    command: "txt2img.launch",
  },
  {
    href: "/dashboard/tts",
    label: "Text to Speech",
    short: "Voice Engine",
    desc: "Turn scripts into clean synthetic speech with production voices.",
    icon: Mic,
    limitKey: "tts" as const,
    color: "#06b6d4",
    gradient: "from-[#06b6d4] via-[#2563eb] to-[#22d3ee]",
    command: "audio.synthesize",
  },
  {
    href: "/dashboard/transcribe",
    label: "Transcribe",
    short: "Signal Decoder",
    desc: "Decode audio into accurate text with Whisper-class recognition.",
    icon: FileAudio,
    limitKey: "transcribe" as const,
    color: "#f59e0b",
    gradient: "from-[#f59e0b] via-[#ef4444] to-[#f97316]",
    command: "speech.decode",
  },
];

const MODEL_STACK = ["FLUX schnell", "VibeVoice", "Whisper v3", "Nucleus", "LLM Core"];

interface LogEntry {
  id: string;
  service: string;
  credits_used: number;
  created_at: string;
}

const SERVICE_LABELS: Record<string, { label: string; icon: typeof Image; color: string }> = {
  image_gen: { label: "Image Gen", icon: Image, color: "#c084fc" },
  tts: { label: "TTS", icon: Mic, color: "#06b6d4" },
  transcribe: { label: "Transcribe", icon: FileAudio, color: "#f59e0b" },
  llm: { label: "LLM", icon: Sparkles, color: "#10b981" },
  nucleus_image: { label: "Nucleus", icon: Image, color: "#c084fc" },
};

export default function DashboardPage() {
  const [name, setName] = useState("");
  const [planId, setPlanId] = useState("trial");
  const [apiKeyCount, setApiKeyCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
  const [totalUsedToday, setTotalUsedToday] = useState(0);
  const [dailyCounts, setDailyCounts] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    getAuthUser(supabase).then((authUser) => {
      if (!authUser) {
        setLoaded(true);
        return;
      }
      setName(authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "");
      supabase.from("profiles").select("plan").eq("id", authUser.id).single()
        .then(({ data: p }) => setPlanId(p?.plan ?? "trial"));
      supabase.from("api_keys").select("id", { count: "exact", head: true }).eq("user_id", authUser.id)
        .then(({ count }) => setApiKeyCount(count ?? 0));
      supabase.from("usage_logs").select("*").eq("user_id", authUser.id).order("created_at", { ascending: false }).limit(5)
        .then(({ data: rows }) => {
          const logs = (rows as LogEntry[]) || [];
          setRecentLogs(logs);
          setTotalUsedToday(logs.reduce((s, l) => s + l.credits_used, 0));
        });
      fetch("/api/usage/counts").then(r => r.json()).then(setDailyCounts).catch(() => {});
      setLoaded(true);
    });
  }, []);

  const plan = getPlan(planId);
  const monthlyPct = plan.monthlyTotalLimit > 0
    ? Math.min(100, (dailyCounts.monthly / plan.monthlyTotalLimit) * 100)
    : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const statCards = [
    { label: "Requests Today", value: loaded ? dailyCounts.daily.toLocaleString() : "-", sub: "live throughput", icon: Zap, color: "#c084fc" },
    { label: "Plan Tier", value: plan.name, sub: plan.priceCents === 0 ? "unlock full throttle" : "$19/mo active", icon: Crown, color: "#06b6d4", link: "/dashboard/billing", badge: plan.priceCents === 0 ? "Upgrade" : undefined },
    { label: "API Keys", value: loaded ? String(apiKeyCount) : "-", sub: `${plan.maxApiKeys} max armed`, icon: Key, color: "#f59e0b" },
    { label: "Recent Burn", value: loaded ? String(totalUsedToday) : "-", sub: "credits last 5 runs", icon: Activity, color: "#10b981" },
  ];

  const quickLinks = [
    { href: "/dashboard/api-keys", label: "API Keys", sub: "Manage & rotate", icon: Key, color: "#06b6d4" },
    { href: "/dashboard/docs", label: "API Docs", sub: "Integration guides", icon: BookOpen, color: "#c084fc" },
    { href: "/dashboard/billing", label: "Billing", sub: "Plans & usage", icon: CreditCard, color: "#10b981" },
  ];

  return (
    <div className="relative space-y-8">
      <div className="pointer-events-none absolute -left-28 top-24 h-72 w-72 rounded-full bg-[#c084fc]/10 blur-[100px]" />
      <div className="pointer-events-none absolute right-0 top-[420px] h-80 w-80 rounded-full bg-[#06b6d4]/10 blur-[120px]" />

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/[0.09] bg-[#080810]/80 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-7 lg:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_20%,rgba(192,132,252,0.3),transparent_28%),radial-gradient(circle_at_18%_96%,rgba(6,182,212,0.18),transparent_34%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#c084fc]/20 blur-[90px]" />
        <div className="absolute bottom-0 right-0 h-40 w-2/3 bg-gradient-to-l from-[#7c3aed]/20 to-transparent blur-3xl" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-stretch">
          <div className="flex min-h-[340px] flex-col justify-between">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c084fc]/25 bg-[#c084fc]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#d8b4fe] shadow-lg shadow-[#c084fc]/10" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10b981]" />
                </span>
                Model Command Center
              </div>
              <h1 className="max-w-3xl font-display text-[38px] font-black leading-[0.92] tracking-[-0.06em] text-white sm:text-[58px] lg:text-[72px]">
                {name ? (
                  <>
                    {greeting()},{" "}
                    <span className="bg-gradient-to-r from-[#f5d0fe] via-[#c084fc] to-[#22d3ee] bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(192,132,252,0.25)]">
                      {name}
                    </span>
                  </>
                ) : (
                  "Launch the arsenal."
                )}
              </h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-7 text-white/52 sm:text-[16px]" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                Pick a model, spend credits with intent, and ship media pipelines from one ruthless control surface.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/generate"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f0abfc] via-[#c084fc] to-[#06b6d4] px-5 py-3 text-[13px] font-black uppercase tracking-[0.12em] text-[#07070d] shadow-[0_0_42px_rgba(192,132,252,0.35)] transition-all hover:scale-[1.015] hover:shadow-[0_0_58px_rgba(6,182,212,0.32)] active:scale-[0.99]"
              >
                <Plus size={15} />
                New generation
                <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/dashboard/docs"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-5 py-3 text-[13px] font-bold text-white/70 transition-all hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-white"
              >
                <TerminalSquare size={15} />
                API playbook
              </Link>
            </div>
          </div>

          <div className="relative min-h-[320px] overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-black/30 p-4 shadow-inner shadow-white/[0.03]">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_32%,rgba(6,182,212,0.08))]" />
            <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c084fc]/25 bg-[#c084fc]/10 blur-sm" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 backdrop-blur">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>System Load</p>
                  <p className="mt-1 font-display text-2xl font-black text-white">{Math.round(monthlyPct)}%</p>
                </div>
                <Gauge className="text-[#06b6d4]" size={28} />
              </div>

              <div className="space-y-2">
                {MODEL_STACK.map((model, i) => (
                  <motion.div
                    key={model}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 + i * 0.06 }}
                    className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-[#090912]/70 px-3.5 py-2.5 backdrop-blur"
                  >
                    <span className="flex items-center gap-2 text-[12px] font-semibold text-white/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] shadow-[0_0_14px_rgba(16,185,129,0.8)]" />
                      {model}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/25" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>ready</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#0a0a12]/80 p-5 shadow-xl shadow-black/20 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.16]"
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40" style={{ backgroundColor: s.color }} />
              <div className="absolute inset-x-0 top-0 h-px opacity-70" style={{ background: `linear-gradient(90deg, transparent, ${s.color}80, transparent)` }} />
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08]" style={{ background: `${s.color}12` }}>
                    <Icon size={18} style={{ color: s.color }} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/25">{s.label}</span>
                </div>
                <p className="mt-5 font-display text-[32px] font-black tabular-nums leading-none tracking-[-0.05em] text-white">
                  {s.value}
                </p>
                <p className="mt-2 text-[12px] text-white/35">
                  {s.link ? (
                    <Link href={s.link} className="inline-flex items-center gap-0.5 transition-colors hover:text-[#c084fc]">
                      {s.sub} <ArrowUpRight size={10} />
                    </Link>
                  ) : (
                    s.sub
                  )}
                </p>
                {s.badge && (
                  <Link
                    href="/dashboard/billing"
                    className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#c084fc]/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#d8b4fe] transition-colors hover:bg-[#c084fc]/20"
                  >
                    {s.badge} <ArrowUpRight size={9} />
                  </Link>
                )}
              </div>
              {s.label === "Requests Today" && (
                <div className="relative z-10 mt-5">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${monthlyPct}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${s.color}, #06b6d4)` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </section>

      {/* Two-column layout */}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Services */}
        <section className="space-y-5">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-[24px] font-black tracking-[-0.04em] text-white">Model arsenal</h2>
              <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-white/30" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                Choose a weapon and execute
              </p>
            </div>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
              {SERVICES_LIST.length} services
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {SERVICES_LIST.map((s, i) => {
              const Icon = s.icon;
              const limit = SERVICE_LIMITS[s.limitKey];
              return (
                <motion.div
                  key={s.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 + i * 0.08 }}
                >
                  <Link
                    href={s.href}
                    className="group relative flex min-h-[280px] flex-col overflow-hidden rounded-[1.65rem] border border-white/[0.08] bg-[#090912]/85 p-5 shadow-xl shadow-black/25 backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-white/[0.18] hover:shadow-2xl"
                  >
                    <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-r ${s.gradient} opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-35`} />
                    <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full opacity-20 blur-[60px] transition-opacity duration-700 group-hover:opacity-70" style={{ background: s.color }} />
                    <div className="absolute inset-x-0 top-0 h-[1px] opacity-100" style={{ background: `linear-gradient(90deg, transparent, ${s.color}80, transparent)` }} />
                    <div className="relative z-10 flex flex-1 flex-col">
                      <div className="flex items-start justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.10] shadow-lg" style={{ background: `linear-gradient(135deg, ${s.color}24, rgba(255,255,255,0.02))`, boxShadow: `0 0 28px ${s.color}20` }}>
                          <Icon size={24} style={{ color: s.color }} />
                        </div>
                        <span className="rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider" style={{ color: s.color, background: `${s.color}10`, borderColor: `${s.color}28` }}>
                          {limit.daily}/day
                        </span>
                      </div>
                      <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-white/25" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>{s.command}</p>
                      <h3 className="mt-2 font-display text-[26px] font-black leading-none tracking-[-0.05em] text-white">{s.short}</h3>
                      <p className="mt-3 text-[13px] leading-relaxed text-white/45">{s.desc}</p>
                      <div className="mt-auto flex items-center justify-between border-t border-white/[0.07] pt-4">
                        <span className="text-[11px] font-black uppercase tracking-[0.14em] text-white/35">Deploy</span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/35 transition-all group-hover:border-white/[0.18] group-hover:bg-white/[0.08] group-hover:text-white">
                          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Right sidebar */}
        <aside className="space-y-6">
          {/* Usage */}
          <div className="relative overflow-hidden rounded-[1.65rem] border border-white/[0.08] bg-[#090912]/85 p-5 shadow-xl shadow-black/25 backdrop-blur">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#06b6d4]/15 blur-3xl" />
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp size={15} className="text-[#c084fc]" />
              <h3 className="font-display text-[17px] font-black tracking-[-0.03em] text-white">Usage cockpit</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[12px]">
                  <span className="text-white/45">Monthly runway</span>
                  <span className="tabular-nums text-white/60">
                    {dailyCounts.monthly.toLocaleString()} / {plan.monthlyTotalLimit.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${monthlyPct}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#c084fc] to-[#06b6d4]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.035] p-3">
                  <p className="text-[11px] text-white/30">Weekly strike</p>
                  <p className="mt-1 font-display text-[20px] font-black tabular-nums text-white">{dailyCounts.weekly.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.035] p-3">
                  <p className="text-[11px] text-white/30">Today</p>
                  <p className="mt-1 font-display text-[20px] font-black tabular-nums text-white">{dailyCounts.daily.toLocaleString()}</p>
                </div>
              </div>
              <Link
                href="/dashboard/billing"
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-[12px] font-bold text-white/45 transition-all hover:border-white/[0.16] hover:text-white"
              >
                View plan details <ArrowUpRight size={11} />
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-[1.65rem] border border-white/[0.08] bg-[#090912]/85 p-5 shadow-xl shadow-black/25 backdrop-blur">
            <div className="mb-4 flex items-center gap-2">
              <Rocket size={15} className="text-[#06b6d4]" />
              <h3 className="font-display text-[17px] font-black tracking-[-0.03em] text-white">Fast routes</h3>
            </div>
            <div className="space-y-1">
              {quickLinks.map((q) => {
                const QIcon = q.icon;
                return (
                  <Link
                    key={q.href}
                    href={q.href}
                    className="group flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors hover:bg-white/[0.04]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07]" style={{ background: `${q.color}10` }}>
                      <QIcon size={15} style={{ color: q.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-white/70 transition-colors group-hover:text-white">{q.label}</p>
                      <p className="text-[11px] text-white/30">{q.sub}</p>
                    </div>
                    <ChevronRight size={14} className="text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-white/40" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.65rem] border border-[#10b981]/15 bg-[#10b981]/[0.045] p-5 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#10b981]/20 bg-[#10b981]/10">
                <ShieldCheck size={19} className="text-[#10b981]" />
              </div>
              <div>
                <h3 className="font-display text-[15px] font-black tracking-[-0.03em] text-white">System armed</h3>
                <p className="text-[11px] text-white/35">Auth, billing, and API routing online.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-white/40">
              <div className="rounded-xl border border-white/[0.05] bg-black/15 px-3 py-2"><BrainCircuit size={13} className="mb-1 text-[#c084fc]" /> Models ready</div>
              <div className="rounded-xl border border-white/[0.05] bg-black/15 px-3 py-2"><Layers3 size={13} className="mb-1 text-[#06b6d4]" /> API unified</div>
            </div>
          </div>
        </aside>
      </div>

      {/* Recent Activity */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-white/30" />
            <h2 className="font-display text-[24px] font-black tracking-[-0.04em] text-white">Recent activity</h2>
          </div>
          <Link href="/dashboard/generations" className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[11px] font-bold text-white/35 transition-all hover:border-white/[0.16] hover:text-white/70">
            View all <ArrowUpRight size={10} />
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div className="relative flex h-56 flex-col items-center justify-center gap-3 overflow-hidden rounded-[1.65rem] border border-dashed border-white/[0.12] bg-[#090912]/70">
            <div className="absolute h-44 w-44 rounded-full bg-[#c084fc]/10 blur-3xl" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
              <Sparkles size={22} className="text-white/35" />
            </div>
            <p className="relative text-[13px] text-white/35" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
              No activity yet. Fire the first model run.
            </p>
            <Link
              href="/dashboard/generate"
              className="relative mt-1 inline-flex items-center gap-1 rounded-xl bg-[#c084fc]/12 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#d8b4fe] transition-colors hover:bg-[#c084fc]/20"
            >
              Create first run <ArrowRight size={11} />
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.65rem] border border-white/[0.08] bg-[#090912]/85 shadow-xl shadow-black/25 backdrop-blur">
            {recentLogs.map((log, i) => {
              const meta = SERVICE_LABELS[log.service] || { label: log.service, icon: Image, color: "#71717a" };
              const LogIcon = meta.icon;
              return (
                <div
                  key={log.id}
                  className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-white/[0.035] ${i < recentLogs.length - 1 ? "border-b border-white/[0.06]" : ""}`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.07]" style={{ background: `${meta.color}10` }}>
                      <LogIcon size={15} style={{ color: meta.color }} />
                    </div>
                    <div>
                      <span className="text-[13px] font-bold text-white/75">{meta.label}</span>
                      <p className="text-[11px] text-white/30">{timeAgo(log.created_at)}</p>
                    </div>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-black tabular-nums" style={{ color: meta.color, background: `${meta.color}10` }}>
                    {log.credits_used} cr
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
