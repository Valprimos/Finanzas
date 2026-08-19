"use client";

import { CategoryManager } from "@/components/category-manager";

export default function PaginaCategorias() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Categorías</h1>
        <p className="text-sm text-[var(--muted)]">Organiza tus movimientos a tu manera.</p>
      </div>
      <CategoryManager />
    </div>
  );
}
