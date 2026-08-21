"use client";

import { useState } from "react";
import { Plus, Trash2, Repeat, SkipForward } from "lucide-react";
import { useFinanzas } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatearMoneda, formatearFecha, hoyISO } from "@/lib/format";
import { proximaOcurrencia } from "@/lib/recurrentes";
import type { RecurrenceFrequency, TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";

const FRECUENCIAS: { valor: RecurrenceFrequency; etiqueta: string }[] = [
  { valor: "diaria", etiqueta: "Diaria" },
  { valor: "semanal", etiqueta: "Semanal" },
  { valor: "mensual", etiqueta: "Mensual" },
  { valor: "anual", etiqueta: "Anual" },
];

export function RecurringManager() {
  const { recurrentes, categorias, ajustes, agregarRecurrente, actualizarRecurrente, eliminarRecurrente } =
    useFinanzas();
  const [formAbierto, setFormAbierto] = useState(false);
  const [tipo, setTipo] = useState<TransactionType>("gasto");
  const [importe, setImporte] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [frecuencia, setFrecuencia] = useState<RecurrenceFrequency>("mensual");
  const [fechaInicio, setFechaInicio] = useState(hoyISO());

  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo);
  const mapaCategorias = new Map(categorias.map((c) => [c.id, c]));

  async function manejarSaltar(regla: (typeof recurrentes)[number]) {
    const fecha = proximaOcurrencia(regla);
    await actualizarRecurrente(regla.id, { fechasOmitidas: [...(regla.fechasOmitidas ?? []), fecha] });
  }

  async function manejarCrear() {
    const valor = parseFloat(importe.replace(",", "."));
    if (!valor || valor <= 0 || !categoriaId) return;
    await agregarRecurrente({
      tipo,
      importe: valor,
      categoriaId,
      descripcion: descripcion.trim() || undefined,
      frecuencia,
      fechaInicio,
      activo: true,
    });
    setFormAbierto(false);
    setImporte("");
    setCategoriaId("");
    setDescripcion("");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Movimientos recurrentes</h2>
        <Button tamano="sm" onClick={() => setFormAbierto(true)}>
          <Plus size={16} /> Nuevo
        </Button>
      </div>

      {recurrentes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-[var(--muted)]">
            Automatiza tu nómina, alquiler o suscripciones: se generarán solas en la fecha que indiques.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {recurrentes.map((r) => {
            const categoria = mapaCategorias.get(r.categoriaId);
            return (
              <Card key={r.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `${categoria?.color}22`, color: categoria?.color }}
                    >
                      <Repeat size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.descripcion || categoria?.nombre}</p>
                      <p className="text-xs text-[var(--muted)] capitalize">
                        {FRECUENCIAS.find((f) => f.valor === r.frecuencia)?.etiqueta} · {categoria?.nombre}
                        {r.activo && ` · próxima: ${formatearFecha(proximaOcurrencia(r))}`}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 font-mono-tabular text-sm font-semibold",
                        r.tipo === "ingreso" ? "text-[var(--ingreso)]" : "text-[var(--gasto)]"
                      )}
                    >
                      {r.tipo === "ingreso" ? "+" : "−"}
                      {formatearMoneda(r.importe, ajustes.moneda).replace("-", "")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => actualizarRecurrente(r.id, { activo: !r.activo })}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-medium",
                        r.activo ? "bg-[var(--ingreso-soft)] text-[var(--ingreso)]" : "bg-[var(--surface-2)] text-[var(--muted)]"
                      )}
                    >
                      {r.activo ? "Activo" : "Pausado"}
                    </button>
                    <div className="flex items-center gap-1">
                      {r.activo && (
                        <button
                          onClick={() => manejarSaltar(r)}
                          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                        >
                          <SkipForward size={13} /> Saltar la próxima
                        </button>
                      )}
                      <button
                        onClick={() => eliminarRecurrente(r.id)}
                        className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--gasto)]"
                        aria-label="Eliminar recurrente"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog abierto={formAbierto} onCerrar={() => setFormAbierto(false)} titulo="Nuevo movimiento recurrente">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-[var(--surface-2)] p-1">
            {(["gasto", "ingreso"] as TransactionType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                className={cn(
                  "rounded-lg py-2 text-sm font-semibold capitalize",
                  tipo === t
                    ? t === "gasto"
                      ? "bg-[var(--gasto-soft)] text-[var(--gasto)]"
                      : "bg-[var(--ingreso-soft)] text-[var(--ingreso)]"
                    : "text-[var(--muted)]"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <Input
            inputMode="decimal"
            placeholder="Importe"
            value={importe}
            onChange={(e) => setImporte(e.target.value)}
          />
          <Select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
            <option value="">Elegir categoría…</option>
            {categoriasFiltradas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
          <Input
            placeholder="Descripción (ej. Alquiler piso)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select value={frecuencia} onChange={(e) => setFrecuencia(e.target.value as RecurrenceFrequency)}>
              {FRECUENCIAS.map((f) => (
                <option key={f.valor} value={f.valor}>
                  {f.etiqueta}
                </option>
              ))}
            </Select>
            <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </div>
          <Button className="w-full" onClick={manejarCrear}>
            Crear recurrente
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
