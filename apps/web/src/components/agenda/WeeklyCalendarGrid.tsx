import { useMemo, useState, useEffect } from 'react';
import { format, addDays, isToday, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment } from '../../types/appointments.types';
import { AppointmentPill } from './AppointmentPill';
import { CurrentTimeLine } from './CurrentTimeLine';

interface WeeklyCalendarGridProps {
  weekStart: Date;
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
}

const GRID_START_HOUR = 8;
const GRID_END_HOUR = 20;
const HOUR_HEIGHT_PX = 80;
const HOUR_COLUMN_WIDTH = '80px';
const TOTAL_HOURS = GRID_END_HOUR - GRID_START_HOUR;
const DAYS_IN_WEEK = 7;

function formatHourLabel(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:00 ${suffix}`;
}

/**
 * Weekly calendar CSS grid with hour rows, day columns,
 * positioned appointment pills, and a live current-time indicator.
 */
export function WeeklyCalendarGrid({ weekStart, appointments, onSelectAppointment }: WeeklyCalendarGridProps) {
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

  const weekDays = useMemo(() => {
    return Array.from({ length: DAYS_IN_WEEK }, (_, index) => addDays(weekStart, index));
  }, [weekStart]);

  const hourSlots = useMemo(() => {
    return Array.from({ length: TOTAL_HOURS }, (_, index) => GRID_START_HOUR + index);
  }, []);

  const appointmentsByDay = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    for (const day of weekDays) {
      const key = format(day, 'yyyy-MM-dd');
      grouped[key] = appointments.filter((appointment) =>
        isSameDay(parseISO(appointment.startTime), day)
      );
    }
    return grouped;
  }, [weekDays, appointments]);

  const showTodayLine = weekDays.some((day) => isToday(day));

  return (
    <div className="bg-white border-t border-gray-100 overflow-hidden h-full flex flex-col">
      {/* Day Headers */}
      <div
        className="grid border-b border-gray-200"
        style={{ gridTemplateColumns: `${HOUR_COLUMN_WIDTH} repeat(7, 1fr)` }}
      >
        {/* Empty corner cell */}
        <div className="p-3 border-r border-gray-100" />

        {weekDays.map((day) => {
          const isDayToday = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className="py-3 px-2 text-center"
            >
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {format(day, 'EEE', { locale: es })}
              </p>
              <div
                className={`inline-flex items-center justify-center w-10 h-10 mt-1 rounded-full text-base font-bold transition-colors ${isDayToday
                    ? 'bg-kanji text-white shadow-md'
                    : 'text-gray-700'
                  }`}
              >
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Grid Body */}
      <div className="relative overflow-y-auto flex-1 min-h-0 pt-3">
        <div
          className="grid"
          style={{ gridTemplateColumns: `${HOUR_COLUMN_WIDTH} repeat(7, 1fr)` }}
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

                            {/* Day Columns for this hour */}
                            {weekDays.map((day) => (
                              <div
                                key={`${day.toISOString()}-${hour}`}
                                className="border-b border-dashed border-gray-100/60 relative group hover:bg-gray-50/50 transition-colors cursor-pointer"
                                style={{ height: `${HOUR_HEIGHT_PX}px` }}
                                title={`Agendar cita el ${format(day, 'EEEE d', { locale: es })} a las ${formatHourLabel(hour)}`}
                              >
                                {/* Ghost Slot UI */}
                                <div className="absolute inset-1 border-2 border-dashed border-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide bg-white/50 px-2 py-1 rounded backdrop-blur-sm">
                                    + Agendar aquí
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
              
                      {/* Shading and Pills Layer */}
                      <div
                        className="absolute top-0 grid pointer-events-none"
                        style={{
                          gridTemplateColumns: `${HOUR_COLUMN_WIDTH} repeat(7, 1fr)`,
                          left: 0,
                          right: 0,
                          height: `${TOTAL_HOURS * HOUR_HEIGHT_PX}px`,
                        }}
                      >
                        {/* Skip the hour label column */}
                        <div />
              
                        {weekDays.map((day) => {
                          const key = format(day, 'yyyy-MM-dd');
                          const dayAppointments = appointmentsByDay[key] ?? [];
                          const isDayToday = isToday(day);
                          
                          return (
                            <div key={key} className="relative pointer-events-none">
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
                          );
                        })}
                      </div>
        {/* Current Time Line */}
        {showTodayLine && (
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

