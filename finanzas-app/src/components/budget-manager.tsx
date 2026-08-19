"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useFinanzas } from "@/lib/store";
import { calcularEstadoPresupuestos } from "@/lib/presupuestos";
import { formatearMoneda, mesActualKey } from "@/lib/format";
import { obtenerIcono } from "@/lib/iconos";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function BudgetManager() {
  const { presupuestos, transacciones, categorias, ajustes, agregarPresupuesto, eliminarPresupuesto } =
    useFinanzas();
  const [formAbierto, setFormAbierto] = useState(false);
  const [categoriaId, setCategoriaId] = useState("");
  const [limite, setLimite] = useState("");

  const categoriasGasto = categorias.filter((c) => c.tipo === "gasto");
  const mapaCategorias = new Map(categorias.map((c) => [c.id, c]));
  const estados = calcularEstadoPresupuestos(presupuestos, transacciones, mesActualKey());

  async function manejarCrear() {
    const valor = parseFloat(limite.replace(",", "."));
    if (!categoriaId || !valor || valor <= 0) return;
    await agregarPresupuesto({ categoriaId, limite: valor, mes: "todos" });
    setFormAbierto(false);
    setCategoriaId("");
    setLimite("");
  }

  const categoriasSinPresupuesto = categoriasGasto.filter(
    (c) => !presupuestos.some((p) => p.categoriaId === c.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Presupuestos por categoría</h2>
        <Button tamano="sm" onClick={() => setFormAbierto(true)} disabled={categoriasSinPresupuesto.length === 0}>
          <Plus size={16} /> Nuevo
        </Button>
      </div>

      {estados.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-[var(--muted)]">
            Todavía no has creado ningún presupuesto. Define un límite mensual por categoría para recibir avisos
            cuando te acerques a superarlo.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {estados.map((e) => {
            const categoria = mapaCategorias.get(e.presupuesto.categoriaId);
            const Icono = obtenerIcono(categoria?.icono ?? "");
            const color = e.excedido ? "var(--gasto)" : e.cercaDelLimite ? "#f5a524" : "var(--accent)";
            return (
              <Card key={e.presupuesto.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: `${categoria?.color}22`, color: categoria?.color }}
                    >
                      <Icono size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{categoria?.nombre}</p>
                      <p className="font-mono-tabular text-xs text-[var(--muted)]">
                        {formatearMoneda(e.gastado, ajustes.moneda)} de {formatearMoneda(e.presupuesto.limite, ajustes.moneda)}
                      </p>
                    </div>
                    <button
                      onClick={() => eliminarPresupuesto(e.presupuesto.id)}
                      className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--gasto)]"
                      aria-label="Eliminar presupuesto"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <Progress valor={e.porcentaje} color={color} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog abierto={formAbierto} onCerrar={() => setFormAbierto(false)} titulo="Nuevo presupuesto">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Categoría</label>
            <Select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
              <option value="">Elegir…</option>
              {categoriasSinPresupuesto.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Límite mensual</label>
            <Input inputMode="decimal" placeholder="0,00" value={limite} onChange={(e) => setLimite(e.target.value)} />
          </div>
          <Button className="w-full" onClick={manejarCrear}>
            Crear presupuesto
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
