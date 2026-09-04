import { useEffect, useRef, useState } from 'react';
import { useIdleTimer } from '../../hooks/use-idle-timer';
import { useAuthStore } from '../../stores/auth.store';
import { Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export function SessionTimeout() {
  const { isIdle, setIsIdle } = useIdleTimer(TIMEOUT_MS);
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const unlockRef = useRef<HTMLButtonElement>(null);

  // `aria-modal="true"` le promete al lector de pantalla que el resto de la
  // página está fuera de alcance. Estas dos cosas sostienen esa promesa: el
  // foco entra al panel al bloquearse y el Tab no puede salir de él hacia los
  // datos clínicos que quedaron detrás del velo.
  useEffect(() => {
    if (!isIdle) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    unlockRef.current?.focus();
    return () => {
      previouslyFocused?.focus?.();
    };
  }, [isIdle]);

  useEffect(() => {
    if (!isIdle) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

      // Mientras el botón está deshabilitado no queda nada enfocable dentro:
      // dejar salir el Tab expondría la pantalla que este velo oculta.
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!active || !panel.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isIdle]);

  const handleUnlock = async () => {
    setIsLoading(true);
    setFailed(false);
    try {
      // Silently refresh the access token using the httpOnly refresh token cookie.
      // No password needed — the refresh token proves the session is still authorized.
      await api.post('/auth/refresh');
      setIsIdle(false);
      toast.success('Acceso desbloqueado');
    } catch {
      // Refresh failed (token expired/revoked): the api interceptor will call logout()
      // which clears state and the RequireAuth guard redirects to /login. But a network
      // failure lands here too and redirects nobody, so the button cannot fail in
      // silence: si no pudimos desbloquear, hay que decirlo.
      setFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isIdle) return null;

  return (
    <div
      // Este velo es el overlay de un diálogo bloqueante — la misma categoría
      // que el overlay de modal, no un efecto decorativo. Además el desenfoque
      // hace aquí un trabajo concreto: oculta los datos clínicos que quedaron
      // en pantalla mientras el consultorio está vacío. Por eso se mantiene.
      className="fixed inset-0 z-[9999] bg-gray-900/70 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
    >
      <div
        ref={panelRef}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-kio-light dark:bg-kio/10 rounded-full flex items-center justify-center mb-6">
          <Lock aria-hidden="true" size={28} className="text-kanji-deep dark:text-kio" />
        </div>

        <h2
          id="session-timeout-title"
          className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white"
        >
          Acceso bloqueado por inactividad
        </h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm mb-8 text-center leading-relaxed">
          Por seguridad, bloqueamos el acceso a tu cuenta tras 15 minutos sin actividad. No es un
          problema con ninguna sesión clínica.
        </p>

        <button
          ref={unlockRef}
          onClick={handleUnlock}
          disabled={isLoading}
          className="w-full min-h-11 bg-kanji-deep hover:bg-kanji-deep/90 text-white py-3 rounded-xl font-bold shadow-md shadow-kanji-deep/20 transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 aria-hidden="true" size={18} className="animate-spin" />
              Desbloqueando…
            </>
          ) : (
            'Desbloquear acceso'
          )}
        </button>

        {failed && (
          <p
            role="alert"
            className="mt-4 text-sm font-medium text-rose-600 dark:text-rose-400 text-center"
          >
            No pudimos desbloquear el acceso. Revisa tu conexión e inténtalo de nuevo.
          </p>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-800 w-full text-center">
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Cuenta:{' '}
            <span className="font-medium text-gray-700 dark:text-slate-200">{user?.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
