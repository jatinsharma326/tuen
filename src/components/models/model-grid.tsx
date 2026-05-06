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
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setCategory("all")}
            className={cn(
              "rounded-md px-2.5 py-1 text-[13px] transition-colors",
              category === "all"
                ? "bg-surface-2 text-text-primary"
                : "text-text-muted hover:text-text-secondary",
            )}
          >
            All
          </button>
          {MODEL_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[13px] transition-colors",
                category === c.id
                  ? "bg-surface-2 text-text-primary"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="h-8 w-full rounded-md border border-border-default bg-transparent pl-8 pr-3 text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong sm:w-48"
          />
        </div>
      </div>
      <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <ModelCard key={m.id} model={m} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-text-muted">
          No models found.
        </p>
      )}
    </div>
  );
}
