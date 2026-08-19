"use client";

import { SavingsGoalManager } from "@/components/savings-goal-manager";

export default function PaginaAhorro() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Ahorro</h1>
        <p className="text-sm text-[var(--muted)]">Ponte una meta y ve apartando dinero hacia ella.</p>
      </div>
      <SavingsGoalManager />
    </div>
  );
}
