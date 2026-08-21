"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

type Fase = "entrando" | "visible" | "saliendo" | "oculto";

/**
 * Pantalla de bienvenida con el logo, visible un instante al arrancar la
 * app (una sola vez por carga, no en cada navegación interna). Se retira
 * del DOM del todo al terminar para no dejar nada montado de fondo.
 */
export function SplashScreen() {
  const [fase, setFase] = useState<Fase>("entrando");

  useEffect(() => {
    const mostrar = requestAnimationFrame(() => setFase("visible"));
    const salir = setTimeout(() => setFase("saliendo"), 1400);
    const ocultar = setTimeout(() => setFase("oculto"), 1900);
    return () => {
      cancelAnimationFrame(mostrar);
      clearTimeout(salir);
      clearTimeout(ocultar);
    };
  }, []);

  if (fase === "oculto") return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)] transition-opacity duration-500 ease-out",
        fase === "saliendo" ? "pointer-events-none opacity-0" : "opacity-100"
      )}
    >
      <div
        className={cn(
          "transition-all duration-1000 ease-out",
          fase === "entrando" ? "scale-75 opacity-0" : "scale-100 opacity-100"
        )}
      >
        <Logo tamano={104} />
      </div>
    </div>
  );
}
