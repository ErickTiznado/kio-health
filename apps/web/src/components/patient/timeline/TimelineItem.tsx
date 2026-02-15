import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TimelineItem as TimelineItemType } from '../../../types/patients.types';
import { NoteCard } from './NoteCard';

interface TimelineItemProps {
  item: TimelineItemType;
  isLast: boolean;
}

export function TimelineItem({ item, isLast }: TimelineItemProps) {
  const date = new Date(item.startTime);
  const isFuture = date > new Date();

  return (
    <div className="flex gap-4">
      {/* Timeline Line & Dot */}
      <div className="flex flex-col items-center min-w-[40px]">
        <div className={`w-3 h-3 rounded-full border-2 z-10 ${isFuture ? 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600' : 'bg-[var(--color-kanji)] border-[var(--color-kanji)]'}`} />
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-slate-800 my-1" />}
      </div>

      {/* Content Wrapper */}
      <div className="flex-1 pb-8">
        <div className="flex items-baseline gap-2 mb-2">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize">
            {format(date, "EEEE, d 'de' MMMM", { locale: es })}
          </h4>
          <span className="text-xs text-gray-500 dark:text-slate-400">
            {format(date, 'HH:mm')}
          </span>
          <span className="text-xs text-gray-400 dark:text-slate-500 font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800">
            {item.type}
          </span>
        </div>

        <NoteCard item={item} />
      </div>
    </div>
  );
}
