import type { Budget, Transaction } from "./types";
import { mesActualKey, mesKeyDeFecha } from "./format";

export interface EstadoPresupuesto {
  presupuesto: Budget;
  gastado: number;
  restante: number;
  porcentaje: number; // 0-100+
  excedido: boolean;
  cercaDelLimite: boolean; // >= 80%
}

export function calcularEstadoPresupuestos(
  presupuestos: Budget[],
  transacciones: Transaction[],
  mes: string = mesActualKey()
): EstadoPresupuesto[] {
  return presupuestos
    .filter((p) => p.mes === "todos" || p.mes === mes)
    .map((presupuesto) => {
      const gastado = transacciones
        .filter(
          (t) =>
            t.tipo === "gasto" &&
            t.categoriaId === presupuesto.categoriaId &&
            mesKeyDeFecha(t.fecha) === mes
        )
        .reduce((suma, t) => suma + t.importe, 0);

      const porcentaje = presupuesto.limite > 0 ? (gastado / presupuesto.limite) * 100 : 0;

      return {
        presupuesto,
        gastado,
        restante: presupuesto.limite - gastado,
        porcentaje,
        excedido: gastado > presupuesto.limite,
        cercaDelLimite: porcentaje >= 80 && gastado <= presupuesto.limite,
      };
    });
}
