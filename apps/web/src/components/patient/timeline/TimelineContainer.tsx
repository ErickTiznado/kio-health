import { useState, useMemo } from 'react';
import { usePatientTimeline } from '../../../hooks/use-patients';
import { TimelineItem } from './TimelineItem';
import { Search, Pin, Inbox } from 'lucide-react';
import { useDebounce } from '../../../hooks/use-debounce';
import { Loader2 } from 'lucide-react';

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

  // Client-side filtering for content if needed (optional since we have server search)
  // But server search is limited to Appointment metadata for now.
  // We can add client-side refinement here if desired.

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (allItems.length === 0 && !search) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 m-4">
        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
          <Inbox size={24} className="text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Comienza la historia</h3>
        <p className="text-sm text-gray-500 max-w-xs mt-2">
          Aún no hay sesiones registradas. La primera sesión marcará el inicio del timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar en historial (motivo, notas)..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-kanji)]/20 focus:border-[var(--color-kanji)] outline-none transition-all"
        />
      </div>

      {/* Pinned Section */}
      {pinnedItems.length > 0 && !search && (
        <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-center gap-2 mb-3 text-amber-800">
            <Pin size={14} className="fill-current" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Destacados</h4>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
            {pinnedItems.map(item => (
              <div key={item.id} className="min-w-[280px] snap-center">
                <TimelineItem item={item} isLast={true} /> 
                {/* Reusing TimelineItem but style might be weird in horizontal. 
                    Ideally create a PinnedCard. For MVP, we list them vertically or simplified.
                    Actually let's just list them vertically if few, or just highlight them in main feed?
                    The requirement says "carrusel o sección Destacados".
                    Let's simplify: List them vertically here.
                */}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Timeline */}
      <div className="pl-2">
        {allItems.map((item, index) => (
          <TimelineItem 
            key={item.id} 
            item={item} 
            isLast={index === allItems.length - 1} 
          />
        ))}
        
        {hasNextPage && (
          <button 
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full py-3 text-sm text-gray-500 font-medium hover:bg-gray-50 rounded-lg transition-colors flex justify-center"
          >
            {isFetchingNextPage ? <Loader2 className="animate-spin" size={16} /> : 'Cargar más historia...'}
          </button>
        )}
        
        {!hasNextPage && allItems.length > 0 && (
          <div className="text-center py-8">
            <p className="text-xs text-gray-300 uppercase tracking-widest font-bold">Inicio de los tiempos</p>
          </div>
        )}
      </div>
    </div>
  );
}
