import type { Debt, DebtPayment } from "./types";

export function calcularSaldoDeuda(deuda: Debt, pagos: DebtPayment[]): { pagado: number; pendiente: number } {
  const pagado = pagos
    .filter((p) => p.deudaId === deuda.id)
    .reduce((suma, p) => suma + p.importe, 0);
  return { pagado, pendiente: Math.max(0, deuda.importe - pagado) };
}
