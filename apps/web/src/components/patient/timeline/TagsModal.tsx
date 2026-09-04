import { type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag } from 'lucide-react';

interface TagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: string[];
  patientName?: string;
}

export const TagsModal: FC<TagsModalProps> = ({ isOpen, onClose, tags }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm dark:bg-black/60"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tags-modal-title"
          className="relative w-full max-w-md bg-surface dark:bg-slate-900 rounded-3xl shadow-2xl border border-cruz dark:border-slate-800 overflow-hidden z-10"
        >
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-cruz dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            <h2
              id="tags-modal-title"
              className="text-base font-bold text-kanji-deep dark:text-white flex items-center gap-2"
            >
              <Tag size={18} aria-hidden="true" />
              Etiquetas de la sesión
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar etiquetas de la sesión"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-secondary hover:text-text dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">
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

          <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-cruz dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center rounded-xl bg-kanji-deep px-6 text-sm font-bold text-white transition-colors duration-150 hover:bg-kanji dark:bg-kio dark:text-slate-900 dark:hover:bg-cruz"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
