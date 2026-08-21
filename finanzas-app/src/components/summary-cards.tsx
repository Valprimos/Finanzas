"use client";

import { ArrowUpRight, ArrowDownRight, Scale } from "lucide-react";
import { formatearMoneda } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  balance: number;
  ingresos: number;
  gastos: number;
  moneda: string;
}

export function SummaryCards({ balance, ingresos, gastos, moneda }: Props) {
  const ahorroNeto = ingresos > 0 ? ((balance / ingresos) * 100).toFixed(0) : "0";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Balance — la ficha principal del "libro mayor" */}
      <div className="animar-entrada relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--accent-soft)] to-[var(--surface)] p-6 sm:col-span-1">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <Scale size={14} />
          </span>
          Balance total
        </div>
        <p
          className={cn(
            "font-mono-tabular mt-3 break-words text-3xl font-semibold sm:text-4xl",
            balance >= 0 ? "text-[var(--ingreso)]" : "text-[var(--gasto)]"
          )}
        >
          {formatearMoneda(balance, moneda)}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {balance >= 0 ? `Ahorro neto del ${ahorroNeto}% sobre ingresos` : "Este mes en negativo"}
        </p>
      </div>

      <div className="animar-entrada rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--ingreso-soft)] to-[var(--surface)] p-6">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--ingreso-soft)] text-[var(--ingreso)]">
            <ArrowUpRight size={14} />
          </span>
          Ingresos totales
        </div>
        <p className="font-mono-tabular mt-3 text-2xl font-semibold text-[var(--ingreso)]">
          {formatearMoneda(ingresos, moneda)}
        </p>
      </div>

      <div className="animar-entrada rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--gasto-soft)] to-[var(--surface)] p-6">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--gasto-soft)] text-[var(--gasto)]">
            <ArrowDownRight size={14} />
          </span>
          Gastos totales
        </div>
        <p className="font-mono-tabular mt-3 text-2xl font-semibold text-[var(--gasto)]">
          {formatearMoneda(gastos, moneda)}
        </p>
      </div>
    </div>
  );
}
