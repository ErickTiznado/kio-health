import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TasksWidget } from '../patient/tasks/TasksWidget';

interface TasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export function TasksModal({ isOpen, onClose, patientId }: TasksModalProps) {
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
            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl z-10 relative overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                <h2 className="text-lg font-bold text-kanji dark:text-kio tracking-tight">Tareas del Paciente</h2>
                <button 
                    onClick={onClose} 
                    className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 transition-colors"
                >
                    <X size={20} />
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
