"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Transaction } from "@/lib/types";
import { formatearMoneda } from "@/lib/format";

interface Props {
  transacciones: Transaction[];
  moneda: string;
}

export function TendenciaMensual({ transacciones, moneda }: Props) {
  const datos = construirSerieMensual(transacciones);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución mensual</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={datos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
            <Tooltip
              contentStyle={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 13,
              }}
              formatter={(valor) => formatearMoneda(Number(valor), moneda)}
            />
            <Area type="monotone" dataKey="ingresos" stroke="var(--ingreso)" fill="url(#gradIngreso)" strokeWidth={2} name="Ingresos" />
            <Area type="monotone" dataKey="gastos" stroke="var(--gasto)" fill="url(#gradGasto)" strokeWidth={2} name="Gastos" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function construirSerieMensual(transacciones: Transaction[]) {
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
