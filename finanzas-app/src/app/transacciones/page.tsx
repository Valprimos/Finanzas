"use client";

import { TransactionList } from "@/components/transaction-list";

export default function PaginaTransacciones() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Movimientos</h1>
        <p className="text-sm text-[var(--muted)]">Busca, filtra y edita todos tus gastos e ingresos.</p>
      </div>
      <TransactionList />
    </div>
  );
}
