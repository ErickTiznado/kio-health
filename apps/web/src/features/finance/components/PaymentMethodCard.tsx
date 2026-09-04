import { Banknote, CreditCard, ArrowLeftRight } from 'lucide-react';
import type { PaymentMethodBreakdown } from '../types';
import { Skeleton } from '@repo/ui/skeleton';
import { WidgetError } from '../../../components/widgets/WidgetError';
import { formatMoney } from '../money';

interface PaymentMethodCardProps {
  breakdown: PaymentMethodBreakdown;
  totalIncome: number;
  loading: boolean;
  currency: string;
  /** La petición del resumen falló: no se puede decir "sin ingresos". */
  isError?: boolean;
  onRetry?: () => void;
}

/**
 * Clases COMPLETAS y estáticas, una por método.
 *
 * Antes había una sola clase de color (`bg-emerald-500`) de la que se derivaban
 * las otras dos en tiempo de ejecución: `bg-opacity-10` —eliminado en Tailwind
 * v4, así que el recuadro salía en color sólido al 100%— y
 * `color.replace('bg-', 'text-')`, que el JIT no puede ver en el código y por lo
 * tanto nunca genera. El resultado en pantalla era un cuadrado sólido con un
 * icono invisible dentro. Tailwind necesita la cadena literal.
 */
const METHODS = [
  {
    key: 'CASH' as const,
    label: 'Efectivo',
    icon: Banknote,
    bar: 'bg-emerald-500',
    tile: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    tint: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'CARD' as const,
    label: 'Tarjeta',
    icon: CreditCard,
    bar: 'bg-blue-500',
    tile: 'bg-blue-500/10 dark:bg-blue-500/20',
    tint: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'TRANSFER' as const,
    label: 'Transferencia',
    icon: ArrowLeftRight,
    bar: 'bg-violet-500',
    tile: 'bg-violet-500/10 dark:bg-violet-500/20',
    tint: 'text-violet-600 dark:text-violet-400',
  },
];

export function PaymentMethodCard({
  breakdown,
  loading,
  currency,
  isError,
  onRetry,
}: PaymentMethodCardProps) {
  const total = breakdown.CASH + breakdown.CARD + breakdown.TRANSFER;

  return (
    <div className="bg-surface dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col h-full">
      <h3 className="font-bold text-kanji-deep dark:text-kio text-sm uppercase tracking-wide mb-5">
        Ingresos por método
      </h3>

      {/* El error va antes del vacío: "Sin ingresos registrados" cuando lo que
          pasó es que la petición falló es una afirmación falsa sobre el mes. */}
      {isError ? (
        <WidgetError what="el desglose por método de pago" onRetry={onRetry} />
      ) : loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : total === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Sin ingresos registrados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {METHODS.map(({ key, label, icon: Icon, bar, tile, tint }) => {
            const amount = breakdown[key];
            const pct = total > 0 ? Math.round((amount / total) * 100) : 0;

            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg ${tile} flex items-center justify-center`}>
                      <Icon size={12} aria-hidden="true" className={tint} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Un solo `Intl` para todo el módulo. Esto producía
                        literalmente "USD$1,200.00" — y "USD$-1,200.00" en
                        negativo, con el signo entre el código y la cifra. */}
                    <span className="text-xs font-bold text-kanji-deep dark:text-kio tabular-nums">
                      {formatMoney(amount, currency)}
                    </span>
                    <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 w-9 text-right tabular-nums">
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${bar} rounded-full transition-all duration-500`}
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
