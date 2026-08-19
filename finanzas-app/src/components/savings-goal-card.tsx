"use client";

import Link from "next/link";
import { PiggyBank } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatearMoneda, formatearFecha } from "@/lib/format";
import type { SavingsGoal, SavingsContribution } from "@/lib/types";

interface Props {
  metas: SavingsGoal[];
  aportaciones: SavingsContribution[];
  moneda: string;
}

export function SavingsGoalCard({ metas, aportaciones, moneda }: Props) {
  if (metas.length === 0) return null;

  // En el dashboard mostramos solo la meta más reciente para no saturar;
  // el resto se ven todas en /ahorro.
  const meta = [...metas].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn))[0];
  const ahorrado = aportaciones
    .filter((a) => a.metaId === meta.id)
    .reduce((suma, a) => suma + a.importe, 0);
  const porcentaje = meta.objetivo > 0 ? (ahorrado / meta.objetivo) * 100 : 0;
  const conseguido = ahorrado >= meta.objetivo;

  return (
    <Link href="/ahorro">
      <Card className="animar-entrada transition-colors hover:bg-[var(--surface-2)]">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              <PiggyBank size={14} />
              Objetivo de ahorro
            </div>
            {metas.length > 1 && (
              <span className="text-xs text-[var(--muted)]">+{metas.length - 1} más</span>
            )}
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-medium">{meta.nombre}</p>
            <p className="font-mono-tabular shrink-0 text-sm text-[var(--muted)]">
              {formatearMoneda(ahorrado, moneda)} / {formatearMoneda(meta.objetivo, moneda)}
            </p>
          </div>
          <Progress valor={porcentaje} color={conseguido ? "var(--ingreso)" : "var(--accent)"} />
          <p className="text-xs text-[var(--muted)]">
            {conseguido
              ? "¡Objetivo conseguido! 🎉"
              : meta.fechaLimite
                ? `${Math.round(porcentaje)}% · hasta ${formatearFecha(meta.fechaLimite)}`
                : `${Math.round(porcentaje)}% conseguido`}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
