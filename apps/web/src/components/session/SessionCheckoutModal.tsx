import type { FC } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CheckCircle,
  X,
  Banknote,
  CreditCard,
  ArrowRightLeft,
  CalendarCheck,
  CalendarPlus,
  Mail,
  DollarSign,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useSessionCheckout } from '../../hooks/use-session-checkout';
import type { PaymentMethod } from '../../types/appointments.types';

/* ── Static config (hoisted outside component — rendering-hoist-jsx) ─── */

type ScheduleOption = '1_WEEK' | '15_DAYS' | '1_MONTH' | 'MANUAL';

const SCHEDULE_OPTIONS: {
  key: ScheduleOption;
  label: string;
  icon?: typeof CalendarPlus;
}[] = [
  { key: '1_WEEK', label: 'En 1 semana' },
  { key: '15_DAYS', label: 'En 15 días' },
  { key: '1_MONTH', label: 'En 1 mes' },
  { key: 'MANUAL', label: 'Agendar Manualmente', icon: CalendarPlus },
];

const PAYMENT_METHODS: {
  key: PaymentMethod;
  label: string;
  icon: typeof Banknote;
}[] = [
  { key: 'CASH', label: 'Efectivo', icon: Banknote },
  { key: 'CARD', label: 'Tarjeta', icon: CreditCard },
  { key: 'TRANSFER', label: 'Transferencia', icon: ArrowRightLeft },
];

/* ── Props ───────────────────────────────────────── */

interface SessionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  defaultAmount?: number;
}

/**
 * Presentational checkout modal — all business logic lives in useSessionCheckout.
 * ISP: component depends only on what it renders.
 */
export const SessionCheckoutModal: FC<SessionCheckoutModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  defaultAmount = 500,
}) => {
  const { state, actions, suggestedDate, isSubmitting, error } =
    useSessionCheckout(appointmentId, defaultAmount, onClose);

  return (
    <>
      {/* ── Overlay ── */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          isOpen
            ? 'bg-black/40 backdrop-blur-sm opacity-100'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        role="presentation"
      />

      {/* ── Modal Panel ── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl pointer-events-auto transition-all duration-300 ease-out ${
            isOpen
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-4'
          }`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Resumen de sesión"
        >
          {/* ── Close button ── */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100/70 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer z-10"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>

          {/* ── Header ── */}
          <div className="px-8 pt-7 pb-5 border-b border-gray-100/80">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center ${
                  isOpen ? 'animate-[checkPulse_1.2s_ease-in-out_infinite]' : ''
                }`}
              >
                <CheckCircle size={22} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                  Resumen de Sesión
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Confirma el pago y agenda la próxima cita
                </p>
              </div>
            </div>
          </div>

          {/* ── Body: 2-column grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8 py-6">
            {/* ─ Step 1: Finanzas ─ */}
            <div className="space-y-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <DollarSign size={12} />
                Finanzas
              </p>

              {/* Amount */}
              <div>
                <label
                  htmlFor="checkout-amount"
                  className="text-xs font-semibold text-gray-500 mb-1.5 block"
                >
                  Total a cobrar
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                    $
                  </span>
                  <input
                    id="checkout-amount"
                    type="number"
                    min={0}
                    value={state.amount}
                    onChange={(e) => actions.setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-gray-50/80 border border-gray-200/60 rounded-2xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-kanji/30 focus:border-kanji/40 transition-all"
                  />
                </div>
              </div>

              {/* Payment status toggle */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Estado
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => actions.setPaymentStatus('PENDING')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      state.paymentStatus === 'PENDING'
                        ? 'bg-amber-100 text-amber-700 shadow-sm ring-1 ring-amber-200'
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    Pendiente
                  </button>
                  <button
                    type="button"
                    onClick={() => actions.setPaymentStatus('PAID')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      state.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-700 shadow-sm ring-1 ring-emerald-200'
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    Pagado
                  </button>
                </div>
              </div>

              {/* Payment method icons */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Método
                </p>
                <div className="flex gap-2">
                  {PAYMENT_METHODS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => actions.setPaymentMethod(key)}
                      className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                        state.paymentMethod === key
                          ? 'bg-kanji/10 text-kanji shadow-sm ring-1 ring-kanji/20'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                      aria-label={label}
                    >
                      <Icon size={18} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ─ Step 2: Continuidad ─ */}
            <div className="space-y-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <CalendarCheck size={12} />
                Continuidad
              </p>

              {/* Quick-select schedule */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Próxima Cita
                </p>
                <div className="space-y-2">
                  {SCHEDULE_OPTIONS.map(({ key, label, icon: OptionIcon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => actions.selectScheduleOption(key)}
                      className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                        state.scheduleOption === key
                          ? 'bg-kanji/10 text-kanji ring-1 ring-kanji/20 shadow-sm'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {OptionIcon ? <OptionIcon size={15} /> : null}
                      {label}
                    </button>
                  ))}
                </div>

                {/* Manual date picker */}
                {state.scheduleOption === 'MANUAL' && (
                  <div className="animate-[fadeSlideUp_0.25s_ease-out] mt-3">
                    <label
                      htmlFor="manual-date-input"
                      className="text-xs font-semibold text-gray-500 mb-1.5 block"
                    >
                      Selecciona la fecha
                    </label>
                    <input
                      id="manual-date-input"
                      type="date"
                      value={state.manualDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => actions.setManualDate(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200/60 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-kanji/30 focus:border-kanji/40 transition-all cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Suggested date display */}
              {suggestedDate && (
                <div className="bg-kio/8 border border-kio/15 rounded-2xl p-4 flex items-center gap-3 animate-[fadeSlideUp_0.25s_ease-out]">
                  <div className="w-10 h-10 rounded-xl bg-kanji/10 flex items-center justify-center shrink-0">
                    <CalendarCheck size={18} className="text-kanji" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Fecha sugerida
                    </p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
                      {format(suggestedDate, "EEEE d 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="px-8 py-5 border-t border-gray-100/80 bg-gray-50/40 rounded-b-3xl">
            {/* Error feedback */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm mb-3 bg-red-50 p-3 rounded-xl animate-[fadeSlideUp_0.2s_ease-out]">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Email checkbox */}
            <label
              htmlFor="send-email-check"
              className="flex items-center gap-3 mb-4 cursor-pointer group"
            >
              <input
                id="send-email-check"
                type="checkbox"
                checked={state.shouldSendEmail}
                onChange={(e) => actions.setShouldSendEmail(e.target.checked)}
                className="w-4.5 h-4.5 rounded-md border-gray-300 text-kanji focus:ring-kanji/40 cursor-pointer accent-kanji"
              />
              <span className="flex items-center gap-1.5 text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                <Mail size={14} />
                Enviar resumen / dieta al paciente por correo
              </span>
            </label>

            {/* Primary CTA */}
            <button
              type="button"
              onClick={actions.handleSaveAndClose}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-kio to-kanji text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ boxShadow: '0 8px 30px rgba(138, 114, 209, 0.30)' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Guardando…
                </>
              ) : (
                <>
                  <Save size={18} />
                  Cerrar y Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Keyframe animations (injected once) ── */}
      <style>{`
        @keyframes checkPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};
