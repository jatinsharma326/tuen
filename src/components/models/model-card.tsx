import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ModelDefinition } from "@/types/models";

export function ModelCard({ model }: { model: ModelDefinition }) {
  const slug = model.id.replace(/\//g, "--");

  return (
    <Link
      href={`/models/${slug}`}
      className="group flex items-center justify-between rounded-lg border border-white/[0.05] bg-[#12121a] px-4 py-3.5 transition-all hover:border-[#c084fc]/20 hover:bg-[#12121a]"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{model.name}</p>
        <p className="mt-0.5 truncate text-xs text-white/30">
          {model.description}
        </p>
      </div>
      <ArrowRight
        size={14}
        className="ml-4 shrink-0 text-white/30 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"
      />
    </Link>
  );
}
