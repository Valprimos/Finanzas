"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { calcularComparativaMensual } from "@/lib/comparativa";
import { formatearMoneda } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  transacciones: Transaction[];
  mesKey: string;
  moneda: string;
}

export function ComparativaMensual({ transacciones, mesKey, moneda }: Props) {
  const c = calcularComparativaMensual(transacciones, mesKey);

  if (c.cambioGastosPct === null && c.cambioIngresosPct === null) {
    return null; // sin datos del mes anterior, no hay nada que comparar todavía
  }

  return (
    <div className="animar-entrada grid grid-cols-1 gap-3 sm:grid-cols-2">
      {c.cambioGastosPct !== null && (
        <FilaComparativa
          etiqueta="Gastos"
          actual={c.gastosActual}
          cambioPct={c.cambioGastosPct}
          // en gastos, subir es "malo" (rojo) y bajar es "bueno" (verde)
          subeEsMalo
          moneda={moneda}
        />
      )}
      {c.cambioIngresosPct !== null && (
        <FilaComparativa
          etiqueta="Ingresos"
          actual={c.ingresosActual}
          cambioPct={c.cambioIngresosPct}
          subeEsMalo={false}
          moneda={moneda}
        />
      )}
    </div>
  );
}

function FilaComparativa({
  etiqueta,
  actual,
  cambioPct,
  subeEsMalo,
  moneda,
}: {
  etiqueta: string;
  actual: number;
  cambioPct: number;
  subeEsMalo: boolean;
  moneda: string;
}) {
  const redondeado = Math.round(Math.abs(cambioPct));
  const sube = cambioPct > 0.5;
  const baja = cambioPct < -0.5;
  const esBueno = sube ? !subeEsMalo : baja ? subeEsMalo : null;

  const Icono = sube ? TrendingUp : baja ? TrendingDown : Minus;
  const color = esBueno === null ? "text-[var(--muted)]" : esBueno ? "text-[var(--ingreso)]" : "text-[var(--gasto)]";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-2)]", color)}>
        <Icono size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[var(--muted)]">{etiqueta} este mes</p>
        <p className="font-mono-tabular text-sm font-semibold">{formatearMoneda(actual, moneda)}</p>
      </div>
      <span className={cn("shrink-0 text-sm font-semibold", color)}>
        {sube ? "+" : baja ? "−" : ""}
        {redondeado}%
      </span>
    </div>
  );
}
