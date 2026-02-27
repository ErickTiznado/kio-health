import { create } from 'zustand';
import { toast } from 'sonner';
import { fetchPsychNote, upsertPsychNote } from '../lib/appointments.api';
import type { PsychNote, CreatePsychNoteDto } from '../types/appointments.types';

interface NoteState {
  currentNote: PsychNote | null;
  status: 'idle' | 'loading' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  error: string | null;

  fetchNote: (appointmentId: string) => Promise<void>;
  saveNote: (appointmentId: string, data: CreatePsychNoteDto) => Promise<void>;
  reset: () => void;
}

export const useNoteStore = create<NoteState>((set) => ({
  currentNote: null,
  status: 'idle',
  lastSaved: null,
  error: null,

  fetchNote: async (appointmentId: string) => {
    set({ status: 'loading', error: null });
    try {
      const note = await fetchPsychNote(appointmentId);
      set({ currentNote: note, status: 'idle' });
    } catch (error) {
      console.error('Failed to fetch note:', error);
      toast.error('Error al cargar la nota');
      // Assume no note exists or error, reset currentNote
      set({ currentNote: null, status: 'idle' });
    }
  },

  saveNote: async (appointmentId: string, data: CreatePsychNoteDto) => {
    set({ status: 'saving', error: null });
    try {
      const note = await upsertPsychNote(appointmentId, data);
      set({ currentNote: note, status: 'saved', lastSaved: new Date() });
      setTimeout(() => set((s) => s.status === 'saved' ? { status: 'idle' } : {}), 3000);
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error('Error al guardar la nota');
      set({ status: 'error', error: 'Failed to save changes' });
    }
  },

  reset: () => set({ currentNote: null, status: 'idle', lastSaved: null, error: null }),
}));
