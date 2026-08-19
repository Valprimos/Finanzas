"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFinanzas } from "@/lib/store";
import { hoyISO } from "@/lib/format";
import type { Transaction, TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  transaccionExistente?: Transaction;
}

const METODOS_PAGO = ["Tarjeta", "Efectivo", "Transferencia", "Bizum", "Otro"];

/**
 * Wrapper: mantiene el Dialog montado y solo instancia el formulario
 * (con una `key` única) mientras está abierto. Así el formulario siempre
 * arranca con el estado inicial correcto derivado de las props, sin
 * necesidad de sincronizar estado dentro de un useEffect.
 */
export function TransactionForm({ abierto, onCerrar, transaccionExistente }: Props) {
  return (
    <Dialog
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={transaccionExistente ? "Editar movimiento" : "Nuevo movimiento"}
    >
      {abierto && (
        <FormularioInterno
          key={transaccionExistente?.id ?? "nuevo"}
          onCerrar={onCerrar}
          transaccionExistente={transaccionExistente}
        />
      )}
    </Dialog>
  );
}

function FormularioInterno({
  onCerrar,
  transaccionExistente,
}: {
  onCerrar: () => void;
  transaccionExistente?: Transaction;
}) {
  const { categorias, cuentas, agregarTransaccion, actualizarTransaccion, eliminarTransaccion } =
    useFinanzas();

  const [tipo, setTipo] = useState<TransactionType>(transaccionExistente?.tipo ?? "gasto");
  const [importe, setImporte] = useState(
    transaccionExistente ? String(transaccionExistente.importe) : ""
  );
  const [fecha, setFecha] = useState(transaccionExistente?.fecha ?? hoyISO());
  const [categoriaId, setCategoriaId] = useState(transaccionExistente?.categoriaId ?? "");
  const [descripcion, setDescripcion] = useState(transaccionExistente?.descripcion ?? "");
  const [metodoPago, setMetodoPago] = useState(transaccionExistente?.metodoPago ?? "");
  const [cuentaId, setCuentaId] = useState(transaccionExistente?.cuentaId ?? "");
  const [error, setError] = useState("");

  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo);

  function cambiarTipo(nuevoTipo: TransactionType) {
    setTipo(nuevoTipo);
    // Si la categoría seleccionada no encaja con el nuevo tipo, se limpia
    // aquí mismo (en el manejador del evento, no en un efecto).
    if (!categorias.some((c) => c.id === categoriaId && c.tipo === nuevoTipo)) {
      setCategoriaId("");
    }
  }

  async function manejarGuardar() {
    const valor = parseFloat(importe.replace(",", "."));
    if (!valor || valor <= 0) {
      setError("Introduce un importe válido mayor que cero.");
      return;
    }
    if (!categoriaId) {
      setError("Elige una categoría.");
      return;
    }

    const datos = {
      tipo,
      importe: valor,
      fecha,
      categoriaId,
      descripcion: descripcion.trim() || undefined,
      metodoPago: metodoPago || undefined,
      cuentaId: cuentaId || undefined,
    };

    if (transaccionExistente) {
      await actualizarTransaccion(transaccionExistente.id, datos);
    } else {
      await agregarTransaccion(datos);
    }
    onCerrar();
  }

  async function manejarEliminar() {
    if (!transaccionExistente) return;
    await eliminarTransaccion(transaccionExistente.id);
    onCerrar();
  }

  return (
    <div className="space-y-4">
      {/* Selector de tipo */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-[var(--surface-2)] p-1">
        {(["gasto", "ingreso"] as TransactionType[]).map((t) => (
          <button
            key={t}
            onClick={() => cambiarTipo(t)}
            className={cn(
              "rounded-lg py-2 text-sm font-semibold capitalize transition-colors",
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

      {/* Importe grande, protagonista */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Importe</label>
        <div className="flex items-center gap-2">
          <span className="font-mono-tabular text-2xl text-[var(--muted)]">€</span>
          <input
            autoFocus
            inputMode="decimal"
            placeholder="0,00"
            value={importe}
            onChange={(e) => setImporte(e.target.value)}
            className="font-mono-tabular w-full bg-transparent text-3xl font-semibold outline-none placeholder:text-[var(--muted)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Categoría</label>
          <Select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
            <option value="">Elegir…</option>
            {categoriasFiltradas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Fecha</label>
          <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
          Descripción <span className="text-[var(--muted)]">(opcional)</span>
        </label>
        <Textarea
          rows={2}
          placeholder="Ej. Compra semanal en el súper"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
            Método de pago <span className="text-[var(--muted)]">(opcional)</span>
          </label>
          <Select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
            <option value="">Sin especificar</option>
            {METODOS_PAGO.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
            Cuenta <span className="text-[var(--muted)]">(opcional)</span>
          </label>
          <Select value={cuentaId} onChange={(e) => setCuentaId(e.target.value)}>
            <option value="">Sin especificar</option>
            {cuentas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {error && <p className="text-sm text-[var(--gasto)]">{error}</p>}

      <div className="flex gap-2 pt-1">
        {transaccionExistente && (
          <Button variante="peligro" tamano="md" onClick={manejarEliminar}>
            Eliminar
          </Button>
        )}
        <Button variante="primario" tamano="md" className="flex-1" onClick={manejarGuardar}>
          Guardar
        </Button>
      </div>
    </div>
  );
}
