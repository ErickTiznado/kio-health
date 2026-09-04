import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { getErrorMessage } from '../lib/errors';
import { identifyUser, resetAnalytics } from '../lib/analytics';
import type { User } from '../types/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { email: string; password: string; fullName: string; inviteToken: string }) => Promise<void>;
  /**
   * `purgeDrafts` solo lo pide un cierre de sesión DELIBERADO (el botón del
   * menú). El valor por defecto es `false` a propósito: ver el comentario de la
   * implementación.
   */
  logout: (options?: { purgeDrafts?: boolean }) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      signup: async (data: { email: string; password: string; fullName: string; inviteToken: string }) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post<{ user: User }>('/auth/signup', data);

          identifyUser(response.data.user);

          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const errorMessage = getErrorMessage(error, 'El registro falló. Por favor intenta de nuevo.');

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });

          throw error;
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          // Backend sets httpOnly cookies; response body contains only user info
          const response = await api.post<{ user: User }>('/auth/login', { email, password });

          identifyUser(response.data.user);

          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const errorMessage = getErrorMessage(error, 'Credenciales inválidas. Verifica tus datos.');

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });

          throw error;
        }
      },

      /**
       * Cierra la sesión.
       *
       * `logout()` NO siempre lo pide una persona: `lib/api.ts` lo invoca solo
       * cuando falla el refresh del token — sesión caducada, cookie revocada,
       * timeout de inactividad. Por eso el borrado del búfer de notas es
       * opt-in y el valor por defecto es NO tocarlo: ahí puede haber el único
       * ejemplar de una nota clínica, y destruirlo en un cierre de sesión que
       * el clínico no provocó es pérdida permanente de texto de paciente sin
       * aviso, sin intento de envío y sin rastro.
       *
       * Aun pidiéndolo (`{ purgeDrafts: true }`), primero se intenta enviar lo
       * pendiente y, si algo sobrevive al intento, se conserva y se dice. El
       * búfer vive en `sessionStorage`: muere igualmente al cerrar la pestaña.
       */
      logout: async (options?: { purgeDrafts?: boolean }) => {
        // Último intento de envío MIENTRAS la sesión todavía vale: después de
        // `/auth/logout` la cookie ya no sirve. Solo en el cierre deliberado —
        // en el involuntario la sesión ya está caída y reintentar solo
        // provocaría otro 401.
        //
        // `keptDrafts` = lo que sobrevivió al intento, es decir lo que se
        // perdería si aquí se purgara.
        let keptDrafts = 0;
        if (options?.purgeDrafts) {
          try {
            const { countOfflineNotes, useNoteStore } = await import('./notes.store');
            if (countOfflineNotes() > 0) {
              await useNoteStore.getState().syncOfflineNotes();
            }
            keptDrafts = countOfflineNotes();
          } catch {
            // Si no se pudo ni comprobar, se asume que hay algo y no se purga.
            keptDrafts = 1;
          }
        }

        try {
          // Revoke refresh token on server and clear cookies
          await api.post('/auth/logout');
        } catch {
          // Best-effort: clear local state regardless
        } finally {
          // Wipe the recent-patients trail BEFORE clearing the user: the key is
          // namespaced by user id, so it is unreachable once the store is empty.
          // On a shared consulting-room machine this is what stops one
          // clinician's patient names surviving into the next session.
          const { clearRecentPatients } = await import('../lib/recent-patients.storage');
          clearRecentPatients();

          // El búfer de notas solo se borra cuando se pidió Y ya no queda nada
          // que perder. Si algo sigue sin llegar al servidor, se conserva y se
          // avisa: el riesgo del ordenador compartido es real, pero es menor
          // que borrar la única copia de una nota clínica.
          if (options?.purgeDrafts) {
            if (keptDrafts === 0) {
              const { purgeOfflineNotes } = await import('./notes.store');
              purgeOfflineNotes();
            } else {
              toast.warning(
                keptDrafts === 1
                  ? 'Una nota no llegó al servidor. Se conserva en esta pestaña: vuelve a entrar aquí antes de cerrarla.'
                  : `${keptDrafts} notas no llegaron al servidor. Se conservan en esta pestaña: vuelve a entrar aquí antes de cerrarla.`,
                { id: 'logout_kept_drafts', duration: 12000 },
              );
            }
          }

          // Corta el hilo entre este clínico y quien use el navegador después.
          // En un ordenador de consulta compartido, no hacerlo mezclaría los
          // eventos de dos profesionales bajo la misma persona.
          resetAnalytics();

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      fetchCurrentUser: async () => {
        set({ isLoading: true });

        try {
          // Relies on httpOnly cookie being sent automatically.
          // The api interceptor will attempt token refresh on 401 before rejecting.
          const response = await api.get<User>('/auth/me');

          // Aquí además de asociar, se refrescan los rasgos: el plan y el rol de
          // clínica cambian al completar el onboarding o al aceptar una
          // invitación, y `/auth/me` es el único sitio que ve ambos.
          identifyUser(response.data);

          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'kio-auth-storage',
      // Only persist non-sensitive UI state. Auth validity is determined by httpOnly cookie.
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
