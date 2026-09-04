import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowLeftRight, Banknote, CreditCard, Loader2, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { DatePicker } from '../../../components/ui/DatePicker';
import { getErrorMessage } from '../../../lib/errors';
import { useUpdateAppointmentPayment, useUpdateTransaction } from '../api/useFinanceSummary';
import {
  financeDayKey,
  formatFinanceDayLong,
  formatFinanceMonthLong,
  isTodayInFinanceZone,
  useFinanceTimeZone,
} from '../dates';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHOD_LABELS,
  categoryLabel,
  type CategoryOption,
  type PaymentMethodValue,
} from '../labels';
import { formatMoney } from '../money';
import type { FinanceTransaction, UpdateTransactionPayload } from '../types';

interface EditTransactionModalProps {
  /** Movimiento a editar. `null` = cerrado. */
  transaction: FinanceTransaction | null;
  currency: string;
  onClose: () => void;
}

const METHODS: Array<{ value: PaymentMethodValue; icon: typeof Banknote }> = [
  { value: 'CASH', icon: Banknote },
  { value: 'CARD', icon: CreditCard },
  { value: 'TRANSFER', icon: ArrowLeftRight },
];

/**
 * Lista de categorías de la dirección del movimiento, con la suya propia
 * delante si no está.
 *
 * Un movimiento viejo puede llevar una categoría que estas listas ya no
 * incluyen. Si no se añade, el `select` abre sin nada seleccionado y el primer
 * guardado le cambiaría la categoría al clínico sin que lo haya pedido.
 */
function categoryOptions(transaction: FinanceTransaction): CategoryOption[] {
  const base = transaction.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  if (base.some((option) => option.value === transaction.category)) return base;
  return [{ value: transaction.category, label: categoryLabel(transaction.category) }, ...base];
}

/**
 * Editar un movimiento.
 *
 * Dos cuerpos distintos porque son dos cosas distintas:
 *
 * - Movimiento de una CITA: no se toca desde finanzas. `PATCH /finance/:id` lo
 *   rechaza con 400 a propósito, para que el importe no tenga dos fuentes de
 *   verdad. Se corrige la cita (`PATCH /appointments/:id/payment`) y el
 *   servidor actualiza el movimiento asociado.
 * - Movimiento MANUAL: se edita directamente con `PATCH /finance/:id`, en
 *   semántica PATCH — solo viajan los campos que de verdad cambiaron.
 */
export function EditTransactionModal({ transaction, currency, onClose }: EditTransactionModalProps) {
  const timeZone = useFinanceTimeZone();
  const paymentMutation = useUpdateAppointmentPayment();
  const transactionMutation = useUpdateTransaction();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethodValue>('CASH');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  // Estado derivado del movimiento que se está editando, ajustado durante el
  // render: hacerlo en un `useEffect` con setState encadena renders y lo
  // rechaza el lint del repo.
  const transactionId = transaction?.id ?? null;
  const [prevTransactionId, setPrevTransactionId] = useState<string | null>(null);
  if (transactionId !== prevTransactionId) {
    setPrevTransactionId(transactionId);
    setAmount(transaction ? String(Number(transaction.amount)) : '');
    setMethod((transaction?.appointment?.paymentMethod as PaymentMethodValue) ?? 'CASH');
    setCategory(transaction?.category ?? '');
    setDescription(transaction?.description ?? '');
    // El día civil se lee en la zona del CLÍNICO, que es donde el servidor lo
    // ancló. Leerlo en la del navegador abriría el formulario con el día de al
    // lado y lo guardaría así.
    setDate(transaction ? financeDayKey(transaction.date, timeZone) : '');
    setShowErrors(false);
  }

  useEffect(() => {
    if (!transaction) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [transaction, onClose]);

  const isFromAppointment = Boolean(transaction?.appointmentId);
  const isPending = paymentMutation.isPending || transactionMutation.isPending;

  const parsedAmount = Number(amount);
  const isValidAmount = amount.trim() !== '' && Number.isFinite(parsedAmount) && parsedAmount >= 0;
  const isValidCategory = category.trim() !== '';

  // El servidor vuelve a fechar el movimiento de una CITA el día de la
  // corrección, así que corregir un cobro viejo lo mueve de mes. Se dice antes
  // de guardar, no después. En un movimiento manual no pasa: la fecha es la que
  // el clínico afirma.
  const movesDate =
    transaction && isFromAppointment ? !isTodayInFinanceZone(transaction.date, timeZone) : false;

  /**
   * Cuerpo del PATCH: solo lo que cambió.
   *
   * Una `description` vaciada viaja como `null` —columna nulable, es la forma
   * legítima de borrar el texto—. Una fecha vaciada NO viaja: la columna es NOT
   * NULL, así que «sin fecha» no existe y omitirla es exactamente lo que el
   * servidor entiende por «no la toques».
   */
  const manualPayload: UpdateTransactionPayload = {};
  if (transaction && !isFromAppointment) {
    if (isValidAmount && parsedAmount !== Number(transaction.amount)) {
      manualPayload.amount = parsedAmount;
    }
    if (isValidCategory && category !== transaction.category) {
      manualPayload.category = category;
    }
    const originalDescription = transaction.description ?? '';
    if (description.trim() !== originalDescription.trim()) {
      manualPayload.description = description.trim() === '' ? null : description.trim();
    }
    const originalDate = financeDayKey(transaction.date, timeZone);
    if (date !== '' && date !== originalDate) {
      manualPayload.date = date;
    }
  }
  const hasManualChanges = Object.keys(manualPayload).length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    if (!isValidAmount || (!isFromAppointment && !isValidCategory)) {
      setShowErrors(true);
      return;
    }

    try {
      if (isFromAppointment) {
        if (!transaction.appointmentId) return;
        await paymentMutation.mutateAsync({
          appointmentId: transaction.appointmentId,
          payload: { status: 'PAID', amount: parsedAmount, method },
        });
        toast.success('Cobro corregido');
      } else {
        if (!hasManualChanges) return;
        await transactionMutation.mutateAsync({ id: transaction.id, payload: manualPayload });
        toast.success('Movimiento actualizado');
      }
      onClose();
    } catch (error) {
      // Un 400 de `/finance/:id` NO es siempre un error de formato: puede ser
      // «este movimiento viene del cobro de una cita» o «la fecha no existe».
      // El servidor manda el motivo en español y se enseña tal cual.
      toast.error(
        getErrorMessage(
          error,
          isFromAppointment
            ? 'No pudimos corregir el cobro. Vuelve a intentarlo.'
            : 'No pudimos guardar los cambios. Vuelve a intentarlo.',
        ),
      );
    }
  };

  const labelClass =
    'block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-1.5';
  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm font-medium text-gray-900 transition-all duration-150 focus:border-kio focus:outline-none focus:ring-2 focus:ring-kio/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white';
  const errorClass = 'mt-1.5 text-xs font-bold text-rose-600 dark:text-rose-400';

  const amountError = showErrors && !isValidAmount;
  const categoryError = showErrors && !isFromAppointment && !isValidCategory;

  const submitDisabled =
    isPending || !isValidAmount || (!isFromAppointment && (!isValidCategory || !hasManualChanges));

  return (
    <AnimatePresence>
      {transaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="editar-movimiento-title"
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
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-5 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-kio/10 text-kanji-deep dark:text-kio">
                  <Pencil size={18} aria-hidden="true" />
                </span>
                <div>
                  <h2
                    id="editar-movimiento-title"
                    className="text-base font-bold tracking-tight text-kanji-deep dark:text-kio"
                  >
                    {isFromAppointment ? 'Corregir cobro' : 'Editar movimiento'}
                  </h2>
                  <p className="mt-0.5 text-sm font-medium text-gray-600 dark:text-slate-400">
                    {isFromAppointment
                      ? (transaction.appointment?.patient.fullName ??
                        transaction.description ??
                        'Sesión')
                      : categoryLabel(transaction.category)}
                    {' · '}
                    {formatFinanceDayLong(transaction.date, timeZone)}
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

            <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <div>
                <label className={labelClass} htmlFor="editar-monto">
                  {isFromAppointment ? 'Monto cobrado' : 'Monto'}
                </label>
                <div className="relative">
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 dark:text-slate-500"
                    aria-hidden="true"
                  >
                    $
                  </span>
                  <input
                    id="editar-monto"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    aria-invalid={amountError || undefined}
                    aria-describedby={amountError ? 'editar-monto-error' : undefined}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-8 pr-16 text-lg font-bold text-gray-900 transition-all duration-150 focus:border-kio focus:outline-none focus:ring-2 focus:ring-kio/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-500 dark:text-slate-400">
                    {currency}
                  </span>
                </div>
                {amountError ? (
                  <p id="editar-monto-error" className={errorClass}>
                    Escribe un monto de 0 o más.
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs font-medium text-gray-500 dark:text-slate-400">
                    Antes: {formatMoney(Number(transaction.amount), currency)}
                  </p>
                )}
              </div>

              {isFromAppointment ? (
                <fieldset>
                  <legend className={labelClass}>Método de pago</legend>
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
              ) : (
                <>
                  <div>
                    <label className={labelClass} htmlFor="editar-categoria">
                      Categoría
                    </label>
                    <select
                      id="editar-categoria"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      aria-invalid={categoryError || undefined}
                      aria-describedby={categoryError ? 'editar-categoria-error' : undefined}
                      className={`${inputClass} min-h-11 appearance-none`}
                    >
                      {categoryOptions(transaction).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {categoryError && (
                      <p id="editar-categoria-error" className={errorClass}>
                        Elige una categoría.
                      </p>
                    )}
                  </div>

                  <div>
                    <DatePicker
                      label="Fecha"
                      // `parseISO` de un día sin hora es medianoche LOCAL, que
                      // es el marco correcto para un calendario: el clínico
                      // elige un día civil, no un instante.
                      value={date ? parseISO(date) : undefined}
                      onChange={(picked) => setDate(picked ? format(picked, 'yyyy-MM-dd') : '')}
                    />
                    <p className="mt-1.5 text-xs font-medium text-gray-500 dark:text-slate-400">
                      Si la cambias de mes, el movimiento deja de contar en{' '}
                      {formatFinanceMonthLong(transaction.date, timeZone)}.
                    </p>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="editar-descripcion">
                      Descripción
                    </label>
                    <textarea
                      id="editar-descripcion"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Detalles del movimiento…"
                      className={`${inputClass} resize-none placeholder:text-gray-400 dark:placeholder:text-slate-500`}
                    />
                  </div>

                  {/* La dirección del movimiento no se edita aquí: cambiarla da
                      la vuelta al balance del mes y deja la categoría sin
                      sentido. Se dice, en vez de dejar al clínico buscando el
                      control que no existe. */}
                  <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        transaction.type === 'INCOME'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                          : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                      }`}
                    >
                      {transaction.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                    </span>
                    <p className="text-xs font-medium text-gray-600 dark:text-slate-400">
                      Para cambiar la dirección del movimiento, elimínalo y regístralo de nuevo.
                    </p>
                  </div>
                </>
              )}

              {movesDate && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-800 dark:bg-amber-950/20">
                  <AlertTriangle
                    size={16}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                  />
                  <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
                    Al guardar, el movimiento se vuelve a registrar con la fecha de hoy, así que
                    dejará de contar en{' '}
                    {formatFinanceMonthLong(transaction.date, timeZone)}.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitDisabled}
                // `bg-kio` con texto blanco mide 2.2:1. El fondo de un botón
                // sólido de marca es Kanji Hondo (7.3:1), como en el resto de
                // los modales del producto.
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-kanji-deep py-3 text-sm font-bold text-white shadow-md shadow-kanji-deep/20 transition-all duration-150 hover:bg-kanji-deep/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                {isFromAppointment ? 'Guardar corrección' : 'Guardar cambios'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
