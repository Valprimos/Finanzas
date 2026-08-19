"use client";

import { BudgetManager } from "@/components/budget-manager";
import { RecurringManager } from "@/components/recurring-manager";

export default function PaginaPresupuestos() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold">Presupuestos</h1>
        <p className="text-sm text-[var(--muted)]">
          Ponle límite a cada categoría y automatiza tus movimientos fijos.
        </p>
      </div>
      <BudgetManager />
      <RecurringManager />
    </div>
  );
}
