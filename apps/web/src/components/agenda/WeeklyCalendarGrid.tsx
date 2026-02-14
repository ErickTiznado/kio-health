import { useMemo, useState, useEffect, useCallback } from 'react';
import { format, addDays, isToday, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import type { Appointment } from '../../types/appointments.types';
import { AppointmentPill } from './AppointmentPill';
import { CurrentTimeLine } from './CurrentTimeLine';

interface WeeklyCalendarGridProps {
  weekStart: Date;
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onSlotClick: (date: Date) => void;
  onReschedule: (appointmentId: string, newStartTime: Date) => void;
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
export function WeeklyCalendarGrid({ weekStart, appointments, onSelectAppointment, onSlotClick, onReschedule }: WeeklyCalendarGridProps) {
  const [pastTimeHeight, setPastTimeHeight] = useState(0);
  const [ghostSlot, setGhostSlot] = useState<{ dayStr: string; hour: number; minute: 0 | 30 } | null>(null);

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

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, day: Date, hour: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const isTopHalf = y < rect.height / 2;
    const minute = isTopHalf ? 0 : 30;
    const dayStr = day.toISOString();

    // Only update state if it changed to reduce re-renders
    setGhostSlot((prev) => {
      if (prev && prev.dayStr === dayStr && prev.hour === hour && prev.minute === minute) {
        return prev;
      }
      return { dayStr, hour, minute };
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setGhostSlot(null);
  }, []);

  const handleGhostClick = () => {
    if (!ghostSlot) return;
    const date = new Date(ghostSlot.dayStr);
    date.setHours(ghostSlot.hour, ghostSlot.minute, 0, 0);
    onSlotClick(date);
    setGhostSlot(null);
    setGhostSlot(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    try {
      const { id } = JSON.parse(data);
      if (!id) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;

      const hoursFromStart = y / HOUR_HEIGHT_PX;
      const hour = Math.floor(hoursFromStart) + GRID_START_HOUR;
      const minutes = (hoursFromStart % 1) * 60;
      const snappedMinutes = Math.round(minutes / 30) * 30;

      const newTime = new Date(day);
      newTime.setHours(hour, snappedMinutes, 0, 0);

      onReschedule(id, newTime);
    } catch (err) {
      console.error('Drop error', err);
    }
  };

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
              {weekDays.map((day) => {
                const dayStr = day.toISOString();
                const isHovered = ghostSlot?.dayStr === dayStr && ghostSlot?.hour === hour;

                return (
                  <div
                    key={`${dayStr}-${hour}`}
                    className="relative border-r border-gray-100 hover:bg-gray-50/50 transition-colors"
                    style={{ height: `${HOUR_HEIGHT_PX}px` }}
                    onMouseMove={(e) => handleMouseMove(e, day, hour)}
                    onMouseLeave={handleMouseLeave}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day)}
                  >
                    {/* Ghost Slot UI */}
                    {isHovered && (
                      <div
                        className="absolute left-1 right-1 border-2 border-dashed border-violet-500/50 bg-violet-500/10 rounded-lg flex items-center justify-center z-10 transition-all duration-75 ease-out cursor-pointer"
                        style={{
                          top: ghostSlot.minute === 0 ? '2px' : '50%',
                          height: 'calc(50% - 2px)',
                        }}
                        onClick={handleGhostClick}
                      >
                        <div className="flex items-center gap-1.5 text-violet-600">
                          <Plus size={14} strokeWidth={3} />
                          <span className="text-xs font-bold">
                            {hour}:{ghostSlot.minute === 0 ? '00' : '30'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
