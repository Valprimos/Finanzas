import type { Category } from "./types";

/**
 * Categorías predeterminadas. El usuario puede editarlas, ocultarlas o
 * añadir las suyas propias desde /categorias. Los colores están pensados
 * para funcionar bien tanto en modo oscuro como en modo claro.
 */
export const CATEGORIAS_PREDETERMINADAS: Category[] = [
  { id: "cat-alimentacion", nombre: "Alimentación", tipo: "gasto", color: "#F5A524", icono: "ShoppingCart", esPredeterminada: true },
  { id: "cat-vivienda", nombre: "Vivienda", tipo: "gasto", color: "#6E7CE0", icono: "Home", esPredeterminada: true },
  { id: "cat-transporte", nombre: "Transporte", tipo: "gasto", color: "#4FB6E0", icono: "Car", esPredeterminada: true },
  { id: "cat-ocio", nombre: "Ocio", tipo: "gasto", color: "#E05C97", icono: "PartyPopper", esPredeterminada: true },
  { id: "cat-salud", nombre: "Salud", tipo: "gasto", color: "#E0575C", icono: "HeartPulse", esPredeterminada: true },
  { id: "cat-suscripciones", nombre: "Suscripciones", tipo: "gasto", color: "#B085E0", icono: "Repeat", esPredeterminada: true },
  { id: "cat-compras", nombre: "Compras", tipo: "gasto", color: "#E0A857", icono: "ShoppingBag", esPredeterminada: true },
  { id: "cat-educacion", nombre: "Educación", tipo: "gasto", color: "#57C4E0", icono: "GraduationCap", esPredeterminada: true },
  { id: "cat-otros-gasto", nombre: "Otros", tipo: "gasto", color: "#8A93A6", icono: "MoreHorizontal", esPredeterminada: true },
  { id: "cat-nomina", nombre: "Nómina", tipo: "ingreso", color: "#3FCF8E", icono: "Wallet", esPredeterminada: true },
  { id: "cat-freelance", nombre: "Freelance", tipo: "ingreso", color: "#3FCFB8", icono: "Laptop", esPredeterminada: true },
  { id: "cat-inversiones", nombre: "Inversiones", tipo: "ingreso", color: "#5CE0A0", icono: "TrendingUp", esPredeterminada: true },
  { id: "cat-regalos", nombre: "Regalos", tipo: "ingreso", color: "#9EE05C", icono: "Gift", esPredeterminada: true },
  { id: "cat-otros-ingreso", nombre: "Otros ingresos", tipo: "ingreso", color: "#6FE07E", icono: "MoreHorizontal", esPredeterminada: true },
];
