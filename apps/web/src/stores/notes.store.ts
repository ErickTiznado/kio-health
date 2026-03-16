import { create } from 'zustand';
import { toast } from 'sonner';
import { fetchPsychNote, upsertPsychNote } from '../lib/appointments.api';
import type { PsychNote, CreatePsychNoteDto } from '../types/appointments.types';

interface OfflineNotePayload {
  appointmentId: string;
  data: CreatePsychNoteDto;
  timestamp: number;
}

interface NoteState {
  currentNote: PsychNote | null;
  status: 'idle' | 'loading' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  error: string | null;
  hasOfflineData: boolean;

  fetchNote: (appointmentId: string) => Promise<void>;
  saveNote: (appointmentId: string, data: CreatePsychNoteDto) => Promise<void>;
  syncOfflineNotes: () => Promise<void>;
  reset: () => void;
}

export const useNoteStore = create<NoteState>((set) => ({
  currentNote: null,
  status: 'idle',
  lastSaved: null,
  error: null,
  hasOfflineData: false,

  fetchNote: async (appointmentId: string) => {
    set({ status: 'loading', error: null });
    try {
      const note = await fetchPsychNote(appointmentId);
      set({ currentNote: note, status: 'idle' });
    } catch (error) {
      console.error('Failed to fetch note:', error);
      toast.error('Error al cargar la nota');
      set({ currentNote: null, status: 'idle' });
    }
  },

  saveNote: async (appointmentId: string, data: CreatePsychNoteDto) => {
    set({ status: 'saving', error: null });
    
    if (!navigator.onLine) {
      const queue: OfflineNotePayload[] = JSON.parse(localStorage.getItem('offline_notes_queue') || '[]');
      
      // Remove any existing pending update for this appointment to only keep the latest
      const filteredQueue = queue.filter(q => q.appointmentId !== appointmentId);
      filteredQueue.push({ appointmentId, data, timestamp: Date.now() });
      
      localStorage.setItem('offline_notes_queue', JSON.stringify(filteredQueue));
      toast.info('Sin conexión. Cambios guardados localmente.', { id: 'offline_save' });
      set({ status: 'saved', lastSaved: new Date(), hasOfflineData: true });
      return;
    }

    try {
      const note = await upsertPsychNote(appointmentId, data);
      set({ currentNote: note, status: 'saved', lastSaved: new Date() });
      setTimeout(() => set((s) => s.status === 'saved' ? { status: 'idle' } : {}), 3000);
    } catch (error) {
      console.error('Failed to save note:', error);
      
      // Fallback to offline queue if server error or network issue
      const queue: OfflineNotePayload[] = JSON.parse(localStorage.getItem('offline_notes_queue') || '[]');
      const filteredQueue = queue.filter(q => q.appointmentId !== appointmentId);
      filteredQueue.push({ appointmentId, data, timestamp: Date.now() });
      localStorage.setItem('offline_notes_queue', JSON.stringify(filteredQueue));
      
      toast.error('No se pudo guardar en el servidor. Guardado localmente.');
      set({ status: 'saved', error: 'Saved locally due to server error', hasOfflineData: true });
    }
  },

  syncOfflineNotes: async () => {
    if (!navigator.onLine) return;
    
    const queue: OfflineNotePayload[] = JSON.parse(localStorage.getItem('offline_notes_queue') || '[]');
    if (queue.length === 0) {
      set({ hasOfflineData: false });
      return;
    }

    let successCount = 0;
    
    for (const item of queue) {
      try {
        await upsertPsychNote(item.appointmentId, item.data);
        successCount++;
      } catch (error) {
        console.error(`Failed to sync note for appointment ${item.appointmentId}:`, error);
      }
    }

    // Keep the ones that failed
    const remainingQueue = queue.slice(successCount);
    localStorage.setItem('offline_notes_queue', JSON.stringify(remainingQueue));
    
    if (remainingQueue.length === 0) {
      toast.success('Sincronización completada. Todas las notas están en la nube.');
      set({ hasOfflineData: false });
    } else {
      toast.error('Algunas notas no pudieron sincronizarse.');
      set({ hasOfflineData: true });
    }
  },

  reset: () => set({ currentNote: null, status: 'idle', lastSaved: null, error: null }),
}));
