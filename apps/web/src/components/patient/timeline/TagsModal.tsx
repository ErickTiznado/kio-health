import { type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag } from 'lucide-react';

interface TagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: string[];
  patientName?: string;
}

export const TagsModal: FC<TagsModalProps> = ({ isOpen, onClose, tags, patientName: _patientName }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-surface dark:bg-slate-900 rounded-2xl shadow-2xl border border-[var(--color-cruz)] dark:border-slate-800 overflow-hidden z-10"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-cruz)] dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            <h2 className="text-lg font-bold text-[var(--color-kanji)] dark:text-white flex items-center gap-2">
              <Tag size={20} className="text-kio" />
              Etiquetas de la Sesión
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              Todas las etiquetas registradas para esta sesión:
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-full text-sm font-medium border border-gray-200 dark:border-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-[var(--color-cruz)] dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[var(--color-kanji)] dark:bg-kio text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
