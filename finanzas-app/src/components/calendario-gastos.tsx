"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanzas } from "@/lib/store";
import { calcularGastoPorDia, type NivelGasto } from "@/lib/calendario";
import { formatearMoneda } from "@/lib/format";
import { cn } from "@/lib/utils";

const COLOR_NIVEL: Record<NivelGasto, string> = {
  "sin-gasto": "transparent",
  bajo: "var(--ingreso)",
  medio: "#f5a524",
  alto: "var(--gasto)",
};

const ETIQUETA_NIVEL: Record<NivelGasto, string> = {
  "sin-gasto": "Sin gasto",
  bajo: "Gasto bajo",
  medio: "Gasto medio",
  alto: "Gasto alto",
};

export function CalendarioGastos() {
  const { transacciones, ajustes } = useFinanzas();
  const [offset, setOffset] = useState(0);
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);

  const { mesKey, etiquetaMes, primerDiaSemana } = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + offset);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const etiqueta = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(d);
    // 0 = lunes ... 6 = domingo (para que la cuadrícula empiece en lunes, como en España)
    const diaSemanaISO = (d.getDay() + 6) % 7;
    return { mesKey: key, etiquetaMes: etiqueta, primerDiaSemana: diaSemanaISO };
  }, [offset]);

  const dias = useMemo(() => calcularGastoPorDia(transacciones, mesKey), [transacciones, mesKey]);
  const diaInfo = diaSeleccionado ? dias.find((d) => d.fecha === diaSeleccionado) : undefined;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays size={14} /> Calendario de gasto
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variante="secundario" tamano="icono" onClick={() => setOffset((o) => o - 1)}>
              <ChevronLeft size={16} />
            </Button>
            <Button variante="secundario" tamano="icono" onClick={() => setOffset((o) => o + 1)} disabled={offset === 0}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
        <p className="mt-1 text-xs capitalize text-[var(--muted)]">{etiquetaMes}</p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => (
            <span key={i} className="text-[10px] font-medium text-[var(--muted)]">
              {d}
            </span>
          ))}
          {Array.from({ length: primerDiaSemana }).map((_, i) => (
            <div key={`vacio-${i}`} />
          ))}
          {dias.map((dia) => {
            const numero = Number(dia.fecha.slice(-2));
            const seleccionado = diaSeleccionado === dia.fecha;
            return (
              <button
                key={dia.fecha}
                onClick={() => setDiaSeleccionado(seleccionado ? null : dia.fecha)}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg text-xs transition-colors",
                  seleccionado ? "bg-[var(--surface-2)] ring-1 ring-[var(--accent)]" : "hover:bg-[var(--surface-2)]"
                )}
              >
                <span className="text-[var(--foreground)]">{numero}</span>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: COLOR_NIVEL[dia.nivel] }}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 border-t border-[var(--border)] pt-3">
          {(["bajo", "medio", "alto"] as NivelGasto[]).map((nivel) => (
            <div key={nivel} className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLOR_NIVEL[nivel] }} />
              {ETIQUETA_NIVEL[nivel]}
            </div>
          ))}
        </div>

        {diaInfo && (
          <div className="mt-3 rounded-xl bg-[var(--surface-2)] px-3 py-2.5 text-sm">
            {diaInfo.total > 0 ? (
              <span>
                Gastaste <strong className="font-mono-tabular">{formatearMoneda(diaInfo.total, ajustes.moneda)}</strong>{" "}
                ese día
              </span>
            ) : (
              <span className="text-[var(--muted)]">Sin gastos registrados ese día</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
