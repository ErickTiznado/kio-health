import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  DollarSign,
  CreditCard,
  Banknote,
  ArrowLeftRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CalendarPlus,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { completeCheckout } from '../../lib/appointments.api';
import type { CheckoutPayload } from '../../types/appointments.types';

interface SessionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  price?: string;
  patientName?: string;
}

type QuickDate = '1w' | '15d' | '1m' | 'none';

function computeNextDate(option: QuickDate): string | null {
  if (option === 'none') return null;
  const date = new Date();
  if (option === '1w') date.setDate(date.getDate() + 7);
  else if (option === '15d') date.setDate(date.getDate() + 15);
  else if (option === '1m') date.setMonth(date.getMonth() + 1);
  date.setHours(date.getHours(), 0, 0, 0);
  return date.toISOString();
}

export const SessionCheckoutModal = ({
  isOpen,
  onClose,
  appointmentId,
  price,
  patientName,
}: SessionCheckoutModalProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID'>('PAID');
  const [method, setMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');
  const [nextDate, setNextDate] = useState<QuickDate>('1w');
  const [sendEmail, setSendEmail] = useState(false);

  useEffect(() => {
    if (isOpen && price) {
      setAmount(price);
      setPaymentStatus('PAID');
      setMethod('CASH');
      setNextDate('1w');
      setSendEmail(false);
    }
  }, [isOpen, price]);

  const mutation = useMutation({
    mutationFn: (payload: CheckoutPayload) =>
      completeCheckout(appointmentId, payload),
    onSuccess: (data) => {
      toast.success('Sesión finalizada correctamente');
      if (data.nextAppointment) {
        toast.success('Próxima cita agendada');
      }
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['session', appointmentId] });
      onClose();
      navigate('/agenda');
    },
    onError: () => {
      toast.error('Error al finalizar la sesión');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      toast.error('Monto inválido');
      return;
    }

    mutation.mutate({
      amount: parsedAmount,
      paymentStatus,
      paymentMethod: method,
      nextAppointmentDate: computeNextDate(nextDate),
      shouldSendEmail: sendEmail,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-black/40 overflow-hidden animate-in zoom-in-95 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Finalizar Sesión & Cobro</h2>
            {patientName && (
              <p className="text-sm text-gray-500 dark:text-slate-400">{patientName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Payment Status Switch */}
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setPaymentStatus('PENDING')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${paymentStatus === 'PENDING'
                  ? 'bg-white dark:bg-slate-700 text-gray-700 dark:text-white shadow-sm'
                  : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                }`}
            >
              <AlertCircle size={16} className={paymentStatus === 'PENDING' ? 'text-amber-500' : ''} />
              Pendiente
            </button>
            <button
              type="button"
              onClick={() => setPaymentStatus('PAID')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${paymentStatus === 'PAID'
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
                <span className="absolute right-4 top-3.5 text-xs font-bold text-gray-400 dark:text-slate-500">USD</span>
              </div>
            </div>

            {/* Payment Method (Only visible if PAID) */}
            {paymentStatus === 'PAID' && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in">
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Método de Pago
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod('CASH')}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${method === 'CASH'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600'
                      }`}
                  >
                    <Banknote size={18} />
                    Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('CARD')}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${method === 'CARD'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600'
                      }`}
                  >
                    <CreditCard size={18} />
                    Tarjeta
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('TRANSFER')}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${method === 'TRANSFER'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600'
                      }`}
                  >
                    <ArrowLeftRight size={18} />
                    Transf.
                  </button>
                </div>
              </div>
            )}

            {/* Next Appointment Quick-Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarPlus size={14} />
                Próxima Cita
              </label>
              <div className="grid grid-cols-4 gap-2">
                {([
                  ['1w', '1 Semana'],
                  ['15d', '15 Días'],
                  ['1m', '1 Mes'],
                  ['none', 'Ninguna'],
                ] as [QuickDate, string][]).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setNextDate(value)}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${nextDate === value
                        ? 'border-[var(--color-kanji)] bg-[var(--color-cruz)] dark:bg-slate-700 text-[var(--color-kanji)] dark:text-kio'
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-[var(--color-kanji)] focus:ring-[var(--color-kanji)]"
              />
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-400">
                <Mail size={14} />
                Enviar resumen por correo
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${paymentStatus === 'PAID'
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
              }`}
          >
            {mutation.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <DollarSign size={18} />
                Finalizar Sesión
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
