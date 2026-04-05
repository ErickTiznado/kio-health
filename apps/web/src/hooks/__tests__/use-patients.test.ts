import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper } from '../../test/query-wrapper';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../lib/patients.api', () => ({
  listPatientDocuments: vi.fn(),
  uploadPatientDocument: vi.fn(),
  deletePatientDocument: vi.fn(),
  fetchDocumentBlob: vi.fn(),
}));

import { api } from '../../lib/api';
import {
  usePatients,
  usePatient,
  useCreatePatient,
  useUpdatePatient,
  useArchivePatient,
  usePatientTimeline,
} from '../use-patients';

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

const mockPatient = {
  id: 'patient-1',
  fullName: 'Ana García',
  status: 'ACTIVE',
  clinicianId: 'clinician-1',
  createdAt: new Date().toISOString(),
};

const mockPatientsResponse = {
  data: [mockPatient],
  meta: { total: 1, page: 1, lastPage: 1 },
};

describe('usePatients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── usePatients ───────────────────────────────────────────────────────────

  it('calls GET /patients with page, search, limit params', async () => {
    mockApi.get.mockResolvedValue({ data: mockPatientsResponse });

    const { result } = renderHook(() => usePatients(2, 'Ana', 20), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.get).toHaveBeenCalledWith('/patients', {
      params: { page: 2, search: 'Ana', limit: 20 },
    });
  });

  it('returns patient list data', async () => {
    mockApi.get.mockResolvedValue({ data: mockPatientsResponse });

    const { result } = renderHook(() => usePatients(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].id).toBe('patient-1');
  });
});

// ── usePatient ────────────────────────────────────────────────────────────

describe('usePatient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /patients/:id when id is provided', async () => {
    mockApi.get.mockResolvedValue({ data: mockPatient });

    const { result } = renderHook(() => usePatient('patient-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.get).toHaveBeenCalledWith('/patients/patient-1');
  });

  it('is disabled when id is empty string', async () => {
    const { result } = renderHook(() => usePatient(''), { wrapper: createWrapper() });

    // Should remain in idle/pending state — not fetching
    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.get).not.toHaveBeenCalled();
  });
});

// ── useCreatePatient ──────────────────────────────────────────────────────

describe('useCreatePatient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls POST /patients with the DTO', async () => {
    mockApi.post.mockResolvedValue({ data: mockPatient });

    const { result } = renderHook(() => useCreatePatient(), { wrapper: createWrapper() });

    result.current.mutate({ fullName: 'Carlos López' } as unknown as unknown);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.post).toHaveBeenCalledWith('/patients', { fullName: 'Carlos López' });
  });
});

// ── useUpdatePatient ──────────────────────────────────────────────────────

describe('useUpdatePatient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls PATCH /patients/:id with update data', async () => {
    mockApi.patch.mockResolvedValue({ data: { ...mockPatient, fullName: 'Ana Updated' } });

    const { result } = renderHook(() => useUpdatePatient(), { wrapper: createWrapper() });

    result.current.mutate({ id: 'patient-1', data: { fullName: 'Ana Updated' } as unknown as unknown });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.patch).toHaveBeenCalledWith('/patients/patient-1', { fullName: 'Ana Updated' });
  });
});

// ── useArchivePatient ─────────────────────────────────────────────────────

describe('useArchivePatient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls PATCH /patients/:id/archive', async () => {
    mockApi.patch.mockResolvedValue({ data: { ...mockPatient, status: 'ARCHIVED' } });

    const { result } = renderHook(() => useArchivePatient(), { wrapper: createWrapper() });

    result.current.mutate('patient-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.patch).toHaveBeenCalledWith('/patients/patient-1/archive');
  });
});

// ── usePatientTimeline ────────────────────────────────────────────────────

describe('usePatientTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is disabled when patientId is empty', () => {
    const { result } = renderHook(() => usePatientTimeline(''), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.get).not.toHaveBeenCalled();
  });

  it('getNextPageParam returns next page number when more pages exist', async () => {
    const page1 = {
      data: [mockPatient],
      meta: { total: 30, page: 1, lastPage: 3 },
    };
    mockApi.get.mockResolvedValue({ data: page1 });

    const { result } = renderHook(() => usePatientTimeline('patient-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // The hook should indicate there are more pages
    expect(result.current.hasNextPage).toBe(true);
  });

  it('getNextPageParam returns undefined on last page', async () => {
    const lastPage = {
      data: [mockPatient],
      meta: { total: 5, page: 3, lastPage: 3 },
    };
    mockApi.get.mockResolvedValue({ data: lastPage });

    const { result } = renderHook(() => usePatientTimeline('patient-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });
});
