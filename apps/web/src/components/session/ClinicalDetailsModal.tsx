import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Target, Activity } from 'lucide-react';

interface ClinicalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  psychContext: {
    diagnosis: string;
    clinicalContext: string;
    treatmentGoals: string[];
  };
}

export function ClinicalDetailsModal({ 
  isOpen, 
  onClose, 
  patientName, 
  psychContext 
}: ClinicalDetailsModalProps) {
  
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
            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl z-10 relative overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                <div>
                    <h2 className="text-xl font-bold text-kanji dark:text-kio tracking-tight">Detalles Clínicos</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{patientName}</p>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8">
                
                {/* Diagnosis */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <Activity size={20} />
                        <h3 className="text-sm font-bold uppercase tracking-wider">Diagnóstico Actual</h3>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30 font-medium leading-relaxed">
                        {psychContext.diagnosis || 'Sin diagnóstico registrado.'}
                    </div>
                </div>

                {/* Clinical Context */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                        <FileText size={20} />
                        <h3 className="text-sm font-bold uppercase tracking-wider">Contexto Clínico</h3>
                    </div>
                    <p className="text-gray-700 dark:text-slate-300 leading-relaxed text-base bg-gray-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                        {psychContext.clinicalContext || 'Sin contexto registrado.'}
                    </p>
                </div>

                {/* Treatment Goals */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <Target size={20} />
                        <h3 className="text-sm font-bold uppercase tracking-wider">Objetivos Terapéuticos</h3>
                    </div>
                    {psychContext.treatmentGoals && psychContext.treatmentGoals.length > 0 ? (
                        <ul className="grid gap-3">
                            {psychContext.treatmentGoals.map((goal: string, idx: number) => (
                                <li key={idx} className="flex gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                    <span className="text-gray-700 dark:text-slate-300">{goal}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 dark:text-slate-500 italic px-1">Sin objetivos definidos.</p>
                    )}
                </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
