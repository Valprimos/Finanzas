"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { calcularComparativaMensual, calcularComparativaAnual } from "@/lib/comparativa";
import { formatearMoneda } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  transacciones: Transaction[];
  mesKey: string;
  moneda: string;
}

type Base = "mes" | "anio";

export function ComparativaMensual({ transacciones, mesKey, moneda }: Props) {
  const [base, setBase] = useState<Base>("mes");

  const cMes = calcularComparativaMensual(transacciones, mesKey);
  const cAnio = calcularComparativaAnual(transacciones, mesKey);
  const hayDatosMes = cMes.cambioGastosPct !== null || cMes.cambioIngresosPct !== null;
  const hayDatosAnio = cAnio.cambioGastosPct !== null || cAnio.cambioIngresosPct !== null;

  if (!hayDatosMes && !hayDatosAnio) return null; // nada que comparar todavía

  const c = base === "mes" ? cMes : cAnio;
  const hayDatos = base === "mes" ? hayDatosMes : hayDatosAnio;
  const etiquetaPeriodo = base === "mes" ? "este mes" : "vs. el año pasado";

  return (
    <div className="animar-entrada space-y-2">
      <div className="flex justify-end gap-1 rounded-xl bg-[var(--surface-2)] p-1">
        {(
          [
            { valor: "mes", etiqueta: "vs. mes anterior" },
            { valor: "anio", etiqueta: "vs. año pasado" },
          ] as const
        ).map((opcion) => (
          <button
            key={opcion.valor}
            onClick={() => setBase(opcion.valor)}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
              base === opcion.valor ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--muted)]"
            )}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>

      {hayDatos ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {c.cambioIngresosPct !== null && (
            <FilaComparativa
              etiqueta="Ingresos"
              periodo={etiquetaPeriodo}
              actual={c.ingresosActual}
              cambioPct={c.cambioIngresosPct}
              subeEsMalo={false}
              moneda={moneda}
            />
          )}
          {c.cambioGastosPct !== null && (
            <FilaComparativa
              etiqueta="Gastos"
              periodo={etiquetaPeriodo}
              actual={c.gastosActual}
              cambioPct={c.cambioGastosPct}
              // en gastos, subir es "malo" (rojo) y bajar es "bueno" (verde)
              subeEsMalo
              moneda={moneda}
            />
          )}
        </div>
      ) : (
        <p className="px-1 text-sm text-[var(--muted)]">Todavía no hay datos del año pasado para comparar.</p>
      )}
    </div>
  );
}

function FilaComparativa({
  etiqueta,
  periodo,
  actual,
  cambioPct,
  subeEsMalo,
  moneda,
}: {
  etiqueta: string;
  periodo: string;
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
        <p className="text-xs text-[var(--muted)]">
          {etiqueta} {periodo}
        </p>
        <p className="font-mono-tabular text-sm font-semibold">{formatearMoneda(actual, moneda)}</p>
      </div>
      <span className={cn("shrink-0 text-sm font-semibold", color)}>
        {sube ? "+" : baja ? "−" : ""}
        {redondeado}%
      </span>
    </div>
  );
}
