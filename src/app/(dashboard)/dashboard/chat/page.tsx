"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { Loader2, Send, Bot, User, Sparkles, Brain, Lock } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const MODELS = [
  { label: "GLM-5.1", value: "zai-org/GLM-5.1", desc: "Zhipu AI latest LLM", minCredits: 2 },
  { label: "DeepSeek-V4 Pro", value: "deepseek-ai/DeepSeek-V4-Pro", desc: "Latest DeepSeek reasoning model", minCredits: 5 },
  { label: "DeepSeek-V3", value: "deepseek-ai/DeepSeek-V3", desc: "Large-scale MoE model", minCredits: 5 },
  { label: "Qwen3-30B-A3B", value: "Qwen/Qwen3-30B-A3B", desc: "Fast, efficient reasoning", minCredits: 2 },
];

interface Message {
  role: "user" | "assistant";
  content: string;
  reasoning: string;
}

function ChatForm() {
  const searchParams = useSearchParams();
  const initialModel = searchParams.get("model") || "zai-org/GLM-5.1";

  const [model, setModel] = useState(initialModel);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [credits, setCredits] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const qModel = searchParams.get("model");
    if (qModel) setModel(qModel);
  }, [searchParams]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("profiles").select("credits").eq("id", data.user.id).single()
        .then(({ data: p }) => { if (p) setCredits(p.credits); });
    });
  }, []);

  useEffect(() => {
    const qModel = searchParams.get("model");
    if (qModel) setModel(qModel);
  }, [searchParams]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const isLocked = (minCredits: number) => credits < minCredits;

  const send = async () => {
    const selected = MODELS.find((m) => m.value === model);
    if (!input.trim() || loading || (selected && isLocked(selected.minCredits))) return;
    const userMsg: Message = { role: "user", content: input, reasoning: "" };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError("");

    const assistantMsg: Message = { role: "assistant", content: "", reasoning: "" };
    setMessages([...newMessages, assistantMsg]);

    try {
      const res = await fetch("/api/services/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          model,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const jsonStr = trimmed.slice(6);
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta;
            const reasoningChunk = delta?.reasoning_content;
            const answerChunk = delta?.content;
            if (reasoningChunk) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  updated[updated.length - 1] = { ...last, reasoning: last.reasoning + reasoningChunk };
                }
                return updated;
              });
            }
            if (answerChunk) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  updated[updated.length - 1] = { ...last, content: last.content + answerChunk };
                }
                return updated;
              });
            }
          } catch {
            // skip unparseable chunks
          }
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setMessages((prev) => prev.filter((m) => m.content !== ""));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
              <Sparkles size={18} className="text-emerald-500" />
            </div>
            <div>
              <h1 className="font-display text-[22px] font-bold tracking-tight">LLM Chat</h1>
              <p className="text-[13px] text-text-muted">Chat with large language models via ModelScope</p>
            </div>
          </div>
          <span className="badge-premium bg-emerald-500/10 text-emerald-500 border-emerald-500/20">2 credits per run</span>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Chat area */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col">
          {/* Model selector */}
          <div className="mb-4">
            <div className="flex gap-2">
              {MODELS.map((m) => {
                const locked = isLocked(m.minCredits);
                return (
                  <button
                    key={m.value}
                    onClick={() => !locked && setModel(m.value)}
                    disabled={locked}
                    title={locked ? `Requires ${m.minCredits} credits (you have ${credits})` : undefined}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                      locked
                        ? "border border-border-subtle bg-surface-1 text-text-muted/50 cursor-not-allowed opacity-50"
                        : model === m.value
                          ? "bg-text-primary text-surface-0 shadow-lg shadow-black/5"
                          : "border border-border-subtle bg-surface-1 text-text-muted hover:text-text-secondary hover:border-border-default"
                    }`}
                  >
                    {locked && <Lock size={10} />}
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 min-h-[400px] max-h-[500px] overflow-y-auto rounded-2xl border border-border-subtle bg-surface-1/30 p-4 space-y-4 mb-4">
            {messages.length === 0 ? (
              <div className="flex h-full min-h-[350px] flex-col items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2">
                  <Bot size={22} className="text-text-muted" />
                </div>
                <p className="text-[12px] text-text-muted">Start a conversation</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Bot size={13} className="text-emerald-500" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                      m.role === "user"
                        ? "bg-text-primary text-surface-0"
                        : "border border-border-subtle bg-surface-1 text-text-primary"
                    }`}
                  >
                    {m.reasoning ? (
                      <details className="mb-2" open>
                        <summary className="flex cursor-pointer items-center gap-1.5 text-[11px] text-text-muted hover:text-text-secondary select-none">
                          <Brain size={12} /> Thinking...
                        </summary>
                        <div className="mt-2 whitespace-pre-wrap text-[12px] text-text-muted leading-relaxed border-l-2 border-border-subtle pl-3">
                          {m.reasoning}
                        </div>
                      </details>
                    ) : null}
                    {m.content ? (
                      <div className={`whitespace-pre-wrap ${m.reasoning ? "border-t border-border-subtle pt-2 mt-2" : ""}`}>
                        {m.content}
                      </div>
                    ) : (!m.reasoning && loading && i === messages.length - 1) ? (
                      <Loader2 size={14} className="animate-spin inline" />
                    ) : null}
                  </div>
                  {m.role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <User size={13} className="text-accent" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Enter to send)"
              rows={2}
              className="input-premium w-full resize-none"
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="btn-white shrink-0 rounded-xl px-4 py-2.5 text-[13px] disabled:opacity-40"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-[12px] text-error">
              {error}
            </div>
          )}
        </motion.div>

        {/* Model info sidebar */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">About</span>
            <div className="rounded-2xl border border-border-subtle bg-surface-1/50 p-5 space-y-4">
              <div>
                <p className="text-[13px] font-semibold text-text-primary">{MODELS.find((m) => m.value === model)?.label || model}</p>
                <p className="mt-1 text-[12px] text-text-muted">{MODELS.find((m) => m.value === model)?.desc}</p>
                {(() => {
                  const m = MODELS.find((x) => x.value === model);
                  if (m && isLocked(m.minCredits)) {
                    return <p className="mt-2 text-[11px] text-warning">Requires {m.minCredits} credits. You have {credits}.</p>;
                  }
                  return null;
                })()}
              </div>
              <div className="border-t border-border-subtle pt-4">
                <p className="text-[11px] text-text-muted">
                  Powered by <span className="text-text-secondary">ModelScope Inference API</span>. Streaming responses with reasoning support.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-text-muted" size={28} />
      </div>
    }>
      <ChatForm />
    </Suspense>
  );
}
