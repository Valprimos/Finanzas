"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useFinanzas } from "@/lib/store";
import { buscarCategoriaPorNombre } from "@/lib/buscar-categoria";
import { formatearMoneda, hoyISO } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { TransactionType } from "@/lib/types";

/**
 * Ruta de "captura rápida" pensada para integrarse con Atajos de iOS/Android,
 * automatizaciones o cualquier herramienta que pueda abrir una URL.
 *
 * Ejemplo:
 *   /anadir?tipo=gasto&importe=12.50&categoria=Alimentacion&descripcion=Supermercado
 *
 * Parámetros admitidos (todos en la URL, sin necesidad de backend: el propio
 * navegador procesa la petición y guarda el movimiento en IndexedDB, igual
 * que si lo hubieras escrito a mano en el formulario):
 *   - tipo:        "gasto" | "ingreso"   (por defecto "gasto")
 *   - importe:     número, obligatorio (admite coma o punto decimal)
 *   - categoria:   nombre de una categoría existente (no distingue mayúsculas
 *                  ni tildes). Si no coincide con ninguna, se usa "Otros".
 *   - descripcion: texto libre, opcional
 *   - metodo:      método de pago, opcional
 *   - fecha:       yyyy-mm-dd, opcional (por defecto hoy)
 */
export default function PaginaAnadir() {
  return (
    <Suspense fallback={<EstadoCargando />}>
      <CapturaRapida />
    </Suspense>
  );
}

function EstadoCargando() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 text-center">
      <Loader2 size={28} className="animate-spin text-[var(--muted)]" />
      <p className="text-sm text-[var(--muted)]">Cargando…</p>
    </div>
  );
}

function CapturaRapida() {
  const params = useSearchParams();
  const { cargado, categorias, ajustes, agregarTransaccion } = useFinanzas();
  const [estado, setEstado] = useState<"procesando" | "ok" | "error">("procesando");
  const [detalle, setDetalle] = useState("");
  const [resumen, setResumen] = useState<{ importe: number; categoria: string; tipo: TransactionType } | null>(
    null
  );
  // Guarda si ya se ha lanzado el guardado. Un ref (no estado) porque hace
  // falta comprobarlo de forma síncrona: en desarrollo, React StrictMode
  // invoca el efecto dos veces seguidas al montar, antes de que el primer
  // `agregarTransaccion` (asíncrono) llegue a actualizar el estado — con
  // solo el estado como guarda, la segunda invocación no se entera a
  // tiempo y el movimiento se duplica.
  const yaLanzado = useRef(false);

  useEffect(() => {
    if (!cargado || estado !== "procesando" || yaLanzado.current) return;
    yaLanzado.current = true;
    let cancelado = false;

    async function procesar() {
      const importeTexto = params.get("importe");
      const tipoParam = params.get("tipo");
      const tipo: TransactionType = tipoParam === "ingreso" ? "ingreso" : "gasto";
      const importe = importeTexto ? parseFloat(importeTexto.replace(",", ".")) : NaN;

      if (!importeTexto || Number.isNaN(importe) || importe <= 0) {
        if (!cancelado) {
          setEstado("error");
          setDetalle("Falta el parámetro 'importe' o no es un número válido. Ejemplo: ?importe=12.50");
        }
        return;
      }

      const categoria = buscarCategoriaPorNombre(categorias, params.get("categoria"), tipo);
      if (!categoria) {
        if (!cancelado) {
          setEstado("error");
          setDetalle("No se ha encontrado ninguna categoría para este tipo de movimiento.");
        }
        return;
      }

      const fechaParam = params.get("fecha");
      const fecha = fechaParam && /^\d{4}-\d{2}-\d{2}$/.test(fechaParam) ? fechaParam : hoyISO();

      await agregarTransaccion({
        tipo,
        importe,
        fecha,
        categoriaId: categoria.id,
        descripcion: params.get("descripcion") || undefined,
        metodoPago: params.get("metodo") || undefined,
      });

      if (!cancelado) {
        setResumen({ importe, categoria: categoria.nombre, tipo });
        setEstado("ok");
      }
    }

    procesar();
    return () => {
      cancelado = true;
    };
  }, [cargado, estado, params, categorias, agregarTransaccion]);

  if (!cargado || estado === "procesando") return <EstadoCargando />;

  if (estado === "error") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <XCircle size={40} className="text-[var(--gasto)]" />
        <div>
          <p className="font-display text-lg font-semibold">No se pudo añadir el movimiento</p>
          <p className="mt-1 max-w-sm text-sm text-[var(--muted)]">{detalle}</p>
        </div>
        <Link href="/">
          <Button variante="secundario">Ir al resumen</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <CheckCircle2 size={44} className="text-[var(--ingreso)]" />
      <div>
        <p className="font-display text-lg font-semibold">Movimiento añadido</p>
        {resumen && (
          <p className="mt-1 text-sm text-[var(--muted)]">
            {resumen.tipo === "ingreso" ? "Ingreso" : "Gasto"} de{" "}
            <span className="font-mono-tabular font-semibold text-[var(--foreground)]">
              {formatearMoneda(resumen.importe, ajustes.moneda)}
            </span>{" "}
            en <strong>{resumen.categoria}</strong>
          </p>
        )}
      </div>
      <p className="text-xs text-[var(--muted)]">Ya puedes cerrar esta ventana.</p>
      <Link href="/">
        <Button variante="secundario" tamano="sm">
          Ir al resumen
        </Button>
      </Link>
    </div>
  );
}
