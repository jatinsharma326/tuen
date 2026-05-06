"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Image, Mic, FileAudio, Clock, History } from "lucide-react";
import { motion } from "framer-motion";

const SERVICE_META: Record<string, { label: string; icon: typeof Image; color: string }> = {
  image_gen: { label: "Image Generation", icon: Image, color: "#7c3aed" },
  tts: { label: "Text to Speech", icon: Mic, color: "#0891b2" },
  transcribe: { label: "Transcription", icon: FileAudio, color: "#d97706" },
};

interface LogEntry {
  id: string;
  service: string;
  credits_used: number;
  created_at: string;
}

export default function GenerationsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase
        .from("usage_logs")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })
        .limit(50)
        .then(({ data: rows }) => {
          setLogs((rows as LogEntry[]) || []);
          setLoading(false);
        });
    });
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2">
            <History size={18} className="text-text-secondary" />
          </div>
          <div>
            <h1 className="font-display text-[22px] font-bold tracking-tight">Usage History</h1>
            <p className="text-[13px] text-text-muted">Your recent API usage and credit consumption</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-2" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-default bg-surface-1/30">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2">
              <Clock size={22} className="text-text-muted" />
            </div>
            <p className="text-[12px] text-text-muted">No usage yet. Try generating something.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border-subtle">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-1/60">
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted">
                    Service
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted">
                    Credits
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const meta = SERVICE_META[log.service] || {
                    label: log.service,
                    icon: Image,
                    color: "#71717a",
                  };
                  const Icon = meta.icon;
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-border-subtle last:border-0 transition-colors hover:bg-surface-1"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{ background: `${meta.color}10` }}
                          >
                            <Icon size={14} style={{ color: meta.color }} />
                          </div>
                          <span className="text-[13px] font-medium text-text-secondary">
                            {meta.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums"
                          style={{ color: meta.color, background: `${meta.color}10` }}
                        >
                          −{log.credits_used}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-[12px] text-text-muted">
                          {formatDate(log.created_at)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
