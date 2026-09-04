import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, TrendingUp, Activity } from 'lucide-react';
import { patientKeys } from '../../../lib/query-keys';
import { WidgetError } from '../../widgets/WidgetError';

interface MoodPoint {
  date: string;
  mood: number;
}

interface MoodChartProps {
  patientId: string;
}

export function MoodChart({ patientId }: MoodChartProps) {
  const { data: moodData = [], isLoading, isError, refetch } = useQuery({
    queryKey: patientKeys.moodHistory(patientId),
    queryFn: async () => {
      const { data } = await api.get<MoodPoint[]>(`/patients/${patientId}/mood-history`);
      return data;
    },
    enabled: !!patientId,
  });

  const shellCls =
    'h-full min-h-[300px] bg-white dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm';

  // El error va ANTES que el vacío. Sin esto una petición fallida caía en
  // `moodData.length < 2` y la vista decía "Sin datos suficientes", que afirma
  // algo sobre el registro de ánimo del paciente en vez de sobre la petición.
  if (isError) {
    return (
      <div className={`${shellCls} p-6`}>
        <WidgetError what="la evolución emocional de este paciente" onRetry={() => refetch()} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${shellCls} flex items-center justify-center`} aria-busy="true">
        <Loader2 aria-hidden="true" className="animate-spin text-kanji-deep dark:text-kio" />
        <span className="sr-only">Cargando evolución emocional…</span>
      </div>
    );
  }

  if (moodData.length < 2) {
    return (
      <div className={`${shellCls} p-6 flex flex-col items-center justify-center text-center`}>
        <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
          <Activity size={20} aria-hidden="true" className="text-slate-600 dark:text-slate-400" />
        </div>
        <h3 className="text-sm font-bold text-text dark:text-slate-200">Sin datos suficientes</h3>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 max-w-[220px]">
          Se necesitan al menos 2 sesiones con registro de ánimo para mostrar la evolución.
        </p>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = moodData.map(point => ({
    date: format(new Date(point.date), 'd MMM', { locale: es }),
    fullDate: format(new Date(point.date), 'PPP', { locale: es }),
    mood: point.mood,
  }));

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h3 className="text-base font-bold text-text dark:text-white flex items-center gap-2">
          <TrendingUp size={18} aria-hidden="true" className="text-kanji-deep dark:text-kio" />
          Evolución emocional
        </h3>
        <span className="text-[11px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
          Últimos meses
        </span>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={250}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-kanji)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--color-kanji)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            {/* 11px es el suelo tipográfico del sistema, y las etiquetas del
                eje eran 10px con un gris literal fuera de la paleta. */}
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-text-secondary)', fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              domain={[1, 10]}
              hide
            />
            {/* `--color-bg-surface` no existe en `@theme` (el token es
                `--color-surface`), así que el tooltip se pintaba transparente y
                en oscuro se leía sobre la gráfica. Radio: 14px = `radius-md`. */}
            <Tooltip
              contentStyle={{
                borderRadius: '14px',
                border: '1px solid var(--color-tooltip-border)',
                padding: '12px 16px',
                backgroundColor: 'var(--color-tooltip-bg)',
                color: 'var(--color-text)'
              }}
              labelStyle={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px', textTransform: 'capitalize' }}
              itemStyle={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-kanji-deep)' }}
              formatter={(value) => [`${value}/10`, 'Estado de ánimo']}
              cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="mood"
              stroke="var(--color-kanji)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorMood)"
              activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--color-kanji)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
