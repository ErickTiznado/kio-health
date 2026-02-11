import { useNavigate } from 'react-router-dom';
import { X, Play, CreditCard, FileText, Clock, Stethoscope, ClipboardList } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AgendaAppointment } from '../../types/agenda.types';

interface AppointmentDrawerProps {
  appointment: AgendaAppointment | null;
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

const PAYMENT_CONFIG: Record<string, { label: string; className: string; icon: string }> = {
  PENDING: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 border border-amber-200', icon: '⏳' },
  PAID: { label: 'Pagado', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: '✓' },
};

/** Mocked recent notes — replace with real data when API is ready. */
const MOCK_HISTORY = [
  { id: '1', date: '2026-02-03', summary: 'Paciente reporta mejoría en niveles de ansiedad. Se continúa con plan actual.' },
  { id: '2', date: '2026-01-27', summary: 'Primera sesión. Se establece línea base y objetivos terapéuticos.' },
];

/**
 * Slide-over drawer showing full appointment details.
 * Opens from the right with backdrop overlay.
 * Includes patient photo, history, payment, and CTA to start session.
 */
export function AppointmentDrawer({ appointment, isOpen, onClose }: AppointmentDrawerProps) {
  const navigate = useNavigate();

  if (!appointment) return null;

  const startDate = parseISO(appointment.startTime);
  const endDate = parseISO(appointment.endTime);
  const initials = appointment.patient.fullName
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  const statusInfo = STATUS_CONFIG[appointment.status] ?? STATUS_CONFIG.SCHEDULED;
  const paymentInfo = PAYMENT_CONFIG[appointment.paymentStatus] ?? PAYMENT_CONFIG.PENDING;
  const typeLabel = TYPE_LABELS[appointment.type] ?? appointment.type;

  const handleStartSession = () => {
    onClose();
    navigate(`/session/${appointment.id}`);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          isOpen ? 'bg-black/25 backdrop-blur-sm opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        role="presentation"
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-[420px] bg-white/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header — Patient Hero */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-kio/10 via-cruz/20 to-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/60 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4">
            {/* Large Avatar */}
            <div className="w-16 h-16 bg-gradient-to-br from-kio to-kanji rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
              <span className="text-white font-bold text-xl">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-gray-900 truncate">{appointment.patient.fullName}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                {format(startDate, "EEEE d 'de' MMMM", { locale: es })}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${statusInfo.className}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Time & Type Card */}
          <div className="bg-gray-50/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-kanji/10 flex items-center justify-center">
                <Clock size={16} className="text-kanji" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Horario</p>
                <p className="text-sm font-semibold text-gray-800">
                  {format(startDate, 'hh:mm a')} — {format(endDate, 'hh:mm a')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-kanji/10 flex items-center justify-center">
                <Stethoscope size={16} className="text-kanji" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipo</p>
                <p className="text-sm font-semibold text-gray-800">{typeLabel}</p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-gray-400" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Motivo de consulta</p>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed pl-6">
              {appointment.reason}
            </p>
          </div>

          {/* History */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList size={14} className="text-gray-400" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Historial reciente</p>
            </div>
            <div className="space-y-2.5 pl-6">
              {MOCK_HISTORY.map((note) => (
                <div key={note.id} className="bg-gray-50/80 rounded-xl p-3 border border-gray-100/60">
                  <p className="text-[10px] font-bold text-gray-400 mb-1">
                    {format(parseISO(note.date), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {note.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={14} className="text-gray-400" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pago</p>
            </div>
            <div className="flex items-center justify-between pl-6">
              <p className="text-sm font-semibold text-gray-800">${appointment.price} MXN</p>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${paymentInfo.className}`}>
                {paymentInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-5 border-t border-gray-100/60 bg-white/80 backdrop-blur-sm">
          <button
            type="button"
            onClick={handleStartSession}
            className="w-full bg-gradient-to-r from-kio to-kanji text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            style={{ boxShadow: '0 8px 30px rgba(138, 114, 209, 0.35)' }}
          >
            <Play fill="currentColor" size={18} />
            Iniciar Sesión Clínica
          </button>
        </div>
      </aside>
    </>
  );
}
