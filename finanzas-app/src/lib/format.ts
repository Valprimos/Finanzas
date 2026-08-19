export function formatearMoneda(valor: number, moneda = "EUR", locale = "es-ES"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: moneda,
    maximumFractionDigits: 2,
  }).format(valor);
}

export function formatearFecha(iso: string, locale = "es-ES"): string {
  const fecha = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(fecha);
}

export function formatearMesCorto(iso: string, locale = "es-ES"): string {
  const fecha = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat(locale, { month: "short" }).format(fecha);
}

export function hoyISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function mesActualKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function mesKeyDeFecha(iso: string): string {
  return iso.slice(0, 7);
}
