"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface Props {
  tamano?: number;
  className?: string;
}

/**
 * Muestra el logo adecuado según el tema:
 *   - /public/logo.png       → modo claro
 *   - /public/logoclaro.png  → modo oscuro (versión clara del logo, para
 *                               que se vea bien sobre fondo oscuro)
 *
 * `useTheme()` devuelve `theme: undefined` hasta que next-themes resuelve
 * el valor real (para evitar parpadeos de hidratación) — como la app
 * arranca en modo oscuro por defecto, tratamos "no claro" como oscuro,
 * sin necesidad de un estado "montado" aparte.
 *
 * Si el archivo correspondiente todavía no existe (o falla al cargar),
 * cae automáticamente en el badge "F" de siempre, para que la app nunca
 * se rompa visualmente mientras no se hayan subido ambos logos.
 */
export function Logo({ tamano = 32, className }: Props) {
  const { theme } = useTheme();
  const [srcFallida, setSrcFallida] = useState<string | null>(null);

  const esOscuro = theme !== "claro";
  const src = esOscuro ? "/logoclaro.png" : "/logo.png";

  if (srcFallida === src) {
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
      key={src}
      src={src}
      alt="Finanzas"
      width={tamano}
      height={tamano}
      onError={() => setSrcFallida(src)}
      className={cn("shrink-0 rounded-lg object-cover", className)}
      style={{ width: tamano, height: tamano }}
    />
  );
}
