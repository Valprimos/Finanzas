"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { v4 as uuid } from "uuid";
import type {
  Transaction,
  Category,
  Account,
  Budget,
  RecurringRule,
  AppSettings,
  BackupData,
} from "./types";
import { db } from "./db";
import { CATEGORIAS_PREDETERMINADAS } from "./categorias-default";
import { generarTransaccionesPendientes } from "./recurrentes";
import { hoyISO } from "./format";

const AJUSTES_POR_DEFECTO: AppSettings = {
  moneda: "EUR",
  localeFormato: "es-ES",
  tema: "oscuro",
};

interface FinanzasContexto {
  cargado: boolean;
  transacciones: Transaction[];
  categorias: Category[];
  cuentas: Account[];
  presupuestos: Budget[];
  recurrentes: RecurringRule[];
  ajustes: AppSettings;

  agregarTransaccion: (t: Omit<Transaction, "id" | "creadoEn" | "actualizadoEn">) => Promise<void>;
  actualizarTransaccion: (id: string, cambios: Partial<Transaction>) => Promise<void>;
  eliminarTransaccion: (id: string) => Promise<void>;

  agregarCategoria: (c: Omit<Category, "id">) => Promise<void>;
  actualizarCategoria: (id: string, cambios: Partial<Category>) => Promise<void>;
  eliminarCategoria: (id: string) => Promise<void>;

  agregarPresupuesto: (p: Omit<Budget, "id">) => Promise<void>;
  actualizarPresupuesto: (id: string, cambios: Partial<Budget>) => Promise<void>;
  eliminarPresupuesto: (id: string) => Promise<void>;

  agregarRecurrente: (r: Omit<RecurringRule, "id">) => Promise<void>;
  actualizarRecurrente: (id: string, cambios: Partial<RecurringRule>) => Promise<void>;
  eliminarRecurrente: (id: string) => Promise<void>;

  actualizarAjustes: (cambios: Partial<AppSettings>) => Promise<void>;

  exportarTodo: () => Promise<BackupData>;
  importarTodo: (data: BackupData) => Promise<void>;
  borrarTodo: () => Promise<void>;
}

const Contexto = createContext<FinanzasContexto | null>(null);

export function FinanzasProvider({ children }: { children: ReactNode }) {
  const [cargado, setCargado] = useState(false);
  const [transacciones, setTransaccionesState] = useState<Transaction[]>([]);
  const [categorias, setCategoriasState] = useState<Category[]>([]);
  const [cuentas, setCuentasState] = useState<Account[]>([]);
  const [presupuestos, setPresupuestosState] = useState<Budget[]>([]);
  const [recurrentes, setRecurrentesState] = useState<RecurringRule[]>([]);
  const [ajustes, setAjustesState] = useState<AppSettings>(AJUSTES_POR_DEFECTO);

  // Carga inicial desde IndexedDB + generación de recurrentes pendientes
  useEffect(() => {
    (async () => {
      let cats = await db.getCategorias();
      if (cats.length === 0) {
        cats = CATEGORIAS_PREDETERMINADAS;
        await db.setCategorias(cats);
      }
      const [txs, accs, pres, recs, ajus] = await Promise.all([
        db.getTransacciones(),
        db.getCuentas(),
        db.getPresupuestos(),
        db.getRecurrentes(),
        db.getAjustes(AJUSTES_POR_DEFECTO),
      ]);

      // Generar transacciones pendientes de reglas recurrentes activas
      let txsFinal = txs;
      let recsFinal = recs;
      if (recs.length > 0) {
        const hoy = hoyISO();
        const nuevasTotales: Transaction[] = [];
        recsFinal = recs.map((r) => {
          const nuevas = generarTransaccionesPendientes(r, hoy);
          if (nuevas.length > 0) {
            nuevasTotales.push(...nuevas);
            return { ...r, ultimaGeneracion: nuevas[nuevas.length - 1].fecha };
          }
          return r;
        });
        if (nuevasTotales.length > 0) {
          txsFinal = [...txs, ...nuevasTotales];
          await db.setTransacciones(txsFinal);
          await db.setRecurrentes(recsFinal);
        }
      }

      setCategoriasState(cats);
      setTransaccionesState(txsFinal);
      setCuentasState(accs);
      setPresupuestosState(pres);
      setRecurrentesState(recsFinal);
      setAjustesState(ajus);
      setCargado(true);
    })();
  }, []);

  const agregarTransaccion = useCallback(
    async (t: Omit<Transaction, "id" | "creadoEn" | "actualizadoEn">) => {
      const ahora = new Date().toISOString();
      const nueva: Transaction = { ...t, id: uuid(), creadoEn: ahora, actualizadoEn: ahora };
      setTransaccionesState((prev) => {
        const siguiente = [nueva, ...prev];
        db.setTransacciones(siguiente);
        return siguiente;
      });
    },
    []
  );

  const actualizarTransaccion = useCallback(async (id: string, cambios: Partial<Transaction>) => {
    setTransaccionesState((prev) => {
      const siguiente = prev.map((t) =>
        t.id === id ? { ...t, ...cambios, actualizadoEn: new Date().toISOString() } : t
      );
      db.setTransacciones(siguiente);
      return siguiente;
    });
  }, []);

  const eliminarTransaccion = useCallback(async (id: string) => {
    setTransaccionesState((prev) => {
      const siguiente = prev.filter((t) => t.id !== id);
      db.setTransacciones(siguiente);
      return siguiente;
    });
  }, []);

  const agregarCategoria = useCallback(async (c: Omit<Category, "id">) => {
    setCategoriasState((prev) => {
      const siguiente = [...prev, { ...c, id: uuid() }];
      db.setCategorias(siguiente);
      return siguiente;
    });
  }, []);

  const actualizarCategoria = useCallback(async (id: string, cambios: Partial<Category>) => {
    setCategoriasState((prev) => {
      const siguiente = prev.map((c) => (c.id === id ? { ...c, ...cambios } : c));
      db.setCategorias(siguiente);
      return siguiente;
    });
  }, []);

  const eliminarCategoria = useCallback(async (id: string) => {
    setCategoriasState((prev) => {
      const siguiente = prev.filter((c) => c.id !== id);
      db.setCategorias(siguiente);
      return siguiente;
    });
  }, []);

  const agregarPresupuesto = useCallback(async (p: Omit<Budget, "id">) => {
    setPresupuestosState((prev) => {
      const siguiente = [...prev, { ...p, id: uuid() }];
      db.setPresupuestos(siguiente);
      return siguiente;
    });
  }, []);

  const actualizarPresupuesto = useCallback(async (id: string, cambios: Partial<Budget>) => {
    setPresupuestosState((prev) => {
      const siguiente = prev.map((p) => (p.id === id ? { ...p, ...cambios } : p));
      db.setPresupuestos(siguiente);
      return siguiente;
    });
  }, []);

  const eliminarPresupuesto = useCallback(async (id: string) => {
    setPresupuestosState((prev) => {
      const siguiente = prev.filter((p) => p.id !== id);
      db.setPresupuestos(siguiente);
      return siguiente;
    });
  }, []);

  const agregarRecurrente = useCallback(async (r: Omit<RecurringRule, "id">) => {
    setRecurrentesState((prev) => {
      const siguiente = [...prev, { ...r, id: uuid() }];
      db.setRecurrentes(siguiente);
      return siguiente;
    });
  }, []);

  const actualizarRecurrente = useCallback(async (id: string, cambios: Partial<RecurringRule>) => {
    setRecurrentesState((prev) => {
      const siguiente = prev.map((r) => (r.id === id ? { ...r, ...cambios } : r));
      db.setRecurrentes(siguiente);
      return siguiente;
    });
  }, []);

  const eliminarRecurrente = useCallback(async (id: string) => {
    setRecurrentesState((prev) => {
      const siguiente = prev.filter((r) => r.id !== id);
      db.setRecurrentes(siguiente);
      return siguiente;
    });
  }, []);

  const actualizarAjustes = useCallback(async (cambios: Partial<AppSettings>) => {
    setAjustesState((prev) => {
      const siguiente = { ...prev, ...cambios };
      db.setAjustes(siguiente);
      return siguiente;
    });
  }, []);

  const exportarTodo = useCallback(() => db.exportarTodo(), []);

  const importarTodo = useCallback(async (data: BackupData) => {
    await db.importarTodo(data);
    setTransaccionesState(data.transacciones ?? []);
    setCategoriasState(data.categorias ?? []);
    setCuentasState(data.cuentas ?? []);
    setPresupuestosState(data.presupuestos ?? []);
    setRecurrentesState(data.recurrentes ?? []);
    if (data.ajustes) setAjustesState(data.ajustes);
  }, []);

  const borrarTodo = useCallback(async () => {
    await db.borrarTodo();
    setTransaccionesState([]);
    setCategoriasState(CATEGORIAS_PREDETERMINADAS);
    setCuentasState([]);
    setPresupuestosState([]);
    setRecurrentesState([]);
    await db.setCategorias(CATEGORIAS_PREDETERMINADAS);
  }, []);

  return (
    <Contexto.Provider
      value={{
        cargado,
        transacciones,
        categorias,
        cuentas,
        presupuestos,
        recurrentes,
        ajustes,
        agregarTransaccion,
        actualizarTransaccion,
        eliminarTransaccion,
        agregarCategoria,
        actualizarCategoria,
        eliminarCategoria,
        agregarPresupuesto,
        actualizarPresupuesto,
        eliminarPresupuesto,
        agregarRecurrente,
        actualizarRecurrente,
        eliminarRecurrente,
        actualizarAjustes,
        exportarTodo,
        importarTodo,
        borrarTodo,
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useFinanzas() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useFinanzas debe usarse dentro de <FinanzasProvider>");
  return contexto;
}
