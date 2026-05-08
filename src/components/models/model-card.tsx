"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Image, Mic, FileAudio, Video, Sparkles, Wand2, Type } from "lucide-react";
import type { ModelDefinition } from "@/types/models";

const CATEGORY_META: Record<string, { icon: typeof Image; color: string; label: string }> = {
  "text-to-image": { icon: Image, color: "#c084fc", label: "Image" },
  "image-to-video": { icon: Video, color: "#06b6d4", label: "Video" },
  "text-to-video": { icon: Video, color: "#06b6d4", label: "Video" },
  "text-to-speech": { icon: Mic, color: "#f59e0b", label: "Audio" },
  "llm": { icon: Sparkles, color: "#10b981", label: "LLM" },
  "upscaling": { icon: Wand2, color: "#c084fc", label: "Upscale" },
  "image-editing": { icon: Type, color: "#06b6d4", label: "Edit" },
};

export function ModelCard({ model }: { model: ModelDefinition }) {
  const slug = model.id.replace(/\//g, "--");
  const meta = CATEGORY_META[model.category] || { icon: Sparkles, color: "#71717a", label: model.category };
  const Icon = meta.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/models/${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.05] bg-[#12121a] p-5 transition-all duration-300 hover:border-white/[0.08] hover:-translate-y-0.5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow effect on hover */}
      <div
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `${meta.color}10` }}
      />

      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-[1px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${meta.color}60, transparent)` }}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.05]"
          style={{ background: `linear-gradient(135deg, ${meta.color}12, transparent)` }}
        >
          <Icon size={18} style={{ color: meta.color }} />
        </div>
        <span
          className="rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
          style={{ color: meta.color, background: `${meta.color}08`, borderColor: `${meta.color}15` }}
        >
          {meta.label}
        </span>
      </div>

      <div className="relative z-10 mt-4 flex-1">
        <h3 className="font-display text-[15px] font-bold tracking-tight text-white">
          {model.name}
        </h3>
        <p className="mt-1 text-[12px] leading-relaxed text-white/40">
          {model.description}
        </p>
      </div>

      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3">
        <span
          className="text-[10px] uppercase tracking-wider text-white/25"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          {model.outputType}
        </span>
        <span className="flex items-center gap-1 text-[11px] font-medium text-white/30 transition-all group-hover:text-white/60 group-hover:gap-1.5">
          Run <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
