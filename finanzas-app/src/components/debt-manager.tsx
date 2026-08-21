"use client";

import { useState } from "react";
import { Plus, Trash2, HandCoins, CheckCircle2 } from "lucide-react";
import { useFinanzas } from "@/lib/store";
import { calcularSaldoDeuda } from "@/lib/deudas";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatearMoneda, formatearFecha, hoyISO } from "@/lib/format";
import type { Debt, TipoDeuda } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DebtManager() {
  const { deudas, pagosDeuda, ajustes, agregarDeuda, eliminarDeuda, agregarPagoDeuda } = useFinanzas();

  const [formAbierto, setFormAbierto] = useState(false);
  const [tipo, setTipo] = useState<TipoDeuda>("me_deben");
  const [persona, setPersona] = useState("");
  const [importe, setImporte] = useState("");
  const [notas, setNotas] = useState("");

  const [deudaParaPagar, setDeudaParaPagar] = useState<string | null>(null);
  const [importePago, setImportePago] = useState("");

  async function manejarCrear() {
    const valor = parseFloat(importe.replace(",", "."));
    if (!persona.trim() || !valor || valor <= 0) return;
    await agregarDeuda({
      tipo,
      persona: persona.trim(),
      importe: valor,
      fecha: hoyISO(),
      notas: notas.trim() || undefined,
    });
    setFormAbierto(false);
    setTipo("me_deben");
    setPersona("");
    setImporte("");
    setNotas("");
  }

  async function manejarPagar() {
    const valor = parseFloat(importePago.replace(",", "."));
    if (!deudaParaPagar || !valor || valor <= 0) return;
    await agregarPagoDeuda({ deudaId: deudaParaPagar, importe: valor, fecha: hoyISO() });
    setDeudaParaPagar(null);
    setImportePago("");
  }

  const meDeben = deudas.filter((d) => d.tipo === "me_deben").sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
  const debo = deudas.filter((d) => d.tipo === "debo").sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Deudas y préstamos</h2>
        <Button tamano="sm" onClick={() => setFormAbierto(true)}>
          <Plus size={16} /> Nueva
        </Button>
      </div>

      {deudas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <HandCoins size={28} className="text-[var(--muted)]" />
            <p className="text-sm text-[var(--muted)]">
              Apunta lo que te deben o lo que debes (ej. &quot;50 € a Juan&quot;) y ve registrando los pagos hasta
              saldarlo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <ListaDeudas
            titulo="Te deben"
            deudas={meDeben}
            pagos={pagosDeuda}
            moneda={ajustes.moneda}
            colorPendiente="var(--ingreso)"
            onPagar={setDeudaParaPagar}
            onEliminar={eliminarDeuda}
          />
          <ListaDeudas
            titulo="Debes"
            deudas={debo}
            pagos={pagosDeuda}
            moneda={ajustes.moneda}
            colorPendiente="var(--gasto)"
            onPagar={setDeudaParaPagar}
            onEliminar={eliminarDeuda}
          />
        </>
      )}

      {/* Nueva deuda/préstamo */}
      <Dialog abierto={formAbierto} onCerrar={() => setFormAbierto(false)} titulo="Nueva deuda o préstamo">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-[var(--surface-2)] p-1">
            {(
              [
                { valor: "me_deben", etiqueta: "Me deben" },
                { valor: "debo", etiqueta: "Debo" },
              ] as const
            ).map((opcion) => (
              <button
                key={opcion.valor}
                onClick={() => setTipo(opcion.valor)}
                className={cn(
                  "rounded-lg py-2 text-sm font-semibold transition-colors",
                  tipo === opcion.valor
                    ? opcion.valor === "me_deben"
                      ? "bg-[var(--ingreso-soft)] text-[var(--ingreso)]"
                      : "bg-[var(--gasto-soft)] text-[var(--gasto)]"
                    : "text-[var(--muted)]"
                )}
              >
                {opcion.etiqueta}
              </button>
            ))}
          </div>
          <Input placeholder="Nombre (ej. Juan)" value={persona} onChange={(e) => setPersona(e.target.value)} />
          <Input
            inputMode="decimal"
            placeholder="Importe"
            value={importe}
            onChange={(e) => setImporte(e.target.value)}
          />
          <Input
            placeholder="Nota (opcional)"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
          <Button className="w-full" onClick={manejarCrear}>
            Guardar
          </Button>
        </div>
      </Dialog>

      {/* Registrar un pago (parcial o total) */}
      <Dialog abierto={!!deudaParaPagar} onCerrar={() => setDeudaParaPagar(null)} titulo="Registrar pago">
        <div className="space-y-4">
          <Input
            autoFocus
            inputMode="decimal"
            placeholder="Importe"
            value={importePago}
            onChange={(e) => setImportePago(e.target.value)}
          />
          <Button className="w-full" onClick={manejarPagar}>
            Guardar pago
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function ListaDeudas({
  titulo,
  deudas,
  pagos,
  moneda,
  colorPendiente,
  onPagar,
  onEliminar,
}: {
  titulo: string;
  deudas: Debt[];
  pagos: Parameters<typeof calcularSaldoDeuda>[1];
  moneda: string;
  colorPendiente: string;
  onPagar: (id: string) => void;
  onEliminar: (id: string) => void;
}) {
  if (deudas.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[var(--muted)]">{titulo}</h3>
      {deudas.map((d) => {
        const { pagado, pendiente } = calcularSaldoDeuda(d, pagos);
        const porcentaje = d.importe > 0 ? (pagado / d.importe) * 100 : 0;
        const saldada = pendiente <= 0;

        return (
          <Card key={d.id}>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${colorPendiente}22`, color: colorPendiente }}
                  >
                    {saldada ? <CheckCircle2 size={18} /> : <HandCoins size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{d.persona}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {formatearFecha(d.fecha)}
                      {d.notas ? ` · ${d.notas}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onEliminar(d.id)}
                  className="shrink-0 rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--gasto)]"
                  aria-label="Eliminar"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="flex items-baseline justify-between text-sm">
                <span className="font-mono-tabular font-semibold" style={{ color: saldada ? "var(--ingreso)" : undefined }}>
                  {saldada ? "Saldada" : formatearMoneda(pendiente, moneda)}
                </span>
                <span className="font-mono-tabular text-[var(--muted)]">
                  de {formatearMoneda(d.importe, moneda)}
                </span>
              </div>
              <Progress valor={porcentaje} color={saldada ? "var(--ingreso)" : colorPendiente} />

              {!saldada && (
                <div className="flex justify-end">
                  <Button tamano="sm" variante="secundario" onClick={() => onPagar(d.id)}>
                    <Plus size={14} /> Registrar pago
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
