"use client";

import { Bug } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { obtenerIcono } from "@/lib/iconos";
import { formatearMoneda } from "@/lib/format";
import { detectarGastosHormiga } from "@/lib/estadisticas";
import type { Category, Transaction } from "@/lib/types";

interface Props {
  transacciones: Transaction[];
  categorias: Category[];
  moneda: string;
}

export function GastosHormiga({ transacciones, categorias, moneda }: Props) {
  const categoriasMapa = new Map(categorias.map((c) => [c.id, c]));
  const detectados = detectarGastosHormiga(transacciones, categorias);

  if (detectados.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug size={14} /> Gastos hormiga
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-2">
        <p className="mb-2 text-xs text-[var(--muted)]">
          Categorías con muchas compras pequeñas que, sumadas, pesan más de lo que parece.
        </p>
        <ul className="divide-y divide-[var(--border)]">
          {detectados.map((d) => {
            const Icono = obtenerIcono(categoriasMapa.get(d.categoriaId)?.icono ?? "");
            return (
              <li key={d.categoriaId} className="flex items-center gap-3 py-2.5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${d.color}22`, color: d.color }}
                >
                  <Icono size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.nombre}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {d.numTransacciones} compras · media de {formatearMoneda(d.importeMedio, moneda)}
                  </p>
                </div>
                <span className="font-mono-tabular shrink-0 text-sm font-semibold text-[var(--gasto)]">
                  {formatearMoneda(d.total, moneda)}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
