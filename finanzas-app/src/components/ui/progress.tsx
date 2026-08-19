import { cn } from "@/lib/utils";

export function Progress({
  valor,
  color = "var(--accent)",
  className,
}: {
  valor: number;
  color?: string;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, valor));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]", className)}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}
