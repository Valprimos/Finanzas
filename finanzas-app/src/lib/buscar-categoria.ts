import type { Category, TransactionType } from "./types";

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Busca una categoría por nombre (ignorando mayúsculas y tildes) dentro
 * del tipo indicado. Si no encuentra coincidencia exacta, prueba una
 * coincidencia parcial. Si tampoco, cae en la categoría "Otros" de ese
 * tipo, y si ni eso existe, en la primera categoría de ese tipo.
 */
export function buscarCategoriaPorNombre(
  categorias: Category[],
  nombre: string | null,
  tipo: TransactionType
): Category | undefined {
  const delTipo = categorias.filter((c) => c.tipo === tipo);
  if (nombre) {
    const buscado = normalizar(nombre);
    const exacta = delTipo.find((c) => normalizar(c.nombre) === buscado);
    if (exacta) return exacta;
    const parcial = delTipo.find(
      (c) => normalizar(c.nombre).includes(buscado) || buscado.includes(normalizar(c.nombre))
    );
    if (parcial) return parcial;
  }
  const otros = delTipo.find((c) => normalizar(c.nombre).startsWith("otro"));
  return otros ?? delTipo[0];
}
