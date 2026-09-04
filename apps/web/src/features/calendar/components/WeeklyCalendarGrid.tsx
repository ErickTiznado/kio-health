import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { format, addDays, isToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Appointment } from '../../../types/appointments.types';
import { AppointmentPill } from './AppointmentPill';
import { CurrentTimeLine } from './CurrentTimeLine';
import { useAuthStore } from '../../../stores/auth.store';
import { confirmAction } from '../../../lib/confirm-action';
import {
  HOUR_COLUMN_WIDTH,
  HOUR_HEIGHT_PX,
  buildHourSlots,
  computeGridBounds,
  formatHourLabel,
  gridBodyHeightPx,
  layoutDayAppointments,
  parseAppointmentDate,
  parseDragPayload,
  resolveDropStart,
} from '../lib/grid';

interface WeeklyCalendarGridProps {
  weekStart: Date;
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onSlotClick: (date: Date) => void;
  onReschedule: (appointmentId: string, newStartTime: Date, duration?: number) => void;
  onQuickPay?: (appointment: Appointment) => void;
  onQuickReschedule?: (appointment: Appointment) => void;
}

const DAYS_IN_WEEK = 7;

/** Ancho mínimo antes de que la semana deje de ser legible; por debajo, scroll. */
const MIN_GRID_WIDTH_PX = 760;

function formatWhen(date: Date): string {
  return format(date, "EEEE d 'de' MMMM, HH:mm", { locale: es });
}

/**
 * Weekly calendar CSS grid with hour rows, day columns,
 * positioned appointment pills, and a live current-time indicator.
 */
export function WeeklyCalendarGrid({
  weekStart,
  appointments,
  onSelectAppointment,
  onSlotClick,
  onReschedule,
  onQuickPay,
  onQuickReschedule
}: WeeklyCalendarGridProps) {
  const { user } = useAuthStore();
  const defaultDuration = user?.profile?.sessionDefaultDuration || 50;

  const bodyRef = useRef<HTMLDivElement>(null);
  const [pastTimeHeight, setPastTimeHeight] = useState(0);
  const [ghostSlot, setGhostSlot] = useState<{ dayStr: string; hour: number; minute: 0 | 30 } | null>(null);

  const weekDays = useMemo(() => {
    return Array.from({ length: DAYS_IN_WEEK }, (_, index) => addDays(weekStart, index));
  }, [weekStart]);

  // La ventana horaria se ensancha para cubrir las citas reales de la semana:
  // una cita a las 07:00 o a las 21:00 estaba fuera de la retícula fija.
  const bounds = useMemo(() => computeGridBounds(appointments), [appointments]);
  const hourSlots = useMemo(() => buildHourSlots(bounds), [bounds]);
  const bodyHeight = gridBodyHeightPx(bounds);

  useEffect(() => {
    const updateHeight = () => {
      const now = new Date();
      const offsetHours = now.getHours() - bounds.startHour + now.getMinutes() / 60;
      setPastTimeHeight(Math.max(0, Math.min(offsetHours, bounds.endHour - bounds.startHour) * HOUR_HEIGHT_PX));
    };

    updateHeight();
    const interval = setInterval(updateHeight, 60_000);
    return () => clearInterval(interval);
  }, [bounds.startHour, bounds.endHour]);

  const positionedByDay = useMemo(() => {
    const grouped: Record<string, ReturnType<typeof layoutDayAppointments>> = {};
    for (const day of weekDays) {
      const key = format(day, 'yyyy-MM-dd');
      const ofDay = appointments.filter((appointment) =>
        isSameDay(parseAppointmentDate(appointment.startTime), day)
      );
      grouped[key] = layoutDayAppointments(ofDay);
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

  const openSlot = useCallback((day: Date, hour: number, minute: number) => {
    const date = new Date(day);
    date.setHours(hour, minute, 0, 0);
    onSlotClick(date);
    setGhostSlot(null);
  }, [onSlotClick]);

  /**
   * En táctil no hay `mousemove`, así que el slot fantasma nunca aparece y la
   * franja vacía era intocable. El toque sobre la celda abre el mismo modal.
   */
  const handleCellClick = useCallback((e: React.MouseEvent<HTMLDivElement>, day: Date, hour: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const minute = e.clientY - rect.top < rect.height / 2 ? 0 : 30;
    openSlot(day, hour, minute);
  }, [openSlot]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  /**
   * Soltar reagenda, y reagendar reprograma el aviso que recibe el paciente:
   * por eso pasa por confirmación en vez de aplicarse al soltar. Conserva la
   * duración original y el punto por el que se agarró la píldora.
   */
  const handleDrop = useCallback(async (e: React.DragEvent, day: Date) => {
    e.preventDefault();

    const payload = parseDragPayload(e.dataTransfer.getData('text/plain'));
    const body = bodyRef.current;
    if (!payload || !body) return;

    const appointment = appointments.find((item) => item.id === payload.id);
    if (!appointment) {
      toast.error('No encontramos la cita que intentas mover');
      return;
    }

    const rect = body.getBoundingClientRect();
    const pointerMinutes = ((e.clientY - rect.top) / HOUR_HEIGHT_PX) * 60;
    const newStartTime = resolveDropStart(
      day,
      pointerMinutes,
      payload.grabOffsetMinutes,
      bounds,
      payload.durationMinutes,
    );

    const previousStartTime = parseAppointmentDate(appointment.startTime);
    if (newStartTime.getTime() === previousStartTime.getTime()) return;

    const confirmed = await confirmAction({
      title: '¿Mover esta cita?',
      description: `${appointment.patient.fullName}: de ${formatWhen(previousStartTime)} a ${formatWhen(newStartTime)}. Si tiene recordatorios activos, se reprogramará el aviso al paciente.`,
      confirmLabel: 'Mover la cita',
      cancelLabel: 'Dejarla donde está',
      variant: 'warning',
    });
    if (!confirmed) return;

    onReschedule(appointment.id, newStartTime, payload.durationMinutes);
  }, [appointments, bounds, onReschedule]);

  const gridTemplateColumns = `${HOUR_COLUMN_WIDTH} repeat(${DAYS_IN_WEEK}, 1fr)`;

  return (
    <div className="bg-surface dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 h-full flex flex-col">
      <div className="flex-1 min-h-0 overflow-auto">
        <div style={{ minWidth: `${MIN_GRID_WIDTH_PX}px` }}>
          {/* Day Headers — flex y no grid para que la esquina pueda ser sticky:
              dentro de un área de grid, una celda que ocupa todo su área no
              tiene margen para desplazarse. */}
          <div className="flex border-b border-gray-200 dark:border-slate-800 bg-surface dark:bg-slate-900 sticky top-0 z-30">
            {/* Esquina fija sobre la columna del eje horario */}
            <div
              className="sticky left-0 z-40 shrink-0 bg-surface dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800"
              style={{ width: HOUR_COLUMN_WIDTH }}
            />

            <div
              className="grid flex-1 min-w-0"
              // `minmax(0, 1fr)`: columnas puramente proporcionales, para que la
              // cabecera no se desalinee del cuerpo si un nombre de día crece.
              style={{ gridTemplateColumns: `repeat(${DAYS_IN_WEEK}, minmax(0, 1fr))` }}
            >
              {weekDays.map((day) => {
                const isDayToday = isToday(day);
                return (
                  <div key={day.toISOString()} className="py-3 px-2 text-center">
                    {/* Neutro, no `kanji/70`: a 11px sobre lino ese púrpura queda
                        en ~2.7:1. La marca la sostiene el círculo del día.
                        `gray-600` y no `gray-500`: el fondo es lino (#f5f3ef),
                        no blanco, y a 11px `gray-500` se queda en 4.42:1 —
                        por debajo de AA. `gray-600` da 6.83:1. */}
                    <p className="text-[11px] font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                      {format(day, 'EEE', { locale: es })}
                    </p>
                    <div
                      className={`inline-flex items-center justify-center w-10 h-10 mt-1 rounded-full text-base font-bold transition-colors duration-150 ${isDayToday
                        ? 'bg-kanji-deep dark:bg-kio text-white dark:text-slate-900'
                        : 'text-kanji-deep dark:text-kio'
                        }`}
                    >
                      {format(day, 'd')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Holgura para que la primera etiqueta de hora no se corte */}
          <div className="h-3" />

          {/* Time Grid Body — celdas, píldoras y línea de ahora comparten origen.
              `isolate` lo convierte en contexto de apilado propio: sin él, los
              z-index de sus hijos (eje z-20, línea z-30) subían al contexto raíz
              y competían con la cabecera sticky (z-30), que pinta antes en el
              DOM y por tanto habría quedado por debajo de la línea de ahora.
              Aislado, el cuerpo entero se pinta bajo la cabecera y el orden
              interno se resuelve solo entre sus capas. */}
          <div ref={bodyRef} className="relative isolate" style={{ height: `${bodyHeight}px` }}>
            {/* Eje horario — en flujo normal, no como celda de la retícula.
                `position: sticky` dentro de un área de grid no tiene margen para
                desplazarse (el área mide justo lo que la celda); aquí el bloque
                contenedor es todo el ancho desplazable, así que el eje se queda
                a la vista al mover la semana en horizontal, que es exactamente
                la vista donde ese desplazamiento es obligatorio en móvil. */}
            <div
              className="sticky left-0 z-20 bg-surface dark:bg-slate-900 border-r border-dashed border-gray-200/60 dark:border-slate-800/60"
              style={{ width: HOUR_COLUMN_WIDTH }}
            >
              {hourSlots.map((hour) => (
                <div
                  key={`label-${hour}`}
                  className="pr-3 text-right flex items-start justify-end"
                  style={{ height: `${HOUR_HEIGHT_PX}px` }}
                >
                  {/* `gray-600`: a 12px sobre lino, `gray-500` da 4.42:1 y no
                      cruza AA; `gray-600` sube a 6.83:1 sin salir del registro
                      de metadato. El par dark (slate-400 sobre slate-900) ya
                      pasaba holgado. */}
                  <span className="text-xs font-medium text-gray-600 dark:text-slate-400 -mt-2 select-none">
                    {formatHourLabel(hour)}
                  </span>
                </div>
              ))}
            </div>

            {/* Capa de celdas */}
            <div className="absolute inset-0 grid" style={{ gridTemplateColumns }}>
              {hourSlots.map((hour) => (
                <div key={`row-${hour}`} className="contents">
                  {/* Hueco de la columna del eje: el eje se pinta encima */}
                  <div style={{ height: `${HOUR_HEIGHT_PX}px` }} />

                  {/* Day Columns for this hour */}
                  {weekDays.map((day) => {
                    const dayStr = day.toISOString();
                    const isHovered = ghostSlot?.dayStr === dayStr && ghostSlot?.hour === hour;
                    const ghostTime = isHovered
                      ? `${String(hour).padStart(2, '0')}:${ghostSlot.minute === 0 ? '00' : '30'}`
                      : '';

                    return (
                      <div
                        key={`${dayStr}-${hour}`}
                        className="relative border-r border-b border-gray-200 dark:border-slate-800 hover:bg-kio-light/10 dark:hover:bg-slate-800 transition-colors duration-150 cursor-pointer"
                        style={{ height: `${HOUR_HEIGHT_PX}px` }}
                        onMouseMove={(e) => handleMouseMove(e, day, hour)}
                        onMouseLeave={handleMouseLeave}
                        onClick={(e) => handleCellClick(e, day, hour)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => { void handleDrop(e, day); }}
                      >
                        {/* Ghost Slot UI */}
                        {isHovered && (
                          <button
                            type="button"
                            aria-label={`Agendar el ${format(day, "d 'de' MMMM", { locale: es })} a las ${ghostTime}`}
                            className="absolute left-1 right-1 border-2 border-dashed border-kio/50 bg-kio/10 rounded-lg flex items-center justify-center z-10 transition-all duration-150 ease-out cursor-pointer"
                            style={{
                              top: ghostSlot.minute === 0 ? '2px' : '50%',
                              height: `calc(${(defaultDuration / 60) * 100}% - 4px)`,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openSlot(day, hour, ghostSlot.minute);
                            }}
                          >
                            <span className="flex items-center gap-1.5 text-kanji-deep dark:text-kio">
                              <Plus size={15} strokeWidth={3} aria-hidden="true" />
                              <span className="text-xs font-bold">{ghostTime}</span>
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Capa de sombreado y píldoras. El `z-10` la aísla: sin él las
                píldoras (z-20) competían con el eje horario en el mismo contexto
                de apilado y se le pondrían encima al desplazar en horizontal. */}
            <div className="absolute inset-0 grid pointer-events-none z-10" style={{ gridTemplateColumns }}>
              {/* Skip the hour label column */}
              <div />

              {weekDays.map((day) => {
                const key = format(day, 'yyyy-MM-dd');
                const positioned = positionedByDay[key] ?? [];
                const isDayToday = isToday(day);

                return (
                  <div key={key} className="relative pointer-events-none">
                    {/* Past Time Shading */}
                    {isDayToday && (
                      <div
                        className="absolute top-0 left-0 right-0 bg-gray-100/20 dark:bg-slate-800/40 border-b border-gray-200/50 dark:border-slate-700/50 pointer-events-none z-0"
                        style={{ height: `${pastTimeHeight}px` }}
                      />
                    )}

                    {positioned.map(({ appointment, column, columns }) => (
                      <AppointmentPill
                        key={appointment.id}
                        appointment={appointment}
                        offsetHour={bounds.startHour}
                        layout={{ column, columns }}
                        onSelect={onSelectAppointment}
                        onQuickPay={onQuickPay}
                        onQuickReschedule={onQuickReschedule}
                        onSlotDragOver={handleDragOver}
                        onSlotDrop={(e) => { void handleDrop(e, day); }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Current Time Line — por encima del eje horario (z-20), que es
                opaco y sticky: la etiqueta «Ahora» vive en el canalón (-left-14)
                y el círculo lo cruza a la mitad, así que con menos z el eje
                tapaba la referencia temporal de la agenda. El cuerpo está
                aislado, de modo que este z-30 no alcanza a la cabecera. */}
            {showTodayLine && (
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-30"
                style={{ left: HOUR_COLUMN_WIDTH, right: 0 }}
              >
                <CurrentTimeLine startHour={bounds.startHour} endHour={bounds.endHour} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
