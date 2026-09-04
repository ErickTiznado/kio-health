import { SetMetadata } from '@nestjs/common';

/**
 * Exime a un endpoint del `TrialGuard`.
 *
 * Hace falta muy poco: en modo `HARD` el guard bloquea también las lecturas, y
 * sin excepciones el usuario con la prueba caducada no podría ni cargar su
 * propio perfil para enterarse de por qué no puede hacer nada. La lista tiene
 * que quedarse en lo mínimo para ver el estado y salir de él — cualquier ruta
 * que además devuelva datos clínicos no pertenece aquí.
 *
 * Login, refresh y logout no lo necesitan: ya son `@Public()`.
 */
export const ALLOW_WHEN_TRIAL_EXPIRED_KEY = 'allowWhenTrialExpired';
export const AllowWhenTrialExpired = () =>
  SetMetadata(ALLOW_WHEN_TRIAL_EXPIRED_KEY, true);
