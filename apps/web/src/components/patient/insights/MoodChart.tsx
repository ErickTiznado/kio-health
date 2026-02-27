import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, TrendingUp, Activity } from 'lucide-react';

interface MoodPoint {
  date: string;
  mood: number;
}

interface MoodChartProps {
  patientId: string;
}

export function MoodChart({ patientId }: MoodChartProps) {
  const { data: moodData = [], isLoading } = useQuery({
    queryKey: ['mood-history', patientId],
    queryFn: async () => {
      const { data } = await api.get<MoodPoint[]>(`/patients/${patientId}/mood-history`);
      return data;
    },
    enabled: !!patientId,
  });

  if (isLoading) {
    return (
      <div className="h-full min-h-[300px] bg-white dark:bg-slate-900 rounded-2xl border border-[var(--color-cruz)] dark:border-slate-800 shadow-sm flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-kanji)]" />
      </div>
    );
  }

  if (moodData.length < 2) {
    return (
      <div className="h-full min-h-[300px] bg-white dark:bg-slate-900 rounded-2xl border border-[var(--color-cruz)] dark:border-slate-800 shadow-sm p-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
          <Activity size={20} className="text-gray-400 dark:text-slate-500" />
        </div>
        <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300">Sin datos suficientes</h3>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 max-w-[200px]">
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
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[var(--color-cruz)] dark:border-slate-800 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-[var(--color-kanji)] dark:text-white flex items-center gap-2">
          <TrendingUp size={20} />
          Evolución Emocional
        </h3>
        <span className="text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
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
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              domain={[1, 10]}
              hide
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '12px 16px',
                backgroundColor: 'var(--color-bg-surface)',
                color: 'var(--color-text)'
              }}
              labelStyle={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'capitalize' }}
              itemStyle={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-kanji)' }}
              formatter={(value: any) => [`${value}/10`, 'Estado de Ánimo']}
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
