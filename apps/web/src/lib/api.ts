import axios from 'axios';
import { toast } from 'sonner';
import type { AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth.store';
import { capture, sanitizePath } from './analytics';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api'),
  withCredentials: true, // Send httpOnly cookies on every request
  timeout: 15000,        // 15 s — evita peticiones colgadas indefinidamente
});

// ── Refresh token rotation ────────────────────────────────────────────────────
// When a request fails with 401, attempt a silent token refresh once.
// If refresh succeeds, retry the original request.
// If refresh fails (expired / revoked), logout and let the app redirect to login.

let isRefreshing = false;
let pendingQueue: Array<{ resolve: () => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown) {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Don't retry auth endpoints to avoid infinite loops
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/logout');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue concurrent requests until refresh completes
        return new Promise<void>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((e) => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403) {
      const route = sanitizePath(originalRequest?.url ?? '');
      const body = error.response?.data as { code?: string; mode?: string } | undefined;

      if (body?.code === 'TRIAL_EXPIRED') {
        // Prueba caducada, no un problema de permisos. Separarlo importa por
        // dos motivos: al usuario se le explica qué hacer en vez de "no tienes
        // acceso", y la sonda de roles de clínica no queda contaminada con
        // cientos de 403 que no tienen nada que ver con los roles.
        capture('trial_write_blocked', { route, mode: body.mode ?? 'READ_ONLY' });

        // `id` fijo: una pantalla puede disparar varias escrituras a la vez y
        // sin esto saldría una pila de toasts idénticos.
        toast.error('Tu prueba terminó. Elige un plan para volver a guardar cambios.', {
          id: 'trial-expired',
          action: {
            label: 'Elegir plan',
            onClick: () => {
              window.location.href = '/plan';
            },
          },
        });
      } else {
        // Alguien intentando algo que su rol no le deja hacer. Capturarlo aquí,
        // en el único cliente de la app, da el mapa completo de dónde el modelo
        // de permisos de clínica contradice lo que el usuario esperaba — sin
        // instrumentar cada botón por separado.
        capture('permission_denied', {
          route,
          method: (originalRequest?.method ?? 'get').toUpperCase(),
        });
      }
    }

    return Promise.reject(error);
  },
);
