import { useEffect, useRef } from 'react';
import { useDebounce } from './use-debounce';
import { useNoteStore } from '../stores/notes.store';
import type { CreatePsychNoteDto, NoteTemplateType } from '../types/appointments.types';

export function useAutoSave(
  appointmentId: string,
  content: any,
  templateType: NoteTemplateType,
  moodRating?: number,
  privateNotes?: string,
  tags?: string[]
) {
  const saveNote = useNoteStore((state) => state.saveNote);
  
  // Construct the DTO
  const dto: CreatePsychNoteDto = {
    templateType,
    content,
    moodRating,
    privateNotes,
    tags
  };

  const debouncedDto = useDebounce(dto, 1000);
  const firstRender = useRef(true);
  const lastSavedStr = useRef<string>('');

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      lastSavedStr.current = JSON.stringify(debouncedDto);
      return;
    }

    const currentStr = JSON.stringify(debouncedDto);
    if (currentStr === lastSavedStr.current) return;

    if (appointmentId) {
      saveNote(appointmentId, debouncedDto);
      lastSavedStr.current = currentStr;
    }
  }, [debouncedDto, appointmentId, saveNote]);
}
