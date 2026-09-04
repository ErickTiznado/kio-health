import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../stores/auth.store';
import { X, CreditCard, FileText, Clock, Stethoscope, ClipboardList, Calendar, Edit2, Ban, ExternalLink } from 'lucide-react';
import { format, parseISO, formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Appointment, NoteContent } from '../../../types/appointments.types';
import type { TimelineResponse } from '../../../types/patients.types';
import { api } from '../../../lib/api';
import { cancelAppointmentSeries } from '../../../lib/appointments.api';
import { getErrorMessage } from '../../../lib/errors';
import { WidgetError } from '../../../components/widgets/WidgetError';

import { useState } from 'react';

import { PaymentModal } from './PaymentModal';
import { ScheduleAppointmentModal } from './ScheduleAppointmentModal';

interface AppointmentDrawerProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (id: string, date: Date, duration?: number) => void;
  onCancel: (id: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  CONSULTATION: 'Consulta',
  EVALUATION: 'Evaluación',
  FOLLOW_UP: 'Seguimiento',
};

const STATUS_CONFIG: Record<string, { label: string; className: string; dotColor: string }> = {
  SCHEDULED: { label: 'Agendada', className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200', dotColor: 'bg-purple-500' },
  COMPLETED: { label: 'Completada', className: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200', dotColor: 'bg-emerald-500' },
  CANCELLED: { label: 'Cancelada', className: 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300', dotColor: 'bg-gray-500' },
  NO_SHOW: { label: 'No asistió', className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200', dotColor: 'bg-amber-500' },
};

/**
 * Slide-over drawer showing full appointment details.
 * Opens from the right with backdrop overlay.
 * Includes patient info, history, payment, and CTA to start session.
 */
export function AppointmentDrawer({ appointment, isOpen, onClose, onReschedule, onCancel }: AppointmentDrawerProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const currency = useAuthStore((s) => s.user?.profile?.currency ?? 'USD');

  const cancelSeriesMutation = useMutation({
    mutationFn: cancelAppointmentSeries,
    onSuccess: (result) => {
      toast.success(`Serie cancelada: ${result.cancelled} sesiones futuras liberadas`);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onClose();
    },
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, 'Error al cancelar la serie')),
  });

  const assignScaleMutation = useMutation({
    mutationFn: (scaleType: 'PHQ9' | 'GAD7') =>
      api.post(`/appointments/${appointment!.id}/scale-assignments`, { scaleType }),
    onSuccess: () => toast.success('Cuestionario enviado al paciente por correo'),
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, 'No se pudo enviar el cuestionario')),
  });

  // Fetch recent history for this patient (last 4, then exclude current appointment)
  const {
    data: recentHistory = [],
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['appointment-drawer-history', appointment?.patientId],
    queryFn: async () => {
      const { data } = await api.get<TimelineResponse>(`/patients/${appointment!.patientId}/timeline`, {
        params: { page: 1, limit: 4 },
      });
      return data.data
        .filter((item) => item.id !== appointment!.id)
        .slice(0, 3)
        .map((item) => {
          const noteContent = item.psychNote?.content as NoteContent | undefined;
          return {
            id: item.id,
            date: item.startTime,
            summary:
              item.psychNote
                ? (typeof noteContent?.s === 'string'
                    ? noteContent.s
                    : typeof noteContent?.body === 'string'
                    ? noteContent.body
                    : item.reason ?? 'Sin detalles')
                : (item.reason ?? 'Sin detalles'),
            tags: item.psychNote?.tags ?? [],
            tagColor: 'bg-kio/10 dark:bg-kio/20 text-kanji-deep dark:text-kio',
          };
        });
    },
    enabled: isOpen && !!appointment?.patientId,
    staleTime: 60_000,
  });

  // Derived state for display
  const amount = Number(appointment?.price) || 0;

  if (!appointment) return null;

  const startDate = parseISO(appointment.startTime);
  const endDate = parseISO(appointment.endTime);
  const initials = appointment.patient.fullName
    .split(' ')
    .slice(0, 2)
    .map((word: string) => word[0])
    .join('')
    .toUpperCase();

  const statusInfo = STATUS_CONFIG[appointment.status] ?? STATUS_CONFIG.SCHEDULED;
  const typeLabel = TYPE_LABELS[appointment.type] ?? appointment.type;

  // Relative time context
  const relativeTime = formatDistanceToNowStrict(startDate, { addSuffix: true, locale: es });
  const isFuture = startDate > new Date();
  // `kanji-deep` y no `kanji`: sobre el velo lavanda claro, `kanji` se queda en
  // ~3.7:1 y este badge es de 11px. `kanji-deep` cruza AA sin cambiar de familia.
  const timeBadgeColor = isFuture ? 'bg-kio-light/20 dark:bg-kio/20 text-kanji-deep dark:text-kio' : 'bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-slate-400';

  const handleStartSession = () => {
    onClose();
    navigate(`/session/${appointment.id}`);
  };

  const handleCancelClick = () => {
    const isSeries = Boolean(appointment.seriesId);
    toast.custom((t) => (
      <div className="bg-surface dark:bg-slate-800 p-5 rounded-[24px] shadow-2xl border border-red-100 dark:border-red-900/30 flex flex-col gap-4 w-[360px] animate-in fade-in slide-in-from-top-5 duration-300">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 shrink-0">
            <Ban size={24} aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-bold text-kanji-deep dark:text-white text-lg leading-tight">
              {isSeries ? '¿Cancelar cita recurrente?' : '¿Cancelar cita?'}
            </h3>
            {/* Sin `opacity-70`: el texto que explica una acción irreversible no
                puede quedar por debajo de AA. */}
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              {isSeries
                ? 'Esta sesión pertenece a una serie. Puedes cancelar solo esta sesión o esta y todas las siguientes.'
                : 'Esta acción es irreversible. El horario quedará libre y se notificará al paciente.'}
            </p>
          </div>
        </div>
        <div className={`flex ${isSeries ? 'flex-col' : ''} gap-3 pt-2`}>
          {isSeries ? (
            <>
              <button
                onClick={() => {
                  onCancel(appointment.id);
                  toast.dismiss(t);
                }}
                className="w-full min-h-11 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-all active:scale-95"
              >
                Solo esta sesión
              </button>
              <button
                onClick={() => {
                  cancelSeriesMutation.mutate(appointment.seriesId!);
                  toast.dismiss(t);
                }}
                className="w-full min-h-11 px-4 rounded-xl text-sm font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
              >
                Esta y las siguientes
              </button>
              <button
                onClick={() => toast.dismiss(t)}
                className="w-full min-h-11 px-4 rounded-xl text-sm font-bold text-kanji-deep dark:text-kio hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                No, volver
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => toast.dismiss(t)}
                className="flex-1 min-h-11 px-4 rounded-xl text-sm font-bold text-kanji-deep dark:text-kio hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                No, volver
              </button>
              <button
                onClick={() => {
                  onCancel(appointment.id);
                  toast.dismiss(t);
                }}
                className="flex-1 min-h-11 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-all active:scale-95"
              >
                Sí, cancelar
              </button>
            </>
          )}
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' }); // Persistent until interaction, center screen
  };

  return (
    <>
      {/* Overlay — el velo neutro del sistema (`gray-900/40` / `black/60`), no
          un lavado púrpura a pantalla completa: el acento se reserva. Es, junto
          al omnibox, uno de los dos sitios donde el blur está permitido. */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${isOpen ? 'bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
        role="presentation"
      />

      {/* Drawer Panel — superficie opaca, sin `backdrop-blur`: el blur vive en
          el overlay, no en el panel que se lee encima. */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-surface dark:bg-slate-900 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header — Patient Hero */}
        <div className="relative px-6 pt-6 pb-5 bg-surface dark:bg-slate-900">
          {/* Header Actions (Secondary) */}
          <div className="absolute top-4 right-4 flex items-center gap-1">
            {/* `aria-label` y no solo `title`: en táctil y con lector de
                pantalla el tooltip no existe. 44px reales de área táctil. */}
            <button
              type="button"
              aria-label="Editar cita"
              title="Editar cita"
              className="min-h-11 min-w-11 grid place-items-center rounded-xl hover:bg-kio-light/20 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 hover:text-kanji-deep dark:hover:text-kio transition-colors"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit2 size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Reagendar cita"
              title="Reagendar cita"
              className="min-h-11 min-w-11 grid place-items-center rounded-xl hover:bg-kio-light/20 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 hover:text-kanji-deep dark:hover:text-kio transition-colors"
              onClick={() => setIsRescheduleModalOpen(true)}
            >
              <Calendar size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Cancelar cita"
              title="Cancelar cita"
              className="min-h-11 min-w-11 grid place-items-center rounded-xl hover:bg-kio-light/20 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 hover:text-kanji-deep dark:hover:text-kio transition-colors"
              onClick={handleCancelClick}
            >
              <Ban size={16} aria-hidden="true" />
            </button>
            <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1" aria-hidden="true" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar el detalle de la cita"
              className="min-h-11 min-w-11 grid place-items-center rounded-xl hover:bg-kio-light/20 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 hover:text-kanji-deep dark:hover:text-kio transition-colors"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center gap-4 mt-6">
            {/* Deep Linking Avatar */}
            <Link
              to={`/patients/${appointment.patientId}`}
              aria-label={`Abrir la ficha de ${appointment.patient.fullName}`}
              className="w-16 h-16 bg-kanji-deep dark:bg-kio rounded-[20px] flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all"
            >
              <span className="text-white dark:text-slate-900 font-bold text-xl relative z-10">{initials}</span>
              {/* Hover indication */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20" aria-hidden="true">
                <ExternalLink size={16} aria-hidden="true" className="text-white dark:text-slate-900" />
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              {/* Deep Linking Name */}
              <Link
                to={`/patients/${appointment.patientId}`}
                className="group flex items-center gap-2"
              >
                {/* El hover subraya en vez de aclarar el tono: pasar de
                    `kanji-deep` a `kanji` bajaba este nombre a 3.88:1, y a
                    `text-lg` (18px) AA todavía pide 4.5:1 — el umbral de texto
                    grande empieza en 18.66px en negrita. Mismo gesto que el
                    enlace «Ver todo» de este mismo cajón. */}
                <p className="text-lg font-bold text-kanji-deep dark:text-white truncate group-hover:underline dark:group-hover:text-kio transition-colors">
                  {appointment.patient.fullName}
                </p>
                <ExternalLink size={12} aria-hidden="true" className="text-gray-500 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md ${statusInfo.className} border border-transparent`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
                  {statusInfo.label}
                </span>
                {appointment.status === 'CANCELLED' && appointment.cancelledBy === 'PATIENT' && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 border border-transparent">
                    Cancelada por paciente
                  </span>
                )}
                {appointment.status === 'SCHEDULED' && appointment.rescheduleRequestedAt && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-kio/10 dark:bg-kio/20 text-kanji-deep dark:text-kio border border-transparent">
                    Solicita reprogramar
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Time & Type Card */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 space-y-3 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-kanji/10 dark:bg-kio/20 flex items-center justify-center text-kanji-deep dark:text-kio">
                <Clock size={16} aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider">Horario</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-kanji-deep dark:text-white">
                    {format(startDate, 'HH:mm')} — {format(endDate, 'HH:mm')}
                  </p>
                  {/* Relative Time Context */}
                  <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${timeBadgeColor}`}>
                    {relativeTime}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-kanji/10 dark:bg-kio/20 flex items-center justify-center text-kanji-deep dark:text-kio">
                <Stethoscope size={16} aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider">Tipo</p>
                <p className="text-sm font-semibold text-kanji-deep dark:text-white">{typeLabel}</p>
              </div>
            </div>
          </div>

          {/* Cuestionario pre-sesión (portal del paciente) */}
          {appointment.status === 'SCHEDULED' && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList size={14} className="text-gray-600 dark:text-slate-400" aria-hidden="true" />
                <p className="text-[11px] font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                  Cuestionario pre-sesión
                </p>
              </div>
              {/* En claro el hover lo marca el borde: teñir el texto de `kanji`
                  dejaba estas etiquetas de 12px en 3.88:1. */}
              <div className="flex gap-2">
                {(['PHQ9', 'GAD7'] as const).map((scaleType) => (
                  <button
                    key={scaleType}
                    type="button"
                    disabled={assignScaleMutation.isPending}
                    onClick={() => assignScaleMutation.mutate(scaleType)}
                    className="flex-1 min-h-11 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold text-kanji-deep dark:text-slate-300 hover:border-kanji dark:hover:text-kio transition-colors disabled:opacity-60"
                  >
                    Enviar {scaleType === 'PHQ9' ? 'PHQ-9' : 'GAD-7'}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-600 dark:text-slate-400 mt-1.5">
                El paciente lo responde desde su correo antes de la sesión.
              </p>
            </div>
          )}

          {/* Reason */}
          {appointment.reason && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={14} className="text-gray-600 dark:text-slate-400" aria-hidden="true" />
                <p className="text-[11px] font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider">Motivo de consulta</p>
              </div>
              <div className="pl-6 relative">
                <div className="absolute left-[3px] top-1 bottom-1 w-0.5 bg-gray-200 dark:bg-slate-700 rounded-full" />
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed pl-4 py-1">
                  {appointment.reason}
                </p>
              </div>
            </div>
          )}

          {/* History (F-Pattern Scannability) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ClipboardList size={14} className="text-gray-600 dark:text-slate-400" aria-hidden="true" />
                <p className="text-[11px] font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider">Historial reciente</p>
              </div>
              {recentHistory.length > 0 && (
                <Link
                  to={`/patients/${appointment.patientId}?tab=history`}
                  onClick={onClose}
                  className="inline-flex min-h-11 items-center gap-1 text-[11px] font-bold text-kanji-deep dark:text-kio hover:underline"
                >
                  Ver todo
                  <ExternalLink size={13} aria-hidden="true" />
                </Link>
              )}
            </div>

            <div className="pl-6">
              {/* Error y carga ANTES que el vacío: "no tiene historial clínico
                  previo" es una afirmación sobre el expediente de un paciente y
                  no se puede sostener con una petición fallida o en vuelo. */}
              {isHistoryError ? (
                <WidgetError
                  what="el historial reciente de este paciente"
                  onRetry={() => { void refetchHistory(); }}
                />
              ) : isHistoryLoading ? (
                <div className="space-y-3" role="status" aria-live="polite">
                  <span className="sr-only">Cargando el historial reciente</span>
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-xl bg-cruz/40 dark:bg-slate-800"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              ) : recentHistory.length === 0 ? (
                <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 border border-dashed border-gray-200 dark:border-slate-700 text-center">
                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Primera sesión</p>
                  <p className="text-[11px] text-gray-600 dark:text-slate-400 mb-3">Este paciente no tiene historial clínico previo.</p>
                  <Link
                    to={`/patients/${appointment.patientId}?tab=profile`}
                    className="text-xs font-bold text-kanji-deep dark:text-kio inline-flex min-h-11 items-center justify-center gap-1.5 mx-auto hover:bg-kanji/5 dark:hover:bg-kio/10 px-3 rounded-lg transition-colors"
                  >
                    <FileText size={12} aria-hidden="true" />
                    Ver cuestionario de admisión
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentHistory.map((note) => (
                    <div key={note.id} className="group relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full border-[2px] border-white dark:border-slate-900 ring-1 ring-gray-200 dark:ring-slate-700 bg-gray-200 dark:bg-slate-700 group-hover:bg-kanji dark:group-hover:bg-kio group-hover:ring-kanji/30 dark:group-hover:ring-kio/30 transition-colors z-10" />
                      {/* Timeline line */}
                      <div className="absolute -left-[23px] top-3.5 bottom-[-14px] w-px bg-gray-200 dark:bg-slate-700 group-last:hidden" />

                      <div className="bg-surface dark:bg-slate-800 rounded-xl p-3 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-kanji/20 dark:hover:border-kio/20 transition-all cursor-default">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[11px] font-bold text-gray-600 dark:text-slate-400">
                            {format(parseISO(note.date), "d 'de' MMM", { locale: es })}
                          </p>
                          <div className="flex gap-1">
                            {note.tags.map(tag => (
                              <span key={tag} className={`text-[11px] font-bold px-1.5 py-0.5 rounded-xs ${note.tagColor}`}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                          {note.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visual Separation: Administrative/Financial Block (Proximity Law) */}
        <div className="bg-gray-50/80 dark:bg-slate-900/80 border-t border-gray-200 dark:border-slate-700 p-6 space-y-4">
          {/* Payment Actionable (Fitts's Law) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={14} className="text-gray-600 dark:text-slate-400" aria-hidden="true" />
              <p className="text-[11px] font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider">Estado del pago</p>
            </div>
            <div className="flex items-center justify-between bg-surface dark:bg-slate-800 rounded-xl p-3 border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex flex-col">
                <p className="text-sm font-bold text-kanji-deep dark:text-white">${amount} {currency}</p>
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md w-fit mt-1 ${appointment.paymentStatus === 'PAID'
                  ? 'bg-kio-light/40 dark:bg-kio/20 text-kanji-deep dark:text-kio'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                  }`}>
                  {appointment.paymentStatus === 'PAID' ? 'PAGADO' : 'PENDIENTE'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-4 min-h-11 bg-kanji-deep hover:bg-kanji-deep/90 dark:bg-kio dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <CreditCard size={14} aria-hidden="true" />
                Gestionar
              </button>

              <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                appointment={appointment}
              />
            </div>
          </div>

          {/* Footer CTA — Status-Aware.
              Sin el barrido de brillo en degradado: el sistema solo admite dos
              gradientes (avatar y deck del dashboard). Y sin `shadow-lg` en
              reposo: la sombra describe estado, no altura.

              El hover de los sólidos de marca es `kanji-deep/90` (5.8:1 con
              blanco) y no `kanji`: DESIGN.md fija `kanji-deep` justamente
              porque `kanji` se queda en 3.88:1, y el hover no está exento de
              AA. Es el mismo hover que usa el CTA del shell
              (`DashboardLayout.tsx`), así que la agenda no se desalinea. */}
          {appointment.status === 'SCHEDULED' && (
            <button
              type="button"
              onClick={handleStartSession}
              className="w-full bg-kanji-deep hover:bg-kanji-deep/90 dark:bg-kio dark:hover:bg-white text-white dark:text-slate-900 py-4 rounded-[16px] font-bold text-base flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Stethoscope size={20} className="stroke-[2.5px]" aria-hidden="true" />
              Iniciar sesión clínica
            </button>
          )}

          {appointment.status === 'IN_PROGRESS' && (
            <button
              type="button"
              onClick={handleStartSession}
              className="w-full bg-kanji-deep hover:bg-kanji-deep/90 dark:bg-kio dark:hover:bg-white text-white dark:text-slate-900 py-4 rounded-[16px] font-bold text-base flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Stethoscope size={20} className="stroke-[2.5px]" aria-hidden="true" />
              Continuar sesión
            </button>
          )}

          {appointment.status === 'COMPLETED' && (
            <button
              type="button"
              onClick={handleStartSession}
              className="w-full bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-900 py-4 rounded-[16px] font-bold text-base flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <FileText size={20} className="stroke-[2.5px]" aria-hidden="true" />
              Ver notas de sesión
            </button>
          )}
        </div>
      </aside>

      {/* Reschedule Modal (Reused) */}
      <ScheduleAppointmentModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        initialDate={startDate}
        onConfirm={(newDate, duration) => {
          onReschedule(appointment.id, newDate, duration);
          setIsRescheduleModalOpen(false);
        }}
        isRescheduleMode={true}
      />

      {/* Edit Modal */}
      <ScheduleAppointmentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialDate={null}
        isEditMode={true}
        initialData={{
          id: appointment.id,
          type: appointment.type,
          reason: appointment.reason,
          price: String(appointment.price ?? ''),
        }}
      />
    </>
  );
}
