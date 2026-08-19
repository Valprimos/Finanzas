"use client";

import { useRef, useState } from "react";
import { Download, Upload, ShieldCheck, Trash2, FileSpreadsheet } from "lucide-react";
import { useFinanzas } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { exportarBackupJSON, exportarTransaccionesCSV, parsearBackupJSON } from "@/lib/exportar";

const MONEDAS = [
  { codigo: "EUR", etiqueta: "Euro (€)" },
  { codigo: "USD", etiqueta: "Dólar estadounidense ($)" },
  { codigo: "GBP", etiqueta: "Libra esterlina (£)" },
  { codigo: "MXN", etiqueta: "Peso mexicano ($)" },
  { codigo: "ARS", etiqueta: "Peso argentino ($)" },
];

export function SettingsPanel() {
  const { ajustes, actualizarAjustes, transacciones, categorias, exportarTodo, importarTodo, borrarTodo } =
    useFinanzas();
  const inputArchivoRef = useRef<HTMLInputElement>(null);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);

  async function manejarExportarJSON() {
    const data = await exportarTodo();
    exportarBackupJSON(data);
  }

  function manejarExportarCSV() {
    exportarTransaccionesCSV(transacciones, categorias);
  }

  async function manejarImportar(archivo: File) {
    try {
      const texto = await archivo.text();
      const data = parsearBackupJSON(texto);
      await importarTodo(data);
      setMensaje({ tipo: "ok", texto: "Backup importado correctamente." });
    } catch {
      setMensaje({ tipo: "error", texto: "No se pudo leer el archivo. Comprueba que sea un backup válido." });
    }
  }

  async function manejarBorrarTodo() {
    await borrarTodo();
    setConfirmarBorrado(false);
    setMensaje({ tipo: "ok", texto: "Todos los datos se han eliminado de este dispositivo." });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="font-display text-base font-semibold">Preferencias</h2>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Moneda</label>
            <Select
              value={ajustes.moneda}
              onChange={(e) => actualizarAjustes({ moneda: e.target.value })}
              className="max-w-xs"
            >
              {MONEDAS.map((m) => (
                <option key={m.codigo} value={m.codigo}>
                  {m.etiqueta}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[var(--ingreso)]" />
            <div>
              <h2 className="font-display text-base font-semibold">Privacidad</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Esta app es <strong>local-first</strong>: todos tus movimientos se guardan solo en este
                dispositivo (IndexedDB del navegador). No hay servidor, no hay analíticas ni rastreadores, y
                nada se envía a terceros. Tú eres el único dueño de tus datos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="font-display text-base font-semibold">Copia de seguridad</h2>
          <p className="text-sm text-[var(--muted)]">
            Exporta un backup completo (JSON) para guardarlo donde quieras y restaurarlo cuando lo necesites, o
            exporta tus movimientos en CSV para abrirlos en una hoja de cálculo.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variante="secundario" onClick={manejarExportarJSON}>
              <Download size={16} /> Exportar backup (JSON)
            </Button>
            <Button variante="secundario" onClick={manejarExportarCSV}>
              <FileSpreadsheet size={16} /> Exportar movimientos (CSV)
            </Button>
            <Button variante="secundario" onClick={() => inputArchivoRef.current?.click()}>
              <Upload size={16} /> Importar backup
            </Button>
            <input
              ref={inputArchivoRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && manejarImportar(e.target.files[0])}
            />
          </div>
          {mensaje && (
            <p className={`text-sm ${mensaje.tipo === "ok" ? "text-[var(--ingreso)]" : "text-[var(--gasto)]"}`}>
              {mensaje.texto}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-[var(--gasto)]/30">
        <CardContent className="space-y-4 p-5">
          <h2 className="font-display text-base font-semibold text-[var(--gasto)]">Zona de peligro</h2>
          <p className="text-sm text-[var(--muted)]">
            Elimina todos tus movimientos, presupuestos y categorías personalizadas de este dispositivo. Esta
            acción no se puede deshacer — exporta antes un backup si lo necesitas.
          </p>
          {!confirmarBorrado ? (
            <Button variante="peligro" onClick={() => setConfirmarBorrado(true)}>
              <Trash2 size={16} /> Borrar todos los datos
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variante="peligro" onClick={manejarBorrarTodo}>
                Sí, borrar definitivamente
              </Button>
              <Button variante="secundario" onClick={() => setConfirmarBorrado(false)}>
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
