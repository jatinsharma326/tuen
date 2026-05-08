"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { MODELS } from "@/lib/constants/models";
import { MODEL_CATEGORIES } from "@/lib/constants/categories";
import { ModelCard } from "./model-card";

export function ModelGrid() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return MODELS.filter((m) => {
      const matchCat = category === "all" || m.category === category;
      const matchSearch =
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [category, search]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("all")}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-[12px] transition-all",
              category === "all"
                ? "bg-[#c084fc]/10 text-[#c084fc] border border-[#c084fc]/20"
                : "text-white/30 hover:text-white/60 hover:bg-white/[0.03] border border-transparent",
            )}
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            All
          </button>
          {MODEL_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-[12px] transition-all",
                category === c.id
                  ? "bg-[#c084fc]/10 text-[#c084fc] border border-[#c084fc]/20"
                  : "text-white/30 hover:text-white/60 hover:bg-white/[0.03] border border-transparent",
              )}
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search models..."
            className="h-9 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-9 pr-3 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-[#c084fc]/30 focus:bg-white/[0.05] sm:w-56"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          />
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <ModelCard key={m.id} model={m} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="mt-16 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-white/30" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
            No models found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
