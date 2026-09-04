import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { DatePicker } from '../../../components/ui/DatePicker';
import { getErrorMessage } from '../../../lib/errors';
import { useCreateTransaction } from '../api/useFinanceSummary';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../labels';
import { todayLocalDateString } from '../money';

interface TransactionModalProps {
  isOpen: boolean;
  /** Un ingreso que no viene de una cita, o un gasto. */
  type: 'INCOME' | 'EXPENSE';
  onClose: () => void;
}

interface TransactionForm {
  amount: number;
  category: string;
  description: string;
  date: string;
}

const COPY = {
  EXPENSE: {
    title: 'Registrar gasto',
    submit: 'Registrar gasto',
    success: 'Gasto registrado',
    error: 'No pudimos registrar el gasto',
    placeholder: 'Detalles del gasto…',
    categories: EXPENSE_CATEGORIES,
  },
  INCOME: {
    title: 'Registrar ingreso',
    submit: 'Registrar ingreso',
    success: 'Ingreso registrado',
    error: 'No pudimos registrar el ingreso',
    placeholder: 'Detalles del ingreso…',
    categories: INCOME_CATEGORIES,
  },
} as const;

/**
 * Alta manual de un movimiento.
 *
 * Sirve para las dos direcciones: un gasto de la consulta y un ingreso que no
 * nace de una cita (un taller, un informe). Los ingresos de sesión no se
 * registran aquí — los genera el cobro de la cita.
 */
export function TransactionModal({ isOpen, type, onClose }: TransactionModalProps) {
  const copy = COPY[type];
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<TransactionForm>({
    // Fecha por defecto en HORA LOCAL: `toISOString()` fecha en UTC y un gasto
    // registrado a las 22:00 en Bogotá se guardaba con la fecha de mañana.
    defaultValues: { date: todayLocalDateString() },
  });
  const createMutation = useCreateTransaction();

  // Al alternar entre gasto e ingreso el formulario arranca limpio: las
  // categorías de una dirección no existen en la otra.
  useEffect(() => {
    if (isOpen) reset({ date: todayLocalDateString(), category: '', description: '' });
  }, [isOpen, type, reset]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const onSubmit = async (data: TransactionForm) => {
    try {
      await createMutation.mutateAsync({
        type,
        amount: Number(data.amount),
        category: data.category,
        description: data.description,
        date: data.date,
      });
      reset({ date: todayLocalDateString(), category: '', description: '' });
      onClose();
      toast.success(copy.success);
    } catch (error) {
      console.error('Failed to create transaction', error);
      // El 400 de `/finance` no es siempre un error de formato: puede ser «la
      // fecha 2026-02-31 no existe». El servidor manda el motivo en español.
      toast.error(getErrorMessage(error, copy.error));
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kio/50 focus:border-kio transition-all duration-150 placeholder:text-gray-400 dark:placeholder:text-slate-500';
  const labelClass =
    'block text-[11px] font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5';

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="transaction-modal-title"
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
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-900">
              <h2
                id="transaction-modal-title"
                className="text-base font-bold tracking-tight text-kanji-deep dark:text-kio"
              >
                {copy.title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="grid h-11 w-11 place-items-center rounded-full text-gray-400 transition-colors duration-150 hover:bg-gray-100 dark:text-slate-500 dark:hover:bg-slate-800"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className={labelClass} htmlFor="transaction-amount">
                    Monto
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 dark:text-slate-500"
                      aria-hidden="true"
                    >
                      $
                    </span>
                    <input
                      id="transaction-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('amount', { required: 'Monto requerido', min: 0 })}
                      className={`${inputClass} pl-8 text-lg font-bold`}
                      placeholder="0.00"
                      autoFocus
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                      {errors.amount.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="transaction-category">
                    Categoría
                  </label>
                  <select
                    id="transaction-category"
                    {...register('category', { required: 'Categoría requerida' })}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="">Seleccionar…</option>
                    {copy.categories.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <Controller
                    control={control}
                    name="date"
                    render={({ field }) => (
                      <DatePicker
                        label="Fecha"
                        // `parseISO` de una fecha sin hora es medianoche LOCAL;
                        // `new Date('yyyy-MM-dd')` sería medianoche UTC y al
                        // oeste de Greenwich mostraría el día anterior.
                        value={field.value ? parseISO(field.value) : undefined}
                        onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                        error={errors.date?.message}
                      />
                    )}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="transaction-description">
                    Descripción
                  </label>
                  <textarea
                    id="transaction-description"
                    {...register('description')}
                    className={`${inputClass} resize-none`}
                    rows={3}
                    placeholder={copy.placeholder}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    // Kanji Hondo, no `kio`: `bg-kio` con texto blanco mide
                    // 2.2:1 y no llega a AA ni de lejos.
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-kanji-deep py-3.5 text-sm font-bold text-white shadow-md shadow-kanji-deep/20 transition-all duration-150 hover:bg-kanji-deep/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {createMutation.isPending && (
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    )}
                    {createMutation.isPending ? 'Guardando…' : copy.submit}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
