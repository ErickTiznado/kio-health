import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FilePlus } from 'lucide-react';
import { toast } from 'sonner';

import { useCreateAddendum } from '../../hooks/use-addendums';
import { confirmAction } from '../../lib/confirm-action';
import { PrivateNoteField } from './PrivateNoteField';

interface AddendumModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
}

export const AddendumModal: FC<AddendumModalProps> = ({ isOpen, onClose, appointmentId }) => {
  const [content, setContent] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const createMutation = useCreateAddendum();

  const dialogRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const hasDraft = Boolean(content.trim() || privateNotes.trim());

  /**
   * Salir del anexo. Un clic en el fondo descartaba un anexo ya tecleado sin
   * preguntar nada: el texto de un anexo es dato clínico y no existe en ningún
   * otro sitio hasta que se guarda.
   */
  const requestClose = useCallback(async () => {
    if (hasDraft) {
      const confirmed = await confirmAction({
        title: '¿Descartar el anexo?',
        description: 'Lo que has escrito aquí todavía no se ha guardado y se perderá.',
        confirmLabel: 'Descartar',
        cancelLabel: 'Seguir escribiendo',
        variant: 'danger',
      });
      if (!confirmed) return;
    }
    setContent('');
    setPrivateNotes('');
    onClose();
  }, [hasDraft, onClose]);

  // `requestClose` cambia de identidad en cuanto `hasDraft` pasa de false a
  // true — es decir, al primer carácter que se teclea — y también en cada render
  // de EditorContainer, porque `onClose` llega como flecha en línea. Si va en
  // las dependencias del efecto de abajo, el efecto se remonta a media escritura
  // y su `contentRef.current?.focus()` arranca el foco de "Notas privadas" y lo
  // devuelve al anexo: lo que se siguiera tecleando acabaría en el campo clínico
  // equivocado. El ref lo saca de las dependencias.
  const requestCloseRef = useRef(requestClose);
  useEffect(() => {
    requestCloseRef.current = requestClose;
  }, [requestClose]);

  useEffect(() => {
    if (!isOpen) return;

    contentRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        void requestCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const root = dialogRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('El contenido del anexo es requerido');
      return;
    }

    createMutation.mutate(
      { appointmentId, content, privateNotes },
      {
        onSuccess: () => {
          toast.success('Anexo creado correctamente');
          setContent('');
          setPrivateNotes('');
          onClose();
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } };
          toast.error(error.response?.data?.message || 'Error al crear el anexo');
        },
      },
    );
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="addendum-title"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-hidden="true"
          onClick={() => void requestClose()}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm dark:bg-black/60"
        />

        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-secondary px-6 py-4">
            <h2 id="addendum-title" className="flex items-center gap-2 text-lg font-bold text-text">
              <FilePlus size={20} aria-hidden="true" className="text-kanji-deep dark:text-kio" />
              Agregar anexo
            </h2>
            <button
              type="button"
              onClick={() => void requestClose()}
              aria-label="Cerrar sin guardar el anexo"
              className="flex size-11 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-border hover:text-text"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
              <div>
                <label
                  htmlFor="addendum-content"
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-text-muted"
                >
                  Contenido del anexo <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <textarea
                  id="addendum-content"
                  ref={contentRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] w-full resize-y rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm font-medium leading-relaxed text-text outline-none transition-colors placeholder:text-text-muted focus:border-kanji-deep focus:ring-2 focus:ring-kio/50 dark:focus:border-kio"
                  placeholder="Información adicional, corrección o actualización…"
                  required
                />
                <p className="mt-1.5 text-[11px] font-medium text-text-secondary">
                  Se añade a la nota cerrada sin modificarla: el anexo es la vía de
                  corrección que preserva el original.
                </p>
              </div>

              <PrivateNoteField
                id="addendum-private-notes"
                value={privateNotes}
                onChange={setPrivateNotes}
                rows={3}
              />
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={() => void requestClose()}
                className="min-h-11 rounded-xl px-4 text-sm font-bold text-text-secondary transition-colors hover:bg-secondary hover:text-text"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || !content.trim()}
                className="flex min-h-11 items-center gap-2 rounded-xl bg-kanji-deep px-4 text-sm font-bold text-white shadow-md shadow-kanji-deep/20 transition-all duration-150 hover:bg-kanji-deep/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createMutation.isPending ? 'Guardando…' : 'Guardar anexo'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
