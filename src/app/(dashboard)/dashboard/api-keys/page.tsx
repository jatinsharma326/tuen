"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Trash2, Plus, Key, Shield, Eye, EyeOff, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { createClient, getAuthUser } from "@/lib/supabase/client";
import { getPlan } from "@/lib/constants/plans";

interface ApiKey {
  id: string;
  key: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [planId, setPlanId] = useState("pro");
  const [copiedId, setCopiedId] = useState("");
  const [revealedId, setRevealedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [origin] = useState(() => typeof window !== "undefined" ? window.location.origin : "");
  const plan = getPlan(planId);

  const fetchKeys = async () => {
    const supabase = createClient();
    const user = await getAuthUser(supabase);
    if (!user) {
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
    setPlanId(profile?.plan || "pro");
    const { data } = await supabase.from("api_keys").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setKeys((data as ApiKey[]) || []);
    setLoading(false);
  };

  useEffect(() => { void fetchKeys(); }, []);

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 1500);
  };

  const createKey = async () => {
    setCreating(true);
    const supabase = createClient();
    const user = await getAuthUser(supabase);
    if (!user) {
      setCreating(false);
      return;
    }
    const key = "tuen_sk_" + Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map((b) => b.toString(16).padStart(2, "0")).join("");
    await supabase.from("api_keys").insert({ user_id: user.id, key, name: newName || "Untitled" });
    setNewName("");
    setCreating(false);
    fetchKeys();
  };

  const deleteKey = async (id: string) => {
    if (keys.length <= 1) return;
    const supabase = createClient();
    await supabase.from("api_keys").delete().eq("id", id);
    fetchKeys();
  };

  const atLimit = keys.length >= plan.maxApiKeys;

  const timeAgo = (iso: string | null) => {
    if (!iso) return "Never used";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const exampleCode = `curl -X POST ${origin}/api/services/image_gen \\
  -H "Authorization: Bearer ${keys[0]?.key || "tuen_sk_xxx"}" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "a cat astronaut"}'`;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-cyan/10">
              <Key size={18} className="text-accent-cyan" />
            </div>
            <div>
              <h1 className="font-display text-[22px] font-bold tracking-tight">API Keys</h1>
              <p className="text-[13px] text-white/30">
                {plan.name} plan — {keys.length}/{plan.maxApiKeys === 999 ? "∞" : plan.maxApiKeys} keys
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Keys list */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
        {loading ? (
          [1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-white/[0.03]" />)
        ) : keys.length === 0 ? (
          <div className="flex h-36 flex-col items-center justify-center gap-3 rounded-2xl rounded-2xl border border-white/[0.05] bg-[#12121a]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03]">
              <Key size={18} className="text-white/30" />
            </div>
            <p className="text-[12px] text-white/30">No API keys yet. Create one below.</p>
          </div>
        ) : (
          keys.map((k) => {
            const isRevealed = revealedId === k.id;
            const isCopied = copiedId === k.id;
            return (
              <div
                key={k.id}
                className="group flex items-center gap-4 rounded-xl rounded-2xl border border-white/[0.05] bg-[#12121a] px-5 py-4 transition-all hover:border-white/[0.05]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.03]">
                  <Shield size={15} className="text-white/30" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-white/70">{k.name}</p>
                    <span className="text-[10px] text-white/30">{timeAgo(k.last_used_at)}</span>
                  </div>
                  <code className="block truncate font-mono text-[11px] text-white/30">
                    {isRevealed ? k.key : k.key.slice(0, 12) + "••••••••••••••••••••"}
                  </code>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setRevealedId(isRevealed ? "" : k.id)}
                    className="rounded-lg p-2 text-white/30 hover:text-white hover:bg-white/[0.03] transition-colors"
                    title={isRevealed ? "Hide key" : "Reveal key"}
                  >
                    {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => copyKey(k.id, k.key)}
                    className="rounded-lg p-2 text-white/30 hover:text-white hover:bg-white/[0.03] transition-colors"
                    title="Copy key"
                  >
                    {isCopied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  </button>
                  {keys.length > 1 && (
                    <button
                      onClick={() => deleteKey(k.id)}
                      className="rounded-lg p-2 text-white/30 hover:text-error hover:bg-error/5 transition-colors"
                      title="Delete key"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </motion.div>

      {/* Create key */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {!atLimit ? (
          <div className="flex gap-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Key name (e.g. Production)"
              className="input-premium h-10 flex-1"
              onKeyDown={(e) => { if (e.key === "Enter") createKey(); }}
            />
            <button
              onClick={createKey}
              disabled={creating}
              className="btn-white flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] disabled:opacity-40"
            >
              <Plus size={14} /> Create key
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-white/[0.05] bg-[#12121a]/50 px-5 py-4">
            <p className="text-[13px] text-white/30">
              You have reached the key limit for your plan. <span className="text-white/70">Upgrade</span> for more.
            </p>
          </div>
        )}
      </motion.div>

      {/* Usage example */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="overflow-hidden rounded-2xl border border-white/[0.05]"
      >
        <div className="flex items-center justify-between border-b border-white/[0.05] bg-[#12121a]/60 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/30">Usage example</span>
            <span className="badge-premium bg-white/[0.03] text-white/30 border-white/[0.08]">curl</span>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(exampleCode)}
            className="text-white/30 hover:text-white/70 transition-colors"
            title="Copy example"
          >
            <Copy size={12} />
          </button>
        </div>
        <pre className="overflow-x-auto bg-[#12121a]/30 p-5 font-mono text-[12px] leading-relaxed text-white/40">{exampleCode}</pre>
        <div className="border-t border-white/[0.05] bg-[#12121a]/30 px-5 py-3">
          <p className="text-[11px] text-white/30">
            Use this key in the <span className="font-mono text-white/70">Authorization</span> header for any service endpoint.
          </p>
        </div>
      </motion.div>

      {/* Endpoint links */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid gap-3 sm:grid-cols-3"
      >
        {[
          { label: "Image Generation", path: "/api/services/image_gen", color: "#7c3aed" },
          { label: "Text to Speech", path: "/api/services/tts", color: "#0891b2" },
          { label: "Transcription", path: "/api/services/transcribe", color: "#d97706" },
        ].map((ep) => (
          <div
            key={ep.path}
            className="flex items-center gap-3 rounded-xl rounded-xl border border-white/[0.03] bg-white/[0.02] px-4 py-3"
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ background: ep.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-white/70">{ep.label}</p>
              <p className="text-[10px] font-mono text-white/30 truncate">{ep.path}</p>
            </div>
            <a
              href={`${origin}${ep.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white/70 transition-colors"
            >
              <ExternalLink size={12} />
            </a>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
