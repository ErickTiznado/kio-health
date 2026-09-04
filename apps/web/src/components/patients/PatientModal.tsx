import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { WizardPatientForm } from './WizardPatientForm';
import type { PatientFormValues } from '../../schemas/patients.schema';

/**
 * Diálogo de ALTA de paciente. No tiene modo edición a propósito: un expediente
 * existente se edita sección a sección en "Perfil clínico", que es el único
 * modelo de edición del módulo.
 */
interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormValues) => void;
  isLoading?: boolean;
}

export function PatientModal({ isOpen, onClose, onSubmit, isLoading }: PatientModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      // Foco atrapado dentro del diálogo: sin esto el tabulador se escapa a la
      // página de detrás, que sigue siendo un expediente clínico visible.
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
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  // Sin `AnimatePresence`: su animación de salida no resuelve en este proyecto y
  // el diálogo se quedaba en el DOM con `aria-modal="true"` después de cerrarlo,
  // dejando el resto de la página oculta para los lectores de pantalla.
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-modal-title"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm dark:bg-black/60"
        onClick={onClose}
      />
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
        className="relative z-10 my-auto w-full max-w-lg rounded-3xl border border-border bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <WizardPatientForm
          titleId="patient-modal-title"
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </motion.div>
    </div>
  );
}
