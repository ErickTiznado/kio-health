import { useState, useMemo } from 'react';
import { usePatientTimeline } from '../../../hooks/use-patients';
import { TimelineItem } from './TimelineItem';
import { Search, Pin, Inbox, Loader2 } from 'lucide-react';
import { useDebounce } from '../../../hooks/use-debounce';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelineContainerProps {
  patientId: string;
}

export function TimelineContainer({ patientId }: TimelineContainerProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = usePatientTimeline(patientId, debouncedSearch);

  const allItems = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const pinnedItems = useMemo(() => {
    return allItems.filter(item => item.psychNote?.isPinned);
  }, [allItems]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-[var(--color-kanji)] mb-4" size={32} />
        <p className="text-gray-400 dark:text-slate-500 text-sm">Cargando historia clínica...</p>
      </div>
    );
  }

  if (allItems.length === 0 && !search) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-[var(--color-cruz)] dark:border-slate-700"
      >
        <div className="w-20 h-20 bg-[var(--color-bg)] dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Inbox size={32} className="text-[var(--color-kanji)] opacity-40" />
        </div>
        <h3 className="text-xl font-bold text-[var(--color-kanji)] dark:text-white">Historia vacía</h3>
        <p className="text-[var(--color-text)] dark:text-slate-400 opacity-60 max-w-sm mt-2 leading-relaxed">
          Aún no hay sesiones registradas para este paciente. Al completar la primera cita, aparecerá aquí automáticamente.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-full shadow-sm border border-[var(--color-cruz)] dark:border-slate-800 max-w-md mx-auto">
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-[var(--color-text)] dark:text-slate-400 opacity-40" />
            </div>
            <input
              type="text"
              placeholder="Buscar en historial (motivo, notas)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 bg-transparent border-none text-sm text-[var(--color-text)] dark:text-slate-300 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-0 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Pinned Section */}
      <AnimatePresence>
        {pinnedItems.length > 0 && !search && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl p-6 border border-amber-100/50 dark:border-amber-800/30"
          >
            <div className="flex items-center gap-2 mb-4 text-amber-800 dark:text-amber-300">
              <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-md">
                <Pin size={14} className="fill-current" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider">Notas Destacadas</h4>
            </div>
            <div className="space-y-4 pl-2 border-l-2 border-amber-200 dark:border-amber-800 ml-3">
              {pinnedItems.map(item => (
                <div key={item.id} className="pl-4">
                  <TimelineItem item={item} isLast={true} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Timeline */}
      <div className="pl-4 relative">
        {/* Vertical Line Background */}
        <div className="absolute left-[21px] top-4 bottom-0 w-px bg-gray-100 dark:bg-slate-800 -z-10"></div>

        {allItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="mb-8 last:mb-0"
          >
            <TimelineItem
              item={item}
              isLast={index === allItems.length - 1}
            />
          </motion.div>
        ))}

        {hasNextPage && (
          <div className="pt-8 flex justify-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="bg-white dark:bg-slate-900 border border-[var(--color-cruz)] dark:border-slate-700 hover:bg-[var(--color-bg)] dark:hover:bg-slate-800 text-[var(--color-text)] dark:text-slate-300 px-6 py-2.5 rounded-full text-sm font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isFetchingNextPage ? <Loader2 className="animate-spin" size={16} /> : 'Cargar sesiones anteriores'}
            </button>
          </div>
        )}

        {!hasNextPage && allItems.length > 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-full text-xs text-gray-400 dark:text-slate-500 font-medium">
              <span>•</span>
              Inicio de la historia clínica
              <span>•</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
