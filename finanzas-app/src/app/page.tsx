"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { useFinanzas } from "@/lib/store";
import { SummaryCards } from "@/components/summary-cards";
import { ComparativaMensual } from "@/components/comparativa-mensual";
import { SavingsGoalCard } from "@/components/savings-goal-card";
import { TendenciaMensual } from "@/components/charts/tendencia-mensual";
import { GastoPorCategoria } from "@/components/charts/gasto-por-categoria";
import { TopCategorias } from "@/components/top-categorias";
import { calcularEstadoPresupuestos } from "@/lib/presupuestos";
import { formatearMoneda, formatearFecha, hoyISO } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ModoPeriodo = "mes" | "rango";

function primerDiaMesActualISO(): string {
  return `${hoyISO().slice(0, 8)}01`;
}

export default function PaginaInicio() {
  const { transacciones, categorias, presupuestos, metasAhorro, aportaciones, ajustes, cargado } = useFinanzas();
  const [mesOffset, setMesOffset] = useState(0);
  const [modoPeriodo, setModoPeriodo] = useState<ModoPeriodo>("mes");
  const [rangoDesde, setRangoDesde] = useState(primerDiaMesActualISO);
  const [rangoHasta, setRangoHasta] = useState(hoyISO);

  const { mesKey, etiquetaMes } = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + mesOffset);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const etiqueta = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(d);
    return { mesKey: key, etiquetaMes: etiqueta };
  }, [mesOffset]);

  const rangoValido = modoPeriodo === "rango" && !!rangoDesde && !!rangoHasta && rangoDesde <= rangoHasta;

  const transaccionesDelPeriodo = useMemo(() => {
    if (modoPeriodo === "mes") {
      return transacciones.filter((t) => t.fecha.slice(0, 7) === mesKey);
    }
    if (!rangoValido) return [];
    return transacciones.filter((t) => t.fecha >= rangoDesde && t.fecha <= rangoHasta);
  }, [transacciones, modoPeriodo, mesKey, rangoValido, rangoDesde, rangoHasta]);

  const ingresos = transaccionesDelPeriodo.filter((t) => t.tipo === "ingreso").reduce((s, t) => s + t.importe, 0);
  const gastos = transaccionesDelPeriodo.filter((t) => t.tipo === "gasto").reduce((s, t) => s + t.importe, 0);

  const estadoPresupuestos = useMemo(
    () => calcularEstadoPresupuestos(presupuestos, transacciones, mesKey).filter((e) => e.cercaDelLimite || e.excedido),
    [presupuestos, transacciones, mesKey]
  );

  const mapaCategorias = useMemo(() => new Map(categorias.map((c) => [c.id, c])), [categorias]);

  if (!cargado) {
    return <div className="py-24 text-center text-sm text-[var(--muted)]">Cargando tus datos…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold">Resumen</h1>
            <p className="truncate text-sm text-[var(--muted)] capitalize">
              {modoPeriodo === "mes"
                ? etiquetaMes
                : rangoValido
                  ? `${formatearFecha(rangoDesde)} – ${formatearFecha(rangoHasta)}`
                  : "Elige un rango de fechas"}
            </p>
          </div>
          <div className="flex shrink-0 gap-1 rounded-xl bg-[var(--surface-2)] p-1">
            {(
              [
                { valor: "mes", etiqueta: "Mes" },
                { valor: "rango", etiqueta: "Rango" },
              ] as const
            ).map((opcion) => (
              <button
                key={opcion.valor}
                onClick={() => setModoPeriodo(opcion.valor)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  modoPeriodo === opcion.valor
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--muted)]"
                )}
              >
                {opcion.etiqueta}
              </button>
            ))}
          </div>
        </div>

        {modoPeriodo === "mes" ? (
          <div className="flex items-center gap-1">
            <Button variante="secundario" tamano="icono" onClick={() => setMesOffset((m) => m - 1)}>
              <ChevronLeft size={18} />
            </Button>
            <Button variante="secundario" tamano="sm" onClick={() => setMesOffset(0)} disabled={mesOffset === 0}>
              Hoy
            </Button>
            <Button
              variante="secundario"
              tamano="icono"
              onClick={() => setMesOffset((m) => m + 1)}
              disabled={mesOffset === 0}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <label className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-medium text-[var(--muted)]">Desde</span>
              <Input type="date" value={rangoDesde} onChange={(e) => setRangoDesde(e.target.value)} />
            </label>
            <label className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-medium text-[var(--muted)]">Hasta</span>
              <Input type="date" value={rangoHasta} onChange={(e) => setRangoHasta(e.target.value)} />
            </label>
          </div>
        )}
      </div>

      <SummaryCards balance={ingresos - gastos} ingresos={ingresos} gastos={gastos} moneda={ajustes.moneda} />

      {/* La comparativa y las alertas de presupuesto son conceptos mensuales
          (los presupuestos se definen por mes), así que solo tienen sentido
          en modo "Mes" — en modo "Rango" se ocultan en vez de mostrar algo
          que no se corresponde con el periodo elegido. */}
      {modoPeriodo === "mes" && <ComparativaMensual transacciones={transacciones} mesKey={mesKey} moneda={ajustes.moneda} />}

      {modoPeriodo === "mes" && estadoPresupuestos.length > 0 && (
        <div className="space-y-2">
          {estadoPresupuestos.map((e) => {
            const categoria = mapaCategorias.get(e.presupuesto.categoriaId);
            return (
              <Link
                href="/presupuestos"
                key={e.presupuesto.id}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm transition-colors hover:bg-[var(--surface-2)]"
              >
                <AlertTriangle
                  size={16}
                  className={e.excedido ? "text-[var(--gasto)]" : "text-[#f5a524]"}
                />
                <span className="flex-1">
                  <strong>{categoria?.nombre}</strong>{" "}
                  {e.excedido
                    ? `ha superado el presupuesto (${formatearMoneda(e.gastado, ajustes.moneda)} de ${formatearMoneda(e.presupuesto.limite, ajustes.moneda)})`
                    : `está cerca del límite (${Math.round(e.porcentaje)}% usado)`}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TendenciaMensual transacciones={transacciones} moneda={ajustes.moneda} />
        </div>
        <TopCategorias transacciones={transaccionesDelPeriodo} categorias={categorias} moneda={ajustes.moneda} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GastoPorCategoria transacciones={transaccionesDelPeriodo} categorias={categorias} moneda={ajustes.moneda} />
        <TopCategorias
          transacciones={transaccionesDelPeriodo}
          categorias={categorias}
          moneda={ajustes.moneda}
          tipo="ingreso"
        />
      </div>

      <SavingsGoalCard
        metas={metasAhorro}
        aportaciones={aportaciones}
        transacciones={transacciones}
        moneda={ajustes.moneda}
      />
    </div>
  );
}
