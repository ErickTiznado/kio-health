import { type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Search, Hash } from 'lucide-react';
import { useState } from 'react';

interface SuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: string[];
  onAddTag: (tag: string) => void;
}

export const SuggestionsModal: FC<SuggestionsModalProps> = ({ isOpen, onClose, suggestions, onAddTag }) => {
  const [search, setSearch] = useState('');
  
  if (!isOpen) return null;

  const filtered = suggestions.filter(s => s.toLowerCase().includes(search.toLowerCase()));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          aria-hidden="true"
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm dark:bg-black/60"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-surface dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden z-10"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            <div>
              <h2 className="text-xl font-bold text-kanji-deep dark:text-white">Explorar etiquetas</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Selecciona etiquetas para añadir a la sesión</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar el explorador de etiquetas"
              className="flex size-11 shrink-0 items-center justify-center text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="p-6">
            {/* Search Input */}
            <div className="relative mb-6">
              <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar entre las etiquetas sugeridas"
                placeholder="Buscar etiqueta…"
                className="min-h-11 w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-kio/20 outline-none transition-all"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {filtered.length > 0 ? (
                filtered.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      onAddTag(s);
                      // Don't close modal, allow multiple selection
                    }}
                    aria-label={`Añadir la etiqueta ${s}`}
                    className="flex min-h-11 items-center justify-between px-4 py-3 bg-white dark:bg-slate-800/40 text-gray-700 dark:text-slate-200 rounded-2xl border border-gray-100 dark:border-slate-700 group hover:border-kanji-deep hover:bg-kio/5 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Hash size={14} aria-hidden="true" className="text-gray-500 group-hover:text-kanji-deep dark:text-slate-400 dark:group-hover:text-kio" />
                      <span className="font-bold text-sm">{s}</span>
                    </div>
                    <Plus size={16} aria-hidden="true" className="text-gray-500 group-hover:text-kanji-deep dark:text-slate-400 dark:group-hover:text-kio" />
                  </button>
                ))
              ) : (
                <div className="col-span-2 py-10 text-center">
                  <p className="text-gray-400 dark:text-slate-500 text-sm italic">No se encontraron etiquetas que coincidan.</p>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-5 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-11 items-center rounded-xl bg-kanji-deep px-8 text-sm font-bold text-white shadow-md shadow-kanji-deep/20 transition-all duration-150 hover:bg-kanji-deep/90 active:scale-95"
            >
              Finalizar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
