import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { TimelineItem as TimelineItemType } from '../../../types/patients.types';
import { NoteCard } from './NoteCard';
import { exportSessionPdf } from '../../../lib/appointments.api';

const TYPE_LABELS: Record<string, string> = {
  CONSULTATION: 'Consulta',
  EVALUATION:   'Evaluación',
  FOLLOW_UP:    'Seguimiento',
};

interface TimelineItemProps {
  item: TimelineItemType;
  isLast: boolean;
}

export function TimelineItem({ item, isLast }: TimelineItemProps) {
  const date = new Date(item.startTime);
  const isFuture = date > new Date();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportSessionPdf(item.id);
      toast.success('PDF descargado correctamente');
    } catch {
      toast.error('No se pudo generar el PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-4">
      {/* Timeline Line & Dot */}
      <div className="flex flex-col items-center min-w-[40px]">
        <div
          aria-hidden="true"
          className={`w-3 h-3 rounded-full border-2 z-10 ${
            isFuture
              ? 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600'
              : 'bg-kanji-deep border-kanji-deep dark:bg-kio dark:border-kio'
          }`}
        />
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-slate-800 my-1" />}
      </div>

      {/* Content Wrapper */}
      <div className="flex-1 pb-8">
        <div className="flex items-baseline gap-2 mb-2">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize">
            {format(date, "EEEE, d 'de' MMMM", { locale: es })}
          </h4>
          <span className="text-xs font-medium tabular-nums text-slate-600 dark:text-slate-400">
            {format(date, 'HH:mm')}
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800">
            {TYPE_LABELS[item.type] ?? item.type}
          </span>

          {/* Export PDF button — only for completed sessions with notes.
              El nombre accesible va en `aria-label`, no en `title`: bajo `sm`
              el rótulo "PDF" se oculta y el `title` no existe en táctil. */}
          {item.status === 'COMPLETED' && (
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              aria-label={`Descargar como PDF la sesión del ${format(date, "d 'de' MMMM", { locale: es })}`}
              className="ml-auto flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-xs font-bold text-slate-600 transition-colors duration-150 hover:text-kanji-deep disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:text-kio"
            >
              {isExporting ? (
                <Loader2 size={14} aria-hidden="true" className="animate-spin" />
              ) : (
                <FileDown size={14} aria-hidden="true" />
              )}
              <span className="hidden sm:inline">PDF</span>
            </button>
          )}
        </div>

        <NoteCard item={item} />
      </div>
    </div>
  );
}
