import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        // text-base (16px) evita que Safari en iOS haga zoom automático al enfocar el campo
        "h-10 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-base text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none transition-colors focus:border-[var(--accent)] sm:text-sm",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
