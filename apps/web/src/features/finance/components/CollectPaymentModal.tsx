import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, CreditCard, ArrowLeftRight, HandCoins, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { WidgetError } from '../../../components/widgets/WidgetError';
import { updatePayment } from '../../../lib/appointments.api';
import { appointmentKeys } from '../../../lib/query-keys';
import { financeKeys, usePatientPendingSessions } from '../api/useFinanceSummary';
import { formatFinanceDayLong, useFinanceTimeZone } from '../dates';
import { PAYMENT_METHOD_LABELS, type PaymentMethodValue } from '../labels';
import { formatMoney } from '../money';
import type { OutstandingEntry } from '../types';

interface CollectPaymentModalProps {
  /** Fila de "Por cobrar" que se está cobrando. `null` = cerrado. */
  entry: OutstandingEntry | null;
  currency: string;
  onClose: () => void;
}

const METHODS: Array<{ value: PaymentMethodValue; icon: typeof Banknote }> = [
  { value: 'CASH', icon: Banknote },
  { value: 'CARD', icon: CreditCard },
  { value: 'TRANSFER', icon: ArrowLeftRight },
];

/**
 * Registrar el cobro de las sesiones pendientes de un paciente.
 *
 * Cobrar es el trabajo real de recepción y hasta ahora el módulo solo sabía
 * registrar gastos. Cada sesión se marca como pagada con
 * `PATCH /appointments/:id/payment`, que es lo que genera el ingreso en
 * finanzas (no existe un endpoint de cobro en `/finance`).
 */
export function CollectPaymentModal({ entry, currency, onClose }: CollectPaymentModalProps) {
  const queryClient = useQueryClient();
  const timeZone = useFinanceTimeZone();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [method, setMethod] = useState<PaymentMethodValue>('CASH');

  const { data, isLoading, isError, refetch } = usePatientPendingSessions(
    entry?.patientId ?? null,
    entry?.oldestDate ?? null,
  );

  const sessions = data ?? [];

  // Por defecto se cobra todo lo pendiente; el clínico deselecciona lo que no.
  // El ajuste se hace durante el render (patrón de estado derivado de props):
  // un `useEffect` con setState encadena renders y lo rechaza el lint.
  // Comparar por ids hace que un refetch con las mismas sesiones no borre la
  // selección, pero cobrar una sí recalcule la lista.
  const sessionsKey = data ? data.map((apt) => apt.id).join(',') : null;
  const [prevSessionsKey, setPrevSessionsKey] = useState<string | null>(null);
  if (data && sessionsKey !== prevSessionsKey) {
    setPrevSessionsKey(sessionsKey);
    setSelectedIds(data.map((apt) => apt.id));
  }

  useEffect(() => {
    if (!entry) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [entry, onClose]);

  const collectMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Secuencial y tolerante: si una sesión falla, las demás sí se cobran y
      // el resultado dice exactamente cuántas quedaron sin registrar.
      let failed = 0;
      for (const id of ids) {
        try {
          await updatePayment(id, { status: 'PAID', method });
        } catch {
          failed += 1;
        }
      }
      return { total: ids.length, failed };
    },
    onSuccess: ({ total, failed }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });

      if (failed === 0) {
        toast.success(total === 1 ? 'Cobro registrado' : `${total} cobros registrados`);
        onClose();
        return;
      }
      if (failed === total) {
        toast.error('No pudimos registrar el cobro. Vuelve a intentarlo.');
        return;
      }
      toast.warning(`Se registraron ${total - failed} de ${total} sesiones. Vuelve a intentar el resto.`);
    },
    onError: () => toast.error('No pudimos registrar el cobro. Vuelve a intentarlo.'),
  });

  const toggle = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const selectedTotal = sessions
    .filter((apt) => selectedIds.includes(apt.id))
    .reduce((sum, apt) => sum + Number(apt.price), 0);

  const missing = entry ? entry.sessions - sessions.length : 0;

  return (
    <AnimatePresence>
      {entry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cobro-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
          >
            {/* Encabezado */}
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-5 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <HandCoins size={18} aria-hidden="true" />
                </span>
                <div>
                  <h2
                    id="cobro-modal-title"
                    className="text-base font-bold tracking-tight text-kanji-deep dark:text-kio"
                  >
                    Registrar cobro
                  </h2>
                  <p className="mt-0.5 text-sm font-medium text-gray-600 dark:text-slate-400">
                    {entry.fullName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-gray-400 transition-colors duration-150 hover:bg-gray-100 dark:text-slate-500 dark:hover:bg-slate-800"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {isError ? (
                <WidgetError what="las sesiones pendientes de este paciente" onRetry={() => refetch()} />
              ) : isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={22} className="animate-spin text-kio" aria-hidden="true" />
                  <span className="sr-only">Cargando sesiones pendientes</span>
                </div>
              ) : sessions.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                  <p className="text-sm font-bold text-gray-800 dark:text-slate-200">
                    No encontramos las sesiones en la agenda
                  </p>
                  <p className="mt-1 text-xs font-medium text-gray-600 dark:text-slate-400">
                    El saldo existe, pero las sesiones que lo generan quedan fuera del rango de
                    fechas que podemos consultar. Puedes cobrarlas desde la ficha del paciente.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                      Sesiones con saldo
                    </p>
                    <ul className="space-y-1">
                      {sessions.map((apt) => {
                        const checked = selectedIds.includes(apt.id);
                        return (
                          <li key={apt.id}>
                            <label
                              className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition-colors duration-150 ${
                                checked
                                  ? 'border-kio/40 bg-kio/10 dark:border-kio/30 dark:bg-kio/10'
                                  : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggle(apt.id)}
                                className="h-4 w-4 accent-kio"
                              />
                              <span className="flex-1 text-sm font-medium text-gray-800 dark:text-slate-200">
                                {/* Zona explícita, no la implícita del runtime:
                                    una sesión de las 22:00 no puede listarse
                                    con el día de mañana. Esa zona será la del
                                    clínico cuando el perfil traiga `timezone`
                                    (ver el docblock de `dates.ts`). */}
                                {formatFinanceDayLong(apt.startTime, timeZone)}
                              </span>
                              <span className="text-sm font-bold tabular-nums text-gray-800 dark:text-slate-200">
                                {formatMoney(Number(apt.price), currency)}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>

                    {missing > 0 && (
                      <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                        {missing === 1
                          ? 'Hay 1 sesión más con saldo fuera del rango de fechas consultado.'
                          : `Hay ${missing} sesiones más con saldo fuera del rango de fechas consultado.`}
                      </p>
                    )}
                  </div>

                  <fieldset>
                    <legend className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                      Método de pago
                    </legend>
                    <div className="grid grid-cols-3 gap-2">
                      {METHODS.map(({ value, icon: Icon }) => {
                        const active = method === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setMethod(value)}
                            aria-pressed={active}
                            className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[11px] font-bold transition-colors duration-150 ${
                              active
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <Icon size={16} aria-hidden="true" />
                            {PAYMENT_METHOD_LABELS[value]}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                </div>
              )}
            </div>

            {/* Pie */}
            {!isError && !isLoading && sessions.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-4 dark:border-slate-800">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Total a registrar
                  </span>
                  <span className="text-base font-bold tabular-nums text-gray-900 dark:text-white">
                    {formatMoney(selectedTotal, currency)}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={selectedIds.length === 0 || collectMutation.isPending}
                  onClick={() => collectMutation.mutate(selectedIds)}
                  // Kanji Hondo, no `kio`: texto blanco sobre `kio` mide 2.2:1.
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-kanji-deep py-3 text-sm font-bold text-white shadow-md shadow-kanji-deep/20 transition-all duration-150 hover:bg-kanji-deep/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {collectMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <HandCoins size={16} aria-hidden="true" />
                  )}
                  {selectedIds.length === 1
                    ? 'Registrar 1 cobro'
                    : `Registrar ${selectedIds.length} cobros`}
                </button>
                <p className="mt-2 text-center text-xs font-medium text-gray-500 dark:text-slate-400">
                  Cada sesión queda como pagada y suma a los ingresos del mes.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
