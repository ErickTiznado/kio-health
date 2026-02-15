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
            cursor={{ fill: 'var(--color-border)', opacity: 0.3 }}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid var(--color-tooltip-border)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              padding: '12px 16px',
              backgroundColor: 'var(--color-tooltip-bg)',
              color: 'var(--color-text)',
              backdropFilter: 'blur(8px)',
            }}
            labelStyle={{ color: 'var(--color-text-muted)', fontSize: '11px', marginBottom: '8px', fontWeight: 'bold' }}
            itemStyle={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text)' }}
          />
          <Bar dataKey="income" name="Ingresos" fill="#10B981" radius={[4, 4, 4, 4]} barSize={24} />
          <Bar dataKey="expense" name="Gastos" fill="#EF4444" radius={[4, 4, 4, 4]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
