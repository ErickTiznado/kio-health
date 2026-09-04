import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { api } from '../../lib/api';
import { patientKeys } from '../../lib/query-keys';
import { WidgetError } from '../widgets/WidgetError';

interface AttendanceStats {
  completed: number;
  noShow: number;
  cancelled: number;
  cancelledByPatient: number;
  attendanceRate: number | null;
  lastCompletedAt: string | null;
}

interface AttendanceStatsCardsProps {
  patientId: string;
}

/**
 * Tarjetas de asistencia del paciente (tasa, no-shows, última sesión).
 * Consume GET /patients/:id/attendance.
 */
export function AttendanceStatsCards({ patientId }: AttendanceStatsCardsProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...patientKeys.detail(patientId), 'attendance'],
    queryFn: async () => {
      const res = await api.get<AttendanceStats>(
        `/patients/${patientId}/attendance`,
      );
      return res.data;
    },
  });

  const cardClass =
    'bg-white dark:bg-slate-900 rounded-2xl p-5 border border-border dark:border-slate-800 shadow-sm';
  const labelClass =
    'text-[11px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider mb-1';
  const footClass = 'text-xs font-medium text-slate-600 dark:text-slate-400 mt-1';

  // El error nunca se degrada a "sin datos": un cuadro de asistencia en blanco
  // se lee como "no faltó nunca", que es una afirmación clínica falsa.
  if (isError) {
    return <WidgetError what="las estadísticas de asistencia" onRetry={() => refetch()} />;
  }

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3" aria-busy="true">
        <span className="sr-only">Cargando estadísticas de asistencia…</span>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={cardClass}>
            <div className="mb-2 h-3 w-20 animate-pulse rounded-xs bg-cruz/40 dark:bg-slate-800" />
            <div className="h-8 w-16 animate-pulse rounded-xs bg-cruz/40 dark:bg-slate-800" />
            <div className="mt-2 h-3 w-24 animate-pulse rounded-xs bg-cruz/30 dark:bg-slate-800/70" />
          </div>
        ))}
      </div>
    );
  }

  const ratePercent =
    data.attendanceRate !== null ? Math.round(data.attendanceRate * 100) : null;
  const rateColor =
    ratePercent === null
      ? 'text-text dark:text-white'
      : ratePercent >= 85
        ? 'text-emerald-700 dark:text-emerald-400'
        : ratePercent >= 60
          ? 'text-amber-700 dark:text-amber-400'
          : 'text-rose-700 dark:text-rose-400';
  // El tono por sí solo no distingue 45% de 95%: en escala de grises, con
  // daltonismo o con lector de pantalla los dos son el mismo dato. El juicio va
  // también como texto.
  const rateVerdict =
    ratePercent === null
      ? null
      : ratePercent >= 85
        ? 'Buena'
        : ratePercent >= 60
          ? 'Irregular'
          : 'Baja';
  const rateVerdictStyle =
    ratePercent === null
      ? ''
      : ratePercent >= 85
        ? 'bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25'
        : ratePercent >= 60
          ? 'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25'
          : 'bg-rose-50 text-rose-800 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/25';

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <div className={cardClass}>
        <p className={labelClass}>Asistencia</p>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className={`text-3xl font-bold tabular-nums ${rateColor}`}>
            {ratePercent !== null ? `${ratePercent}%` : 'Sin datos'}
          </p>
          {rateVerdict && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ring-1 ${rateVerdictStyle}`}
            >
              {rateVerdict}
            </span>
          )}
        </div>
        <p className={footClass}>
          {data.completed} asistidas · {data.noShow} no asistidas
        </p>
      </div>
      <div className={cardClass}>
        <p className={labelClass}>Cancelaciones</p>
        <p className="text-3xl font-bold tabular-nums text-text dark:text-white">
          {data.cancelled}
        </p>
        <p className={footClass}>
          {data.cancelledByPatient} por el paciente
        </p>
      </div>
      <div className={cardClass}>
        <p className={labelClass}>Última sesión</p>
        <p className="text-2xl font-bold capitalize tabular-nums text-text dark:text-white">
          {data.lastCompletedAt
            ? format(parseISO(data.lastCompletedAt), 'd MMM yyyy', { locale: es })
            : 'Ninguna'}
        </p>
        <p className={footClass}>{data.lastCompletedAt ? 'completada' : 'registrada todavía'}</p>
      </div>
    </div>
  );
}
