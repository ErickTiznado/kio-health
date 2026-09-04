import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  CreditCard,
  Banknote,
  ArrowLeftRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  CalendarPlus,
  ClipboardCheck,
  Activity,
  CloudOff,
  Mail,
  RotateCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { completeCheckout } from '../../lib/appointments.api';
import { appointmentKeys } from '../../lib/query-keys';
import { financeKeys } from '../../features/finance/api/useFinanceSummary';
import { useAuthStore } from '../../stores/auth.store';
import { useNoteStore } from '../../stores/notes.store';
import type { CheckoutPayload, ClinicalScale } from '../../types/appointments.types';

interface SessionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  price?: string;
  patientName?: string;
  /** Cita de serie recurrente: la próxima sesión ya está agendada. */
  isSeriesAppointment?: boolean;
  /** Escalas respondidas en esta sesión, para cerrar el resumen clínico. */
  clinicalScales?: ClinicalScale[];
}

type QuickDate = '1w' | '15d' | '1m' | 'none';

const NEXT_DATE_OPTIONS: [QuickDate, string][] = [
  ['1w', '1 semana'],
  ['15d', '15 días'],
  ['1m', '1 mes'],
  ['none', 'Ninguna'],
];

const SCALE_LABEL: Record<string, string> = { PHQ9: 'PHQ-9', GAD7: 'GAD-7' };
const SCALE_MAX: Record<string, number> = { PHQ9: 27, GAD7: 21 };
const RISK_LABEL: Record<string, string> = {
  MINIMAL: 'mínimo',
  MILD: 'leve',
  MODERATE: 'moderado',
  MODERATELY_SEVERE: 'mod. severo',
  SEVERE: 'severo',
};

function computeNextDate(option: QuickDate): string | null {
  if (option === 'none') return null;
  const date = new Date();
  if (option === '1w') date.setDate(date.getDate() + 7);
  else if (option === '15d') date.setDate(date.getDate() + 15);
  else if (option === '1m') date.setMonth(date.getMonth() + 1);
  date.setHours(date.getHours(), 0, 0, 0);
  return date.toISOString();
}

/**
 * Cierre de la sesión.
 *
 * Es el peak-end de todo el producto: lo último que Kio dice sobre una hora de
 * terapia. Antes se titulaba "Finalizar Sesión & Cobro", abría con un icono de
 * dólar y una cifra grande y terminaba redirigiendo a la agenda — es decir, lo
 * último que el producto decía sobre una sesión era una transacción. Ahora el
 * encabezado resume lo que queda registrado (nota, escalas, próxima cita) y el
 * dinero es la mitad discreta del formulario.
 */
export const SessionCheckoutModal = ({
  isOpen,
  onClose,
  appointmentId,
  price,
  patientName,
  isSeriesAppointment = false,
  clinicalScales,
}: SessionCheckoutModalProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currency = useAuthStore((s) => s.user?.profile?.currency ?? 'USD');

  const noteStatus = useNoteStore((s) => s.status);
  const noteLastSaved = useNoteStore((s) => s.lastSaved);
  const noteError = useNoteStore((s) => s.error);
  const noteLoadError = useNoteStore((s) => s.loadError);
  const hasOfflineData = useNoteStore((s) => s.hasOfflineData);
  const offlineCount = useNoteStore((s) => s.offlineCount);
  const syncOfflineNotes = useNoteStore((s) => s.syncOfflineNotes);
  const fetchNote = useNoteStore((s) => s.fetchNote);

  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID'>('PAID');
  const [method, setMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');
  const [nextDate, setNextDate] = useState<QuickDate>('1w');
  const [sendEmail, setSendEmail] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Reset al abrir. Dos arreglos sobre la versión anterior:
  //
  //  1. Estaba condicionado a que `price` fuera truthy, así que una cita de
  //     precio 0 o sin precio NUNCA reseteaba el estado entre aperturas y
  //     arrastraba las selecciones del paciente anterior.
  //  2. Vivía en un efecto con `setTimeout(…, 0)` para esquivar la regla
  //     `set-state-in-effect`. El ajuste en render es el patrón que ya usan
  //     `EditorContainer` y `ScalesTab` en este mismo carril.
  const [wasOpen, setWasOpen] = useState(false);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setAmount(price ?? '');
      setPaymentStatus('PAID');
      setMethod('CASH');
      setNextDate('1w');
      setSendEmail(false);
    }
  }

  // `onClose` llega como flecha en línea desde SessionPage: identidad nueva en
  // cada render de la página. Con el callback en las dependencias del efecto de
  // abajo, cualquier refetch con el cierre abierto lo remontaba y su
  // `closeButtonRef.current?.focus()` arrancaba el foco del campo de monto para
  // llevarlo a la X. El ref lo saca de las dependencias.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Escape y trampa de foco: sin esto el diálogo no se podía cerrar con el
  // teclado y el tabulador se escapaba al formulario de debajo.
  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const root = dialogRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href], select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [isOpen]);

  const mutation = useMutation({
    mutationFn: (payload: CheckoutPayload) => completeCheckout(appointmentId, payload),
    onSuccess: (data) => {
      // Un cobro PENDING crea una deuda que hasta ahora no se mencionaba en
      // ningún sitio: el modal cerraba, la app navegaba a /agenda y el saldo
      // solo aparecía si el clínico abría Finanzas por su cuenta. El toast no
      // celebra nada — dice dónde queda lo que se acaba de crear.
      if (paymentStatus === 'PENDING') {
        toast.success('Sesión cerrada · cobro pendiente', {
          description: 'El saldo de esta sesión queda registrado como pendiente de cobro.',
          action: {
            label: 'Ver por cobrar',
            onClick: () => navigate('/finance?tab=por-cobrar'),
          },
        });
      } else {
        toast.success('Sesión cerrada correctamente');
      }
      if (data.nextAppointment) {
        toast.success('Próxima cita agendada');
      }
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      // La clave anterior era `['session', appointmentId]`: no existe ninguna
      // consulta con ese prefijo. El snapshot de la sesión vive en
      // `appointmentKeys.context(id)`, que `appointmentKeys.all` ya cubre; se
      // nombra igualmente para que la intención no dependa de esa coincidencia.
      queryClient.invalidateQueries({ queryKey: appointmentKeys.context(appointmentId) });
      // Sin esto el toast miente. El cierre crea un movimiento de finanzas
      // (pendiente o cobrado) y las consultas de esa pantalla —resumen,
      // movimientos y `outstanding`— tienen `staleTime` de 2 min (main.tsx), así
      // que no refetchean al montar si el clínico pasó por Finanzas hace poco:
      // «Ver por cobrar» le llevaría a una lista sin el cargo recién creado.
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
      onClose();
      navigate('/agenda');
    },
    onError: () => {
      toast.error('No se pudo cerrar la sesión');
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
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
        // Serie recurrente: la próxima sesión ya existe — el backend rechaza
        // nextAppointmentDate para citas con seriesId.
        nextAppointmentDate: isSeriesAppointment ? null : computeNextDate(nextDate),
        shouldSendEmail: sendEmail,
      });
    },
    [amount, isSeriesAppointment, method, mutation, nextDate, paymentStatus, sendEmail],
  );

  if (!isOpen) return null;

  const nextDateLabel = isSeriesAppointment
    ? 'Ya agendada — sesión de una serie'
    : nextDate === 'none'
      ? 'Sin próxima cita'
      : NEXT_DATE_OPTIONS.find(([value]) => value === nextDate)?.[1];

  const noteIsSafe = Boolean(noteLastSaved) && noteStatus !== 'error' && !hasOfflineData;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
    >
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm dark:bg-black/60"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Diálogo */}
      <div
        ref={dialogRef}
        className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-slate-900 dark:shadow-black/40"
      >
        {/* ── Encabezado: lo que queda registrado ── */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border bg-secondary px-6 py-4">
          <div className="min-w-0">
            <h2 id="checkout-title" className="text-xl font-bold text-text">
              Cerrar la sesión
            </h2>
            {patientName && (
              <p className="truncate text-sm font-medium text-text-secondary">{patientName}</p>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar sin finalizar la sesión"
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-border hover:text-text"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* ── Resumen clínico ── */}
          <div className="space-y-2 px-6 py-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Queda registrado
            </h3>

            {/* Estado de la nota, aquí y no solo en la barra del editor: este es
                el botón con el que se termina toda sesión. */}
            {noteStatus === 'saving' ? (
              <p className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                <Loader2 size={16} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
                Guardando la nota…
              </p>
            ) : hasOfflineData ? (
              /* Lo que el mecanismo garantiza, y nada más. El búfer vive en
                 `sessionStorage`: sobrevive a la navegación y a una recarga,
                 no al cierre de la pestaña. Prometer "se enviará al recuperar
                 la conexión" es justo lo que hace cerrar el portátil tranquilo. */
              <div className="space-y-1.5">
                <p className="flex items-start gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
                  <CloudOff size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                  {offlineCount > 1
                    ? `${offlineCount} notas no llegaron al servidor: solo existen en esta pestaña. Si la cierras, se pierden.`
                    : 'La nota no llegó al servidor: solo existe en esta pestaña. Si la cierras, se pierde.'}
                </p>
                <button
                  type="button"
                  onClick={() => void syncOfflineNotes()}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-amber-300 px-3 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/40"
                >
                  <RotateCw size={14} aria-hidden="true" />
                  Reintentar el envío ahora
                </button>
              </div>
            ) : noteStatus === 'error' ? (
              <p className="flex items-start gap-2 text-sm font-medium text-rose-700 dark:text-rose-300">
                <AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                {noteError || 'La nota no se pudo guardar.'}
              </p>
            ) : noteLoadError ? (
              /* Error antes que vacío. Sin esta rama, un fallo de LECTURA se
                 pintaba como "sin nota escrita en esta sesión" — el producto
                 afirmando que no hay nota justo en la pantalla con la que se
                 cierra el expediente. */
              <div className="space-y-1.5">
                <p className="flex items-start gap-2 text-sm font-medium text-rose-700 dark:text-rose-300">
                  <AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                  No se pudo leer la nota de esta sesión. No se sabe si quedó registrada.
                </p>
                <button
                  type="button"
                  onClick={() => void fetchNote(appointmentId)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-rose-300 px-3 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-700 dark:text-rose-200 dark:hover:bg-rose-900/40"
                >
                  <RotateCw size={14} aria-hidden="true" />
                  Reintentar la lectura
                </button>
              </div>
            ) : noteIsSafe && noteLastSaved ? (
              <p className="flex items-center gap-2 text-sm font-medium text-text">
                <ClipboardCheck
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 text-emerald-600 dark:text-emerald-400"
                />
                Nota guardada a las {format(noteLastSaved, 'HH:mm', { locale: es })}
              </p>
            ) : (
              <p className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                <ClipboardCheck size={16} aria-hidden="true" className="shrink-0" />
                Sin nota escrita en esta sesión
              </p>
            )}

            {clinicalScales?.map((scale) => (
              <p key={scale.id} className="flex items-center gap-2 text-sm font-medium text-text">
                <Activity
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 text-kanji-deep dark:text-kio"
                />
                {SCALE_LABEL[scale.scaleType] ?? scale.scaleType} {scale.totalScore}/
                {SCALE_MAX[scale.scaleType] ?? scale.scores.length * 3} · riesgo{' '}
                {RISK_LABEL[scale.riskLevel] ?? scale.riskLevel.toLowerCase()}
              </p>
            ))}

            <p className="flex items-center gap-2 text-sm font-medium text-text">
              <CalendarCheck size={16} aria-hidden="true" className="shrink-0 text-text-muted" />
              Próxima cita: {nextDateLabel}
            </p>
          </div>

          <div className="mx-6 h-px bg-border" />

          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5 px-6 py-4">
            {/* ── Próxima cita ── */}
            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                <CalendarPlus size={14} aria-hidden="true" />
                Próxima cita
              </span>
              {isSeriesAppointment ? (
                <div className="flex items-center gap-2 rounded-md border border-border bg-secondary p-3 text-sm font-medium text-text-secondary">
                  <CheckCircle2 size={16} aria-hidden="true" className="shrink-0" />
                  <span>
                    Esta sesión es parte de una serie recurrente — la próxima ya está
                    agendada automáticamente.
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {NEXT_DATE_OPTIONS.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={nextDate === value}
                      onClick={() => setNextDate(value)}
                      className={`min-h-11 rounded-xl border text-xs font-bold transition-colors ${
                        nextDate === value
                          ? 'border-kanji-deep bg-cruz text-kanji-deep dark:border-kio/40 dark:bg-kio/10 dark:text-kio'
                          : 'border-border bg-surface text-text-secondary hover:bg-secondary hover:text-text'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Cobro — la mitad discreta ── */}
            <div className="space-y-3 rounded-md border border-border bg-secondary p-3">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Cobro
              </span>

              <div className="flex gap-2 rounded-xl bg-surface p-1">
                <button
                  type="button"
                  aria-pressed={paymentStatus === 'PENDING'}
                  onClick={() => setPaymentStatus('PENDING')}
                  className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-bold transition-colors ${
                    paymentStatus === 'PENDING'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200'
                      : 'text-text-secondary hover:text-text'
                  }`}
                >
                  <AlertCircle size={16} aria-hidden="true" />
                  Pendiente
                </button>
                <button
                  type="button"
                  aria-pressed={paymentStatus === 'PAID'}
                  onClick={() => setPaymentStatus('PAID')}
                  className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-bold transition-colors ${
                    paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
                      : 'text-text-secondary hover:text-text'
                  }`}
                >
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Pagado
                </button>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="checkout-amount"
                  className="block text-[11px] font-bold uppercase tracking-wider text-text-muted"
                >
                  Monto de la sesión
                </label>
                {/* Un "$" fijo junto al badge de moneda del perfil pintaba
                    "$ 50000 COP": dos símbolos monetarios contradiciéndose. La
                    moneda real es la del perfil y se muestra una sola vez. */}
                <div className="relative">
                  <input
                    id="checkout-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="min-h-11 w-full rounded-xl border border-border bg-surface pl-3.5 pr-16 text-base font-bold text-text outline-none transition-colors focus:border-kanji-deep focus:ring-2 focus:ring-kio/50 dark:focus:border-kio"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-text-muted">
                    {currency}
                  </span>
                </div>
              </div>

              {paymentStatus === 'PAID' && (
                <div className="space-y-1.5">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Método de pago
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        ['CASH', 'Efectivo', Banknote],
                        ['CARD', 'Tarjeta', CreditCard],
                        ['TRANSFER', 'Transferencia', ArrowLeftRight],
                      ] as const
                    ).map(([value, label, Icon]) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={method === value}
                        onClick={() => setMethod(value)}
                        className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[11px] font-bold transition-colors ${
                          method === value
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                            : 'border-border bg-surface text-text-secondary hover:bg-secondary hover:text-text'
                        }`}
                      >
                        <Icon size={16} aria-hidden="true" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <label className="flex min-h-11 cursor-pointer select-none items-center gap-3">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="size-4 rounded-xs border-border accent-kio"
              />
              <span className="flex items-center gap-1.5 text-sm font-medium text-text-secondary">
                <Mail size={16} aria-hidden="true" />
                Enviar resumen por correo
              </span>
            </label>
          </form>
        </div>

        {/* ── Cierre ── */}
        <div className="shrink-0 border-t border-border px-6 py-4">
          <button
            type="submit"
            form="checkout-form"
            disabled={mutation.isPending}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all duration-150 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60"
          >
            {mutation.isPending ? (
              <Loader2 size={18} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
            ) : (
              <>
                <CheckCircle2 size={18} aria-hidden="true" />
                Cerrar la sesión
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
