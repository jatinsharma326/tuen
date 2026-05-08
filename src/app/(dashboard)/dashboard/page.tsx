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
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { getPlan, SERVICE_LIMITS } from "@/lib/constants/plans";

const SERVICES_LIST = [
  {
    href: "/dashboard/generate",
    label: "Image Generation",
    desc: "Transform text into stunning visuals with FLUX & Stable Diffusion models.",
    icon: Image,
    limitKey: "image" as const,
    color: "#c084fc",
    colorAlt: "#3b82f6",
    tag: "200/day",
  },
  {
    href: "/dashboard/tts",
    label: "Text to Speech",
    desc: "Natural-sounding voice synthesis with multiple speaker options.",
    icon: Mic,
    limitKey: "tts" as const,
    color: "#06b6d4",
    colorAlt: "#0d9488",
    tag: "100/day",
  },
  {
    href: "/dashboard/transcribe",
    label: "Transcribe",
    desc: "Accurate speech recognition powered by Whisper-class models.",
    icon: FileAudio,
    limitKey: "transcribe" as const,
    color: "#f59e0b",
    colorAlt: "#b45309",
    tag: "200/day",
  },
];

interface LogEntry {
  id: string;
  service: string;
  credits_used: number;
  created_at: string;
}

const SERVICE_LABELS: Record<string, { label: string; icon: typeof Image; color: string }> = {
  image_gen: { label: "Image Generation", icon: Image, color: "#c084fc" },
  tts: { label: "Text to Speech", icon: Mic, color: "#06b6d4" },
  transcribe: { label: "Transcription", icon: FileAudio, color: "#f59e0b" },
  llm: { label: "LLM Chat", icon: Sparkles, color: "#10b981" },
  nucleus_image: { label: "Nucleus Image", icon: Image, color: "#c084fc" },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
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
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setName(
        data.user.user_metadata?.full_name ||
          data.user.email?.split("@")[0] ||
          ""
      );

      supabase
        .from("profiles")
        .select("plan")
        .eq("id", data.user.id)
        .single()
        .then(({ data: p }) => {
          setPlanId(p?.plan ?? "trial");
        });

      supabase
        .from("api_keys")
        .select("id", { count: "exact", head: true })
        .eq("user_id", data.user.id)
        .then(({ count }) => setApiKeyCount(count ?? 0));

      supabase
        .from("usage_logs")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })
        .limit(5)
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

  const stats = [
    {
      label: "Requests Today",
      value: loaded ? dailyCounts.daily.toLocaleString() : "—",
      sub: `of ${plan.monthlyTotalLimit.toLocaleString()} monthly limit`,
      icon: Zap,
      color: "#c084fc",
      progress: monthlyPct,
    },
    {
      label: "Plan",
      value: plan.name,
      sub: plan.priceCents === 0 ? "Free trial" : "$19/month",
      icon: TrendingUp,
      color: "#3b82f6",
      link: plan.priceCents === 0 ? "/dashboard/billing" : undefined,
      badge: plan.priceCents === 0 ? "Upgrade" : undefined,
    },
    {
      label: "API Keys",
      value: loaded ? String(apiKeyCount) : "—",
      sub: plan.maxApiKeys === 999 ? "Unlimited" : `${plan.maxApiKeys} max`,
      icon: Key,
      color: "#06b6d4",
    },
    {
      label: "Recent Usage",
      value: loaded ? String(totalUsedToday) : "—",
      sub: "requests in last 5 runs",
      icon: Activity,
      color: "#f59e0b",
    },
  ];

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full opacity-[0.08]"
        style={{ background: "radial-gradient(ellipse, #c084fc, transparent 70%)" }}
      />

      <div className="relative space-y-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-end gap-3">
            <h1 className="font-display text-[26px] font-extrabold tracking-tight md:text-[32px]">
              {name ? (
                <>
                  {greeting()},{" "}
                  <span className="bg-gradient-to-r from-accent via-accent-blue to-accent-light bg-clip-text text-transparent">
                    {name}
                  </span>
                </>
              ) : (
                "Dashboard"
              )}
            </h1>
            <span className="relative mb-1.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
          </div>
          <p className="mt-2 text-[13px] text-white/30">
            Overview of your usage, services, and recent activity.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                variants={fadeUp}
                custom={i}
                className="group relative overflow-hidden rounded-2xl rounded-2xl border border-white/[0.05] bg-[#12121a] p-5 transition-all duration-300 hover:border-white/[0.08]"
                style={{
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.3)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 48px -12px ${s.color}18`;
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${s.color}30`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.3)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "";
                }}
              >
                <div
                  className="absolute -right-6 -top-6 h-28 w-28 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: `${s.color}12` }}
                />

                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg"
                        style={{ background: `${s.color}12` }}
                      >
                        <Icon size={14} style={{ color: s.color }} />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/30">
                        {s.label}
                      </span>
                    </div>
                    <p className="mt-3 font-display text-[24px] font-extrabold tabular-nums leading-none tracking-tight">
                      {s.value}
                    </p>
                    <p className="mt-1.5 text-[11px] text-white/30">
                      {s.link ? (
                        <Link href={s.link} className="hover:text-accent transition-colors inline-flex items-center gap-0.5">
                          {s.sub} <ArrowUpRight size={9} />
                        </Link>
                      ) : (
                        s.sub
                      )}
                    </p>
                    {s.badge && (
                      <Link href="/dashboard/billing" className="mt-2 inline-flex items-center gap-1 rounded-lg bg-accent/10 px-2.5 py-1 text-[10px] font-semibold text-accent hover:bg-accent/20 transition-colors">
                        {s.badge} <ArrowUpRight size={9} />
                      </Link>
                    )}
                  </div>
                </div>

                {s.progress !== undefined && (
                  <div className="relative z-10 mt-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.03]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.progress}%` }}
                        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${s.color}, #3b82f6)`,
                          boxShadow: `0 0 12px ${s.color}35`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-5 flex items-center justify-between"
          >
            <div>
              <h2 className="font-display text-[18px] font-bold tracking-tight">Services</h2>
              <p className="mt-0.5 text-[12px] text-white/30">Choose a model and start building</p>
            </div>
            <span className="badge-premium bg-white/[0.03] text-white/30 border-white/[0.08]">
              {SERVICES_LIST.length} available
            </span>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {SERVICES_LIST.map((s, i) => {
              const Icon = s.icon;
              const limit = SERVICE_LIMITS[s.limitKey];
              return (
                <motion.div key={s.href} variants={fadeUp} custom={i + 4}>
                  <Link
                    href={s.href}
                    className="group relative flex flex-col overflow-hidden rounded-2xl rounded-2xl border border-white/[0.05] bg-[#12121a] p-6 transition-all duration-300 hover:border-white/[0.08]"
                    style={{
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.3)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.05), 0 12px 48px -12px ${s.color}15`;
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = `${s.color}30`;
                      (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.3)";
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = "";
                      (e.currentTarget as HTMLAnchorElement).style.transform = "";
                    }}
                  >
                    <div
                      className="absolute -right-12 -top-12 h-40 w-40 rounded-full blur-[60px] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                      style={{ background: `${s.color}10` }}
                    />

                    <div
                      className="absolute inset-x-0 top-0 h-[1px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{ background: `linear-gradient(90deg, transparent, ${s.color}50, transparent)` }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between">
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-border-subtle shadow-sm"
                          style={{ background: `linear-gradient(135deg, ${s.color}15, ${s.colorAlt}08)` }}
                        >
                          <Icon size={20} style={{ color: s.color }} />
                        </div>
                        <span
                          className="badge-premium"
                          style={{
                            color: s.color,
                            background: `${s.color}08`,
                            borderColor: `${s.color}18`,
                          }}
                        >
                          {s.tag}
                        </span>
                      </div>

                      <h3 className="mt-5 font-display text-[16px] font-bold tracking-tight text-white">
                        {s.label}
                      </h3>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-white/40">
                        {s.desc}
                      </p>

                      <div className="mt-6 flex items-center justify-between border-t border-white/[0.05] pt-4">
                        <span className="text-[11px] tabular-nums text-white/30">
                          <span className="font-semibold text-white/70">{limit.daily}</span> {limit.label} per day
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-white/30 transition-all duration-300 group-hover:text-white group-hover:gap-2">
                          Launch <ArrowRight size={11} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-white/30" />
              <h2 className="font-display text-[18px] font-bold tracking-tight">Recent Activity</h2>
            </div>
            <Link
              href="/dashboard/generations"
              className="flex items-center gap-1.5 rounded-xl bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-white/30 ring-1 ring-border-default transition-all hover:text-white/70 hover:ring-border-strong"
            >
              View all <ArrowUpRight size={10} />
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <div className="flex h-36 flex-col items-center justify-center gap-3 rounded-2xl rounded-2xl border border-white/[0.05] bg-[#12121a]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03]">
                <Sparkles size={18} className="text-white/30" />
              </div>
              <p className="text-[12px] text-white/30">
                No activity yet — try a service above
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl rounded-2xl border border-white/[0.05] bg-[#12121a]">
              {recentLogs.map((log, i) => {
                const meta = SERVICE_LABELS[log.service] || {
                  label: log.service,
                  icon: Image,
                  color: "#71717a",
                };
                const LogIcon = meta.icon;
                return (
                  <div
                    key={log.id}
                    className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#12121a] ${
                      i < recentLogs.length - 1 ? "border-b border-white/[0.05]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-border-default"
                        style={{ background: `${meta.color}08` }}
                      >
                        <LogIcon size={15} style={{ color: meta.color }} />
                      </div>
                      <div>
                        <span className="text-[13px] font-medium text-white/70">
                          {meta.label}
                        </span>
                        <p className="text-[11px] text-white/30">{timeAgo(log.created_at)}</p>
                      </div>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums"
                      style={{
                        color: meta.color,
                        background: `${meta.color}08`,
                      }}
                    >
                      1 req
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid gap-3 sm:grid-cols-3"
        >
          {[
            { href: "/dashboard/api-keys", label: "API Keys", sub: "Manage & rotate keys", icon: Key, color: "#06b6d4" },
            { href: "/dashboard/docs", label: "API Docs", sub: "Integration guides", icon: BookOpen, color: "#3b82f6" },
            { href: "/dashboard/billing", label: "Billing", sub: "Plans & usage", icon: CreditCard, color: "#c084fc" },
          ].map((q) => {
            const QIcon = q.icon;
            return (
              <Link
                key={q.href}
                href={q.href}
                className="group flex items-center gap-4 rounded-2xl rounded-2xl border border-white/[0.05] bg-[#12121a] px-5 py-4 transition-all duration-300 hover:bg-[#12121a]"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = `${q.color}25`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "";
                }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-border-default transition-transform duration-300 group-hover:scale-105"
                  style={{ background: `${q.color}08` }}
                >
                  <QIcon size={17} style={{ color: q.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-white/70 group-hover:text-white transition-colors">
                    {q.label}
                  </p>
                  <p className="text-[11px] text-white/30">{q.sub}</p>
                </div>
                <ArrowRight size={14} className="text-white/30 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
