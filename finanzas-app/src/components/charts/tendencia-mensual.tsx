"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { MouseHandlerDataParam } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Transaction } from "@/lib/types";
import { formatearMoneda } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  transacciones: Transaction[];
  moneda: string;
}

type Serie = "ingresos" | "gastos";
type Punto = { mes: string; ingresos: number; gastos: number };

export function TendenciaMensual({ transacciones, moneda }: Props) {
  const datos = construirSerieMensual(transacciones);
  const [seleccion, setSeleccion] = useState<Serie | null>(null);
  const [activo, setActivo] = useState<Punto | null>(null);

  function manejarInteraccion(estado: MouseHandlerDataParam) {
    // activeIndex llega como string ("0"), no como number, en esta versión
    // de recharts — hay que convertirlo antes de indexar el array.
    const indice = Number(estado.activeIndex);
    if (!Number.isNaN(indice)) setActivo(datos[indice] ?? null);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Evolución mensual</CardTitle>
          {/* Pulsar una etiqueta filtra a esa sola serie; pulsar el área del
              gráfico (onClick en el propio AreaChart) vuelve a mostrar ambas. */}
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setSeleccion(seleccion === "ingresos" ? null : "ingresos")}
              className={cn(
                "flex items-center gap-1.5 font-medium transition-opacity",
                seleccion === "gastos" ? "opacity-40" : "opacity-100"
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--ingreso)" }} />
              Ingresos
            </button>
            <button
              onClick={() => setSeleccion(seleccion === "gastos" ? null : "gastos")}
              className={cn(
                "flex items-center gap-1.5 font-medium transition-opacity",
                seleccion === "ingresos" ? "opacity-40" : "opacity-100"
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--gasto)" }} />
              Gastos
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={datos}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            onClick={(estado) => {
              setSeleccion(null);
              manejarInteraccion(estado);
            }}
            onMouseMove={manejarInteraccion}
          >
            <defs>
              <linearGradient id="gradIngreso" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--ingreso)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--ingreso)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradGasto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--gasto)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--gasto)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="mes" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} width={40} />
            {/* Sin tooltip flotante: tapa el gráfico y en móvil sigue al dedo
                de forma incómoda. El detalle se muestra abajo, en un panel
                fijo que nunca se mueve ni cubre nada. */}
            <Tooltip content={() => null} cursor={{ stroke: "var(--border)" }} />
            {seleccion !== "gastos" && (
              <Area
                type="monotone"
                dataKey="ingresos"
                stroke="var(--ingreso)"
                fill="url(#gradIngreso)"
                strokeWidth={2}
                name="Ingresos"
              />
            )}
            {seleccion !== "ingresos" && (
              <Area
                type="monotone"
                dataKey="gastos"
                stroke="var(--gasto)"
                fill="url(#gradGasto)"
                strokeWidth={2}
                name="Gastos"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-3 flex min-h-[52px] items-center justify-between gap-3 rounded-xl bg-[var(--surface-2)] px-4 py-3 text-sm">
          {activo ? (
            <>
              <span className="shrink-0 capitalize text-[var(--muted)]">{activo.mes}</span>
              <div className="flex items-center gap-4">
                {seleccion !== "gastos" && (
                  <span className="font-mono-tabular font-semibold text-[var(--ingreso)]">
                    {formatearMoneda(activo.ingresos, moneda)}
                  </span>
                )}
                {seleccion !== "ingresos" && (
                  <span className="font-mono-tabular font-semibold text-[var(--gasto)]">
                    {formatearMoneda(activo.gastos, moneda)}
                  </span>
                )}
              </div>
            </>
          ) : (
            <span className="text-[var(--muted)]">Toca el gráfico para ver el detalle de un mes</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function construirSerieMensual(transacciones: Transaction[]): Punto[] {
  const mapa = new Map<string, { ingresos: number; gastos: number }>();
  for (const t of transacciones) {
    const clave = t.fecha.slice(0, 7);
    const actual = mapa.get(clave) ?? { ingresos: 0, gastos: 0 };
    if (t.tipo === "ingreso") actual.ingresos += t.importe;
    else actual.gastos += t.importe;
    mapa.set(clave, actual);
  }
  return Array.from(mapa.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([clave, valores]) => ({
      mes: new Intl.DateTimeFormat("es-ES", { month: "short" }).format(new Date(clave + "-02")),
      ...valores,
    }));
}
