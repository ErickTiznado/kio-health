import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TasksWidget } from '../patient/tasks/TasksWidget';

interface TasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export function TasksModal({ isOpen, onClose, patientId }: TasksModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // `onClose` llega como flecha en línea desde PatientContextPanel, así que
  // cambia de identidad en cada render del panel — y el panel se re-renderiza
  // con el modal abierto en cada transición del autoguardado. Con el callback
  // en las dependencias, el efecto se remontaba a media escritura y su limpieza
  // devolvía el foco al botón que hay DETRÁS del overlay. El ref lo saca de las
  // dependencias sin dejar de llamar siempre a la versión vigente.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      // Mismo trap que PatientModal: sin esto el tabulador se escapa a la
      // sesión de detrás, que sigue siendo un expediente clínico visible.
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          {/* Overlay sin `onClick`: cerrar por clic fuera descartaba en silencio
              la tarea a medio escribir. Se cierra con la X o con Escape. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl z-10 relative overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                <h2 id="modal-title" className="text-lg font-bold text-kanji-deep dark:text-kio tracking-tight">Tareas del paciente</h2>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar tareas"
                    className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                    <X size={20} aria-hidden="true" />
                </button>
            </div>

            <div className="flex-1 overflow-hidden p-4">
                <TasksWidget patientId={patientId} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
