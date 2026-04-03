import { type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Trash2 } from 'lucide-react';

interface TagsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: string[];
  onRemoveTag: (tag: string) => void;
}

export const TagsManagerModal: FC<TagsManagerModalProps> = ({ isOpen, onClose, tags, onRemoveTag }) => {
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
              Gestionar Etiquetas
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 text-gray-700 dark:text-slate-200 rounded-xl border border-gray-200 dark:border-slate-700 group hover:border-kio/40 transition-colors"
                >
                  <span className="font-bold text-sm">#{tag}</span>
                  <button 
                    onClick={() => onRemoveTag(tag)}
                    className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                    title="Eliminar etiqueta"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-[var(--color-cruz)] dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-kio text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-md shadow-kio/20"
            >
              Listo
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
