import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../lib/appointments.api', () => ({
  fetchPsychNote: vi.fn(),
  upsertPsychNote: vi.fn(),
}));
vi.mock('../../lib/analytics', () => ({ capture: vi.fn() }));
vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

import { useNoteStore, countOfflineNotes, purgeOfflineNotes } from '../notes.store';
import { fetchPsychNote, upsertPsychNote } from '../../lib/appointments.api';
import { NoteTemplateType } from '../../types/appointments.types';

const mockUpsert = upsertPsychNote as unknown as ReturnType<typeof vi.fn>;
const mockFetch = fetchPsychNote as unknown as ReturnType<typeof vi.fn>;

const dto = (body: string) => ({
  templateType: NoteTemplateType.FREE,
  content: { body },
});

function axiosError(status: number, message?: string, code?: string) {
  return { response: { status, data: { message, code } } };
}

describe('notes.store buffer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    purgeOfflineNotes();
    sessionStorage.clear();
    localStorage.clear();
    useNoteStore.setState({
      currentNote: null,
      status: 'idle',
      lastSaved: null,
      error: null,
      loadError: null,
      hasOfflineData: false,
      offlineCount: 0,
      lastSavedSignature: null,
      pendingSave: null,
    });
  });

  it('un 401 encola en vez de dar el guardado por rechazado', async () => {
    mockUpsert.mockRejectedValueOnce(axiosError(401, 'Unauthorized'));
    await useNoteStore.getState().saveNote('apt-1', dto('v1'));

    expect(useNoteStore.getState().status).not.toBe('error');
    expect(useNoteStore.getState().hasOfflineData).toBe(true);
    expect(countOfflineNotes()).toBe(1);
  });

  it('un 403 de las 24 h sí es rechazo definitivo y no deja cola', async () => {
    mockUpsert.mockRejectedValueOnce(axiosError(403, 'Edición bloqueada'));
    await useNoteStore.getState().saveNote('apt-1', dto('v1'));

    expect(useNoteStore.getState().status).toBe('error');
    expect(useNoteStore.getState().error).toBe('Edición bloqueada');
    expect(countOfflineNotes()).toBe(0);
  });

  it('TRIAL_EXPIRED se conserva para reintentar', async () => {
    mockUpsert.mockRejectedValueOnce(axiosError(403, 'Prueba terminada', 'TRIAL_EXPIRED'));
    await useNoteStore.getState().saveNote('apt-1', dto('v1'));
    expect(countOfflineNotes()).toBe(1);
  });

  it('un guardado con éxito retira del búfer la entrada de esa cita', async () => {
    mockUpsert.mockRejectedValueOnce(axiosError(500));
    await useNoteStore.getState().saveNote('apt-1', dto('v1'));
    expect(countOfflineNotes()).toBe(1);

    mockUpsert.mockResolvedValueOnce({ id: 'n1', appointmentId: 'apt-1' });
    await useNoteStore.getState().saveNote('apt-1', dto('v2'));

    expect(countOfflineNotes()).toBe(0);
    expect(useNoteStore.getState().hasOfflineData).toBe(false);
  });

  it('sync retira solo lo confirmado y conserva lo que falla', async () => {
    mockUpsert.mockRejectedValueOnce(axiosError(500));
    await useNoteStore.getState().saveNote('apt-1', dto('a'));
    mockUpsert.mockRejectedValueOnce(axiosError(500));
    await useNoteStore.getState().saveNote('apt-2', dto('b'));
    expect(countOfflineNotes()).toBe(2);

    mockUpsert.mockResolvedValueOnce({ id: 'n1', appointmentId: 'apt-1' });
    mockUpsert.mockRejectedValueOnce(axiosError(500));
    await useNoteStore.getState().syncOfflineNotes();

    expect(countOfflineNotes()).toBe(1);
    expect(useNoteStore.getState().offlineCount).toBe(1);
    const left = JSON.parse(sessionStorage.getItem('kio_offline_notes') ?? '[]');
    expect(left.map((e: { appointmentId: string }) => e.appointmentId)).toEqual(['apt-2']);
  });

  it('sync corta al caducar la sesión y no pierde nada', async () => {
    mockUpsert.mockRejectedValueOnce(axiosError(500));
    await useNoteStore.getState().saveNote('apt-1', dto('a'));
    mockUpsert.mockRejectedValueOnce(axiosError(500));
    await useNoteStore.getState().saveNote('apt-2', dto('b'));

    mockUpsert.mockRejectedValue(axiosError(401));
    await useNoteStore.getState().syncOfflineNotes();

    expect(countOfflineNotes()).toBe(2);
  });

  it('fetchNote fallido deja loadError, no un vacío', async () => {
    mockFetch.mockRejectedValueOnce(new Error('boom'));
    await useNoteStore.getState().fetchNote('apt-1');
    expect(useNoteStore.getState().loadError).toBeTruthy();
    expect(useNoteStore.getState().currentNote).toBeNull();
  });

  it('flushPendingSave no lanza un segundo upsert sobre el que está en vuelo', async () => {
    let resolveUpsert: (v: unknown) => void = () => {};
    mockUpsert.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveUpsert = resolve;
        }),
    );

    useNoteStore.getState().setPendingSave({ appointmentId: 'apt-1', data: dto('v1') });
    const saving = useNoteStore.getState().saveNote('apt-1', dto('v1'));
    const flushing = useNoteStore.getState().flushPendingSave();

    resolveUpsert({ id: 'n1', appointmentId: 'apt-1' });
    await saving;
    const ok = await flushing;

    expect(ok).toBe(true);
    expect(mockUpsert).toHaveBeenCalledTimes(1);
  });
});
