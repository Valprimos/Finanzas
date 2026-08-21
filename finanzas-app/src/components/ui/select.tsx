import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Safari calcula el ancho mínimo de un <select> nativo a partir de la
 * opción más larga de la lista (no de la seleccionada), e ignora
 * width:100%/min-width:0 cuando el hueco disponible es estrecho (p.ej. en
 * una columna de grid a mitad de pantalla) — esto no pasa en Chromium, por
 * eso solo se ve en iPhone. Quitamos el aspecto nativo con appearance-none
 * para que el ancho lo decida siempre el CSS, y dibujamos el icono de la
 * flecha a mano.
 */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative min-w-0">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full min-w-0 appearance-none truncate rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 pr-8 text-base text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)] sm:text-sm",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
      />
    </div>
  )
);
Select.displayName = "Select";
