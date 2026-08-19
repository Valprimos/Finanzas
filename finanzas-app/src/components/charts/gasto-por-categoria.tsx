"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Category, Transaction } from "@/lib/types";
import { formatearMoneda } from "@/lib/format";

interface Props {
  transacciones: Transaction[];
  categorias: Category[];
  moneda: string;
}

export function GastoPorCategoria({ transacciones, categorias, moneda }: Props) {
  const mapaCategorias = new Map(categorias.map((c) => [c.id, c]));
  const totales = new Map<string, number>();

  for (const t of transacciones) {
    if (t.tipo !== "gasto") continue;
    totales.set(t.categoriaId, (totales.get(t.categoriaId) ?? 0) + t.importe);
  }

  const datos = Array.from(totales.entries())
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gasto por categoría</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={datos}
              dataKey="valor"
              nameKey="nombre"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={2}
              strokeWidth={0}
            >
              {datos.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 13,
              }}
              formatter={(valor) => formatearMoneda(Number(valor), moneda)}
            />
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
      </CardContent>
    </Card>
  );
}
