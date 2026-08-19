"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { obtenerIcono } from "@/lib/iconos";
import { formatearMoneda } from "@/lib/format";
import type { Category, Transaction } from "@/lib/types";

interface Props {
  transacciones: Transaction[];
  categorias: Category[];
  moneda: string;
  tipo?: "gasto" | "ingreso";
}

export function TopCategorias({ transacciones, categorias, moneda, tipo = "gasto" }: Props) {
  const mapaCategorias = new Map(categorias.map((c) => [c.id, c]));
  const totales = new Map<string, number>();

  for (const t of transacciones) {
    if (t.tipo !== tipo) continue;
    totales.set(t.categoriaId, (totales.get(t.categoriaId) ?? 0) + t.importe);
  }

  const total = Array.from(totales.values()).reduce((a, b) => a + b, 0);
  const filas = Array.from(totales.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tipo === "gasto" ? "Top categorías de gasto" : "Top fuentes de ingreso"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {filas.length === 0 && (
          <p className="text-sm text-[var(--muted)]">Aún no hay datos suficientes.</p>
        )}
        {filas.map(([categoriaId, valor]) => {
          const categoria = mapaCategorias.get(categoriaId);
          const Icono = obtenerIcono(categoria?.icono ?? "");
          const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
          return (
            <div key={categoriaId} className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${categoria?.color ?? "#8892a4"}22`, color: categoria?.color ?? "#8892a4" }}
              >
                <Icono size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate font-medium">{categoria?.nombre ?? "Otros"}</span>
                  <span className="font-mono-tabular shrink-0 pl-2">{formatearMoneda(valor, moneda)}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: categoria?.color ?? "#8892a4" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
