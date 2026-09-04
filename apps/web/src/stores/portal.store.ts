import { create } from 'zustand';

const STORAGE_KEY = 'kio_portal_token';

interface PortalState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

/**
 * Token de acceso del paciente. Vive en sessionStorage (se pierde al cerrar
 * la pestaña) + memoria — NUNCA en localStorage ni en la URL después del
 * bootstrap (/p/:token hace replaceState a /p).
 */
export const usePortalStore = create<PortalState>((set) => ({
  token: sessionStorage.getItem(STORAGE_KEY),
  setToken: (token) => {
    sessionStorage.setItem(STORAGE_KEY, token);
    set({ token });
  },
  clearToken: () => {
    sessionStorage.removeItem(STORAGE_KEY);
    set({ token: null });
  },
}));
