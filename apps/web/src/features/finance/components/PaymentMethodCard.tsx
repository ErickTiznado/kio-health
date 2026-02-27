import { Banknote, CreditCard, ArrowLeftRight } from 'lucide-react';
import type { PaymentMethodBreakdown } from '../types';
import { Skeleton } from '@repo/ui/skeleton';

interface PaymentMethodCardProps {
  breakdown: PaymentMethodBreakdown;
  totalIncome: number;
  loading: boolean;
  currency: string;
}

const METHODS = [
  { key: 'CASH' as const, label: 'Efectivo', icon: Banknote, color: 'bg-emerald-500' },
  { key: 'CARD' as const, label: 'Tarjeta', icon: CreditCard, color: 'bg-blue-500' },
  { key: 'TRANSFER' as const, label: 'Transferencia', icon: ArrowLeftRight, color: 'bg-violet-500' },
];

export function PaymentMethodCard({ breakdown, loading, currency }: PaymentMethodCardProps) {
  const total = breakdown.CASH + breakdown.CARD + breakdown.TRANSFER;

  return (
    <div className="bg-surface dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col h-full">
      <h3 className="font-bold text-kanji dark:text-kio text-sm uppercase tracking-wide mb-5">
        Ingresos por método
      </h3>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : total === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center opacity-40">
          <p className="text-xs text-gray-500 dark:text-slate-400">Sin ingresos registrados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {METHODS.map(({ key, label, icon: Icon, color }) => {
            const amount = breakdown[key];
            const pct = total > 0 ? Math.round((amount / total) * 100) : 0;

            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg ${color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center`}>
                      <Icon size={12} className={`${color.replace('bg-', 'text-')}`} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-kanji dark:text-kio">
                      {currency}${amount.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 w-8 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
