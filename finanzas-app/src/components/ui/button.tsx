import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variante = "primario" | "secundario" | "fantasma" | "peligro" | "contorno";
type Tamano = "sm" | "md" | "lg" | "icono";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamano?: Tamano;
}

const variantes: Record<Variante, string> = {
  primario: "bg-[var(--accent)] text-[#0a0d12] hover:brightness-110 shadow-[0_0_0_1px_rgba(124,158,255,0.25)]",
  secundario: "bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--border)]",
  fantasma: "bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-2)]",
  contorno: "bg-transparent border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-2)]",
  peligro: "bg-[var(--gasto)] text-white hover:brightness-110",
};

const tamanos: Record<Tamano, string> = {
  sm: "h-8 px-3 text-sm rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2",
  icono: "h-10 w-10 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variante = "primario", tamano = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.97]",
        variantes[variante],
        tamanos[tamano],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
