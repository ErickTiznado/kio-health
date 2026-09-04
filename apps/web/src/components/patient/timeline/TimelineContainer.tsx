import { useState, useMemo } from 'react';
import { usePatientTimeline } from '../../../hooks/use-patients';
import { TimelineItem } from './TimelineItem';
import { Search, Pin, Inbox, Loader2 } from 'lucide-react';
import { useDebounce } from '../../../hooks/use-debounce';
import { motion, AnimatePresence } from 'framer-motion';
import { WidgetError } from '../../widgets/WidgetError';

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
    isLoading,
    isError,
    refetch,
  } = usePatientTimeline(patientId, debouncedSearch);

  const allItems = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const pinnedItems = useMemo(() => {
    return allItems.filter(item => item.psychNote?.isPinned);
  }, [allItems]);

  // El error va ANTES que el vacío: "Historia vacía" tras una petición fallida
  // afirma que este paciente no tiene sesiones registradas, y esa es una
  // afirmación sobre su expediente clínico que la vista no puede sostener.
  if (isError) {
    return <WidgetError what="la historia clínica de este paciente" onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20" aria-busy="true">
        <Loader2 aria-hidden="true" className="animate-spin text-kanji-deep dark:text-kio mb-4" size={32} />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Cargando historia clínica…
        </p>
      </div>
    );
  }

  if (allItems.length === 0 && !search) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-cruz dark:border-slate-700"
      >
        <div className="w-20 h-20 bg-bg dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Inbox size={32} aria-hidden="true" className="text-kanji-deep dark:text-kio" />
        </div>
        <h3 className="text-xl font-bold text-text dark:text-white">Historia vacía</h3>
        <p className="max-w-sm mt-2 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">
          Aún no hay sesiones registradas para este paciente. Al completar la primera cita, aparecerá aquí automáticamente.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-full shadow-sm border border-cruz dark:border-slate-800 max-w-md mx-auto focus-within:border-kio focus-within:ring-2 focus-within:ring-kio/50">
          <div className="relative flex items-center">
            <label className="sr-only" htmlFor="timeline-search">
              Buscar en la historia clínica por motivo o notas de la cita
            </label>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} aria-hidden="true" className="text-slate-600 dark:text-slate-400" />
            </div>
            {/* El backend busca en `reason` y `notes` de la CITA. El contenido
                de la nota clínica va cifrado y no es consultable en SQL: el
                marcador de posición decía "(motivo, notas)" a secas, que se lee
                como que sí busca dentro de la nota. */}
            <input
              id="timeline-search"
              type="search"
              placeholder="Buscar por motivo o notas de la cita…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-describedby="timeline-search-scope"
              className="block w-full min-h-11 pl-11 pr-4 bg-transparent border-none text-sm font-medium text-text dark:text-slate-300 placeholder:font-normal placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-0 outline-none"
            />
          </div>
        </div>
        <p
          id="timeline-search-scope"
          className="mx-auto mt-2 max-w-md text-center text-[11px] font-medium text-slate-600 dark:text-slate-400"
        >
          No busca dentro de la nota clínica: su contenido está cifrado.
        </p>
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
                <Pin size={14} aria-hidden="true" className="fill-current" />
              </div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider">Notas destacadas</h4>
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
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cruz bg-white px-6 text-sm font-bold text-text shadow-sm transition-colors duration-150 hover:bg-bg disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 aria-hidden="true" className="animate-spin" size={16} />
                  Cargando…
                </>
              ) : (
                'Cargar sesiones anteriores'
              )}
            </button>
          </div>
        )}

        {!hasNextPage && allItems.length > 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-full text-xs text-slate-600 dark:text-slate-400 font-medium">
              <span aria-hidden="true">•</span>
              Inicio de la historia clínica
              <span aria-hidden="true">•</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
