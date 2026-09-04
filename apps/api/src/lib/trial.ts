/**
 * Periodo de prueba.
 *
 * Una sola definición de la regla, importada por el guard, por el servicio de
 * auth y por los tests. La duración y el modo de bloqueo no se repiten en
 * ningún otro sitio: repartirlos fue lo que dejó `plan` gobernando permisos
 * desde tres archivos que no se hablaban entre sí.
 */

/** Días de prueba gratuita. Sin tarjeta, sin elegir plan. */
export const TRIAL_DAYS = 15;

/**
 * Qué hace la app cuando la prueba ha caducado.
 *
 * · `READ_ONLY` — se puede consultar todo, no se puede escribir nada. Es el
 *   modo de la beta cerrada: dejar a un clínico sin acceso a la historia de sus
 *   pacientes por una fecha de facturación es peor que cobrar tarde.
 * · `HARD` — la app queda bloqueada entera hasta elegir plan. Es el modo
 *   previsto para el lanzamiento público.
 *
 * Se decide por entorno (`TRIAL_EXPIRED_MODE`), no por código, para que pasar
 * de beta a live sea una variable y no un despliegue con cambios de lógica.
 */
export type TrialLockMode = 'READ_ONLY' | 'HARD';

export const DEFAULT_TRIAL_LOCK_MODE: TrialLockMode = 'READ_ONLY';

export function getTrialLockMode(): TrialLockMode {
  return process.env.TRIAL_EXPIRED_MODE === 'HARD'
    ? 'HARD'
    : DEFAULT_TRIAL_LOCK_MODE;
}

/** Fin de la prueba contado desde el momento en que se completa el perfil. */
export function computeTrialEnd(from: Date = new Date()): Date {
  const end = new Date(from);
  end.setUTCDate(end.getUTCDate() + TRIAL_DAYS);
  return end;
}

/**
 * `null` es "sin límite", no "caducada".
 *
 * Esta distinción es la que evita el peor fallo posible de esta función: que un
 * perfil sin fecha —una cuenta interna, o una fila anterior a la migración que
 * el backfill no alcanzara— quede bloqueado por omisión. El fallo por defecto
 * tiene que ser dejar pasar, no cerrar la puerta.
 */
export function isTrialExpired(
  trialEndsAt: Date | string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!trialEndsAt) return false;
  const end = trialEndsAt instanceof Date ? trialEndsAt : new Date(trialEndsAt);
  if (Number.isNaN(end.getTime())) return false;
  return end.getTime() <= now.getTime();
}

/** Días completos que quedan. 0 el último día; nunca negativo. */
export function trialDaysRemaining(
  trialEndsAt: Date | string | null | undefined,
  now: Date = new Date(),
): number | null {
  if (!trialEndsAt) return null;
  const end = trialEndsAt instanceof Date ? trialEndsAt : new Date(trialEndsAt);
  if (Number.isNaN(end.getTime())) return null;
  const ms = end.getTime() - now.getTime();
  return ms <= 0 ? 0 : Math.ceil(ms / (24 * 60 * 60 * 1000));
}
