"use client";

import { useFinanzas } from "@/lib/store";
import { TendenciaMensual } from "@/components/charts/tendencia-mensual";
import { GastoPorCategoria } from "@/components/charts/gasto-por-categoria";
import { IngresosVsGastos } from "@/components/charts/ingresos-vs-gastos";
import { TopCategorias } from "@/components/top-categorias";

export default function PaginaEstadisticas() {
  const { transacciones, categorias, ajustes } = useFinanzas();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Estadísticas</h1>
        <p className="text-sm text-[var(--muted)]">Tendencias, comparativas y tus categorías más activas.</p>
      </div>

      <TendenciaMensual transacciones={transacciones} moneda={ajustes.moneda} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <IngresosVsGastos transacciones={transacciones} moneda={ajustes.moneda} />
        <GastoPorCategoria transacciones={transacciones} categorias={categorias} moneda={ajustes.moneda} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopCategorias transacciones={transacciones} categorias={categorias} moneda={ajustes.moneda} tipo="gasto" />
        <TopCategorias transacciones={transacciones} categorias={categorias} moneda={ajustes.moneda} tipo="ingreso" />
      </div>
    </div>
  );
}
