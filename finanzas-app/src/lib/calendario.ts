import type { Transaction } from "./types";

export type NivelGasto = "sin-gasto" | "bajo" | "medio" | "alto";

export interface DiaGasto {
  fecha: string; // yyyy-MM-dd
  total: number;
  nivel: NivelGasto;
}

/**
 * Calcula el gasto de cada día del mes indicado y lo clasifica en un nivel
 * relativo a la media de gasto diario de ESE mes (no un umbral fijo en
 * euros, para que tenga sentido tanto si gastas poco como si gastas mucho).
 */
export function calcularGastoPorDia(transacciones: Transaction[], mesKey: string): DiaGasto[] {
  const [anio, mes] = mesKey.split("-").map(Number);
  const diasEnMes = new Date(anio, mes, 0).getDate();

  const totalesPorDia = new Map<string, number>();
  for (const t of transacciones) {
    if (t.tipo !== "gasto" || t.fecha.slice(0, 7) !== mesKey) continue;
    totalesPorDia.set(t.fecha, (totalesPorDia.get(t.fecha) ?? 0) + t.importe);
  }

  const diasConGasto = Array.from(totalesPorDia.values());
  const media =
    diasConGasto.length > 0 ? diasConGasto.reduce((a, b) => a + b, 0) / diasConGasto.length : 0;

  const dias: DiaGasto[] = [];
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fecha = `${mesKey}-${String(dia).padStart(2, "0")}`;
    const total = totalesPorDia.get(fecha) ?? 0;
    dias.push({ fecha, total, nivel: clasificarNivel(total, media) });
  }
  return dias;
}

function clasificarNivel(total: number, media: number): NivelGasto {
  if (total <= 0) return "sin-gasto";
  if (media <= 0) return "medio";
  if (total <= media * 0.6) return "bajo";
  if (total <= media * 1.4) return "medio";
  return "alto";
}
