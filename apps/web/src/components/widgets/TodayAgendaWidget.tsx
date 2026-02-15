import { CalendarClock, Coffee, ChevronRight, Clock, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isWithinInterval, parseISO, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '../ui/Skeleton';
import type { Appointment } from '../../types/appointments.types';

interface TodayAgendaWidgetProps {
  appointments: Appointment[];
  isLoading: boolean;
}

const STATUS_COLORS: Record<Appointment['status'], string> = {
  SCHEDULED: 'bg-blue-500',
  IN_PROGRESS: 'bg-kio',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-gray-400',
  NO_SHOW: 'bg-red-500',
};

const STATUS_RING: Record<Appointment['status'], string> = {
  SCHEDULED: 'ring-blue-200 dark:ring-blue-500/30',
  IN_PROGRESS: 'ring-kio/40',
  COMPLETED: 'ring-green-200 dark:ring-green-500/30',
  CANCELLED: 'ring-gray-200 dark:ring-gray-500/30',
  NO_SHOW: 'ring-red-200 dark:ring-red-500/30',
};

const TYPE_SHORT: Record<Appointment['type'], string> = {
  CONSULTATION: 'CON',
  EVALUATION: 'EVA',
  FOLLOW_UP: 'SEG',
};

const TYPE_LABELS: Record<Appointment['type'], string> = {
  CONSULTATION: 'Consulta',
  EVALUATION: 'Evaluación',
  FOLLOW_UP: 'Seguimiento',
};

export function TodayAgendaWidget({
  appointments,
  isLoading,
}: TodayAgendaWidgetProps) {
  const now = new Date();

  const sorted = [...appointments].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  const completed = sorted.filter(a => a.status === 'COMPLETED').length;

  return (
    <div className="w-full h-full">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-5 shadow-sm border border-gray-100 dark:border-slate-800 h-full flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-base transition-colors">
              <CalendarClock size={18} className="text-kio" />
              Agenda de Hoy
            </h3>
            <p className="text-[10px] text-gray-400 dark:text-kanji font-medium ml-7 capitalize">
              {format(now, "EEEE d 'de' MMMM", { locale: es })}
            </p>
          </div>
          {!isLoading && sorted.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-kio bg-kio-light dark:bg-kio/20 px-2.5 py-1 rounded-full">
                {completed}/{sorted.length}
              </span>
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 px-2">
                <Skeleton className="w-9 h-3.5 dark:bg-slate-700" />
                <Skeleton className="w-1.5 h-1.5 rounded-full dark:bg-slate-700" />
                <div className="flex-1">
                  <Skeleton className="w-28 h-3.5 dark:bg-slate-700" />
                </div>
                <Skeleton className="w-8 h-3 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 text-center bg-gray-50/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700 p-8 transition-colors">
            <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-2xl shadow-sm flex items-center justify-center mb-3 transition-colors">
              <Coffee size={20} className="text-kio/60" />
            </div>
            <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">
              Día libre
            </p>
            <p className="text-xs text-gray-400 dark:text-kio max-w-[150px]">
              No hay citas programadas para hoy.
            </p>
          </div>
        )}

        {/* Compact List */}
        {!isLoading && sorted.length > 0 && (
          <div className="relative flex-1 overflow-y-auto min-h-0 pr-1 -mr-1">
            {/* Vertical timeline line */}
            <div className="absolute left-[2.65rem] top-1 bottom-1 w-px bg-gray-100 dark:bg-slate-800" />

            <div className="space-y-px">
              {sorted.map((apt) => {
                const isPaid = apt.paymentStatus === 'PAID';
                const startTime = parseISO(apt.startTime);
                const endTime = parseISO(apt.endTime);
                const duration = differenceInMinutes(endTime, startTime);

                const isNow = isWithinInterval(now, {
                  start: startTime,
                  end: endTime,
                }) && apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED';

                const isPast = endTime < now && apt.status !== 'IN_PROGRESS';
                const isCancelled = apt.status === 'CANCELLED';

                return (
                  <Link
                    key={apt.id}
                    to={`/session/${apt.id}`}
                    className={`group relative flex items-center gap-2.5 py-2 px-2 rounded-xl transition-all ${isNow
                        ? 'bg-kio/5 dark:bg-kio/10'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'
                      } ${isCancelled ? 'opacity-40' : ''}`}
                  >
                    {/* Time */}
                    <div className={`w-[2.2rem] text-right shrink-0 ${isPast && !isNow ? 'opacity-50' : ''}`}>
                      <span className={`text-[11px] font-bold tabular-nums leading-none ${isNow ? 'text-kio' : 'text-gray-900 dark:text-white'
                        }`}>
                        {format(startTime, 'HH:mm')}
                      </span>
                    </div>

                    {/* Dot */}
                    <div className="relative z-10 shrink-0 flex items-center justify-center w-2.5">
                      <div className={`w-2 h-2 rounded-full transition-all ${isNow
                          ? 'bg-kio ring-[3px] ring-kio/30 scale-125'
                          : `${STATUS_COLORS[apt.status]} ${isPast ? '' : `ring-2 ${STATUS_RING[apt.status]}`}`
                        }`} />
                    </div>

                    {/* Content */}
                    <div className={`flex-1 min-w-0 flex items-center gap-2 ${isPast && !isNow ? 'opacity-60' : ''}`}>
                      {/* Patient name */}
                      <span className={`font-semibold text-xs text-gray-900 dark:text-white truncate group-hover:text-kio transition-colors ${isCancelled ? 'line-through' : ''
                        }`}>
                        {apt.patient.fullName}
                      </span>

                      {/* Now badge */}
                      {isNow && (
                        <span className="shrink-0 text-[8px] font-black text-white bg-kio px-1.5 py-px rounded-md uppercase tracking-wider leading-tight">
                          Ahora
                        </span>
                      )}
                    </div>

                    {/* Right meta */}
                    <div className={`flex items-center gap-1.5 shrink-0 ${isPast && !isNow ? 'opacity-50' : ''}`}>
                      {/* Payment indicator */}
                      {!isPaid && !isCancelled && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Pago pendiente" />
                      )}
                      {/* Type tag */}
                      <span className="text-[9px] font-bold text-gray-400 dark:text-kanji bg-gray-50 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                        {TYPE_SHORT[apt.type]}
                      </span>
                      {/* Duration */}
                      <span className="text-[9px] text-gray-400 dark:text-kanji tabular-nums">
                        {duration}m
                      </span>
                    </div>

                    {/* Hover arrow */}
                    <ChevronRight
                      size={12}
                      className="text-gray-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
