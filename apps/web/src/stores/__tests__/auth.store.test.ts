import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import { useAuthStore } from '../auth.store';
import { api } from '../../lib/api';

const mockApi = api as unknown as {
  post: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
};

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  role: 'CLINICIAN',
  profile: null,
  clinicId: null,
  clinicRole: null,
};

function resetStore() {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });
  localStorage.removeItem('kio-auth-storage');
}

describe('useAuthStore', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  // ── login() ───────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('sets user and isAuthenticated=true on success', async () => {
      mockApi.post.mockResolvedValue({ data: { user: mockUser } });

      await useAuthStore.getState().login('test@example.com', 'password');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('clears isLoading after success', async () => {
      mockApi.post.mockResolvedValue({ data: { user: mockUser } });

      await useAuthStore.getState().login('test@example.com', 'password');

      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('sets error and isAuthenticated=false on 401 failure', async () => {
      const error = new Error('Credenciales inválidas');
      mockApi.post.mockRejectedValue(error);

      await expect(useAuthStore.getState().login('test@example.com', 'wrong')).rejects.toThrow();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBeTruthy();
      expect(state.isLoading).toBe(false);
    });

    it('re-throws the error after setting state', async () => {
      const error = new Error('Login failed');
      mockApi.post.mockRejectedValue(error);

      await expect(useAuthStore.getState().login('a@b.com', 'pass')).rejects.toThrow(error);
    });

    it('persists user and isAuthenticated to localStorage', async () => {
      mockApi.post.mockResolvedValue({ data: { user: mockUser } });

      await useAuthStore.getState().login('test@example.com', 'password');

      const stored = JSON.parse(localStorage.getItem('kio-auth-storage') ?? '{}');
      expect(stored.state.user).toBeTruthy();
      expect(stored.state.isAuthenticated).toBe(true);
    });

    it('does NOT persist isLoading or error to localStorage', async () => {
      mockApi.post.mockResolvedValue({ data: { user: mockUser } });
      await useAuthStore.getState().login('test@example.com', 'password');

      const stored = JSON.parse(localStorage.getItem('kio-auth-storage') ?? '{}');
      expect(stored.state).not.toHaveProperty('isLoading');
      expect(stored.state).not.toHaveProperty('error');
    });
  });

  // ── logout() ──────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('clears state in finally block even when POST fails', async () => {
      // First set some authenticated state
      useAuthStore.setState({ user: mockUser as unknown as unknown, isAuthenticated: true });
      mockApi.post.mockRejectedValue(new Error('Network error'));

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('clears state on successful logout', async () => {
      useAuthStore.setState({ user: mockUser as unknown as unknown, isAuthenticated: true });
      mockApi.post.mockResolvedValue({});

      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('is async — state is cleared after await', async () => {
      useAuthStore.setState({ user: mockUser as unknown as unknown, isAuthenticated: true });
      mockApi.post.mockResolvedValue({});

      const promise = useAuthStore.getState().logout();
      // Before await, state might still be set (or might not — implementation detail)
      await promise;
      // After await, state must be cleared
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('removes user from localStorage', async () => {
      // Simulate a logged-in persisted state
      localStorage.setItem('kio-auth-storage', JSON.stringify({ state: { user: mockUser, isAuthenticated: true } }));
      useAuthStore.setState({ user: mockUser as unknown as unknown, isAuthenticated: true });
      mockApi.post.mockResolvedValue({});

      await useAuthStore.getState().logout();

      const stored = JSON.parse(localStorage.getItem('kio-auth-storage') ?? '{}');
      expect(stored.state?.user).toBeFalsy();
      expect(stored.state?.isAuthenticated).toBe(false);
    });
  });

  // ── fetchCurrentUser() ────────────────────────────────────────────────────

  describe('fetchCurrentUser()', () => {
    it('sets user and isAuthenticated=true on success', async () => {
      mockApi.get.mockResolvedValue({ data: mockUser });

      await useAuthStore.getState().fetchCurrentUser();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('sets user=null and isAuthenticated=false on 401', async () => {
      mockApi.get.mockRejectedValue(new Error('Unauthorized'));

      await useAuthStore.getState().fetchCurrentUser();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  // ── Persistence ───────────────────────────────────────────────────────────

  describe('partialize (persistence)', () => {
    it('only persists user and isAuthenticated — not isLoading or error', async () => {
      mockApi.post.mockRejectedValue(new Error('failed'));
      // This sets error=truthy and isLoading=false
      await expect(useAuthStore.getState().login('x@x.com', 'pass')).rejects.toThrow();

      const stored = JSON.parse(localStorage.getItem('kio-auth-storage') ?? '{}');
      const persistedKeys = Object.keys(stored.state ?? {});
      expect(persistedKeys).toContain('user');
      expect(persistedKeys).toContain('isAuthenticated');
      expect(persistedKeys).not.toContain('isLoading');
      expect(persistedKeys).not.toContain('error');
    });
  });
});
