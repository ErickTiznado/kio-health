/**
 * Estado de la prueba de 15 días, en el cliente.
 *
 * ESTO NO ES EL CANDADO. El candado es `TrialGuard` en la API, que rechaza las
 * escrituras cuando la prueba caducó. Lo de aquí solo decide qué se pinta: un
 * botón deshabilitado es cortesía, no seguridad. Si algún día divergen, manda
 * el servidor y el frontend está mal.
 *
 * Se replican `isTrialExpired` y `trialDaysRemaining` en vez de importarlas de
 * la API porque `apps/web` no depende de `apps/api`. Los tests de ambos lados
 * fijan la misma regla, incluida la parte que más importa: `null` es "sin
 * límite", nunca "caducada".
 */

export type TrialLockMode = 'READ_ONLY' | 'HARD';

/** A partir de aquí se avisa. Antes, silencio: nadie quiere un banner el día 1. */
export const TRIAL_WARNING_DAYS = 7;

export interface TrialState {
  /** Hay una prueba con fecha de fin. */
  isTracked: boolean;
  endsAt: Date | null;
  /** Días completos que quedan. `null` si no hay prueba; 0 el último día. */
  daysRemaining: number | null;
  isExpired: boolean;
  /** Caducada y el servidor solo permite leer. */
  isReadOnly: boolean;
  /** Caducada y el servidor bloquea todo: la app no se puede usar. */
  isHardLocked: boolean;
  /** Vigente pero entrando en la recta final. */
  isEndingSoon: boolean;
}

export function isTrialExpired(
  trialEndsAt: string | Date | null | undefined,
  now: Date = new Date(),
): boolean {
  const end = toDate(trialEndsAt);
  if (!end) return false;
  return end.getTime() <= now.getTime();
}

export function trialDaysRemaining(
  trialEndsAt: string | Date | null | undefined,
  now: Date = new Date(),
): number | null {
  const end = toDate(trialEndsAt);
  if (!end) return null;
  const ms = end.getTime() - now.getTime();
  return ms <= 0 ? 0 : Math.ceil(ms / (24 * 60 * 60 * 1000));
}

export function getTrialState(
  trialEndsAt: string | Date | null | undefined,
  mode: TrialLockMode | undefined,
  now: Date = new Date(),
): TrialState {
  const endsAt = toDate(trialEndsAt);
  const daysRemaining = trialDaysRemaining(trialEndsAt, now);
  const isExpired = isTrialExpired(trialEndsAt, now);
  // Ante un modo desconocido se elige el menos destructivo: dejar leer. Una
  // errata en la variable de entorno no puede dejar a nadie fuera de la
  // historia clínica de sus pacientes.
  const hard = mode === 'HARD';

  return {
    isTracked: endsAt !== null,
    endsAt,
    daysRemaining,
    isExpired,
    isReadOnly: isExpired && !hard,
    isHardLocked: isExpired && hard,
    isEndingSoon:
      !isExpired && daysRemaining !== null && daysRemaining <= TRIAL_WARNING_DAYS,
  };
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
