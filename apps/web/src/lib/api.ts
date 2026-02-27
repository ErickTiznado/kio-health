import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth.store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  withCredentials: true, // Send httpOnly cookies on every request
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

    return Promise.reject(error);
  },
);
