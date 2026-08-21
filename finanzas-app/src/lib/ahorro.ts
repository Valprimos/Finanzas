import type { SavingsGoal, SavingsContribution, Transaction } from "./types";

/**
 * Solo los objetivos "cuánto tener y para cuándo" (con fecha límite) pueden
 * vincularse al saldo real — un objetivo de "cuánto ahorrar" es dinero que
 * se va apartando aparte, no una foto del saldo total. Y solo se vincula
 * automáticamente si es el único objetivo con fecha activo: con varios a
 * la vez, la app no sabe qué parte del saldo pertenece a cada uno.
 */
export function esMetaAutomatica(meta: SavingsGoal, todasLasMetas: SavingsGoal[]): boolean {
  if (!meta.fechaLimite) return false;
  return todasLasMetas.filter((m) => m.fechaLimite).length === 1;
}

export function calcularAhorrado(
  meta: SavingsGoal,
  todasLasMetas: SavingsGoal[],
  aportaciones: SavingsContribution[],
  transacciones: Transaction[]
): number {
  if (esMetaAutomatica(meta, todasLasMetas)) {
    const saldo = transacciones.reduce((s, t) => s + (t.tipo === "ingreso" ? t.importe : -t.importe), 0);
    return Math.max(0, saldo);
  }
  return aportaciones.filter((a) => a.metaId === meta.id).reduce((s, a) => s + a.importe, 0);
}
