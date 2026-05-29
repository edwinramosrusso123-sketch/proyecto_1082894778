// Utilidades de fechas (formato ISO yyyy-mm-dd, sin zona horaria).

export function calculateNights(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn + 'T00:00:00Z').getTime();
  const b = new Date(checkOut + 'T00:00:00Z').getTime();
  const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
  return diff;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
}

export function formatCOP(amount: number): string {
  return '$' + Math.round(amount).toLocaleString('es-CO');
}

// Días que cubre una reserva [check_in, check_out) — útil para ocupación.
export function rangeCoversDate(checkIn: string, checkOut: string, date: string): boolean {
  return checkIn <= date && date < checkOut;
}
