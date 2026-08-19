"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  etiquetas: string[];
  onCambiar: (etiquetas: string[]) => void;
  placeholder?: string;
}

/**
 * Campo de texto que va convirtiendo lo escrito en "chips" al pulsar
 * Enter o coma. Pensado para etiquetas libres tipo "viaje portugal",
 * independientes de las categorías.
 */
export function TagInput({ etiquetas, onCambiar, placeholder }: Props) {
  const [borrador, setBorrador] = useState("");

  function anadir(texto: string) {
    const limpio = texto.trim().toLowerCase();
    if (!limpio) return;
    if (etiquetas.includes(limpio)) {
      setBorrador("");
      return;
    }
    onCambiar([...etiquetas, limpio]);
    setBorrador("");
  }

  function quitar(etiqueta: string) {
    onCambiar(etiquetas.filter((e) => e !== etiqueta));
  }

  function manejarTeclado(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      anadir(borrador);
    } else if (e.key === "Backspace" && borrador === "" && etiquetas.length > 0) {
      quitar(etiquetas[etiquetas.length - 1]);
    }
  }

  return (
    <div
      className={cn(
        "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5 focus-within:border-[var(--accent)]"
      )}
    >
      {etiquetas.map((etiqueta) => (
        <span
          key={etiqueta}
          className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]"
        >
          #{etiqueta}
          <button
            type="button"
            onClick={() => quitar(etiqueta)}
            aria-label={`Quitar etiqueta ${etiqueta}`}
            className="hover:opacity-70"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={borrador}
        onChange={(e) => setBorrador(e.target.value)}
        onKeyDown={manejarTeclado}
        onBlur={() => anadir(borrador)}
        placeholder={etiquetas.length === 0 ? placeholder : ""}
        className="min-w-[100px] flex-1 bg-transparent text-base text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none sm:text-sm"
      />
    </div>
  );
}
