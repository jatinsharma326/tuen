"use client";

import { useState, useCallback } from "react";
import { ParameterForm } from "./parameter-form";
import { RunButton } from "./run-button";
import { ImageOutput } from "./image-output";
import { Badge } from "@/components/ui/badge";
import type { ModelDefinition } from "@/types/models";

export function PlaygroundLayout({ model }: { model: ModelDefinition }) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    model.inputSchema.forEach((f) => {
      if (f.default !== undefined) init[f.key] = f.default;
    });
    return init;
  });
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onChange = useCallback((k: string, v: unknown) => {
    setValues((prev) => ({ ...prev, [k]: v }));
  }, []);

  const run = async () => {
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const res = await fetch("/api/services/image_gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      const url = data?.images?.[0]?.url || data?.image?.url || null;
      setOutput(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-medium">{model.name}</h1>
          <Badge category={model.category}>
            {model.category.replace(/-/g, " ")}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-text-tertiary">{model.description}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <ParameterForm schema={model.inputSchema} values={values} onChange={onChange} />
          <RunButton loading={loading} disabled={false} onClick={run} />
          {error && (
            <p className="rounded-md border border-error/20 bg-error/5 px-3 py-2 text-xs text-error">
              {error}
            </p>
          )}
        </div>
        <div className="lg:col-span-3">
          <ImageOutput url={output} loading={loading} />
        </div>
      </div>
    </div>
  );
}
