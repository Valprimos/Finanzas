import type { Transaction } from "./types";

export interface ComparativaMensual {
  gastosActual: number;
  gastosAnterior: number;
  ingresosActual: number;
  ingresosAnterior: number;
  cambioGastosPct: number | null; // null si no hay datos del periodo anterior para comparar
  cambioIngresosPct: number | null;
}

/** Dado "2026-08", devuelve "2026-07". Dado "2026-01", devuelve "2025-12". */
export function mesAnteriorKey(mesKey: string): string {
  const [anioStr, mesStr] = mesKey.split("-");
  const fecha = new Date(Number(anioStr), Number(mesStr) - 1, 1);
  fecha.setMonth(fecha.getMonth() - 1);
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
}

/** Dado "2026-08", devuelve "2025-08": el mismo mes del año anterior. */
export function mesAnioAnteriorKey(mesKey: string): string {
  const [anioStr, mesStr] = mesKey.split("-");
  return `${Number(anioStr) - 1}-${mesStr}`;
}

function totalesDelMes(transacciones: Transaction[], mesKey: string) {
  let gastos = 0;
  let ingresos = 0;
  for (const t of transacciones) {
    if (t.fecha.slice(0, 7) !== mesKey) continue;
    if (t.tipo === "gasto") gastos += t.importe;
    else ingresos += t.importe;
  }
  return { gastos, ingresos };
}

function construirComparativa(
  transacciones: Transaction[],
  mesKey: string,
  mesAnteriorKeyCalculado: string
): ComparativaMensual {
  const actual = totalesDelMes(transacciones, mesKey);
  const previo = totalesDelMes(transacciones, mesAnteriorKeyCalculado);

  const cambioGastosPct = previo.gastos > 0 ? ((actual.gastos - previo.gastos) / previo.gastos) * 100 : null;
  const cambioIngresosPct =
    previo.ingresos > 0 ? ((actual.ingresos - previo.ingresos) / previo.ingresos) * 100 : null;

  return {
    gastosActual: actual.gastos,
    gastosAnterior: previo.gastos,
    ingresosActual: actual.ingresos,
    ingresosAnterior: previo.ingresos,
    cambioGastosPct,
    cambioIngresosPct,
  };
}

export function calcularComparativaMensual(transacciones: Transaction[], mesKey: string): ComparativaMensual {
  return construirComparativa(transacciones, mesKey, mesAnteriorKey(mesKey));
}

/** Igual que calcularComparativaMensual, pero contra el mismo mes del año pasado. */
export function calcularComparativaAnual(transacciones: Transaction[], mesKey: string): ComparativaMensual {
  return construirComparativa(transacciones, mesKey, mesAnioAnteriorKey(mesKey));
}
