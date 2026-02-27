import { useState } from 'react';
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

  const handleUnlock = async () => {
    setIsLoading(true);
    try {
      // Silently refresh the access token using the httpOnly refresh token cookie.
      // No password needed — the refresh token proves the session is still authorized.
      await api.post('/auth/refresh');
      setIsIdle(false);
      toast.success('Sesión desbloqueada');
    } catch {
      // Refresh failed (token expired/revoked): the api interceptor will call logout()
      // which clears state and the RequireAuth guard redirects to /login.
    } finally {
      setIsLoading(false);
    }
  };

  if (!isIdle) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-white animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white/10 border border-white/20 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 bg-[var(--color-kanji)] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
          <Lock size={32} className="text-white" />
        </div>

        <h2 className="text-2xl font-bold mb-2 text-center">Sesión Bloqueada</h2>
        <p className="text-white/60 text-sm mb-8 text-center">
          Por seguridad, tu sesión se ha bloqueado tras 15 minutos de inactividad.
        </p>

        <button
          onClick={handleUnlock}
          disabled={isLoading}
          className="w-full bg-[var(--color-kanji)] hover:bg-[var(--color-kio)] text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Desbloquear sesión'}
        </button>

        <div className="mt-6 pt-6 border-t border-white/10 w-full text-center">
          <p className="text-xs text-white/40">
            Usuario: <span className="text-white/80 font-medium">{user?.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
