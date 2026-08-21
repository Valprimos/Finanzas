"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useFinanzas } from "@/lib/store";
import { obtenerIcono } from "@/lib/iconos";
import { formatearFecha, formatearMoneda } from "@/lib/format";
import { TransactionForm } from "@/components/transaction-form";
import type { Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

function CampoFiltro({
  etiqueta,
  htmlFor,
  className,
  children,
}: {
  etiqueta: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="text-xs font-medium text-[var(--muted)]">{etiqueta}</span>
      {children}
    </label>
  );
}

type Orden = "fecha_desc" | "fecha_asc" | "importe_desc" | "importe_asc";

export function TransactionList() {
  const { transacciones, categorias, ajustes } = useFinanzas();
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "gasto" | "ingreso">("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroEtiqueta, setFiltroEtiqueta] = useState("todas");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [orden, setOrden] = useState<Orden>("fecha_desc");
  const [editando, setEditando] = useState<Transaction | null>(null);

  const mapaCategorias = useMemo(() => new Map(categorias.map((c) => [c.id, c])), [categorias]);

  const todasLasEtiquetas = useMemo(() => {
    const set = new Set<string>();
    for (const t of transacciones) {
      t.etiquetas?.forEach((e) => set.add(e));
    }
    return Array.from(set).sort();
  }, [transacciones]);

  const filtradas = useMemo(() => {
    let resultado = transacciones.filter((t) => {
      const categoria = mapaCategorias.get(t.categoriaId);
      const coincideBusqueda =
        !busqueda ||
        t.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
        categoria?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.etiquetas?.some((e) => e.includes(busqueda.toLowerCase()));
      const coincideTipo = filtroTipo === "todos" || t.tipo === filtroTipo;
      const coincideCategoria = filtroCategoria === "todas" || t.categoriaId === filtroCategoria;
      const coincideEtiqueta = filtroEtiqueta === "todas" || (t.etiquetas ?? []).includes(filtroEtiqueta);
      const coincideDesde = !desde || t.fecha >= desde;
      const coincideHasta = !hasta || t.fecha <= hasta;
      return (
        coincideBusqueda && coincideTipo && coincideCategoria && coincideEtiqueta && coincideDesde && coincideHasta
      );
    });

    resultado = resultado.sort((a, b) => {
      switch (orden) {
        case "fecha_asc":
          return a.fecha.localeCompare(b.fecha);
        case "importe_desc":
          return b.importe - a.importe;
        case "importe_asc":
          return a.importe - b.importe;
        default:
          return b.fecha.localeCompare(a.fecha);
      }
    });

    return resultado;
  }, [transacciones, busqueda, filtroTipo, filtroCategoria, filtroEtiqueta, desde, hasta, orden, mapaCategorias]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <Input
            placeholder="Buscar por descripción, categoría o etiqueta…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <CampoFiltro etiqueta="Tipo">
            <Select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as typeof filtroTipo)}>
              <option value="todos">Todos</option>
              <option value="gasto">Gastos</option>
              <option value="ingreso">Ingresos</option>
            </Select>
          </CampoFiltro>
          <CampoFiltro etiqueta="Categoría">
            <Select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
              <option value="todas">Todas</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          </CampoFiltro>
          {todasLasEtiquetas.length > 0 && (
            <CampoFiltro etiqueta="Etiqueta">
              <Select value={filtroEtiqueta} onChange={(e) => setFiltroEtiqueta(e.target.value)}>
                <option value="todas">Todas</option>
                {todasLasEtiquetas.map((e) => (
                  <option key={e} value={e}>
                    #{e}
                  </option>
                ))}
              </Select>
            </CampoFiltro>
          )}
          <CampoFiltro etiqueta="Desde" htmlFor="filtro-desde">
            <Input id="filtro-desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </CampoFiltro>
          <CampoFiltro etiqueta="Hasta" htmlFor="filtro-hasta">
            <Input id="filtro-hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </CampoFiltro>
          <CampoFiltro etiqueta="Ordenar por" className="col-span-2 lg:col-span-1">
            <Select value={orden} onChange={(e) => setOrden(e.target.value as Orden)}>
              <option value="fecha_desc">Recientes</option>
              <option value="fecha_asc">Antiguas</option>
              <option value="importe_desc">Importe mayor</option>
              <option value="importe_asc">Importe menor</option>
            </Select>
          </CampoFiltro>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        {filtradas.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <ArrowUpDown size={22} className="text-[var(--muted)]" />
            <p className="text-sm text-[var(--muted)]">No hay movimientos que coincidan con los filtros.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {filtradas.map((t) => {
              const categoria = mapaCategorias.get(t.categoriaId);
              const Icono = obtenerIcono(categoria?.icono ?? "");
              return (
                <li key={t.id}>
                  <button
                    onClick={() => setEditando(t)}
                    className="block w-full min-w-0 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-2)]"
                  >
                    {/* El layout va en un div interno, no en el propio <button>: Safari no
                        reparte bien min-width:0 a los hijos flex cuando el contenedor flex
                        es un <button>, y la descripción larga empujaba el importe fuera de
                        la pantalla. */}
                    <div className="flex w-full min-w-0 items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `${categoria?.color ?? "#8892a4"}22`, color: categoria?.color ?? "#8892a4" }}
                      >
                        <Icono size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {t.descripcion || categoria?.nombre || "Movimiento"}
                        </p>
                        <p className="truncate text-xs text-[var(--muted)]">
                          {categoria?.nombre} · {formatearFecha(t.fecha)}
                          {t.metodoPago ? ` · ${t.metodoPago}` : ""}
                        </p>
                        {t.etiquetas && t.etiquetas.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {t.etiquetas.map((e) => (
                              <span
                                key={e}
                                className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]"
                              >
                                #{e}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span
                        className={cn(
                          "font-mono-tabular shrink-0 text-sm font-semibold",
                          t.tipo === "ingreso" ? "text-[var(--ingreso)]" : "text-[var(--gasto)]"
                        )}
                      >
                        {t.tipo === "ingreso" ? "+" : "−"}
                        {formatearMoneda(t.importe, ajustes.moneda).replace("-", "")}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <TransactionForm
        abierto={!!editando}
        onCerrar={() => setEditando(null)}
        transaccionExistente={editando ?? undefined}
      />
    </div>
  );
}
