import { get, set, keys, del } from "idb-keyval";
import type {
  Transaction,
  Category,
  Account,
  Budget,
  RecurringRule,
  SavingsGoal,
  SavingsContribution,
  Debt,
  DebtPayment,
  AppSettings,
  BackupData,
} from "./types";

/**
 * Capa de persistencia 100% local (IndexedDB vía idb-keyval).
 * No se realiza ninguna petición de red: los datos nunca salen del dispositivo.
 * Cada "store" se guarda como una única clave con un array serializable,
 * lo que hace trivial exportar/importar backups completos.
 */

const KEYS = {
  transacciones: "finanzas:transacciones",
  categorias: "finanzas:categorias",
  cuentas: "finanzas:cuentas",
  presupuestos: "finanzas:presupuestos",
  recurrentes: "finanzas:recurrentes",
  metasAhorro: "finanzas:metasAhorro",
  aportaciones: "finanzas:aportaciones",
  deudas: "finanzas:deudas",
  pagosDeuda: "finanzas:pagosDeuda",
  ajustes: "finanzas:ajustes",
} as const;

async function leer<T>(key: string, fallback: T): Promise<T> {
  try {
    const valor = await get<T>(key);
    return valor ?? fallback;
  } catch (error) {
    console.error("Error leyendo de IndexedDB", key, error);
    return fallback;
  }
}

async function escribir<T>(key: string, valor: T): Promise<void> {
  try {
    await set(key, valor);
  } catch (error) {
    console.error("Error escribiendo en IndexedDB", key, error);
    throw error;
  }
}

export const db = {
  async getTransacciones(): Promise<Transaction[]> {
    return leer(KEYS.transacciones, []);
  },
  async setTransacciones(data: Transaction[]): Promise<void> {
    return escribir(KEYS.transacciones, data);
  },
  async getCategorias(): Promise<Category[]> {
    return leer(KEYS.categorias, []);
  },
  async setCategorias(data: Category[]): Promise<void> {
    return escribir(KEYS.categorias, data);
  },
  async getCuentas(): Promise<Account[]> {
    return leer(KEYS.cuentas, []);
  },
  async setCuentas(data: Account[]): Promise<void> {
    return escribir(KEYS.cuentas, data);
  },
  async getPresupuestos(): Promise<Budget[]> {
    return leer(KEYS.presupuestos, []);
  },
  async setPresupuestos(data: Budget[]): Promise<void> {
    return escribir(KEYS.presupuestos, data);
  },
  async getRecurrentes(): Promise<RecurringRule[]> {
    return leer(KEYS.recurrentes, []);
  },
  async setRecurrentes(data: RecurringRule[]): Promise<void> {
    return escribir(KEYS.recurrentes, data);
  },
  async getMetasAhorro(): Promise<SavingsGoal[]> {
    return leer(KEYS.metasAhorro, []);
  },
  async setMetasAhorro(data: SavingsGoal[]): Promise<void> {
    return escribir(KEYS.metasAhorro, data);
  },
  async getAportaciones(): Promise<SavingsContribution[]> {
    return leer(KEYS.aportaciones, []);
  },
  async setAportaciones(data: SavingsContribution[]): Promise<void> {
    return escribir(KEYS.aportaciones, data);
  },
  async getDeudas(): Promise<Debt[]> {
    return leer(KEYS.deudas, []);
  },
  async setDeudas(data: Debt[]): Promise<void> {
    return escribir(KEYS.deudas, data);
  },
  async getPagosDeuda(): Promise<DebtPayment[]> {
    return leer(KEYS.pagosDeuda, []);
  },
  async setPagosDeuda(data: DebtPayment[]): Promise<void> {
    return escribir(KEYS.pagosDeuda, data);
  },
  async getAjustes(defaultAjustes: AppSettings): Promise<AppSettings> {
    return leer(KEYS.ajustes, defaultAjustes);
  },
  async setAjustes(data: AppSettings): Promise<void> {
    return escribir(KEYS.ajustes, data);
  },
  async exportarTodo(): Promise<BackupData> {
    const [
      transacciones,
      categorias,
      cuentas,
      presupuestos,
      recurrentes,
      metasAhorro,
      aportaciones,
      deudas,
      pagosDeuda,
      ajustes,
    ] = await Promise.all([
      this.getTransacciones(),
      this.getCategorias(),
      this.getCuentas(),
      this.getPresupuestos(),
      this.getRecurrentes(),
      this.getMetasAhorro(),
      this.getAportaciones(),
      this.getDeudas(),
      this.getPagosDeuda(),
      get<AppSettings>(KEYS.ajustes),
    ]);
    return {
      version: 3,
      exportadoEn: new Date().toISOString(),
      transacciones,
      categorias,
      cuentas,
      presupuestos,
      recurrentes,
      metasAhorro,
      aportaciones,
      deudas,
      pagosDeuda,
      ajustes: ajustes ?? { moneda: "EUR", localeFormato: "es-ES", tema: "oscuro" },
    };
  },
  async importarTodo(data: BackupData): Promise<void> {
    await Promise.all([
      escribir(KEYS.transacciones, data.transacciones ?? []),
      escribir(KEYS.categorias, data.categorias ?? []),
      escribir(KEYS.cuentas, data.cuentas ?? []),
      escribir(KEYS.presupuestos, data.presupuestos ?? []),
      escribir(KEYS.recurrentes, data.recurrentes ?? []),
      escribir(KEYS.metasAhorro, data.metasAhorro ?? []),
      escribir(KEYS.aportaciones, data.aportaciones ?? []),
      escribir(KEYS.deudas, data.deudas ?? []),
      escribir(KEYS.pagosDeuda, data.pagosDeuda ?? []),
      escribir(KEYS.ajustes, data.ajustes),
    ]);
  },
  async borrarTodo(): Promise<void> {
    const todas = await keys();
    await Promise.all(
      todas
        .filter((k) => typeof k === "string" && k.startsWith("finanzas:"))
        .map((k) => del(k))
    );
  },
};
