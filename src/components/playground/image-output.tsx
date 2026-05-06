"use client";

import { Download } from "lucide-react";

interface Props {
  url: string | null;
  loading: boolean;
}

export function ImageOutput({ url, loading }: Props) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-surface-2">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border-default">
        <p className="text-sm text-text-muted">Output will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <img src={url} alt="Generated" className="w-full rounded-xl" />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-accent-400 hover:text-accent-300"
      >
        <Download size={14} /> Download
      </a>
    </div>
  );
}
