"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Wallet,
  Shapes,
  Settings,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { QuickAddFab } from "@/components/quick-add-fab";
import { TransactionForm } from "@/components/transaction-form";

const NAV = [
  { href: "/", label: "Resumen", icon: LayoutDashboard },
  { href: "/transacciones", label: "Movimientos", icon: ArrowLeftRight },
  { href: "/estadisticas", label: "Estadísticas", icon: PieChart },
  { href: "/presupuestos", label: "Presupuestos", icon: Wallet },
  { href: "/categorias", label: "Categorías", icon: Shapes },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [formAbierto, setFormAbierto] = useState(false);

  return (
    <div className="flex min-h-dvh">
      {/* Navegación lateral — escritorio */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] font-display text-sm font-bold text-[#0a0d12]">
            F
          </div>
          <span className="font-display text-lg font-semibold">Finanzas</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const activo = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  activo
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => setTheme(theme === "oscuro" ? "claro" : "oscuro")}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
        >
          {theme === "oscuro" ? <Sun size={18} /> : <Moon size={18} />}
          {theme === "oscuro" ? "Modo claro" : "Modo oscuro"}
        </button>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col">
        {/* Barra superior — móvil */}
        <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] font-display text-xs font-bold text-[#0a0d12]">
              F
            </div>
            <span className="font-display text-base font-semibold">Finanzas</span>
          </div>
          <button
            onClick={() => setTheme(theme === "oscuro" ? "claro" : "oscuro")}
            aria-label="Cambiar tema"
            className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)]"
          >
            {theme === "oscuro" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className="flex-1 px-4 pb-24 pt-5 lg:px-8 lg:pb-8 lg:pt-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        {/* Navegación inferior — móvil */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur px-2 py-2 lg:hidden">
          {NAV.slice(0, 4).map(({ href, label, icon: Icon }) => {
            const activo = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium",
                  activo ? "text-[var(--accent)]" : "text-[var(--muted)]"
                )}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
          <Link
            href="/categorias"
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium",
              pathname === "/categorias" ? "text-[var(--accent)]" : "text-[var(--muted)]"
            )}
          >
            <Shapes size={20} />
            Categorías
          </Link>
        </nav>
      </div>

      <QuickAddFab onClick={() => setFormAbierto(true)} />
      <TransactionForm abierto={formAbierto} onCerrar={() => setFormAbierto(false)} />
    </div>
  );
}
