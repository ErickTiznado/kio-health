import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import type { AgendaAppointment } from '../../types/agenda.types';

interface AppointmentPillProps {
  appointment: AgendaAppointment;
  onSelect: (appointment: AgendaAppointment) => void;
}

const GRID_START_HOUR = 8;
const HOUR_HEIGHT_PX = 80;

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-purple-50 hover:bg-purple-100',
  COMPLETED: 'bg-emerald-50 hover:bg-emerald-100',
  CANCELLED: 'bg-gray-50 hover:bg-gray-100 opacity-60',
  NO_SHOW: 'bg-amber-50 hover:bg-amber-100',
};

const TYPE_BORDER: Record<string, string> = {
  CONSULTATION: 'border-l-kanji',
  EVALUATION: 'border-l-blue-500',
  FOLLOW_UP: 'border-l-emerald-500',
};

function StatusIcon({ status }: { status: string }) {
  if (status === 'COMPLETED') return <CheckCircle2 size={12} className="text-emerald-500" />;
  if (status === 'CANCELLED') return <AlertCircle size={12} className="text-gray-400" />;
  return <Clock size={12} className="text-kanji" />;
}

/**
 * Renders a single appointment positioned absolutely within its day column.
 * Position and height derived from start/end times vs the 08:00 grid origin.
 */
export function AppointmentPill({ appointment, onSelect }: AppointmentPillProps) {
  const startDate = parseISO(appointment.startTime);
  const endDate = parseISO(appointment.endTime);

  const startOffsetMinutes = (startDate.getHours() - GRID_START_HOUR) * 60 + startDate.getMinutes();
  const durationMinutes = differenceInMinutes(endDate, startDate);

  const topPx = (startOffsetMinutes / 60) * HOUR_HEIGHT_PX;
  const heightPx = (durationMinutes / 60) * HOUR_HEIGHT_PX;

  const statusClass = STATUS_STYLES[appointment.status] ?? STATUS_STYLES.SCHEDULED;
  const borderClass = TYPE_BORDER[appointment.type] ?? TYPE_BORDER.CONSULTATION;

  const firstName = appointment.patient.fullName.split(' ')[0];

  return (
    <button
      type="button"
      onClick={() => onSelect(appointment)}
      className={`absolute left-1.5 right-1.5 rounded-xl border-l-4 ${borderClass} ${statusClass} px-2 py-1 text-left cursor-pointer shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden group`}
      style={{ top: `${topPx}px`, height: `${heightPx}px`, minHeight: '28px' }}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <span className="text-xs text-gray-400 font-medium">
          {format(startDate, 'hh:mm a')}
        </span>
        <StatusIcon status={appointment.status} />
      </div>
      <p className="text-sm font-bold text-gray-800 truncate leading-tight">
        {firstName}
      </p>
      {heightPx > 50 && (
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {appointment.reason}
        </p>
      )}
    </button>
  );
}
