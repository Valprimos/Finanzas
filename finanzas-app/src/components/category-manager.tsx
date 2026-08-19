"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useFinanzas } from "@/lib/store";
import { obtenerIcono, NOMBRES_ICONOS } from "@/lib/iconos";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";

const PALETA = [
  "#F5A524", "#6E7CE0", "#4FB6E0", "#E05C97", "#E0575C", "#B085E0",
  "#E0A857", "#57C4E0", "#3FCF8E", "#3FCFB8", "#5CE0A0", "#9EE05C",
];

export function CategoryManager() {
  const { categorias, transacciones, agregarCategoria, eliminarCategoria } = useFinanzas();
  const [tipoActivo, setTipoActivo] = useState<TransactionType>("gasto");
  const [formAbierto, setFormAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [color, setColor] = useState(PALETA[0]);
  const [icono, setIcono] = useState(NOMBRES_ICONOS[0]);

  const filtradas = categorias.filter((c) => c.tipo === tipoActivo);

  async function manejarCrear() {
    if (!nombre.trim()) return;
    await agregarCategoria({ nombre: nombre.trim(), tipo: tipoActivo, color, icono });
    setFormAbierto(false);
    setNombre("");
  }

  function categoriaEnUso(categoriaId: string) {
    return transacciones.some((t) => t.categoriaId === categoriaId);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 rounded-xl bg-[var(--surface-2)] p-1">
          {(["gasto", "ingreso"] as TransactionType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTipoActivo(t)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-medium capitalize",
                tipoActivo === t ? "bg-[var(--surface)] text-[var(--foreground)]" : "text-[var(--muted)]"
              )}
            >
              {t}s
            </button>
          ))}
        </div>
        <Button tamano="sm" onClick={() => setFormAbierto(true)}>
          <Plus size={16} /> Nueva
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {filtradas.map((c) => {
          const Icono = obtenerIcono(c.icono);
          const enUso = categoriaEnUso(c.id);
          return (
            <Card key={c.id}>
              <CardContent className="flex items-center gap-3 p-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${c.color}22`, color: c.color }}
                >
                  <Icono size={17} />
                </div>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.nombre}</span>
                <button
                  onClick={() => !enUso && eliminarCategoria(c.id)}
                  disabled={enUso}
                  title={enUso ? "En uso por movimientos existentes" : "Eliminar"}
                  className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--gasto)] disabled:opacity-30"
                >
                  <Trash2 size={14} />
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog abierto={formAbierto} onCerrar={() => setFormAbierto(false)} titulo="Nueva categoría">
        <div className="space-y-4">
          <Input placeholder="Nombre de la categoría" value={nombre} onChange={(e) => setNombre(e.target.value)} />

          <div>
            <label className="mb-2 block text-xs font-medium text-[var(--muted)]">Color</label>
            <div className="flex flex-wrap gap-2">
              {PALETA.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-transform",
                    color === c && "scale-110 ring-2 ring-offset-2 ring-offset-[var(--surface)]"
                  )}
                  style={{ background: c, ...(color === c ? { boxShadow: `0 0 0 2px ${c}` } : {}) }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[var(--muted)]">Icono</label>
            <div className="grid grid-cols-6 gap-2">
              {NOMBRES_ICONOS.map((nombreIcono) => {
                const Icono = obtenerIcono(nombreIcono);
                return (
                  <button
                    key={nombreIcono}
                    onClick={() => setIcono(nombreIcono)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl border transition-colors",
                      icono === nombreIcono
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    <Icono size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          <Button className="w-full" onClick={manejarCrear}>
            Crear categoría
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
