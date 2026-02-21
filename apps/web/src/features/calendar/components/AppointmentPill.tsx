import { MapPin, Banknote, Calendar } from 'lucide-react';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import type { Appointment } from '../../../types/appointments.types';

interface AppointmentPillProps {
  appointment: Appointment;
  onSelect: (appointment: Appointment) => void;
  onQuickPay?: (appointment: Appointment) => void;
  onQuickReschedule?: (appointment: Appointment) => void;
}

const GRID_START_HOUR = 8;
const HOUR_HEIGHT_PX = 80;

const STATUS_BORDER_COLORS: Record<string, string> = {
  COMPLETED: 'border-l-emerald-500',
  IN_PROGRESS: 'border-l-teal-500',
  CANCELLED: 'border-l-red-400',
  NO_SHOW: 'border-l-orange-400',
  SCHEDULED: 'border-l-blue-500',
  PENDING: 'border-l-amber-500',
};

const STATUS_HOVER_BG: Record<string, string> = {
  COMPLETED: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20',
  IN_PROGRESS: 'hover:bg-teal-50/50 dark:hover:bg-teal-900/20',
  CANCELLED: 'hover:bg-red-50/30 dark:hover:bg-red-900/10',
  NO_SHOW: 'hover:bg-orange-50/30 dark:hover:bg-orange-900/10',
  SCHEDULED: 'hover:bg-blue-50/50 dark:hover:bg-blue-900/20',
  PENDING: 'hover:bg-amber-50/50 dark:hover:bg-amber-900/20',
};

function getStatusBorder(status: string, paymentStatus?: string | null) {
  if (paymentStatus === 'PAID') {
    return 'border-l-emerald-500';
  }
  if (paymentStatus === 'PENDING' && status === 'SCHEDULED') {
    return STATUS_BORDER_COLORS.PENDING;
  }
  return STATUS_BORDER_COLORS[status] || STATUS_BORDER_COLORS.SCHEDULED;
}

function getStatusHoverBg(status: string, paymentStatus?: string | null) {
  if (paymentStatus === 'PENDING' && status === 'SCHEDULED') {
    return STATUS_HOVER_BG.PENDING;
  }
  return STATUS_HOVER_BG[status] || STATUS_HOVER_BG.SCHEDULED;
}

/**
 * Appointment Card component with semantic border and clean layout.
 */
export function AppointmentPill({ appointment, onSelect, onQuickPay, onQuickReschedule }: AppointmentPillProps) {
  const startDate = parseISO(appointment.startTime.replace(' ', 'T'));
  const endDate = parseISO(appointment.endTime.replace(' ', 'T'));

  const startOffsetMinutes = (startDate.getHours() - GRID_START_HOUR) * 60 + startDate.getMinutes();
  const durationMinutes = differenceInMinutes(endDate, startDate);

  const topPx = (startOffsetMinutes / 60) * HOUR_HEIGHT_PX;
  const heightPx = (durationMinutes / 60) * HOUR_HEIGHT_PX;

  const isShort = heightPx < 60;

  // Determine border color based on status
  const paymentStatus = appointment.paymentStatus;
  const borderClass = getStatusBorder(appointment.status, paymentStatus);
  const hoverBgClass = getStatusHoverBg(appointment.status, paymentStatus);

  const firstName = appointment.patient.fullName;

  const showMoneyIcon = paymentStatus === 'PENDING';
  const isInactive = appointment.status === 'CANCELLED' || appointment.status === 'NO_SHOW';
  const isInProgress = appointment.status === 'IN_PROGRESS';
  const isDraggable = appointment.status === 'SCHEDULED';

  const handleDragStart = (e: React.DragEvent) => {
    if (!isDraggable) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', JSON.stringify({
      id: appointment.id,
      durationMinutes
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      className={`absolute left-1.5 right-1.5 rounded-md border-l-4 ${borderClass} ${isInactive ? 'bg-gray-50 dark:bg-slate-800/50 opacity-60' : 'bg-white dark:bg-slate-800'} ${hoverBgClass} px-2 py-1.5 text-left shadow-[0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-none transition-all duration-200 hover:shadow-md dark:hover:shadow-none hover:-translate-y-0.5 group overflow-hidden flex flex-col z-20 hover:z-30 pointer-events-auto ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
      style={{ top: `${topPx}px`, height: `${heightPx}px`, minHeight: '32px' }}
      onClick={(e) => {
        // Prevent click when dragging
        if (e.defaultPrevented) return;
        onSelect(appointment);
      }}
    >
      {isShort ? (
        // Short Appointment Layout (Single Line)
        <div className="flex items-center gap-2 h-full">
          <span className="text-xs text-gray-500 dark:text-slate-400 font-medium whitespace-nowrap">
            {format(startDate, 'HH:mm')}
          </span>
          <span className={`text-sm font-bold truncate flex-1 ${isInactive ? 'text-gray-400 dark:text-slate-500 line-through' : 'text-gray-900 dark:text-white'}`}>
            {firstName}
          </span>
          {isInProgress && <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shrink-0" />}
          {showMoneyIcon && (
            <Banknote size={12} className="text-amber-500 shrink-0" />
          )}
        </div>
      ) : (
        // Standard Appointment Layout
        <>
          {/* Header: Time and Context Icon */}
          <div className="flex justify-between items-start mb-0.5">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
              {/* Always show MapPin as all appointments are in-person */}
              <MapPin size={14} strokeWidth={2} />
              <span className="text-xs font-medium">
                {format(startDate, 'HH:mm')}
              </span>
              {showMoneyIcon && (
                <Banknote size={14} className="text-amber-500 shrink-0 ml-1" />
              )}
            </div>

            {/* Hover Menu Icons */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm -mr-1 -mt-0.5 rounded-md relative z-10">
              {onQuickPay && !isInactive && (
                <button
                  type="button"
                  title="Registrar Pago"
                  className="p-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickPay(appointment);
                  }}
                >
                  <Banknote size={14} />
                </button>
              )}
              {onQuickReschedule && isDraggable && (
                <button
                  type="button"
                  title="Reagendar"
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 text-kanji/60 dark:text-slate-400 hover:text-kanji dark:hover:text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickReschedule(appointment);
                  }}
                >
                  <Calendar size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Patient Name */}
          <div className="flex items-center gap-1.5">
            {isInProgress && <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shrink-0" />}
            <p className={`text-sm font-bold truncate leading-tight ${isInactive ? 'text-gray-400 dark:text-slate-500 line-through' : 'text-gray-900 dark:text-white'}`}>
              {firstName}
            </p>
          </div>

          {/* Reason / Treatment */}
          {appointment.reason ? (
            <p className="text-xs text-gray-700 dark:text-slate-300 truncate mt-0.5 font-normal">
              {appointment.reason}
            </p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-slate-500 truncate mt-0.5 italic">
              Consulta General
            </p>
          )}
        </>
      )}
    </div>
  );
}

