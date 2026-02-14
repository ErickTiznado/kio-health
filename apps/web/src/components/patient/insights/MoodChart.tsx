import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

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
    return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;
  }

  if (moodData.length < 2) {
    return (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">Se necesitan al menos 2 sesiones con registro de ánimo.</p>
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
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-sm font-bold text-gray-700 mb-4 px-2">Evolución del Estado de Ánimo</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-kanji)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--color-kanji)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                dy={10}
            />
            <YAxis 
                domain={[1, 10]} 
                hide 
            />
            <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}
                itemStyle={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-kanji)' }}
                formatter={(value: number) => [`${value}/10`, 'Ánimo']}
            />
            <Area 
                type="monotone" 
                dataKey="mood" 
                stroke="var(--color-kanji)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorMood)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
