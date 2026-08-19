"use client";

import { Plus } from "lucide-react";

export function QuickAddFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Añadir movimiento"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-[#0a0d12] shadow-[0_8px_24px_rgba(124,158,255,0.4)] transition-transform active:scale-90 lg:bottom-8 lg:right-8"
    >
      <Plus size={26} strokeWidth={2.5} />
    </button>
  );
}
