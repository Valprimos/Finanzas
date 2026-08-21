"use client";

import { useRef, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { MouseHandlerDataParam } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useClicFuera } from "@/lib/use-clic-fuera";
import type { Category, Transaction } from "@/lib/types";
import { formatearMoneda } from "@/lib/format";

interface Props {
  transacciones: Transaction[];
  categorias: Category[];
  moneda: string;
}

type Rebanada = { nombre: string; valor: number; color: string };

export function GastoPorCategoria({ transacciones, categorias, moneda }: Props) {
  const [activo, setActivo] = useState<Rebanada | null>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useClicFuera(contenedorRef, () => setActivo(null));

  const mapaCategorias = new Map(categorias.map((c) => [c.id, c]));
  const totales = new Map<string, number>();

  for (const t of transacciones) {
    if (t.tipo !== "gasto") continue;
    totales.set(t.categoriaId, (totales.get(t.categoriaId) ?? 0) + t.importe);
  }

  const datos: Rebanada[] = Array.from(totales.entries())
    .map(([categoriaId, valor]) => ({
      nombre: mapaCategorias.get(categoriaId)?.nombre ?? "Otros",
      valor,
      color: mapaCategorias.get(categoriaId)?.color ?? "#8892a4",
    }))
    .sort((a, b) => b.valor - a.valor);

  if (datos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gasto por categoría</CardTitle>
        </CardHeader>
        <CardContent className="flex h-52 items-center justify-center text-sm text-[var(--muted)]">
          Todavía no hay gastos que mostrar.
        </CardContent>
      </Card>
    );
  }

  const total = datos.reduce((s, d) => s + d.valor, 0);

  // El onClick propio de <Pie> no dispara de forma fiable en esta versión
  // de recharts, así que se usa el mismo mecanismo que en los demás
  // gráficos: leer el sector activo desde el estado del chart contenedor.
  function manejarInteraccion(estado: MouseHandlerDataParam) {
    const indice = Number(estado.activeIndex);
    if (!Number.isNaN(indice)) setActivo(datos[indice] ?? null);
  }

  return (
    <div ref={contenedorRef}>
      <Card>
        <CardHeader>
          <CardTitle>Gasto por categoría</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart onClick={manejarInteraccion} onMouseMove={manejarInteraccion} onTouchMove={manejarInteraccion}>
              <Pie
                data={datos}
                dataKey="valor"
                nameKey="nombre"
                innerRadius={62}
                outerRadius={92}
                paddingAngle={2}
                strokeWidth={0}
                cursor="pointer"
              >
                {datos.map((d, i) => (
                  <Cell key={i} fill={d.color} opacity={activo && activo.nombre !== d.nombre ? 0.35 : 1} />
                ))}
              </Pie>
              {/* Sin tooltip flotante: el detalle se muestra abajo, en un
                  panel fijo que nunca se mueve ni cubre el gráfico, pero se
                  actualiza en vivo mientras arrastras el dedo por él. */}
              <Tooltip content={() => null} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                iconType="circle"
                iconSize={8}
                formatter={(valor) => <span style={{ color: "var(--muted)", fontSize: 12 }}>{valor}</span>}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-3 flex min-h-[52px] items-center justify-between gap-3 rounded-xl bg-[var(--surface-2)] px-4 py-3 text-sm">
            {activo ? (
              <>
                <span className="flex min-w-0 items-center gap-2 truncate">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: activo.color }} />
                  <span className="truncate">{activo.nombre}</span>
                </span>
                <span className="shrink-0 font-mono-tabular font-semibold">
                  {formatearMoneda(activo.valor, moneda)}
                  <span className="ml-1.5 text-[var(--muted)]">
                    ({Math.round((activo.valor / total) * 100)}%)
                  </span>
                </span>
              </>
            ) : (
              <>
                <span className="text-[var(--muted)]">Total gastado</span>
                <span className="font-mono-tabular font-semibold">{formatearMoneda(total, moneda)}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
