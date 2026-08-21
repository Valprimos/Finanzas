import type { Transaction } from "./types";

export type NivelGasto = "sin-gasto" | "bajo" | "medio" | "alto";

export interface DiaGasto {
  fecha: string; // yyyy-MM-dd
  total: number; // total gastado ese día
  totalIngresos: number; // total ingresado ese día
  nivel: NivelGasto;
}

/**
 * Calcula el gasto (y el ingreso) de cada día del mes indicado. El nivel
 * de gasto se clasifica en relación a la media de gasto diario de ESE mes
 * (no un umbral fijo en euros, para que tenga sentido tanto si gastas poco
 * como si gastas mucho); los ingresos se muestran aparte, sin nivel.
 */
export function calcularGastoPorDia(transacciones: Transaction[], mesKey: string): DiaGasto[] {
  const [anio, mes] = mesKey.split("-").map(Number);
  const diasEnMes = new Date(anio, mes, 0).getDate();

  const gastosPorDia = new Map<string, number>();
  const ingresosPorDia = new Map<string, number>();
  for (const t of transacciones) {
    if (t.fecha.slice(0, 7) !== mesKey) continue;
    const mapa = t.tipo === "gasto" ? gastosPorDia : ingresosPorDia;
    mapa.set(t.fecha, (mapa.get(t.fecha) ?? 0) + t.importe);
  }

  const diasConGasto = Array.from(gastosPorDia.values());
  const media =
    diasConGasto.length > 0 ? diasConGasto.reduce((a, b) => a + b, 0) / diasConGasto.length : 0;

  const dias: DiaGasto[] = [];
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fecha = `${mesKey}-${String(dia).padStart(2, "0")}`;
    const total = gastosPorDia.get(fecha) ?? 0;
    const totalIngresos = ingresosPorDia.get(fecha) ?? 0;
    dias.push({ fecha, total, totalIngresos, nivel: clasificarNivel(total, media) });
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
