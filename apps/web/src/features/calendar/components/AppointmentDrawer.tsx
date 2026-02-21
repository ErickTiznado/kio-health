import { useNavigate, Link } from 'react-router-dom';
import { X, CreditCard, FileText, Clock, Stethoscope, ClipboardList, Calendar, Edit2, Ban, ExternalLink } from 'lucide-react';
import { format, parseISO, formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import type { Appointment } from '../../../types/appointments.types';

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
  CANCELLED: { label: 'Cancelada', className: 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400', dotColor: 'bg-gray-400' },
  NO_SHOW: { label: 'No asistió', className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200', dotColor: 'bg-amber-500' },
};

/**
 * Slide-over drawer showing full appointment details.
 * Opens from the right with backdrop overlay.
 * Includes patient info, history, payment, and CTA to start session.
 */
export function AppointmentDrawer({ appointment, isOpen, onClose, onReschedule, onCancel }: AppointmentDrawerProps) {
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

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
  const timeBadgeColor = isFuture ? 'bg-kio-light/20 dark:bg-kio/20 text-kanji dark:text-kio' : 'bg-gray-100 dark:bg-slate-700/50 text-kanji/60 dark:text-slate-400';

  const handleStartSession = () => {
    onClose();
    navigate(`/session/${appointment.id}`);
  };

  const handleCancelClick = () => {
    toast.custom((t) => (
      <div className="bg-white dark:bg-slate-800 p-5 rounded-[24px] shadow-2xl border border-red-100 dark:border-red-900/30 flex flex-col gap-4 w-[360px] animate-in fade-in slide-in-from-top-5 duration-300">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 shrink-0">
            <Ban size={24} />
          </div>
          <div>
            <h3 className="font-bold text-kanji dark:text-white text-lg leading-tight">¿Cancelar cita?</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 opacity-70 mt-1.5 leading-relaxed">
              Esta acción es irreversible. El horario quedará libre y se notificará al paciente.
            </p>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => toast.dismiss(t)}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-kanji dark:text-kio hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            No, volver
          </button>
          <button
            onClick={() => {
              onCancel(appointment.id);
              toast.dismiss(t);
            }}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all active:scale-95"
          >
            Sí, cancelar
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' }); // Persistent until interaction, center screen
  };

  // Check for history empty state
  const history: Array<{ id: string; date: string; summary: string; tags: string[]; tagColor: string }> = [];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${isOpen ? 'bg-kanji/10 dark:bg-black/50 backdrop-blur-sm opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
        role="presentation"
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-[420px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header — Patient Hero */}
        <div className="relative px-6 pt-6 pb-5 bg-white dark:bg-slate-900">
          {/* Header Actions (Secondary) */}
          <div className="absolute top-4 right-4 flex items-center gap-1">
            <button
              type="button"
              title="Editar Cita"
              className="p-2 rounded-xl hover:bg-kio-light/20 dark:hover:bg-slate-800 text-kanji/60 dark:text-slate-400 hover:text-kio transition-colors"
              onClick={() => toast.info('Edición completa próximamente', { description: 'Utiliza "Reagendar" para cambiar la fecha.' })}
            >
              <Edit2 size={16} />
            </button>
            <button
              type="button"
              title="Reagendar"
              className="p-2 rounded-xl hover:bg-kio-light/20 dark:hover:bg-slate-800 text-kanji/60 dark:text-slate-400 hover:text-kanji dark:hover:text-kio transition-colors"
              onClick={() => setIsRescheduleModalOpen(true)}
            >
              <Calendar size={16} />
            </button>
            <button
              type="button"
              title="Cancelar Cita"
              className="p-2 rounded-xl hover:bg-kio-light/20 dark:hover:bg-slate-800 text-kanji/60 dark:text-slate-400 hover:text-kanji dark:hover:text-kio transition-colors"
              onClick={handleCancelClick}
            >
              <Ban size={16} />
            </button>
            <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1" />
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-kio-light/20 dark:hover:bg-slate-800 text-kanji/40 dark:text-slate-500 hover:text-kanji dark:hover:text-kio transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center gap-4 mt-6">
            {/* Deep Linking Avatar */}
            <Link
              to={`/patients/${appointment.patientId}`}
              className="w-16 h-16 bg-kanji dark:bg-kio rounded-[20px] flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all"
            >
              <span className="text-white dark:text-slate-900 font-bold text-xl relative z-10">{initials}</span>
              {/* Hover indication */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                <ExternalLink size={16} className="text-white dark:text-slate-900" />
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              {/* Deep Linking Name */}
              <Link
                to={`/patients/${appointment.patientId}`}
                className="group flex items-center gap-2"
              >
                <p className="text-lg font-bold text-kanji dark:text-white truncate group-hover:text-kio transition-colors">
                  {appointment.patient.fullName}
                </p>
                <ExternalLink size={12} className="text-kanji/40 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <div className="flex items-center gap-2 mt-2.5">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-md ${statusInfo.className} border border-transparent`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Time & Type Card */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 space-y-3 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-kanji/10 dark:bg-kio/20 flex items-center justify-center text-kanji dark:text-kio">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-kanji/60 dark:text-slate-400 uppercase tracking-widest">Horario</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-kanji dark:text-white">
                    {format(startDate, 'hh:mm a')} — {format(endDate, 'hh:mm a')}
                  </p>
                  {/* Relative Time Context */}
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${timeBadgeColor}`}>
                    {relativeTime}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-kanji/10 dark:bg-kio/20 flex items-center justify-center text-kanji dark:text-kio">
                <Stethoscope size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-kanji/60 dark:text-slate-400 uppercase tracking-widest">Tipo</p>
                <p className="text-sm font-semibold text-kanji dark:text-white">{typeLabel}</p>
              </div>
            </div>
          </div>

          {/* Reason */}
          {appointment.reason && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={14} className="text-kanji/60 dark:text-slate-400" />
                <p className="text-[10px] font-bold text-kanji/60 dark:text-slate-400 uppercase tracking-widest">Motivo de consulta</p>
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
                <ClipboardList size={14} className="text-kanji/60 dark:text-slate-400" />
                <p className="text-[10px] font-bold text-kanji/60 dark:text-slate-400 uppercase tracking-widest">Historial reciente</p>
              </div>
              {history.length > 0 && (
                <button className="text-[10px] font-bold text-kanji dark:text-kio hover:underline">Ver todo</button>
              )}
            </div>

            <div className="pl-6">
              {/* Empty State (Guidance) */}
              {history.length === 0 ? (
                <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 border border-dashed border-gray-200 dark:border-slate-700 text-center">
                  <p className="text-xs font-semibold text-kanji/80 dark:text-slate-300 mb-1">Primera sesión</p>
                  <p className="text-[10px] text-gray-500 dark:text-slate-500 mb-3">Este paciente no tiene historial clínico previo.</p>
                  <Link
                    to={`/patients/${appointment.patientId}`}
                    className="text-xs font-bold text-kanji dark:text-kio flex items-center justify-center gap-1.5 mx-auto hover:bg-kanji/5 dark:hover:bg-kio/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <FileText size={12} />
                    Ver cuestionario de admisión
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((note) => (
                    <div key={note.id} className="group relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full border-[2px] border-white dark:border-slate-900 ring-1 ring-gray-200 dark:ring-slate-700 bg-gray-200 dark:bg-slate-700 group-hover:bg-kanji dark:group-hover:bg-kio group-hover:ring-kanji/30 dark:group-hover:ring-kio/30 transition-colors z-10" />
                      {/* Timeline line */}
                      <div className="absolute -left-[23px] top-3.5 bottom-[-14px] w-px bg-gray-200 dark:bg-slate-700 group-last:hidden" />

                      <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-kanji/20 dark:hover:border-kio/20 transition-all cursor-default">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[10px] font-bold text-kanji/60 dark:text-slate-400">
                            {format(parseISO(note.date), "d 'de' MMM", { locale: es })}
                          </p>
                          <div className="flex gap-1">
                            {note.tags.map(tag => (
                              <span key={tag} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${note.tagColor}`}>
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
              <CreditCard size={14} className="text-kanji/60 dark:text-slate-400" />
              <p className="text-[10px] font-bold text-kanji/60 dark:text-slate-400 uppercase tracking-widest">Estado del Pago</p>
            </div>
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-3 border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex flex-col">
                <p className="text-sm font-bold text-kanji dark:text-white">${amount} MXN</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md w-fit mt-1 ${appointment.paymentStatus === 'PAID'
                  ? 'bg-kio-light/40 dark:bg-kio/20 text-kio'
                  : 'bg-gray-100 dark:bg-slate-700 text-kanji/80 dark:text-slate-300'
                  }`}>
                  {appointment.paymentStatus === 'PAID' ? 'PAGADO' : 'PENDIENTE'}
                </span>
              </div>

              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-4 py-2 bg-kanji dark:bg-kio text-white dark:text-slate-900 text-xs font-bold rounded-lg hover:bg-kio dark:hover:bg-white transition-colors flex items-center gap-1.5"
              >
                <CreditCard size={14} />
                Gestionar
              </button>

              <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                appointment={appointment}
              />
            </div>
          </div>

          {/* Footer CTA with Feedforward */}
          <button
            type="button"
            onClick={handleStartSession}
            className="w-full bg-kanji dark:bg-kio text-white dark:text-slate-900 py-4 rounded-[16px] font-bold text-base flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-md transition-all duration-200 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
            {/* Feedforward Icon based on probable action */}
            <Stethoscope size={20} className="stroke-[2.5px]" />
            Iniciar Sesión Clínica
          </button>
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
    </>
  );
}
