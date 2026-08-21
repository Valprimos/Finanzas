"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Transaction } from "@/lib/types";
import { formatearMoneda } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  transacciones: Transaction[];
  moneda: string;
}

type Serie = "ingresos" | "gastos";

export function IngresosVsGastos({ transacciones, moneda }: Props) {
  const [seleccion, setSeleccion] = useState<Serie | null>(null);

  const mapa = new Map<string, { ingresos: number; gastos: number }>();
  for (const t of transacciones) {
    const clave = t.fecha.slice(0, 7);
    const actual = mapa.get(clave) ?? { ingresos: 0, gastos: 0 };
    if (t.tipo === "ingreso") actual.ingresos += t.importe;
    else actual.gastos += t.importe;
    mapa.set(clave, actual);
  }
  const datos = Array.from(mapa.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([clave, v]) => ({
      mes: new Intl.DateTimeFormat("es-ES", { month: "short" }).format(new Date(clave + "-02")),
      ...v,
    }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Ingresos vs. gastos</CardTitle>
          {/* Pulsar una etiqueta filtra a esa sola serie; pulsar el área del
              gráfico (onClick en el propio BarChart) vuelve a mostrar ambas. */}
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
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={datos}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            onClick={() => setSeleccion(null)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="mes" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} width={40} />
            <Tooltip
              cursor={{ fill: "var(--surface-2)" }}
              contentStyle={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 13,
              }}
              formatter={(valor) => formatearMoneda(Number(valor), moneda)}
            />
            {seleccion !== "gastos" && (
              <Bar
                dataKey="ingresos"
                fill="var(--ingreso)"
                radius={[6, 6, 0, 0]}
                name="Ingresos"
                cursor="pointer"
                onClick={(_, __, evento) => {
                  // Sin esto, el clic en la barra también burbujea hasta el
                  // onClick del BarChart y lo resetea a "ambas" justo
                  // después de seleccionar — se anularían entre sí.
                  evento.stopPropagation();
                  setSeleccion((actual) => (actual === "ingresos" ? null : "ingresos"));
                }}
              />
            )}
            {seleccion !== "ingresos" && (
              <Bar
                dataKey="gastos"
                fill="var(--gasto)"
                radius={[6, 6, 0, 0]}
                name="Gastos"
                cursor="pointer"
                onClick={(_, __, evento) => {
                  evento.stopPropagation();
                  setSeleccion((actual) => (actual === "gastos" ? null : "gastos"));
                }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
