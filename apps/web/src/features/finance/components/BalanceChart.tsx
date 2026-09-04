import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { financeDayKey, formatDayKeyShort } from '../dates';
import { formatMoney, formatMoneyCompact } from '../money';
import type { FinanceTransaction } from '../types';

interface BalanceChartProps {
  transactions: FinanceTransaction[];
  currency: string;
  /**
   * Zona en la que se decide a qué día pertenece cada movimiento. Será la del
   * clínico; hoy cae en la del navegador hasta que `GET /auth/me` mande
   * `profile.timezone` — ver el docblock de `dates.ts`.
   */
  timeZone: string;
}

/**
 * Flujo de caja diario del mes.
 *
 * Esto ES una serie temporal y hasta ahora no lo era: agrupaba por la ETIQUETA
 * ya formateada (`dd MMM`) y devolvía `sort(() => 0)`, con un comentario
 * admitiéndolo. El resultado era un eje X en orden de inserción del hash —es
 * decir, el orden en que el servidor devolvió las filas, `date desc`— y claves
 * que colisionan entre meses: un `05 ago` y un `05 sep` caían en la misma barra
 * y sumaban dinero de dos meses distintos.
 *
 * Ahora se agrupa por día civil ISO (`YYYY-MM-DD`) calculado en la zona del
 * clínico, se ordena por esa clave —que ordena cronológicamente— y la etiqueta
 * se formatea al final, solo para pintarla.
 */
export function BalanceChart({ transactions, currency, timeZone }: BalanceChartProps) {
  const data = useMemo(() => {
    const grouped = new Map<string, { key: string; income: number; expense: number }>();

    for (const transaction of transactions) {
      const key = financeDayKey(transaction.date, timeZone);
      if (!key) continue;

      let bucket = grouped.get(key);
      if (!bucket) {
        bucket = { key, income: 0, expense: 0 };
        grouped.set(key, bucket);
      }

      if (transaction.type === 'INCOME') {
        bucket.income += Number(transaction.amount);
      } else {
        bucket.expense += Number(transaction.amount);
      }
    }

    return [...grouped.values()]
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((bucket) => ({
        date: formatDayKeyShort(bucket.key),
        income: bucket.income,
        expense: bucket.expense,
      }));
  }, [transactions, timeZone]);

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="date"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            // Los ticks estaban cableados a #9CA3AF para los dos temas, justo al
            // lado de un tooltip que sí usa variables. Ahora los dos leen el
            // mismo token y el par `dark:` existe de verdad.
            tick={{ fill: 'var(--color-text-secondary)' }}
            dy={10}
          />
          <YAxis
            fontSize={11}
            tickLine={false}
            axisLine={false}
            // El `$` estaba escrito a mano: la moneda sale del perfil del
            // clínico y puede no ser dólar.
            tickFormatter={(value) => formatMoneyCompact(Number(value), currency)}
            tick={{ fill: 'var(--color-text-secondary)' }}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-border)', opacity: 0.3 }}
            formatter={(value) => formatMoney(Number(value), currency)}
            contentStyle={{
              borderRadius: '16px',
              border: '1px solid var(--color-tooltip-border)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              padding: '12px 16px',
              backgroundColor: 'var(--color-tooltip-bg)',
              color: 'var(--color-text)',
            }}
            labelStyle={{ color: 'var(--color-text-muted)', fontSize: '11px', marginBottom: '8px', fontWeight: 'bold' }}
            // 14px es el escalón de cuerpo del sistema; estaba en 13px, fuera de
            // la rampa tipográfica.
            itemStyle={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text)' }}
          />
          <Bar dataKey="income" name="Ingresos" fill="#10B981" radius={[6, 6, 6, 6]} barSize={24} />
          <Bar dataKey="expense" name="Gastos" fill="#EF4444" radius={[6, 6, 6, 6]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
