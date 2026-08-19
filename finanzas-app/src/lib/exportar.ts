import type { BackupData, Transaction, Category } from "./types";

export function descargarArchivo(contenido: string, nombre: string, tipoMime: string) {
  const blob = new Blob([contenido], { type: tipoMime });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

export function exportarBackupJSON(data: BackupData) {
  const contenido = JSON.stringify(data, null, 2);
  descargarArchivo(contenido, `backup-finanzas-${data.exportadoEn.slice(0, 10)}.json`, "application/json");
}

export function exportarTransaccionesCSV(transacciones: Transaction[], categorias: Category[]) {
  const mapaCategorias = new Map(categorias.map((c) => [c.id, c.nombre]));
  const cabecera = ["fecha", "tipo", "categoria", "importe", "descripcion", "metodoPago", "cuentaId", "etiquetas"];
  const filas = transacciones.map((t) =>
    [
      t.fecha,
      t.tipo,
      mapaCategorias.get(t.categoriaId) ?? t.categoriaId,
      t.importe.toString(),
      escaparCSV(t.descripcion ?? ""),
      t.metodoPago ?? "",
      t.cuentaId ?? "",
      escaparCSV((t.etiquetas ?? []).join(";")),
    ].join(",")
  );
  const csv = [cabecera.join(","), ...filas].join("\n");
  descargarArchivo(csv, `transacciones-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv");
}

function escaparCSV(valor: string): string {
  if (valor.includes(",") || valor.includes('"') || valor.includes("\n")) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}

export function parsearBackupJSON(texto: string): BackupData {
  const data = JSON.parse(texto);
  if (!data || !Array.isArray(data.transacciones)) {
    throw new Error("El archivo no tiene el formato de backup esperado.");
  }
  return data as BackupData;
}
