import { describe, it, expect, beforeEach, vi } from 'vitest';

// vi.mock is hoisted before imports — auth.store is mocked before api.ts loads
vi.mock('../../stores/auth.store', () => ({
  useAuthStore: {
    getState: () => ({ logout: mockLogout }),
  },
}));

const mockLogout = vi.fn();

// Static import — picks up the mock because vi.mock() is hoisted
import { api } from '../../lib/api';

// Helper: create an axios error from actual adapter config (preserves _retry etc.)
function makeError(config: Record<string, unknown>, status: number) {
  const response = { status, data: {}, headers: {}, config };
  return { response, config, isAxiosError: true, message: `Request failed with status code ${status}` };
}

// Helper: success adapter response
function makeSuccess(data: unknown, config: unknown) {
  return { data, status: 200, statusText: 'OK', headers: {}, config, request: {} };
}

describe('api response interceptor', () => {
  let originalAdapter: unknown;

  beforeEach(() => {
    vi.clearAllMocks();
    // Save the original adapter so we can restore it
    originalAdapter = (api.defaults as any).adapter;
  });

  afterEach(() => {
    // Restore the original adapter after each test
    (api.defaults as any).adapter = originalAdapter;
  });

  it('passes successful responses through without modification', async () => {
    (api.defaults as any).adapter = (config: any) => Promise.resolve(makeSuccess({ ok: true }, config));

    const response = await api.get('/data');
    expect(response.data).toEqual({ ok: true });
  });

  it('does NOT call refresh for /auth/login 401', async () => {
    let callCount = 0;
    (api.defaults as any).adapter = (config: any) => {
      callCount++;
      return Promise.reject(makeError(config, 401));
    };

    await expect(api.post('/auth/login', {})).rejects.toBeTruthy();
    expect(callCount).toBe(1); // no retry
  });

  it('does NOT call refresh for /auth/refresh 401', async () => {
    let callCount = 0;
    (api.defaults as any).adapter = (config: any) => {
      callCount++;
      return Promise.reject(makeError(config, 401));
    };

    await expect(api.post('/auth/refresh')).rejects.toBeTruthy();
    expect(callCount).toBe(1);
  });

  it('does NOT call refresh for /auth/logout 401', async () => {
    let callCount = 0;
    (api.defaults as any).adapter = (config: any) => {
      callCount++;
      return Promise.reject(makeError(config, 401));
    };

    await expect(api.post('/auth/logout')).rejects.toBeTruthy();
    expect(callCount).toBe(1);
  });

  it('calls POST /auth/refresh on 401 from non-auth endpoint', async () => {
    const calledUrls: string[] = [];
    (api.defaults as any).adapter = (config: any) => {
      calledUrls.push(config.url);
      if (config.url.includes('/patients') && !config._retry) {
        return Promise.reject(makeError(config, 401));
      }
      return Promise.resolve(makeSuccess({}, config));
    };

    await api.get('/patients');

    expect(calledUrls.some((u) => u.includes('/auth/refresh'))).toBe(true);
  });

  it('retries the original request after successful refresh', async () => {
    const calledUrls: string[] = [];
    (api.defaults as any).adapter = (config: any) => {
      calledUrls.push(config.url);
      if (config.url.includes('/patients') && !config._retry) {
        return Promise.reject(makeError(config, 401));
      }
      const data = config.url.includes('/patients') ? { patients: [] } : {};
      return Promise.resolve(makeSuccess(data, config));
    };

    const result = await api.get('/patients');

    expect(result.data).toEqual({ patients: [] });
    expect(calledUrls.filter((u) => u.includes('/patients'))).toHaveLength(2);
  });

  it('calls logout() when refresh fails', async () => {
    (api.defaults as any).adapter = (config: any) =>
      Promise.reject(makeError(config, 401));

    await expect(api.get('/patients')).rejects.toBeTruthy();
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('does not retry requests already marked with _retry=true', async () => {
    let callCount = 0;
    (api.defaults as any).adapter = (config: any) => {
      callCount++;
      return Promise.reject(makeError(config, 401));
    };

    await expect(
      api.request({ url: '/patients', method: 'GET', _retry: true } as any),
    ).rejects.toBeTruthy();

    expect(callCount).toBe(1);
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('does not trigger interceptor for non-401 errors', async () => {
    let callCount = 0;
    (api.defaults as any).adapter = (config: any) => {
      callCount++;
      return Promise.reject(makeError(config, 403));
    };

    await expect(api.get('/patients')).rejects.toBeTruthy();
    expect(callCount).toBe(1);
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('concurrent 401s trigger only one refresh', async () => {
    const refreshCalls: string[] = [];
    let resolveRefresh!: () => void;
    const refreshBlocker = new Promise<void>((r) => {
      resolveRefresh = r;
    });
    // After refresh completes, non-refresh requests succeed (simulates valid token)
    let refreshDone = false;

    (api.defaults as any).adapter = async (config: any) => {
      if (config.url?.includes('/auth/refresh')) {
        refreshCalls.push(config.url);
        await refreshBlocker;
        refreshDone = true;
        return makeSuccess({}, config);
      }
      // Pre-refresh: all data requests fail with 401
      if (!refreshDone) {
        return Promise.reject(makeError(config, 401));
      }
      // Post-refresh: data requests succeed (token is now valid)
      return makeSuccess({ retried: true }, config);
    };

    const p1 = api.get('/patients');

    // Poll until refresh is in-flight (guarantees isRefreshing===true before p2 starts)
    await new Promise<void>((resolve) => {
      const poll = setInterval(() => {
        if (refreshCalls.length >= 1) {
          clearInterval(poll);
          resolve();
        }
      }, 2);
    });

    // isRefreshing===true: p2 must be enqueued, not trigger a second refresh
    const p2 = api.get('/appointments');
    await new Promise((r) => setTimeout(r, 10));

    resolveRefresh();

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1.data).toEqual({ retried: true });
    expect(r2.data).toEqual({ retried: true });
    expect(refreshCalls).toHaveLength(1);
  });
});
