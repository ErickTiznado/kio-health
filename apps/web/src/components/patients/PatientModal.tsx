import { motion, AnimatePresence } from 'framer-motion';
import { WizardPatientForm } from './WizardPatientForm';
import type { PatientFormValues } from '../../schemas/patients.schema';
import type { Patient } from '../../types/patients.types';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Patient | null;
  onSubmit: (data: PatientFormValues) => void;
  isLoading?: boolean;
}

export function PatientModal({ isOpen, onClose, initialData, onSubmit, isLoading }: PatientModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg z-10 relative border border-gray-100 dark:border-slate-800"
          >
            <WizardPatientForm
              initialData={initialData || undefined}
              onSubmit={onSubmit}
              onCancel={onClose}
              isLoading={isLoading}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
