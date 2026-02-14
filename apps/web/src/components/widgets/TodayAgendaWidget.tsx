import { CalendarClock, Coffee, ChevronRight, Circle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '../ui/Skeleton';
import type { Appointment } from '../../types/appointments.types';

interface TodayAgendaWidgetProps {
  appointments: Appointment[];
  isLoading: boolean;
}

const STATUS_STYLES: Record<
  Appointment['status'],
  { label: string; bg: string; text: string }
> = {
  SCHEDULED: { label: 'Agendada', bg: 'bg-blue-50', text: 'text-blue-600' },
  IN_PROGRESS: { label: 'En curso', bg: 'bg-kio-light', text: 'text-kio' },
  COMPLETED: { label: 'Finalizada', bg: 'bg-green-50', text: 'text-green-600' },
  CANCELLED: { label: 'Cancelada', bg: 'bg-gray-100', text: 'text-gray-500' },
  NO_SHOW: { label: 'No asistió', bg: 'bg-red-50', text: 'text-red-500' },
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

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-[40px] p-8 lg:p-10 shadow-sm border border-gray-100 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-gray-900 flex items-center gap-3 text-lg">
              <CalendarClock size={24} className="text-kio" />
              Agenda de Hoy
            </h3>
            <p className="text-xs text-gray-400 font-medium ml-9 capitalize">
              {format(now, "EEEE d 'de' MMMM", { locale: es })}
            </p>
          </div>
          {!isLoading && sorted.length > 0 && (
            <span className="text-xs font-bold text-kio bg-kio-light px-4 py-2 rounded-full shadow-sm">
              {sorted.length} {sorted.length === 1 ? 'cita' : 'citas'}
            </span>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-5 rounded-3xl bg-gray-50/50">
                <Skeleton className="w-20 h-5" />
                <div className="flex-1">
                  <Skeleton className="w-40 h-5 mb-2" />
                  <Skeleton className="w-24 h-4" />
                </div>
                <Skeleton className="w-24 h-8 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && sorted.length === 0 && (
          <div className="text-center py-16 bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-5">
              <Coffee size={28} className="text-kio/40" />
            </div>
            <p className="font-bold text-gray-900 text-base mb-1">
              Día libre de consultas
            </p>
            <p className="text-sm text-gray-400 max-w-[200px] mx-auto">
              No tienes citas programadas para el resto del día.
            </p>
          </div>
        )}

        {/* List */}
        {!isLoading && sorted.length > 0 && (
          <div className="grid gap-3 flex-1 overflow-y-auto min-h-0 pr-1">
            {sorted.map((apt) => {
              const status = STATUS_STYLES[apt.status];
              const isPaid = apt.paymentStatus === 'PAID';
              const startTime = parseISO(apt.startTime);
              const endTime = parseISO(apt.endTime);
              
              const isNow = isWithinInterval(now, {
                start: startTime,
                end: endTime,
              }) && apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED';

              return (
                <Link
                  key={apt.id}
                  to={`/session/${apt.id}`}
                  className={`flex items-center gap-3 p-3 rounded-[24px] transition-all group border-2 ${
                    isNow 
                      ? 'bg-kio-light/30 border-kio/20 ring-4 ring-kio/5' 
                      : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-100 hover:shadow-md'
                  }`}
                >
                  {/* Time column */}
                  <div className="flex flex-col w-[4.5rem] shrink-0 text-center">
                    <span className={`text-xs font-black ${isNow ? 'text-kio' : 'text-kanji'}`}>
                      {format(startTime, 'h:mm a')}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">
                      {format(endTime, 'h:mm a')}
                    </span>
                  </div>

                  {/* Patient info */}
                  <div className="flex-1 min-w-0 border-l border-gray-100 pl-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-gray-900 text-sm truncate group-hover:text-kio transition-colors">
                        {apt.patient.fullName}
                      </p>
                      {isNow && (
                        <span className="flex items-center gap-1 text-[8px] font-black text-white bg-kio px-1.5 py-0.5 rounded-full animate-pulse uppercase tracking-wider shrink-0">
                          <Circle size={4} fill="currentColor" /> Ahora
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      <span className="truncate">
                        {TYPE_LABELS[apt.type]}
                      </span>
                      {apt.reason && (
                        <>
                          <span className="opacity-30">•</span>
                          <span className="truncate">{apt.reason}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status & Indicators */}
                  <div className="flex items-center gap-2">
                    <div className="hidden xl:flex flex-col items-end gap-1">
                      <span
                        className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${status.bg} ${status.text} border border-current/10`}
                      >
                        {status.label}
                      </span>
                      {!isPaid && (
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 flex items-center gap-1">
                          <Clock size={8} /> Deuda
                        </span>
                      )}
                    </div>
                    <ChevronRight 
                      size={16} 
                      className={`text-gray-300 group-hover:text-kio transform group-hover:translate-x-1 transition-all ${isNow ? 'text-kio/50' : ''}`} 
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

