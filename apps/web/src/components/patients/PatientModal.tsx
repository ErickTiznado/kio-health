import { motion, AnimatePresence } from 'framer-motion';
import { PatientForm } from './PatientForm';
import type { PatientFormValues } from '../../schemas/patients.schema';
import type { Patient } from '../../types/patients.types';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Patient | null;
  onSubmit: (data: PatientFormValues) => void;
  isLoading?: boolean;
}

export function PatientModal({ 
  isOpen, 
  onClose, 
  initialData, 
  onSubmit, 
  isLoading 
}: PatientModalProps) {
  const isEditing = !!initialData;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm" 
            aria-hidden="true" 
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl px-8 pt-8 pb-8 text-left overflow-hidden shadow-2xl sm:max-w-lg sm:w-full z-10 relative"
          >
            <div className="text-left">
              <h3 className="text-xl font-bold text-kanji dark:text-kio mb-1" id="modal-title">
                {isEditing ? 'Editar Expediente' : 'Crear Expediente'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-400 opacity-60 mb-6">
                {isEditing 
                  ? 'Actualiza la información clínica del paciente.' 
                  : 'Ingresa los datos esenciales del nuevo paciente.'}
              </p>
              
              <PatientForm
                initialData={initialData || undefined}
                onSubmit={onSubmit}
                onCancel={onClose}
                isLoading={isLoading}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
