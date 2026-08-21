import type { Budget, Transaction } from "./types";
import { mesActualKey, mesKeyDeFecha, hoyISO } from "./format";
import { mesAnteriorKey } from "./comparativa";

export type RitmoGasto = "bien" | "rapido" | "sin-datos";

export interface EstadoPresupuesto {
  presupuesto: Budget;
  limiteEfectivo: number; // límite + sobrante del mes anterior, si aplica
  sobranteMesAnterior: number;
  gastado: number;
  restante: number;
  porcentaje: number; // 0-100+, sobre el límite efectivo
  excedido: boolean;
  cercaDelLimite: boolean; // >= 80%
  ritmo: RitmoGasto; // solo se calcula para el mes en curso
}

function gastadoEnMes(transacciones: Transaction[], categoriaId: string, mes: string): number {
  return transacciones
    .filter((t) => t.tipo === "gasto" && t.categoriaId === categoriaId && mesKeyDeFecha(t.fecha) === mes)
    .reduce((suma, t) => suma + t.importe, 0);
}

export function calcularEstadoPresupuestos(
  presupuestos: Budget[],
  transacciones: Transaction[],
  mes: string = mesActualKey(),
  hoy: string = hoyISO()
): EstadoPresupuesto[] {
  const esMesActual = mes === mesActualKey();

  return presupuestos
    .filter((p) => p.mes === "todos" || p.mes === mes)
    .map((presupuesto) => {
      // El sobrante solo mira UN mes atrás (no se encadena mes a mes) para
      // que el cálculo sea predecible: "lo que te sobró el mes pasado se
      // suma a este mes", no una acumulación indefinida.
      const sobranteMesAnterior = presupuesto.acumularSobrante
        ? Math.max(
            0,
            presupuesto.limite - gastadoEnMes(transacciones, presupuesto.categoriaId, mesAnteriorKey(mes))
          )
        : 0;
      const limiteEfectivo = presupuesto.limite + sobranteMesAnterior;

      const gastado = gastadoEnMes(transacciones, presupuesto.categoriaId, mes);
      const porcentaje = limiteEfectivo > 0 ? (gastado / limiteEfectivo) * 100 : 0;
      const excedido = gastado > limiteEfectivo;

      let ritmo: RitmoGasto = "sin-datos";
      if (esMesActual) {
        const [anio, mesNum] = mes.split("-").map(Number);
        const diasEnMes = new Date(anio, mesNum, 0).getDate();
        const diaActual = Number(hoy.slice(8, 10));
        // Cuánto "debería" llevarse gastado a estas alturas del mes si el
        // gasto se repartiera uniformemente hasta el límite efectivo.
        const gastoEsperado = limiteEfectivo * (diaActual / diasEnMes);
        // 10% de margen para no marcar "rápido" por ruido de un solo día.
        ritmo = gastado > gastoEsperado * 1.1 ? "rapido" : "bien";
      }

      return {
        presupuesto,
        limiteEfectivo,
        sobranteMesAnterior,
        gastado,
        restante: limiteEfectivo - gastado,
        porcentaje,
        excedido,
        cercaDelLimite: porcentaje >= 80 && !excedido,
        ritmo,
      };
    });
}
