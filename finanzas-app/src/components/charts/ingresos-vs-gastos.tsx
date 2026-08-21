"use client";

import { useRef, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { MouseHandlerDataParam } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useClicFuera } from "@/lib/use-clic-fuera";
import type { Transaction } from "@/lib/types";
import { formatearMoneda } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  transacciones: Transaction[];
  moneda: string;
}

type Serie = "ingresos" | "gastos";
type Punto = { mes: string; ingresos: number; gastos: number };

export function IngresosVsGastos({ transacciones, moneda }: Props) {
  const [seleccion, setSeleccion] = useState<Serie | null>(null);
  const [activo, setActivo] = useState<Punto | null>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useClicFuera(contenedorRef, () => {
    setSeleccion(null);
    setActivo(null);
  });

  const mapa = new Map<string, { ingresos: number; gastos: number }>();
  for (const t of transacciones) {
    const clave = t.fecha.slice(0, 7);
    const actual = mapa.get(clave) ?? { ingresos: 0, gastos: 0 };
    if (t.tipo === "ingreso") actual.ingresos += t.importe;
    else actual.gastos += t.importe;
    mapa.set(clave, actual);
  }
  const datos: Punto[] = Array.from(mapa.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([clave, v]) => ({
      mes: new Intl.DateTimeFormat("es-ES", { month: "short" }).format(new Date(clave + "-02")),
      ...v,
    }));

  function manejarInteraccion(estado: MouseHandlerDataParam) {
    // activeIndex llega como string ("0"), no como number, en esta versión
    // de recharts — hay que convertirlo antes de indexar el array.
    const indice = Number(estado.activeIndex);
    if (!Number.isNaN(indice)) setActivo(datos[indice] ?? null);
  }

  return (
    <div ref={contenedorRef}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ingresos vs. gastos</CardTitle>
            {/* Pulsar una etiqueta o una barra filtra a esa sola serie;
                pulsar fuera del gráfico (toda la tarjeta) vuelve a mostrar
                ambas. */}
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
              onClick={manejarInteraccion}
              onMouseMove={manejarInteraccion}
              onTouchMove={manejarInteraccion}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="mes" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} width={40} />
              {/* Sin tooltip flotante: tapa el gráfico y en móvil sigue al dedo
                  de forma incómoda. El detalle se muestra abajo, en un panel
                  fijo que nunca se mueve ni cubre nada, pero se actualiza en
                  vivo mientras arrastras el dedo por el gráfico. */}
              <Tooltip content={() => null} cursor={{ fill: "var(--surface-2)" }} />
              {seleccion !== "gastos" && (
                <Bar
                  dataKey="ingresos"
                  fill="var(--ingreso)"
                  radius={[6, 6, 0, 0]}
                  name="Ingresos"
                  cursor="pointer"
                  onClick={(_, indice, evento) => {
                    // Evita que también burbujee hasta el onClick del
                    // BarChart y ejecute manejarInteraccion dos veces.
                    evento.stopPropagation();
                    setActivo(datos[indice] ?? null);
                    setSeleccion((actualSel) => (actualSel === "ingresos" ? null : "ingresos"));
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
                  onClick={(_, indice, evento) => {
                    evento.stopPropagation();
                    setActivo(datos[indice] ?? null);
                    setSeleccion((actualSel) => (actualSel === "gastos" ? null : "gastos"));
                  }}
                />
              )}
            </BarChart>
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
              <span className="text-[var(--muted)]">Toca o arrastra el dedo por el gráfico para ver el detalle</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
