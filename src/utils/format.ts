export const BUSINESS_TIME_ZONE = 'America/Havana';

export function formatPrice(value: number, currency?: string | null): string {
  const c = currency || 'CUP';
  const formatted = new Intl.NumberFormat('es-CU', {
    style: 'currency',
    currency: c,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 2,
  }).format(value);
  return c !== 'CUP' ? `${formatted} ${c}` : formatted;
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('es-CU', {
      timeZone: BUSINESS_TIME_ZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatRelativeTime(iso?: string | null, now: number = Date.now()): string {
  const target = iso ? new Date(iso).getTime() : NaN;
  if (Number.isNaN(target)) return '—';
  const diffMinutes = Math.round((target - now) / 60000);
  const absMinutes = Math.abs(diffMinutes);
  if (absMinutes < 1) return 'ahora';
  if (diffMinutes < 0) return `hace ${absMinutes} min`;
  return `en ${absMinutes} min`;
}
