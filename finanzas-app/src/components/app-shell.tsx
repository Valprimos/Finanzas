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
  MoreHorizontal,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { QuickAddFab } from "@/components/quick-add-fab";
import { TransactionForm } from "@/components/transaction-form";
import { Logo } from "@/components/logo";
import { Dialog } from "@/components/ui/dialog";

const NAV = [
  { href: "/", label: "Resumen", icon: LayoutDashboard },
  { href: "/transacciones", label: "Movimientos", icon: ArrowLeftRight },
  { href: "/estadisticas", label: "Estadísticas", icon: PieChart },
  { href: "/presupuestos", label: "Presupuestos", icon: Wallet },
];

// Estas dos se acceden desde el botón "Más" en móvil (no caben las 6 en la barra inferior)
const NAV_MAS = [
  { href: "/categorias", label: "Categorías", icon: Shapes },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

const NAV_ESCRITORIO = [...NAV, ...NAV_MAS];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [formAbierto, setFormAbierto] = useState(false);
  const [masAbierto, setMasAbierto] = useState(false);

  const pestanaMasActiva = NAV_MAS.some((item) => item.href === pathname);

  return (
    <div className="flex min-h-dvh">
      {/* Navegación lateral — escritorio */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <Logo tamano={32} />
          <span className="font-display text-lg font-semibold">Finanzas</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ESCRITORIO.map(({ href, label, icon: Icon }) => {
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
            <Logo tamano={28} />
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

        {/* Navegación inferior — móvil: 4 fijas + "Más" para Categorías/Ajustes */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur px-1 py-2 lg:hidden">
          {NAV.map(({ href, label, icon: Icon }) => {
            const activo = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium",
                  activo ? "text-[var(--accent)]" : "text-[var(--muted)]"
                )}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
          <button
            onClick={() => setMasAbierto(true)}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium",
              pestanaMasActiva ? "text-[var(--accent)]" : "text-[var(--muted)]"
            )}
          >
            <MoreHorizontal size={20} />
            Más
          </button>
        </nav>
      </div>

      {/* Hoja "Más" — móvil: Categorías y Ajustes */}
      <Dialog abierto={masAbierto} onCerrar={() => setMasAbierto(false)} titulo="Más">
        <div className="space-y-1">
          {NAV_MAS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMasAbierto(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              )}
            >
              <Icon size={19} />
              {label}
            </Link>
          ))}
        </div>
      </Dialog>

      <QuickAddFab onClick={() => setFormAbierto(true)} />
      <TransactionForm abierto={formAbierto} onCerrar={() => setFormAbierto(false)} />
    </div>
  );
}
