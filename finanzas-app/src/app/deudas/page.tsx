"use client";

import { DebtManager } from "@/components/debt-manager";

export default function PaginaDeudas() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Deudas</h1>
        <p className="text-sm text-[var(--muted)]">Lo que te deben y lo que debes, con su saldo pendiente.</p>
      </div>
      <DebtManager />
    </div>
  );
}
