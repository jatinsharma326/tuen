import { cn } from "@/lib/utils/cn";
import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ className, hoverable = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border-subtle bg-surface-1",
        hoverable && "transition-all duration-200 hover:border-border-default hover:bg-surface-2",
        className,
      )}
      {...props}
    />
  );
}
