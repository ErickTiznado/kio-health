import { useNavigate, Link } from 'react-router-dom';
import { X, CreditCard, FileText, Clock, Stethoscope, ClipboardList, Calendar, Edit2, Ban, ExternalLink } from 'lucide-react';
import { format, parseISO, formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment } from '../../types/appointments.types';

import { useState } from 'react';

import { PaymentModal } from './PaymentModal';

interface AppointmentDrawerProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  CONSULTATION: 'Consulta',
  EVALUATION: 'Evaluación',
  FOLLOW_UP: 'Seguimiento',
};

const STATUS_CONFIG: Record<string, { label: string; className: string; dotColor: string }> = {
  SCHEDULED: { label: 'Agendada', className: 'bg-purple-100 text-purple-700', dotColor: 'bg-purple-500' },
  COMPLETED: { label: 'Completada', className: 'bg-emerald-100 text-emerald-700', dotColor: 'bg-emerald-500' },
  CANCELLED: { label: 'Cancelada', className: 'bg-gray-100 text-gray-600', dotColor: 'bg-gray-400' },
  NO_SHOW: { label: 'No asistió', className: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-500' },
};

/**
 * Slide-over drawer showing full appointment details.
 * Opens from the right with backdrop overlay.
 * Includes patient info, history, payment, and CTA to start session.
 */
export function AppointmentDrawer({ appointment, isOpen, onClose }: AppointmentDrawerProps) {
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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
  const timeBadgeColor = isFuture ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700';

  const handleStartSession = () => {
    onClose();
    navigate(`/session/${appointment.id}`);
  };

  // Check for history empty state
  const history: Array<{ id: string; date: string; summary: string; tags: string[]; tagColor: string }> = [];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${isOpen ? 'bg-black/25 backdrop-blur-sm opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
        role="presentation"
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-[420px] bg-white/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header — Patient Hero */}
        <div className="relative px-6 pt-6 pb-5 bg-[var(--color-bg)]">
          {/* Header Actions (Secondary) */}
          <div className="absolute top-4 right-4 flex items-center gap-1">
            <button
              type="button"
              title="Editar Cita"
              className="p-2 rounded-xl hover:bg-white/60 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Edit2 size={16} />
            </button>
            <button
              type="button"
              title="Reagendar"
              className="p-2 rounded-xl hover:bg-white/60 text-gray-500 hover:text-amber-600 transition-colors"
            >
              <Calendar size={16} />
            </button>
            <button
              type="button"
              title="Cancelar Cita"
              className="p-2 rounded-xl hover:bg-white/60 text-gray-500 hover:text-red-600 transition-colors"
            >
              <Ban size={16} />
            </button>
            <div className="w-px h-4 bg-gray-300 mx-1" />
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/60 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center gap-4 mt-6">
            {/* Deep Linking Avatar */}
            <Link
              to={`/patient/${appointment.patientId}`}
              className="w-16 h-16 bg-[var(--color-kanji)] rounded-[20px] flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all"
            >
              <span className="text-white font-bold text-xl relative z-10">{initials}</span>
              {/* Hover indication */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                <ExternalLink size={16} className="text-white" />
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              {/* Deep Linking Name */}
              <Link
                to={`/patient/${appointment.patientId}`}
                className="group flex items-center gap-2"
              >
                <p className="text-lg font-bold text-gray-900 truncate group-hover:text-[var(--color-kanji)] transition-colors">
                  {appointment.patient.fullName}
                </p>
                <ExternalLink size={12} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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
          <div className="bg-gray-50/80 rounded-2xl p-4 space-y-3 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-kanji/10 flex items-center justify-center text-kanji">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Horario</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800">
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
              <div className="w-9 h-9 rounded-xl bg-kanji/10 flex items-center justify-center text-kanji">
                <Stethoscope size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tipo</p>
                <p className="text-sm font-semibold text-gray-800">{typeLabel}</p>
              </div>
            </div>
          </div>

          {/* Reason */}
          {appointment.reason && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={14} className="text-gray-500" />
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Motivo de consulta</p>
              </div>
              <div className="pl-6 relative">
                <div className="absolute left-[3px] top-1 bottom-1 w-0.5 bg-gray-200 rounded-full" />
                <p className="text-sm text-gray-700 leading-relaxed pl-4 py-1">
                  {appointment.reason}
                </p>
              </div>
            </div>
          )}

          {/* History (F-Pattern Scannability) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ClipboardList size={14} className="text-gray-500" />
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Historial reciente</p>
              </div>
              {history.length > 0 && (
                <button className="text-[10px] font-bold text-kanji hover:underline">Ver todo</button>
              )}
            </div>

            <div className="pl-6">
              {/* Empty State (Guidance) */}
              {history.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200 text-center">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Primera sesión</p>
                  <p className="text-[10px] text-gray-400 mb-3">Este paciente no tiene historial clínico previo.</p>
                  <button className="text-xs font-bold text-kanji flex items-center justify-center gap-1.5 mx-auto hover:bg-kanji/5 px-3 py-1.5 rounded-lg transition-colors">
                    <FileText size={12} />
                    Ver cuestionario de admisión
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((note) => (
                    <div key={note.id} className="group relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full border-[2px] border-white ring-1 ring-gray-200 bg-gray-300 group-hover:bg-kanji group-hover:ring-kanji/30 transition-colors z-10" />
                      {/* Timeline line */}
                      <div className="absolute -left-[23px] top-3.5 bottom-[-14px] w-px bg-gray-200 group-last:hidden" />

                      <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md hover:border-kanji/20 transition-all cursor-default">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[10px] font-bold text-gray-500">
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
                        <p className="text-xs text-gray-600 leading-relaxed">
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
        <div className="bg-gray-50/50 border-t border-gray-100 p-6 space-y-4">
          {/* Payment Actionable (Fitts's Law) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={14} className="text-gray-500" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Estado del Pago</p>
            </div>
            <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
              <div className="flex flex-col">
                <p className="text-sm font-bold text-gray-800">${amount} MXN</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md w-fit mt-1 ${appointment.paymentStatus === 'PAID'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
                  }`}>
                  {appointment.paymentStatus === 'PAID' ? 'PAGADO' : 'PENDIENTE'}
                </span>
              </div>

              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5"
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
            className="w-full bg-[var(--color-kanji)] text-white py-4 rounded-[16px] font-bold text-base flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-md transition-all duration-200 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
            {/* Feedforward Icon based on probable action */}
            <Stethoscope fill="currentColor" size={18} />
            Iniciar Sesión Clínica
          </button>
        </div>
      </aside>
    </>
  );
}
