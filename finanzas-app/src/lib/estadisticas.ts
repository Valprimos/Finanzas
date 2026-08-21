import type { Category, Transaction } from "./types";
import { hoyISO } from "./format";

/**
 * Extrapola el gasto del mes en curso al ritmo actual. Solo tiene sentido
 * para el mes que se está viviendo — para un mes ya cerrado o futuro
 * devuelve null en vez de un número que no significaría nada.
 */
export function calcularProyeccionFinMes(
  gastado: number,
  mesKey: string,
  hoy: string = hoyISO()
): number | null {
  if (mesKey !== hoy.slice(0, 7)) return null;
  const [anio, mes] = mesKey.split("-").map(Number);
  const diasEnMes = new Date(anio, mes, 0).getDate();
  const diaActual = Number(hoy.slice(8, 10));
  if (diaActual <= 0) return null;
  return (gastado / diaActual) * diasEnMes;
}

export interface GastoHormiga {
  categoriaId: string;
  nombre: string;
  color: string;
  numTransacciones: number;
  total: number;
  importeMedio: number;
}

/**
 * Categorías con muchas transacciones pequeñas que, sumadas, pesan más de
 * lo que parece a simple vista — el clásico "gasto hormiga". Umbrales
 * pensados para pillar patrones tipo "cafés, snacks, apps" sin marcar
 * cualquier categoría con dos o tres compras sueltas.
 */
export function detectarGastosHormiga(
  transacciones: Transaction[],
  categorias: Category[],
  opciones: { minTransacciones?: number; importeMedioMaximo?: number } = {}
): GastoHormiga[] {
  const { minTransacciones = 5, importeMedioMaximo = 15 } = opciones;
  const mapaCategorias = new Map(categorias.map((c) => [c.id, c]));

  const porCategoria = new Map<string, Transaction[]>();
  for (const t of transacciones) {
    if (t.tipo !== "gasto") continue;
    const lista = porCategoria.get(t.categoriaId) ?? [];
    lista.push(t);
    porCategoria.set(t.categoriaId, lista);
  }

  const resultado: GastoHormiga[] = [];
  for (const [categoriaId, txs] of porCategoria) {
    const total = txs.reduce((s, t) => s + t.importe, 0);
    const importeMedio = total / txs.length;
    if (txs.length >= minTransacciones && importeMedio <= importeMedioMaximo) {
      const categoria = mapaCategorias.get(categoriaId);
      resultado.push({
        categoriaId,
        nombre: categoria?.nombre ?? "Otros",
        color: categoria?.color ?? "#8892a4",
        numTransacciones: txs.length,
        total,
        importeMedio,
      });
    }
  }

  return resultado.sort((a, b) => b.total - a.total);
}
