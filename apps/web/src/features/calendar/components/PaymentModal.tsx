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

export function PaymentModal({ isOpen, onClose, appointment, defaultStatus }: PaymentModalProps) {
    const queryClient = useQueryClient();
    const currency = useAuthStore((s) => s.user?.profile?.currency ?? 'USD');
    const [amount, setAmount] = useState<string>('');
    const [status, setStatus] = useState<'PENDING' | 'PAID'>('PENDING');
    const [method, setMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');

    useEffect(() => {
        if (isOpen && appointment) {
            setAmount(appointment.price.toString());
            // Use defaultStatus if provided and appointment is not already paid
            setStatus(appointment.paymentStatus === 'PAID' ? 'PAID' : (defaultStatus || appointment.paymentStatus || 'PENDING'));
            setMethod(appointment.paymentMethod || 'CASH');
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
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 flex flex-col">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gestionar Cobro</h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                            {appointment.type} - {appointment.patient.fullName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Status Switch */}
                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setStatus('PENDING')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${status === 'PENDING'
                                ? 'bg-white dark:bg-slate-700 text-gray-700 dark:text-white shadow-sm'
                                : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                                }`}
                        >
                            <AlertCircle size={16} className={status === 'PENDING' ? 'text-amber-500' : ''} />
                            Pendiente
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatus('PAID')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${status === 'PAID'
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                                }`}
                        >
                            <CheckCircle2 size={16} />
                            Pagado
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Amount Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                Monto de la Sesión
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-gray-400 dark:text-slate-500 font-medium">$</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-8 pr-16 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-lg font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-kanji)]/20 focus:border-[var(--color-kanji)] transition-all"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                                <span className="absolute right-4 top-3.5 text-xs font-bold text-gray-400 dark:text-slate-500">{currency}</span>
                            </div>
                        </div>

                        {/* Payment Method (Only visible if PAID) */}
                        {status === 'PAID' && (
                            <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in">
                                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                    Método de Pago
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setMethod('CASH')}
                                        className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${method === 'CASH'
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200'
                                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                                            }`}
                                    >
                                        <Banknote size={18} />
                                        Efectivo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMethod('CARD')}
                                        className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${method === 'CARD'
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200'
                                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                                            }`}
                                    >
                                        <CreditCard size={18} />
                                        Tarjeta
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMethod('TRANSFER')}
                                        className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${method === 'TRANSFER'
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200'
                                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                                            }`}
                                    >
                                        <ArrowLeftRight size={18} />
                                        Transf.
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${status === 'PAID'
                            ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                            : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                            }`}
                    >
                        {mutation.isPending ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                <DollarSign size={18} />
                                {status === 'PAID' ? 'Confirmar Pago' : 'Guardar Pendiente'}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
