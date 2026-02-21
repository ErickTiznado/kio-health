import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment } from '../../../types/appointments.types';
import { AppointmentPill } from './AppointmentPill';

interface DailyCalendarGridProps {
  selectedDay: Date;
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onSlotClick: (date: Date) => void;
  onReschedule?: (appointmentId: string, newStartTime: Date) => void;
  onQuickPay?: (appointment: Appointment) => void;
  onQuickReschedule?: (appointment: Appointment) => void;
}

const GRID_START_HOUR = 8;
const GRID_END_HOUR = 20;
const TOTAL_HOURS = GRID_END_HOUR - GRID_START_HOUR;

export function DailyCalendarGrid({
  selectedDay,
  appointments,
  onSelectAppointment,
  onSlotClick,
  onQuickPay,
  onQuickReschedule
}: DailyCalendarGridProps) {
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => GRID_START_HOUR + i);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 font-bold border-b border-gray-200 dark:border-slate-800 text-center text-kanji dark:text-kio">
        {format(selectedDay, 'EEEE, d MMMM', { locale: es })}
      </div>
      <div className="relative flex-1">
        {hours.map(hour => {
          const hourDate = new Date(selectedDay);
          hourDate.setHours(hour, 0, 0, 0);

          const slotAppointments = appointments.filter(a => {
            const d = new Date(a.startTime);
            return d.getDate() === selectedDay.getDate() &&
              d.getMonth() === selectedDay.getMonth() &&
              d.getFullYear() === selectedDay.getFullYear() &&
              d.getHours() === hour;
          });

          return (
            <div key={hour} className="flex border-b border-gray-200 dark:border-slate-800 min-h-[5rem]">
              <div className="w-16 text-right pr-2 text-sm text-kanji/50 dark:text-kio/50 pt-2">
                {hour}:00
              </div>
              <div
                className="flex-1 p-1 hover:bg-kio-light/20 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                onClick={() => onSlotClick(hourDate)}
              >
                {slotAppointments.map(a => (
                  <div key={a.id} className="relative h-20 w-full mb-1">
                    <AppointmentPill
                      appointment={a}
                      onSelect={onSelectAppointment}
                      onQuickPay={onQuickPay}
                      onQuickReschedule={onQuickReschedule}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
