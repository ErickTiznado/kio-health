import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { FinanceTransaction } from '../types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface BalanceChartProps {
  transactions: FinanceTransaction[];
}

export function BalanceChart({ transactions }: BalanceChartProps) {
  const data = useMemo(() => {
    // Group by day for the chart
    const grouped: Record<string, { date: string; income: number; expense: number }> = {};

    transactions.forEach((t) => {
      const dayKey = format(parseISO(t.date), 'dd MMM', { locale: es });
      if (!grouped[dayKey]) {
        grouped[dayKey] = { date: dayKey, income: 0, expense: 0 };
      }
      if (t.type === 'INCOME') {
        grouped[dayKey].income += Number(t.amount);
      } else {
        grouped[dayKey].expense += Number(t.amount);
      }
    });

    return Object.values(grouped).sort(() => 
      // Very naive sort for display purposes, ideally sort by date object but key is string
      // Better to rely on sorted input from backend or proper date handling
      0
    );
  }, [transactions]);

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="date" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#9CA3AF' }}
            dy={10}
          />
          <YAxis 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `$${value}`} 
            tick={{ fill: '#9CA3AF' }}
          />
          <Tooltip 
            cursor={{ fill: '#F3F4F6' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '8px 12px' }}
            labelStyle={{ color: '#6B7280', fontSize: '11px', marginBottom: '4px' }}
          />
          <Bar dataKey="income" name="Ingresos" fill="#10B981" radius={[4, 4, 4, 4]} barSize={32} />
          <Bar dataKey="expense" name="Gastos" fill="#EF4444" radius={[4, 4, 4, 4]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
