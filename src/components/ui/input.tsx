import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-[13px] text-white/70">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "flex h-9 w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white placeholder:text-white/25 outline-none transition-colors",
            "focus:border-[#c084fc]/30 focus:bg-white/[0.05]",
            "disabled:cursor-not-allowed disabled:opacity-40",
            error && "border-[#ef4444]",
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#ef4444]">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export { Input };
