import { lazy, Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { SessionTimeout } from './auth/SessionTimeout';
import { useTrial } from '../hooks/use-trial';

// Se carga aparte: la mayoría de las sesiones no ve nunca esta pantalla y no
// tiene por qué pagar su peso en el bundle principal.
const PlanPage = lazy(() => import('../pages/PlanPage'));

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const trial = useTrial();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-kio border-t-transparent rounded-full animate-spin" />
          <p className="text-text/60">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but no clinician profile → must complete onboarding first
  if (!user?.profile && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Bloqueo duro: la app entera queda detrás de la elección de plan. Esto es
  // solo la capa visual — quien lo esquive se encuentra igualmente con el 403
  // de `TrialGuard`, que es donde vive la regla de verdad.
  //
  // SE RENDERIZA EN EL SITIO, NO SE NAVEGA, y la diferencia no es cosmética: un
  // `<Navigate to="/plan">` aquí entra en bucle infinito. Las rutas van dentro
  // de un `<AnimatePresence>` que mantiene montada la copia saliente, y esa
  // copia conserva su `location` congelada en la ruta anterior — así que vuelve
  // a evaluar esta condición, vuelve a emitir el `<Navigate>`, y se realimenta
  // hasta que React aborta con "Maximum update depth exceeded" y deja la
  // pantalla en blanco. Renderizar no toca el router y no puede reentrar.
  if (trial.isHardLocked && location.pathname !== '/plan') {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-slate-950">
            <div className="w-10 h-10 rounded-full border-4 border-kio/20 border-t-kio animate-spin" />
          </div>
        }
      >
        <PlanPage />
      </Suspense>
    );
  }

  return (
    <>
      <SessionTimeout />
      {children}
    </>
  );
}
