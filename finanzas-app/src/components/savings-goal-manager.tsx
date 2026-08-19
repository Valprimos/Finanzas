"use client";

import { useState } from "react";
import { Plus, Trash2, PiggyBank, Target } from "lucide-react";
import { useFinanzas } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatearMoneda, formatearFecha, hoyISO } from "@/lib/format";

export function SavingsGoalManager() {
  const { metasAhorro, aportaciones, ajustes, agregarMeta, eliminarMeta, agregarAportacion, eliminarAportacion } =
    useFinanzas();

  const [formMetaAbierto, setFormMetaAbierto] = useState(false);
  const [nombreMeta, setNombreMeta] = useState("");
  const [objetivoMeta, setObjetivoMeta] = useState("");
  const [fechaLimiteMeta, setFechaLimiteMeta] = useState("");

  const [metaParaAportar, setMetaParaAportar] = useState<string | null>(null);
  const [importeAportacion, setImporteAportacion] = useState("");
  const [notaAportacion, setNotaAportacion] = useState("");

  const [metaExpandida, setMetaExpandida] = useState<string | null>(null);

  async function manejarCrearMeta() {
    const objetivo = parseFloat(objetivoMeta.replace(",", "."));
    if (!nombreMeta.trim() || !objetivo || objetivo <= 0) return;
    await agregarMeta({
      nombre: nombreMeta.trim(),
      objetivo,
      fechaLimite: fechaLimiteMeta || undefined,
    });
    setFormMetaAbierto(false);
    setNombreMeta("");
    setObjetivoMeta("");
    setFechaLimiteMeta("");
  }

  async function manejarAportar() {
    const importe = parseFloat(importeAportacion.replace(",", "."));
    if (!metaParaAportar || !importe || importe <= 0) return;
    await agregarAportacion({
      metaId: metaParaAportar,
      importe,
      fecha: hoyISO(),
      nota: notaAportacion.trim() || undefined,
    });
    setMetaParaAportar(null);
    setImporteAportacion("");
    setNotaAportacion("");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Objetivos de ahorro</h2>
        <Button tamano="sm" onClick={() => setFormMetaAbierto(true)}>
          <Plus size={16} /> Nuevo objetivo
        </Button>
      </div>

      {metasAhorro.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <PiggyBank size={28} className="text-[var(--muted)]" />
            <p className="text-sm text-[var(--muted)]">
              Crea un objetivo (ej. &quot;2000 € para diciembre&quot;) y ve añadiendo aportaciones a mano cuando
              apartes dinero.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {metasAhorro
            .slice()
            .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn))
            .map((meta) => {
              const aportacionesMeta = aportaciones
                .filter((a) => a.metaId === meta.id)
                .sort((a, b) => b.fecha.localeCompare(a.fecha));
              const ahorrado = aportacionesMeta.reduce((s, a) => s + a.importe, 0);
              const porcentaje = meta.objetivo > 0 ? (ahorrado / meta.objetivo) * 100 : 0;
              const conseguido = ahorrado >= meta.objetivo;
              const expandida = metaExpandida === meta.id;

              return (
                <Card key={meta.id}>
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                          <Target size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{meta.nombre}</p>
                          {meta.fechaLimite && (
                            <p className="text-xs text-[var(--muted)]">Hasta {formatearFecha(meta.fechaLimite)}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => eliminarMeta(meta.id)}
                        className="shrink-0 rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--gasto)]"
                        aria-label="Eliminar objetivo"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-mono-tabular font-semibold">{formatearMoneda(ahorrado, ajustes.moneda)}</span>
                      <span className="font-mono-tabular text-[var(--muted)]">
                        de {formatearMoneda(meta.objetivo, ajustes.moneda)}
                      </span>
                    </div>
                    <Progress valor={porcentaje} color={conseguido ? "var(--ingreso)" : "var(--accent)"} />

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setMetaExpandida(expandida ? null : meta.id)}
                        className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                      >
                        {aportacionesMeta.length} aportación{aportacionesMeta.length !== 1 ? "es" : ""}
                        {aportacionesMeta.length > 0 ? (expandida ? " — ocultar" : " — ver") : ""}
                      </button>
                      <Button tamano="sm" variante="secundario" onClick={() => setMetaParaAportar(meta.id)}>
                        <Plus size={14} /> Aportar
                      </Button>
                    </div>

                    {expandida && aportacionesMeta.length > 0 && (
                      <ul className="space-y-1.5 border-t border-[var(--border)] pt-3">
                        {aportacionesMeta.map((a) => (
                          <li key={a.id} className="flex items-center justify-between text-xs">
                            <span className="text-[var(--muted)]">
                              {formatearFecha(a.fecha)}
                              {a.nota ? ` · ${a.nota}` : ""}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono-tabular text-[var(--ingreso)]">
                                +{formatearMoneda(a.importe, ajustes.moneda)}
                              </span>
                              <button
                                onClick={() => eliminarAportacion(a.id)}
                                className="text-[var(--muted)] hover:text-[var(--gasto)]"
                                aria-label="Eliminar aportación"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}

      {/* Nuevo objetivo */}
      <Dialog abierto={formMetaAbierto} onCerrar={() => setFormMetaAbierto(false)} titulo="Nuevo objetivo de ahorro">
        <div className="space-y-4">
          <Input
            placeholder="Nombre (ej. Viaje a Japón)"
            value={nombreMeta}
            onChange={(e) => setNombreMeta(e.target.value)}
          />
          <Input
            inputMode="decimal"
            placeholder="Importe objetivo"
            value={objetivoMeta}
            onChange={(e) => setObjetivoMeta(e.target.value)}
          />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
              Fecha límite <span className="text-[var(--muted)]">(opcional)</span>
            </label>
            <Input type="date" value={fechaLimiteMeta} onChange={(e) => setFechaLimiteMeta(e.target.value)} />
          </div>
          <Button className="w-full" onClick={manejarCrearMeta}>
            Crear objetivo
          </Button>
        </div>
      </Dialog>

      {/* Nueva aportación */}
      <Dialog abierto={!!metaParaAportar} onCerrar={() => setMetaParaAportar(null)} titulo="Añadir aportación">
        <div className="space-y-4">
          <Input
            autoFocus
            inputMode="decimal"
            placeholder="Importe"
            value={importeAportacion}
            onChange={(e) => setImporteAportacion(e.target.value)}
          />
          <Input
            placeholder="Nota (opcional)"
            value={notaAportacion}
            onChange={(e) => setNotaAportacion(e.target.value)}
          />
          <Button className="w-full" onClick={manejarAportar}>
            Añadir
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
