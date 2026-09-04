import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HandCoins, Loader2 } from 'lucide-react';
import { WidgetError } from '../../../components/widgets/WidgetError';
import { useOutstanding } from '../api/useFinanceSummary';
import { formatFinanceDayNumeric, useFinanceTimeZone } from '../dates';
import { formatMoney } from '../money';
import { CollectPaymentModal } from './CollectPaymentModal';
import type { OutstandingEntry } from '../types';

interface PorCobrarTabProps {
  currency: string;
}

/**
 * Saldos por cobrar: sesiones completadas con pago pendiente, por paciente.
 */
export function PorCobrarTab({ currency }: PorCobrarTabProps) {
  const { data, isLoading, isError, refetch } = useOutstanding();
  const timeZone = useFinanceTimeZone();
  const [collecting, setCollecting] = useState<OutstandingEntry | null>(null);

  // El error va ANTES del vacío y antes de pintar un total en cero: "Nadie te
  // debe dinero" ante un 500 es la afirmación más cara de todo el módulo,
  // porque el clínico deja de perseguir un cobro que sí existe.
  if (isError) {
    return (
      <div className="bg-surface dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-800">
        <WidgetError what="los saldos por cobrar" onRetry={() => refetch()} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-kio" aria-hidden="true" />
        <span className="sr-only">Cargando saldos por cobrar</span>
      </div>
    );
  }

  const entries = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Total */}
      <div className="bg-surface dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-800 flex items-center gap-4">
        <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
          <HandCoins className="w-6 h-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
            Total por cobrar
          </p>
          <p className="text-2xl font-bold text-kanji-deep dark:text-white">
            {formatMoney(data?.total ?? 0, currency)}
          </p>
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mt-0.5">
            Sesiones completadas con pago pendiente
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="bg-surface dark:bg-slate-900 rounded-2xl p-10 shadow-sm border border-gray-200 dark:border-slate-800 text-center">
          <p className="text-sm font-semibold text-kanji-deep dark:text-white">
            Nadie te debe dinero 🎉
          </p>
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mt-1">
            Todas las sesiones completadas están pagadas.
          </p>
        </div>
      ) : (
        <div className="bg-surface dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg/50 dark:bg-slate-800/50 text-left">
                  {/* La versalita del sistema: 11px, bold. Igual que las
                      cabeceras de la tabla de movimientos. */}
                  <th className="px-5 py-3 text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Paciente</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-center">Sesiones</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Deuda más antigua</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Saldo</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {entries.map((entry) => (
                  <tr key={entry.patientId} className="hover:bg-bg/40 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3">
                      <Link
                        to={`/patients/${entry.patientId}`}
                        className="font-semibold text-kanji-deep dark:text-white hover:underline transition-colors duration-150"
                      >
                        {entry.fullName}
                      </Link>
                      {entry.patientStatus === 'ARCHIVED' && (
                        <span className="ml-2 text-[11px] font-medium px-1.5 py-0.5 rounded-xs bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
                          Archivado
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center text-gray-600 dark:text-slate-400">
                      {entry.sessions}
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-slate-400">
                      {entry.oldestDate
                        ? formatFinanceDayNumeric(entry.oldestDate, timeZone)
                        : '—'}
                    </td>
                    {/* `amber-600` sobre lino mide 2.87:1: por debajo de AA
                        para la cifra que dice cuánto le deben al clínico.
                        `amber-700` mide 4.53:1 sin salirse del ámbar. El par
                        oscuro ya estaba bien (10.69:1). */}
                    <td className="px-5 py-3 text-right font-bold text-amber-700 dark:text-amber-400">
                      {formatMoney(entry.total, currency)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setCollecting(entry)}
                        aria-label={`Registrar cobro de ${entry.fullName}`}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 px-3 text-xs font-bold text-kanji-deep transition-colors duration-150 hover:bg-gray-50 dark:border-slate-700 dark:text-kio dark:hover:bg-slate-800"
                      >
                        <HandCoins size={15} aria-hidden="true" />
                        Registrar cobro
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CollectPaymentModal
        entry={collecting}
        currency={currency}
        onClose={() => setCollecting(null)}
      />
    </div>
  );
}
