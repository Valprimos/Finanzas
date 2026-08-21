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
  SavingsGoal,
  SavingsContribution,
  Debt,
  DebtPayment,
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
  metasAhorro: SavingsGoal[];
  aportaciones: SavingsContribution[];
  deudas: Debt[];
  pagosDeuda: DebtPayment[];
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

  agregarMeta: (m: Omit<SavingsGoal, "id" | "creadoEn">) => Promise<void>;
  actualizarMeta: (id: string, cambios: Partial<SavingsGoal>) => Promise<void>;
  eliminarMeta: (id: string) => Promise<void>;

  agregarAportacion: (a: Omit<SavingsContribution, "id">) => Promise<void>;
  eliminarAportacion: (id: string) => Promise<void>;

  agregarDeuda: (d: Omit<Debt, "id" | "creadoEn">) => Promise<void>;
  actualizarDeuda: (id: string, cambios: Partial<Debt>) => Promise<void>;
  eliminarDeuda: (id: string) => Promise<void>;

  agregarPagoDeuda: (p: Omit<DebtPayment, "id">) => Promise<void>;
  eliminarPagoDeuda: (id: string) => Promise<void>;

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
  const [metasAhorro, setMetasAhorroState] = useState<SavingsGoal[]>([]);
  const [aportaciones, setAportacionesState] = useState<SavingsContribution[]>([]);
  const [deudas, setDeudasState] = useState<Debt[]>([]);
  const [pagosDeuda, setPagosDeudaState] = useState<DebtPayment[]>([]);
  const [ajustes, setAjustesState] = useState<AppSettings>(AJUSTES_POR_DEFECTO);

  // Carga inicial desde IndexedDB + generación de recurrentes pendientes
  useEffect(() => {
    (async () => {
      let cats = await db.getCategorias();
      if (cats.length === 0) {
        cats = CATEGORIAS_PREDETERMINADAS;
        await db.setCategorias(cats);
      }
      const [txs, accs, pres, recs, metas, aportes, deus, pagosDeus, ajus] = await Promise.all([
        db.getTransacciones(),
        db.getCuentas(),
        db.getPresupuestos(),
        db.getRecurrentes(),
        db.getMetasAhorro(),
        db.getAportaciones(),
        db.getDeudas(),
        db.getPagosDeuda(),
        db.getAjustes(AJUSTES_POR_DEFECTO),
      ]);

      // Generar transacciones pendientes de reglas recurrentes activas
      let txsFinal = txs;
      let recsFinal = recs;
      if (recs.length > 0) {
        const hoy = hoyISO();
        const nuevasTotales: Transaction[] = [];
        let reglasCambiadas = false;
        recsFinal = recs.map((r) => {
          const { nuevas, ultimaFechaProcesada } = generarTransaccionesPendientes(r, hoy);
          if (nuevas.length > 0) nuevasTotales.push(...nuevas);
          if (ultimaFechaProcesada) {
            reglasCambiadas = true;
            return { ...r, ultimaGeneracion: ultimaFechaProcesada };
          }
          return r;
        });
        if (nuevasTotales.length > 0) {
          txsFinal = [...txs, ...nuevasTotales];
          await db.setTransacciones(txsFinal);
        }
        if (reglasCambiadas) {
          await db.setRecurrentes(recsFinal);
        }
      }

      setCategoriasState(cats);
      setTransaccionesState(txsFinal);
      setCuentasState(accs);
      setPresupuestosState(pres);
      setRecurrentesState(recsFinal);
      setMetasAhorroState(metas);
      setAportacionesState(aportes);
      setDeudasState(deus);
      setPagosDeudaState(pagosDeus);
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

  const agregarMeta = useCallback(async (m: Omit<SavingsGoal, "id" | "creadoEn">) => {
    setMetasAhorroState((prev) => {
      const siguiente = [...prev, { ...m, id: uuid(), creadoEn: new Date().toISOString() }];
      db.setMetasAhorro(siguiente);
      return siguiente;
    });
  }, []);

  const actualizarMeta = useCallback(async (id: string, cambios: Partial<SavingsGoal>) => {
    setMetasAhorroState((prev) => {
      const siguiente = prev.map((m) => (m.id === id ? { ...m, ...cambios } : m));
      db.setMetasAhorro(siguiente);
      return siguiente;
    });
  }, []);

  const eliminarMeta = useCallback(async (id: string) => {
    setMetasAhorroState((prev) => {
      const siguiente = prev.filter((m) => m.id !== id);
      db.setMetasAhorro(siguiente);
      return siguiente;
    });
    // Al borrar una meta, sus aportaciones huérfanas también se eliminan
    setAportacionesState((prev) => {
      const siguiente = prev.filter((a) => a.metaId !== id);
      db.setAportaciones(siguiente);
      return siguiente;
    });
  }, []);

  const agregarAportacion = useCallback(async (a: Omit<SavingsContribution, "id">) => {
    setAportacionesState((prev) => {
      const siguiente = [...prev, { ...a, id: uuid() }];
      db.setAportaciones(siguiente);
      return siguiente;
    });
  }, []);

  const eliminarAportacion = useCallback(async (id: string) => {
    setAportacionesState((prev) => {
      const siguiente = prev.filter((a) => a.id !== id);
      db.setAportaciones(siguiente);
      return siguiente;
    });
  }, []);

  const agregarDeuda = useCallback(async (d: Omit<Debt, "id" | "creadoEn">) => {
    setDeudasState((prev) => {
      const siguiente = [...prev, { ...d, id: uuid(), creadoEn: new Date().toISOString() }];
      db.setDeudas(siguiente);
      return siguiente;
    });
  }, []);

  const actualizarDeuda = useCallback(async (id: string, cambios: Partial<Debt>) => {
    setDeudasState((prev) => {
      const siguiente = prev.map((d) => (d.id === id ? { ...d, ...cambios } : d));
      db.setDeudas(siguiente);
      return siguiente;
    });
  }, []);

  const eliminarDeuda = useCallback(async (id: string) => {
    setDeudasState((prev) => {
      const siguiente = prev.filter((d) => d.id !== id);
      db.setDeudas(siguiente);
      return siguiente;
    });
    // Al borrar una deuda, sus pagos huérfanos también se eliminan
    setPagosDeudaState((prev) => {
      const siguiente = prev.filter((p) => p.deudaId !== id);
      db.setPagosDeuda(siguiente);
      return siguiente;
    });
  }, []);

  const agregarPagoDeuda = useCallback(async (p: Omit<DebtPayment, "id">) => {
    setPagosDeudaState((prev) => {
      const siguiente = [...prev, { ...p, id: uuid() }];
      db.setPagosDeuda(siguiente);
      return siguiente;
    });
  }, []);

  const eliminarPagoDeuda = useCallback(async (id: string) => {
    setPagosDeudaState((prev) => {
      const siguiente = prev.filter((p) => p.id !== id);
      db.setPagosDeuda(siguiente);
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
    setMetasAhorroState(data.metasAhorro ?? []);
    setAportacionesState(data.aportaciones ?? []);
    setDeudasState(data.deudas ?? []);
    setPagosDeudaState(data.pagosDeuda ?? []);
    if (data.ajustes) setAjustesState(data.ajustes);
  }, []);

  const borrarTodo = useCallback(async () => {
    await db.borrarTodo();
    setTransaccionesState([]);
    setCategoriasState(CATEGORIAS_PREDETERMINADAS);
    setCuentasState([]);
    setPresupuestosState([]);
    setRecurrentesState([]);
    setMetasAhorroState([]);
    setAportacionesState([]);
    setDeudasState([]);
    setPagosDeudaState([]);
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
        metasAhorro,
        aportaciones,
        deudas,
        pagosDeuda,
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
        agregarMeta,
        actualizarMeta,
        eliminarMeta,
        agregarAportacion,
        eliminarAportacion,
        agregarDeuda,
        actualizarDeuda,
        eliminarDeuda,
        agregarPagoDeuda,
        eliminarPagoDeuda,
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
