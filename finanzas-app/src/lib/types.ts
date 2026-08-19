export type TransactionType = "gasto" | "ingreso";

export type RecurrenceFrequency = "diaria" | "semanal" | "mensual" | "anual";

export interface Category {
  id: string;
  nombre: string;
  tipo: TransactionType;
  color: string; // hex
  icono: string; // lucide icon name
  esPredeterminada?: boolean;
}

export interface Account {
  id: string;
  nombre: string;
  color: string;
}

export interface Transaction {
  id: string;
  tipo: TransactionType;
  importe: number; // siempre positivo, el signo lo da "tipo"
  fecha: string; // ISO yyyy-MM-dd
  categoriaId: string;
  descripcion?: string;
  metodoPago?: string;
  cuentaId?: string;
  recurrenteId?: string; // si viene de una regla recurrente
  creadoEn: string;
  actualizadoEn: string;
}

export interface RecurringRule {
  id: string;
  tipo: TransactionType;
  importe: number;
  categoriaId: string;
  descripcion?: string;
  metodoPago?: string;
  cuentaId?: string;
  frecuencia: RecurrenceFrequency;
  diaDelMes?: number; // 1-31, para mensual/anual
  diaSemana?: number; // 0-6, para semanal
  fechaInicio: string;
  fechaFin?: string;
  ultimaGeneracion?: string; // última fecha para la que se generó una transacción
  activo: boolean;
}

export interface Budget {
  id: string;
  categoriaId: string;
  limite: number;
  mes: string; // "todos" para presupuesto recurrente mensual, o "yyyy-MM" para un mes específico
}

export interface AppSettings {
  moneda: string; // ISO 4217, ej "EUR"
  localeFormato: string; // ej "es-ES"
  tema: "claro" | "oscuro" | "sistema";
  nombreUsuario?: string;
}

export interface BackupData {
  version: number;
  exportadoEn: string;
  transacciones: Transaction[];
  categorias: Category[];
  cuentas: Account[];
  presupuestos: Budget[];
  recurrentes: RecurringRule[];
  ajustes: AppSettings;
}
