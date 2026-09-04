import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../stores/auth.store';
import { X, DollarSign, CreditCard, Banknote, ArrowLeftRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { updatePayment, type UpdatePaymentPayload } from '../../../lib/appointments.api';
import type { Appointment } from '../../../types/appointments.types';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
    defaultStatus?: 'PENDING' | 'PAID';
}

/** El enum del backend no es copy: la cabecera mostraba «CONSULTATION». */
const TYPE_LABELS: Record<string, string> = {
    CONSULTATION: 'Consulta',
    EVALUATION: 'Evaluación',
    FOLLOW_UP: 'Seguimiento',
};

export function PaymentModal({ isOpen, onClose, appointment, defaultStatus }: PaymentModalProps) {
    const queryClient = useQueryClient();
    const currency = useAuthStore((s) => s.user?.profile?.currency ?? 'USD');
    const [amount, setAmount] = useState<string>('');
    const [status, setStatus] = useState<'PENDING' | 'PAID'>('PENDING');
    const [method, setMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');

    useEffect(() => {
        if (isOpen && appointment) {
            const id = setTimeout(() => {
                setAmount(appointment.price.toString());
                setStatus(appointment.paymentStatus === 'PAID' ? 'PAID' : (defaultStatus || appointment.paymentStatus || 'PENDING'));  
                setMethod(appointment.paymentMethod || 'CASH');
            }, 0);
            return () => clearTimeout(id);
        }
    }, [isOpen, appointment, defaultStatus]);
    const mutation = useMutation({
        mutationFn: (payload: UpdatePaymentPayload) =>
            updatePayment(appointment!.id, payload),
        onMutate: async (payload) => {
            await queryClient.cancelQueries({ queryKey: ['appointments'] });
            const previous = queryClient.getQueriesData<Appointment[]>({ queryKey: ['appointments'] });

            queryClient.setQueriesData<Appointment[]>(
                { queryKey: ['appointments'] },
                (old) =>
                    old?.map((apt) =>
                        apt.id === appointment!.id
                            ? {
                                ...apt,
                                paymentStatus: payload.status,
                                paymentMethod: payload.method ?? apt.paymentMethod,
                                price: payload.amount?.toString() ?? apt.price,
                            }
                            : apt,
                    ),
            );

            return { previous };
        },
        onError: (_err, _payload, context) => {
            if (context?.previous) {
                for (const [key, data] of context.previous) {
                    queryClient.setQueryData(key, data);
                }
            }
            toast.error('Error al actualizar el pago');
        },
        onSuccess: (data) => {
            toast.success(
                data.paymentStatus === 'PAID'
                    ? 'Pago registrado correctamente'
                    : 'Estado de pago actualizado'
            );
            onClose();
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!appointment) return;

        mutation.mutate({
            status,
            // Only send amount if it's a valid number
            amount: amount ? parseFloat(amount) : undefined,
            method: status === 'PAID' ? method : undefined,
        });
    };

    if (!isOpen || !appointment) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop — velo neutro del sistema; el blur solo vive aquí. */}
            <div
                className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
                onClick={onClose}
                role="presentation"
            />

            {/* Modal */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="payment-modal-title"
                className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 flex flex-col"
            >

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800">
                    <div>
                        <h2 id="payment-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">Gestionar cobro</h2>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                            {TYPE_LABELS[appointment.type] ?? appointment.type} · {appointment.patient.fullName}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar el cobro"
                        className="min-h-11 min-w-11 grid place-items-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 transition-colors"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Status Switch — `aria-pressed` porque el estado activo no
                        puede quedar solo en el color de fondo. El verde del
                        estado activo es `emerald-700` (5.48:1 con blanco):
                        `emerald-600` se queda en 3.77:1 y este texto es
                        `text-sm`, así que AA le pide 4.5:1. */}
                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setStatus('PENDING')}
                            aria-pressed={status === 'PENDING'}
                            className={`flex-1 min-h-11 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${status === 'PENDING'
                                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                                }`}
                        >
                            <AlertCircle size={16} aria-hidden="true" className={status === 'PENDING' ? 'text-amber-600 dark:text-amber-400' : ''} />
                            Pendiente
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatus('PAID')}
                            aria-pressed={status === 'PAID'}
                            className={`flex-1 min-h-11 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${status === 'PAID'
                                ? 'bg-emerald-700 text-white shadow-sm'
                                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                                }`}
                        >
                            <CheckCircle2 size={16} aria-hidden="true" />
                            Pagado
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Amount Input */}
                        <div className="space-y-1.5">
                            <label htmlFor="payment-amount" className="block text-[11px] font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                                Monto de la sesión
                            </label>
                            <div className="relative">
                                <span aria-hidden="true" className="absolute left-4 top-3 text-gray-600 dark:text-slate-400 font-medium">$</span>
                                <input
                                    id="payment-amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    aria-describedby="payment-amount-currency"
                                    className="w-full pl-8 pr-16 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-lg font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kio/50 focus:border-kio transition-all"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                                <span id="payment-amount-currency" className="absolute right-4 top-3.5 text-xs font-bold text-gray-600 dark:text-slate-400">{currency}</span>
                            </div>
                        </div>

                        {/* Payment Method (Only visible if PAID).
                            `role="group"` y no `<label>`: son tres botones, no un
                            campo; una etiqueta suelta no los nombraría. */}
                        {status === 'PAID' && (
                            <div
                                role="group"
                                aria-labelledby="payment-method-label"
                                className="space-y-1.5 animate-in slide-in-from-top-2 fade-in"
                            >
                                <p id="payment-method-label" className="text-[11px] font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                                    Método de pago
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setMethod('CASH')}
                                        aria-pressed={method === 'CASH'}
                                        className={`min-h-11 py-2.5 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${method === 'CASH'
                                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200'
                                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-400 dark:hover:border-slate-600'
                                            }`}
                                    >
                                        <Banknote size={18} aria-hidden="true" />
                                        Efectivo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMethod('CARD')}
                                        aria-pressed={method === 'CARD'}
                                        className={`min-h-11 py-2.5 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${method === 'CARD'
                                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200'
                                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-400 dark:hover:border-slate-600'
                                            }`}
                                    >
                                        <CreditCard size={18} aria-hidden="true" />
                                        Tarjeta
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMethod('TRANSFER')}
                                        aria-pressed={method === 'TRANSFER'}
                                        className={`min-h-11 py-2.5 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${method === 'TRANSFER'
                                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200'
                                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-400 dark:hover:border-slate-600'
                                            }`}
                                    >
                                        <ArrowLeftRight size={18} aria-hidden="true" />
                                        Transf.
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button — `shadow-sm` en reposo: la sombra describe
                        estado, no altura. Y el fondo llega hasta el `700`: con
                        texto blanco a 16px, `emerald-500` mide 2.54:1 y
                        `emerald-600` 3.77:1 — los dos por debajo de AA, que a
                        este tamaño exige 4.5:1 aunque el texto sea negrita.
                        `emerald-700` (#047857) mide 5.48:1 y `amber-700`
                        (#b45309) 5.02:1. Es el botón que confirma un cobro. */}
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className={`w-full min-h-11 py-3.5 rounded-xl font-bold text-white shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${status === 'PAID'
                            ? 'bg-emerald-700 hover:bg-emerald-800'
                            : 'bg-amber-700 hover:bg-amber-800'
                            }`}
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                                Guardando…
                            </>
                        ) : (
                            <>
                                <DollarSign size={18} aria-hidden="true" />
                                {status === 'PAID' ? 'Confirmar pago' : 'Guardar pendiente'}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
