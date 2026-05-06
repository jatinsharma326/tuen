import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ModelDefinition } from "@/types/models";

export function ModelCard({ model }: { model: ModelDefinition }) {
  const slug = model.id.replace(/\//g, "--");

  return (
    <Link
      href={`/models/${slug}`}
      className="group flex items-center justify-between rounded-lg border border-border-subtle px-4 py-3.5 transition-colors hover:border-border-default hover:bg-surface-1"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary">{model.name}</p>
        <p className="mt-0.5 truncate text-xs text-text-muted">
          {model.description}
        </p>
      </div>
      <ArrowRight
        size={14}
        className="ml-4 shrink-0 text-text-muted opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"
      />
    </Link>
  );
}
