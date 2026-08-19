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
import { formatearMoneda } from "@/lib/format";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PaginaInicio() {
  const { transacciones, categorias, presupuestos, metasAhorro, aportaciones, ajustes, cargado } = useFinanzas();
  const [mesOffset, setMesOffset] = useState(0);

  const { mesKey, etiquetaMes } = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + mesOffset);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const etiqueta = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(d);
    return { mesKey: key, etiquetaMes: etiqueta };
  }, [mesOffset]);

  const transaccionesDelMes = useMemo(
    () => transacciones.filter((t) => t.fecha.slice(0, 7) === mesKey),
    [transacciones, mesKey]
  );

  const ingresos = transaccionesDelMes.filter((t) => t.tipo === "ingreso").reduce((s, t) => s + t.importe, 0);
  const gastos = transaccionesDelMes.filter((t) => t.tipo === "gasto").reduce((s, t) => s + t.importe, 0);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Resumen</h1>
          <p className="text-sm text-[var(--muted)] capitalize">{etiquetaMes}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variante="secundario" tamano="icono" onClick={() => setMesOffset((m) => m - 1)}>
            <ChevronLeft size={18} />
          </Button>
          <Button variante="secundario" tamano="sm" onClick={() => setMesOffset(0)} disabled={mesOffset === 0}>
            Hoy
          </Button>
          <Button variante="secundario" tamano="icono" onClick={() => setMesOffset((m) => m + 1)} disabled={mesOffset === 0}>
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      <SummaryCards balance={ingresos - gastos} ingresos={ingresos} gastos={gastos} moneda={ajustes.moneda} />

      <ComparativaMensual transacciones={transacciones} mesKey={mesKey} moneda={ajustes.moneda} />

      {estadoPresupuestos.length > 0 && (
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

      <SavingsGoalCard metas={metasAhorro} aportaciones={aportaciones} moneda={ajustes.moneda} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TendenciaMensual transacciones={transacciones} moneda={ajustes.moneda} />
        </div>
        <TopCategorias transacciones={transaccionesDelMes} categorias={categorias} moneda={ajustes.moneda} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GastoPorCategoria transacciones={transaccionesDelMes} categorias={categorias} moneda={ajustes.moneda} />
        <TopCategorias
          transacciones={transaccionesDelMes}
          categorias={categorias}
          moneda={ajustes.moneda}
          tipo="ingreso"
        />
      </div>
    </div>
  );
}
