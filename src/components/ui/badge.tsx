import { cn } from "@/lib/utils/cn";

const CATEGORY_COLORS: Record<string, string> = {
  "text-to-image": "bg-indigo-500/10 text-indigo-400",
  "image-to-video": "bg-purple-500/10 text-purple-400",
  "text-to-video": "bg-pink-500/10 text-pink-400",
  "text-to-speech": "bg-green-500/10 text-green-400",
  audio: "bg-green-500/10 text-green-400",
  llm: "bg-amber-500/10 text-amber-400",
  "image-editing": "bg-cyan-500/10 text-cyan-400",
  "image-to-3d": "bg-orange-500/10 text-orange-400",
  upscaling: "bg-teal-500/10 text-teal-400",
  default: "bg-surface-2 text-text-tertiary",
};

interface BadgeProps {
  children: React.ReactNode;
  category?: string;
  className?: string;
}

export function Badge({ children, category, className }: BadgeProps) {
  const colors = category
    ? CATEGORY_COLORS[category] || CATEGORY_COLORS.default
    : CATEGORY_COLORS.default;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colors,
        className,
      )}
    >
      {children}
    </span>
  );
}
