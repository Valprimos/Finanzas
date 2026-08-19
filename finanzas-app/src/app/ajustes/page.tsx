"use client";

import { SettingsPanel } from "@/components/settings-panel";

export default function PaginaAjustes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Ajustes</h1>
        <p className="text-sm text-[var(--muted)]">Moneda, privacidad y copias de seguridad.</p>
      </div>
      <SettingsPanel />
    </div>
  );
}
