import { useAuthStore } from '../stores/auth.store';
import { getTrialState, type TrialState } from '../lib/trial';

/**
 * Estado de la prueba del usuario en sesión.
 *
 * Deriva de `auth.store` en cada render en vez de guardar el resultado en
 * estado: la prueba caduca por el paso del tiempo, no por un evento, y un valor
 * congelado en un `useState` seguiría diciendo "te quedan 0 días" mucho después
 * de haber caducado. Recalcular es más barato que sincronizar.
 */
export function useTrial(): TrialState {
  const user = useAuthStore((s) => s.user);
  return getTrialState(user?.profile?.trialEndsAt, user?.trialLockMode);
}
