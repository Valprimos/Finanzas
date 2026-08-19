"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Transaction } from "@/lib/types";
import { formatearMoneda } from "@/lib/format";

interface Props {
  transacciones: Transaction[];
  moneda: string;
}

export function IngresosVsGastos({ transacciones, moneda }: Props) {
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
        <CardTitle>Ingresos vs. gastos</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={datos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
            <Bar dataKey="ingresos" fill="var(--ingreso)" radius={[6, 6, 0, 0]} name="Ingresos" />
            <Bar dataKey="gastos" fill="var(--gasto)" radius={[6, 6, 0, 0]} name="Gastos" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
