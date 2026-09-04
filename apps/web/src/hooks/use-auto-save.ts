import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDebounce } from './use-debounce';
import { useNoteStore } from '../stores/notes.store';
import type { CreatePsychNoteDto, NoteTemplateType } from '../types/appointments.types';

interface AutoSaveInput {
  appointmentId: string;
  content: unknown;
  templateType: NoteTemplateType;
  moodRating?: number;
  privateNotes?: string;
  tags?: string[];
  /** En notas cerradas (sesión COMPLETED/CANCELLED) no se guarda nada. */
  enabled?: boolean;
}

/**
 * Autoguardado con debounce.
 *
 * Devuelve `isDirty` para que la página pueda advertir antes de abandonar la
 * sesión con cambios en vuelo, y `saveNow` para forzar la escritura sin esperar
 * al debounce — lo que necesitan el atajo de guardado y el cierre de sesión,
 * que hasta ahora desmontaban el editor con el temporizador de 1 s pendiente y
 * se llevaban por delante la última frase escrita.
 */
export function useAutoSave({
  appointmentId,
  content,
  templateType,
  moodRating,
  privateNotes,
  tags,
  enabled = true,
}: AutoSaveInput) {
  const saveNote = useNoteStore((state) => state.saveNote);
  const saveStatus = useNoteStore((state) => state.status);
  const setPendingSave = useNoteStore((state) => state.setPendingSave);
  const markSavedSignature = useNoteStore((state) => state.markSavedSignature);
  const flushPendingSave = useNoteStore((state) => state.flushPendingSave);

  // El DTO tiene que ser estable entre renders. Construido como literal suelto
  // era un objeto nuevo cada vez, así que `useDebounce` reprogramaba su timer en
  // cada render y volvía a llamar a `setDebouncedValue` con otra referencia: un
  // bucle de render perpetuo de ~1/s que seguía corriendo sin que nadie tocara
  // el editor.
  const dto: CreatePsychNoteDto = useMemo(
    () => ({
      templateType,
      content,
      moodRating,
      privateNotes,
      tags,
    }),
    [templateType, content, moodRating, privateNotes, tags],
  );

  const debouncedDto = useDebounce(dto, 1000);
  const firstRender = useRef(true);

  // Marca de "sucio" derivada solo de valores de render — nada de refs ni de
  // estado sincronizado desde un efecto. Hay cambios en vuelo mientras el
  // debounce va por detrás del DTO actual (se teclea ahora mismo) o mientras la
  // petición de guardado sigue abierta. Cubre exactamente la ventana en la que
  // el guard de salida tiene que avisar.
  const isDirty = enabled && (dto !== debouncedDto || saveStatus === 'saving');

  // Espejo de lo tecleado en el store, para que `flushPendingSave` pueda
  // escribirlo desde fuera del editor (atajo Ctrl+S, botón de finalizar).
  useEffect(() => {
    if (!enabled || !appointmentId) {
      setPendingSave(null);
      return;
    }
    setPendingSave({ appointmentId, data: dto });
  }, [dto, appointmentId, enabled, setPendingSave]);

  // Al desmontar deja de haber editor: lo pendiente ya no puede describirse
  // como "lo que hay escrito en pantalla".
  useEffect(() => () => setPendingSave(null), [setPendingSave]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      markSavedSignature(JSON.stringify(debouncedDto));
      return;
    }

    if (!enabled) return;

    const currentStr = JSON.stringify(debouncedDto);
    if (currentStr === useNoteStore.getState().lastSavedSignature) return;

    if (appointmentId && debouncedDto.content && typeof debouncedDto.content === 'object') {
      saveNote(appointmentId, debouncedDto);
    }
  }, [debouncedDto, appointmentId, saveNote, enabled, markSavedSignature]);

  const saveNow = useCallback(async () => {
    if (!enabled) return true;
    return flushPendingSave();
  }, [enabled, flushPendingSave]);

  return { isDirty, saveNow };
}
