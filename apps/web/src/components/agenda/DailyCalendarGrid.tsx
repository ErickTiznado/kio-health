import { useMemo, useState, useEffect } from 'react';
import { format, isToday, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment } from '../../types/appointments.types';
import { AppointmentPill } from './AppointmentPill';
import { CurrentTimeLine } from './CurrentTimeLine';

interface DailyCalendarGridProps {
  selectedDay: Date;
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
}

const GRID_START_HOUR = 8;
const GRID_END_HOUR = 20;
const HOUR_HEIGHT_PX = 80;
const HOUR_COLUMN_WIDTH = '80px';
const TOTAL_HOURS = GRID_END_HOUR - GRID_START_HOUR;

function formatHourLabel(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:00 ${suffix}`;
}

/**
 * Daily calendar grid — single-column view showing all hours for one day.
 * Reuses AppointmentPill and CurrentTimeLine from the weekly view.
 */
export function DailyCalendarGrid({ selectedDay, appointments, onSelectAppointment }: DailyCalendarGridProps) {
  const [pastTimeHeight, setPastTimeHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const offsetHours = currentHour - GRID_START_HOUR + currentMinute / 60;
      setPastTimeHeight(Math.max(0, offsetHours * HOUR_HEIGHT_PX));
    };

    updateHeight();
    const interval = setInterval(updateHeight, 60_000);
    return () => clearInterval(interval);
  }, []);

  const hourSlots = useMemo(() => {
    return Array.from({ length: TOTAL_HOURS }, (_, index) => GRID_START_HOUR + index);
  }, []);

  const dayAppointments = useMemo(() => {
    return appointments.filter((appointment) =>
      isSameDay(parseISO(appointment.startTime), selectedDay)
    );
  }, [appointments, selectedDay]);

  const isDayToday = isToday(selectedDay);

  return (
    <div className="bg-white border-t border-gray-100 overflow-hidden h-full flex flex-col">
      {/* Day Header */}
      <div
        className="grid border-b border-gray-200"
        style={{ gridTemplateColumns: `${HOUR_COLUMN_WIDTH} 1fr` }}
      >
        <div className="p-3 border-r border-gray-100" />
        <div className="py-3 px-4 flex items-center gap-3">
          <div
            className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold transition-colors ${isDayToday
                ? 'bg-kanji text-white shadow-md'
                : 'text-gray-700 bg-gray-50'
              }`}
          >
            {format(selectedDay, 'd')}
          </div>
          <div>
            <p className="text-base font-bold text-gray-800 capitalize">
              {format(selectedDay, 'EEEE', { locale: es })}
            </p>
            <p className="text-sm text-gray-400">
              {format(selectedDay, "d 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
        </div>
      </div>

      {/* Time Grid Body */}
      <div className="relative overflow-y-auto flex-1 min-h-0 pt-3">
        <div
          className="grid"
          style={{ gridTemplateColumns: `${HOUR_COLUMN_WIDTH} 1fr` }}
        >
          {hourSlots.map((hour) => (
            <div key={`row-${hour}`} className="contents">
              {/* Hour Label */}
              <div
                className="pr-3 pt-0 text-right border-r border-dashed border-gray-100/60 flex items-start justify-end"
                style={{ height: `${HOUR_HEIGHT_PX}px` }}
              >
                <span className="text-xs font-medium text-gray-400 -mt-2 select-none">
                  {formatHourLabel(hour)}
                </span>
              </div>

              {/* Day Column for this hour */}
              <div
                className="border-b border-dashed border-gray-100/60 relative group hover:bg-gray-50/50 transition-colors cursor-pointer"
                style={{ height: `${HOUR_HEIGHT_PX}px` }}
                title={`Agendar cita a las ${formatHourLabel(hour)}`}
              >
                {/* Ghost Slot UI */}
                <div className="absolute inset-1 border-2 border-dashed border-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide bg-white/50 px-3 py-1.5 rounded-md backdrop-blur-sm">
                    + Agendar aquí
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Shading and Pills Layer */}
        <div
          className="absolute top-0 grid pointer-events-none"
          style={{
            gridTemplateColumns: `${HOUR_COLUMN_WIDTH} 1fr`,
            left: 0,
            right: 0,
            height: `${TOTAL_HOURS * HOUR_HEIGHT_PX}px`,
          }}
        >
          <div />
          <div className="relative pointer-events-none">
            {/* Past Time Shading */}
            {isDayToday && (
              <div
                className="absolute top-0 left-0 right-0 bg-gray-50/40 border-b border-gray-100/50 pointer-events-none z-0"
                style={{ height: `${pastTimeHeight}px` }}
              />
            )}

            {dayAppointments.map((appointment) => (
              <AppointmentPill
                key={appointment.id}
                appointment={appointment}
                onSelect={onSelectAppointment}
              />
            ))}
          </div>
        </div>

        {/* Current Time Line */}
        {isDayToday && (
          <div
            className="absolute top-0 pointer-events-none"
            style={{
              left: HOUR_COLUMN_WIDTH,
              right: 0,
              height: `${TOTAL_HOURS * HOUR_HEIGHT_PX}px`,
            }}
          >
            <CurrentTimeLine />
          </div>
        )}
      </div>
    </div>
  );
}

