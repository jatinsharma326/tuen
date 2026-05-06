"use client";

import type { ModelField } from "@/types/models";

interface Props {
  schema: ModelField[];
  values: Record<string, unknown>;
  onChange: (key: string, val: unknown) => void;
}

export function ParameterForm({ schema, values, onChange }: Props) {
  return (
    <div className="space-y-5">
      {schema.map((field) => (
        <FieldRenderer
          key={field.key}
          field={field}
          value={values[field.key] ?? field.default ?? ""}
          onChange={(v) => onChange(field.key, v)}
        />
      ))}
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: ModelField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const base =
    "w-full rounded-xl border border-border-default bg-surface-1 px-4 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-500";

  switch (field.type) {
    case "textarea":
      return (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary">
            {field.label}
          </label>
          <textarea
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={`${base} h-auto py-3`}
          />
        </div>
      );

    case "text":
      return (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary">
            {field.label}
          </label>
          <input
            type="text"
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={`${base} h-10`}
          />
        </div>
      );

    case "number":
      return (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary">
            {field.label}
          </label>
          <input
            type="number"
            value={value === "" ? "" : Number(value)}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            className={`${base} h-10`}
          />
        </div>
      );

    case "slider":
      return (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-secondary">
              {field.label}
            </label>
            <span className="text-xs tabular-nums text-text-muted">
              {String(value)}
            </span>
          </div>
          <input
            type="range"
            value={Number(value)}
            onChange={(e) => onChange(Number(e.target.value))}
            min={field.min}
            max={field.max}
            step={field.step}
            className="w-full accent-accent-500"
          />
        </div>
      );

    case "select":
      return (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary">
            {field.label}
          </label>
          <select
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            className={`${base} h-10 appearance-none`}
          >
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );

    case "toggle":
      return (
        <label className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-secondary">
            {field.label}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(value)}
            onClick={() => onChange(!value)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              value ? "bg-accent-500" : "bg-surface-3"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                value ? "translate-x-5" : ""
              }`}
            />
          </button>
        </label>
      );

    case "image-upload":
      return (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary">
            {field.label}
          </label>
          <input
            type="text"
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste image URL..."
            className={`${base} h-10`}
          />
        </div>
      );

    default:
      return null;
  }
}
