import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';
import type { User } from '../types/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          // Backend sets httpOnly cookies; response body contains only user info
          const response = await api.post<{ user: User }>('/auth/login', { email, password });

          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Login failed. Please check your credentials.';

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });

          throw error;
        }
      },

      logout: async () => {
        try {
          // Revoke refresh token on server and clear cookies
          await api.post('/auth/logout');
        } catch {
          // Best-effort: clear local state regardless
        } finally {
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
