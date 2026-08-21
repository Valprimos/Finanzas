import type { RecurringRule, Transaction } from "./types";
import { hoyISO } from "./format";

/**
 * Calcula qué transacciones nuevas hay que generar para una regla recurrente
 * desde la última generación hasta hoy (inclusive). Es una función pura para
 * poder testearla fácilmente: no toca la base de datos.
 *
 * Las fechas en `regla.fechasOmitidas` (ocurrencias puntuales saltadas a
 * mano) no generan transacción, pero SÍ cuentan como "procesadas" — si no,
 * la próxima carga las volvería a intentar generar indefinidamente.
 */
export function generarTransaccionesPendientes(
  regla: RecurringRule,
  hoy: string = hoyISO()
): { nuevas: Transaction[]; ultimaFechaProcesada: string | null } {
  if (!regla.activo) return { nuevas: [], ultimaFechaProcesada: null };

  const inicio = regla.ultimaGeneracion
    ? siguienteFecha(regla.ultimaGeneracion, regla.frecuencia)
    : regla.fechaInicio;

  const limite = regla.fechaFin && regla.fechaFin < hoy ? regla.fechaFin : hoy;
  const omitidas = new Set(regla.fechasOmitidas ?? []);

  const nuevas: Transaction[] = [];
  let cursor = inicio;
  let ultimaFechaProcesada: string | null = null;
  let guarda = 0; // evita bucles infinitos ante datos corruptos

  while (cursor <= limite && guarda < 1000) {
    if (!omitidas.has(cursor)) {
      const ahora = new Date().toISOString();
      nuevas.push({
        id: `${regla.id}-${cursor}`,
        tipo: regla.tipo,
        importe: regla.importe,
        fecha: cursor,
        categoriaId: regla.categoriaId,
        descripcion: regla.descripcion,
        metodoPago: regla.metodoPago,
        cuentaId: regla.cuentaId,
        recurrenteId: regla.id,
        creadoEn: ahora,
        actualizadoEn: ahora,
      });
    }
    ultimaFechaProcesada = cursor;
    cursor = siguienteFecha(cursor, regla.frecuencia);
    guarda++;
  }

  return { nuevas, ultimaFechaProcesada };
}

/** Próxima fecha en la que tocaría generar una transacción de esta regla. */
export function proximaOcurrencia(regla: RecurringRule): string {
  return regla.ultimaGeneracion ? siguienteFecha(regla.ultimaGeneracion, regla.frecuencia) : regla.fechaInicio;
}

export function siguienteFecha(iso: string, frecuencia: RecurringRule["frecuencia"]): string {
  const fecha = new Date(iso + "T00:00:00");
  switch (frecuencia) {
    case "diaria":
      fecha.setDate(fecha.getDate() + 1);
      break;
    case "semanal":
      fecha.setDate(fecha.getDate() + 7);
      break;
    case "mensual":
      fecha.setMonth(fecha.getMonth() + 1);
      break;
    case "anual":
      fecha.setFullYear(fecha.getFullYear() + 1);
      break;
  }
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}
