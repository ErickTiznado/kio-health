import { useAuthStore } from '../../stores/auth.store';

/**
 * Fechas del módulo de finanzas, leídas en la zona del CLÍNICO.
 *
 * El servidor ancla el día civil de cada movimiento al inicio de ese día en
 * `ClinicianProfile.timezone`, y calcula los bordes del mes en esa misma zona.
 * Formatear con `format(parseISO(t.date))` renderiza en la zona DEL NAVEGADOR:
 * el día sale bien solo mientras las dos coinciden, y se desplaza en cuanto el
 * clínico viaja o tiene mal el reloj del equipo. Un movimiento del 1 de agosto
 * listado —y exportado al contador— como «31 jul» es exactamente el defecto que
 * el backend ya arregló de su lado.
 *
 * DEUDA CONOCIDA, declarada y no disimulada: `GET /auth/me` todavía NO devuelve
 * `timezone` dentro de `profile` (ver el `select` de `AuthService`), así que hoy
 * `useFinanceTimeZone()` casi siempre cae en la zona del navegador — el mismo
 * comportamiento de antes, ni mejor ni peor. En cuanto el perfil traiga el
 * campo, todas las fechas de finanzas pasan a leerse en la zona correcta sin
 * tocar un solo componente. No se inventa una zona por defecto: afirmar
 * `America/Mexico_City` para alguien que consulta desde Madrid sería el mismo
 * error con otro disfraz.
 */

/** Una zona que este runtime entiende de verdad. */
function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('es-MX', { timeZone });
    return true;
  } catch {
    return false;
  }
}

function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

/**
 * `timezone` del perfil, cuando el servidor lo manda y es una zona real.
 *
 * Se lee de forma defensiva porque `ClinicianProfile` (en `types/auth.types.ts`)
 * todavía no declara el campo: el día que el backend lo incluya, esto empieza a
 * devolver la zona sin más cambios.
 */
function profileTimeZone(profile: unknown): string | null {
  const timeZone = (profile as { timezone?: unknown } | null | undefined)?.timezone;
  if (typeof timeZone !== 'string' || timeZone.trim() === '') return null;
  return isValidTimeZone(timeZone) ? timeZone : null;
}

/** Zona en la que se leen y se escriben las fechas de finanzas. */
export function useFinanceTimeZone(): string {
  const fromProfile = useAuthStore((state) => profileTimeZone(state.user?.profile));
  return fromProfile ?? browserTimeZone();
}

// `Intl.DateTimeFormat` es caro de construir y estas tablas formatean una fecha
// por fila; se reutiliza el formateador por (zona + opciones).
const FORMATTERS = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${timeZone}|${JSON.stringify(options)}`;
  const cached = FORMATTERS.get(key);
  if (cached) return cached;

  // Una zona inválida haría explotar la vista entera; se degrada a la del
  // navegador, que es lo que se renderizaba antes de este módulo.
  const safeZone = isValidTimeZone(timeZone) ? timeZone : browserTimeZone();
  const created = new Intl.DateTimeFormat('es-MX', { timeZone: safeZone, ...options });
  FORMATTERS.set(key, created);
  return created;
}

function toDate(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatIn(
  iso: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const date = toDate(iso);
  // Un guion es honesto; una fecha inventada no.
  if (!date) return '—';
  return formatter(timeZone, options).format(date);
}

/** `5 ago 2026` — la fecha de una fila de movimientos. */
export function formatFinanceDay(iso: string, timeZone: string): string {
  return formatIn(iso, timeZone, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** `05/08/2026` — el formato del CSV que acaba en manos del contador. */
export function formatFinanceDayNumeric(iso: string, timeZone: string): string {
  return formatIn(iso, timeZone, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** `5 de agosto de 2026` — encabezados de modal, donde cabe el nombre entero. */
export function formatFinanceDayLong(iso: string, timeZone: string): string {
  return formatIn(iso, timeZone, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** `agosto de 2026` — a qué mes pertenece un movimiento. */
export function formatFinanceMonthLong(iso: string, timeZone: string): string {
  return formatIn(iso, timeZone, { month: 'long', year: 'numeric' });
}

/**
 * Día civil `YYYY-MM-DD` de un instante, EN LA ZONA DEL CLÍNICO.
 *
 * Es la clave con la que se agrupa y se ordena una serie temporal: ordena
 * lexicográficamente igual que cronológicamente, y a diferencia de una etiqueta
 * `dd MMM` no colisiona entre meses ni entre años.
 */
export function financeDayKey(iso: string, timeZone: string): string {
  const date = toDate(iso);
  if (!date) return '';

  const parts = formatter(timeZone, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** `05 ago` — etiqueta corta del eje X, construida desde una clave de día. */
export function formatDayKeyShort(dayKey: string): string {
  // La clave ya ES un día civil: se lee en UTC para no volver a desplazarla.
  return formatIn(`${dayKey}T00:00:00Z`, 'UTC', { day: '2-digit', month: 'short' });
}

/** El día civil de hoy en la zona del clínico. */
export function todayFinanceDayKey(timeZone: string): string {
  return financeDayKey(new Date().toISOString(), timeZone);
}

/** ¿Ese instante cae hoy, en la zona del clínico? */
export function isTodayInFinanceZone(iso: string, timeZone: string): boolean {
  const key = financeDayKey(iso, timeZone);
  return key !== '' && key === todayFinanceDayKey(timeZone);
}
