"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  tamano?: number;
  className?: string;
}

/**
 * Muestra /public/logo.png. Si el archivo todavía no existe (o falla al
 * cargar), cae automáticamente en el badge "F" de siempre, para que la app
 * nunca se rompa visualmente mientras no se haya subido el logo definitivo.
 */
export function Logo({ tamano = 32, className }: Props) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] font-display font-bold text-[#0a0d12]",
          className
        )}
        style={{ width: tamano, height: tamano, fontSize: tamano * 0.45 }}
      >
        F
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- tamaño fijo pequeño, no necesita optimización de next/image
    <img
      src="/logo.png"
      alt="Finanzas"
      width={tamano}
      height={tamano}
      onError={() => setError(true)}
      className={cn("shrink-0 rounded-lg object-cover", className)}
      style={{ width: tamano, height: tamano }}
    />
  );
}
