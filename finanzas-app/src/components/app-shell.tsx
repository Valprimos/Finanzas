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
  PiggyBank,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { QuickAddFab } from "@/components/quick-add-fab";
import { TransactionForm } from "@/components/transaction-form";
import { Logo } from "@/components/logo";
import { Dialog } from "@/components/ui/dialog";

// Cada sección tiene su propio color para que la navegación no sea
// monocromática — el mismo criterio que ya usan las categorías.
const NAV = [
  { href: "/", label: "Resumen", icon: LayoutDashboard, color: "#7C9EFF" },
  { href: "/transacciones", label: "Movimientos", icon: ArrowLeftRight, color: "#4FB6E0" },
  { href: "/estadisticas", label: "Estadísticas", icon: PieChart, color: "#F5A524" },
  { href: "/presupuestos", label: "Presupuestos", icon: Wallet, color: "#3FCF8E" },
];

// Estas se acceden desde el botón "Más" en móvil (no caben todas en la barra inferior)
const NAV_MAS = [
  { href: "/ahorro", label: "Ahorro", icon: PiggyBank, color: "#E05C97" },
  { href: "/categorias", label: "Categorías", icon: Shapes, color: "#B085E0" },
  { href: "/ajustes", label: "Ajustes", icon: Settings, color: "#8A93A6" },
];

const NAV_ESCRITORIO = [...NAV, ...NAV_MAS];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [formAbierto, setFormAbierto] = useState(false);
  const [masAbierto, setMasAbierto] = useState(false);

  const pestanaMasActiva = NAV_MAS.some((item) => item.href === pathname);

  // `theme` es `undefined` hasta que next-themes resuelve el valor real en
  // el cliente; como la app arranca en modo oscuro por defecto, tratamos
  // "no claro" como oscuro para que el primer render coincida con el de
  // hidratación y no parpadeen los iconos (mismo criterio que en Logo).
  const esOscuro = theme !== "claro";

  return (
    <div className="flex min-h-dvh">
      {/* Navegación lateral — escritorio */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <Logo tamano={32} />
          <span className="font-display text-lg font-semibold">Finanzas</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ESCRITORIO.map(({ href, label, icon: Icon, color }) => {
            const activo = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={activo ? { backgroundColor: `${color}1f`, color } : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  !activo && "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon size={18} style={!activo ? { color } : undefined} className={!activo ? "opacity-75" : undefined} />
                {label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => setTheme(esOscuro ? "claro" : "oscuro")}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
        >
          {esOscuro ? <Sun size={18} /> : <Moon size={18} />}
          {esOscuro ? "Modo claro" : "Modo oscuro"}
        </button>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        {/* Barra superior — móvil */}
        <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <Logo tamano={28} />
            <span className="font-display text-base font-semibold">Finanzas</span>
          </div>
          <button
            onClick={() => setTheme(esOscuro ? "claro" : "oscuro")}
            aria-label="Cambiar tema"
            className="rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)]"
          >
            {esOscuro ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className="flex-1 px-4 pb-24 pt-5 lg:px-8 lg:pb-8 lg:pt-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        {/* Navegación inferior — móvil: 4 fijas + "Más" para Categorías/Ajustes */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur px-1 py-2 lg:hidden">
          {NAV.map(({ href, label, icon: Icon, color }) => {
            const activo = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={activo ? { backgroundColor: `${color}1f`, color } : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
                  !activo && "text-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon size={20} style={!activo ? { color } : undefined} className={!activo ? "opacity-75" : undefined} />
                {label}
              </Link>
            );
          })}
          <button
            onClick={() => setMasAbierto(true)}
            style={pestanaMasActiva ? { backgroundColor: "var(--accent-soft)", color: "var(--accent)" } : undefined}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
              !pestanaMasActiva && "text-[var(--muted)] hover:text-[var(--foreground)]"
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
          {NAV_MAS.map(({ href, label, icon: Icon, color }) => {
            const activo = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMasAbierto(false)}
                style={activo ? { backgroundColor: `${color}1f`, color } : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                  !activo && "text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                )}
              >
                <Icon size={19} style={!activo ? { color } : undefined} />
                {label}
              </Link>
            );
          })}
        </div>
      </Dialog>

      <QuickAddFab onClick={() => setFormAbierto(true)} />
      <TransactionForm abierto={formAbierto} onCerrar={() => setFormAbierto(false)} />
    </div>
  );
}
