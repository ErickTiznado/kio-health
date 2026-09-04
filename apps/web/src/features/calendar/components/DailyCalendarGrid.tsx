import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format, isSameDay, isToday } from 'date-fns';
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

interface DailyCalendarGridProps {
  selectedDay: Date;
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onSlotClick: (date: Date) => void;
  onReschedule?: (appointmentId: string, newStartTime: Date, duration?: number) => void;
  onQuickPay?: (appointment: Appointment) => void;
  onQuickReschedule?: (appointment: Appointment) => void;
}

function formatWhen(date: Date): string {
  return format(date, "EEEE d 'de' MMMM, HH:mm", { locale: es });
}

/**
 * Retícula de un solo día.
 *
 * Comparte las primitivas de `lib/grid` con la vista semanal: una única columna
 * posicionada en absoluto desde la primera hora de la retícula. Antes envolvía
 * cada píldora en una caja de 80px por fila mientras la píldora se posicionaba
 * en absoluto desde las 08:00, así que una cita de las 15:00 se dibujaba siete
 * filas más abajo, encima de horas ajenas — y ésta es la vista que el móvil
 * fuerza, la escena de uso primaria del producto.
 */
export function DailyCalendarGrid({
  selectedDay,
  appointments,
  onSelectAppointment,
  onSlotClick,
  onReschedule,
  onQuickPay,
  onQuickReschedule
}: DailyCalendarGridProps) {
  const { user } = useAuthStore();
  const defaultDuration = user?.profile?.sessionDefaultDuration || 50;

  const bodyRef = useRef<HTMLDivElement>(null);
  const [pastTimeHeight, setPastTimeHeight] = useState(0);
  const [ghostSlot, setGhostSlot] = useState<{ hour: number; minute: 0 | 30 } | null>(null);

  const dayAppointments = useMemo(
    () => appointments.filter((appointment) =>
      isSameDay(parseAppointmentDate(appointment.startTime), selectedDay)
    ),
    [appointments, selectedDay],
  );

  const bounds = useMemo(() => computeGridBounds(dayAppointments), [dayAppointments]);
  const hourSlots = useMemo(() => buildHourSlots(bounds), [bounds]);
  const bodyHeight = gridBodyHeightPx(bounds);
  const positioned = useMemo(() => layoutDayAppointments(dayAppointments), [dayAppointments]);

  const isDayToday = isToday(selectedDay);

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

  const openSlot = useCallback((hour: number, minute: number) => {
    const date = new Date(selectedDay);
    date.setHours(hour, minute, 0, 0);
    onSlotClick(date);
    setGhostSlot(null);
  }, [onSlotClick, selectedDay]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, hour: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const minute = e.clientY - rect.top < rect.height / 2 ? 0 : 30;
    setGhostSlot((prev) => (prev && prev.hour === hour && prev.minute === minute ? prev : { hour, minute }));
  }, []);

  const handleCellClick = useCallback((e: React.MouseEvent<HTMLDivElement>, hour: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const minute = e.clientY - rect.top < rect.height / 2 ? 0 : 30;
    openSlot(hour, minute);
  }, [openSlot]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!onReschedule) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, [onReschedule]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    if (!onReschedule) return;
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
      selectedDay,
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
  }, [appointments, bounds, onReschedule, selectedDay]);

  const gridTemplateColumns = `${HOUR_COLUMN_WIDTH} 1fr`;

  return (
    <div className="bg-surface dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 h-full flex flex-col">
      <div className="flex-1 min-h-0 overflow-auto">
        {/* Cabecera del día */}
        <div className="sticky top-0 z-30 bg-surface dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-kanji-deep dark:text-kio capitalize">
            {format(selectedDay, "EEEE, d 'de' MMMM", { locale: es })}
          </p>
          {/* "Visibles" y no "citas" a secas: la lista que llega ya viene
              filtrada, así que el número describe la pantalla, no el día. */}
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400">
            {dayAppointments.length === 1 ? '1 cita visible' : `${dayAppointments.length} citas visibles`}
          </p>
        </div>

        {/* Holgura para que la primera etiqueta de hora no se corte */}
        <div className="h-3" />

        <div ref={bodyRef} className="relative" style={{ height: `${bodyHeight}px` }}>
          {/* Capa de celdas */}
          <div className="absolute inset-0 grid" style={{ gridTemplateColumns }}>
            {hourSlots.map((hour) => {
              const isHovered = ghostSlot?.hour === hour;
              const ghostTime = isHovered
                ? `${String(hour).padStart(2, '0')}:${ghostSlot.minute === 0 ? '00' : '30'}`
                : '';

              return (
                <div key={`row-${hour}`} className="contents">
                  <div
                    className="pr-3 text-right border-r border-dashed border-gray-200/60 dark:border-slate-800/60 flex items-start justify-end"
                    style={{ height: `${HOUR_HEIGHT_PX}px` }}
                  >
                    {/* Neutro, no `kanji/60`: el eje horario es la referencia
                        primaria de la agenda, y ese púrpura al 60% queda en
                        ~2.5:1 sobre lino. `gray-600` y no `gray-500` porque el
                        fondo es lino (#f5f3ef) y no blanco: `gray-500` se queda
                        en 4.42:1, por debajo de AA a 12px; `gray-600` da
                        6.83:1. */}
                    <span className="text-xs font-medium text-gray-600 dark:text-slate-400 -mt-2 select-none">
                      {formatHourLabel(hour)}
                    </span>
                  </div>

                  <div
                    className="relative border-b border-gray-200 dark:border-slate-800 hover:bg-kio-light/10 dark:hover:bg-slate-800 transition-colors duration-150 cursor-pointer"
                    style={{ height: `${HOUR_HEIGHT_PX}px` }}
                    onMouseMove={(e) => handleMouseMove(e, hour)}
                    onMouseLeave={() => setGhostSlot(null)}
                    onClick={(e) => handleCellClick(e, hour)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => { void handleDrop(e); }}
                  >
                    {isHovered && (
                      <button
                        type="button"
                        aria-label={`Agendar a las ${ghostTime}`}
                        className="absolute left-1 right-1 border-2 border-dashed border-kio/50 bg-kio/10 rounded-lg flex items-center justify-center z-10 transition-all duration-150 ease-out cursor-pointer"
                        style={{
                          top: ghostSlot.minute === 0 ? '2px' : '50%',
                          height: `calc(${(defaultDuration / 60) * 100}% - 4px)`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openSlot(hour, ghostSlot.minute);
                        }}
                      >
                        <span className="flex items-center gap-1.5 text-kanji-deep dark:text-kio">
                          <Plus size={15} strokeWidth={3} aria-hidden="true" />
                          <span className="text-xs font-bold">{ghostTime}</span>
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Capa de sombreado y píldoras */}
          <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns }}>
            <div />
            <div className="relative pointer-events-none">
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
                  onSlotDrop={(e) => { void handleDrop(e); }}
                />
              ))}
            </div>
          </div>

          {/* Línea de la hora actual */}
          {isDayToday && (
            <div
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{ left: HOUR_COLUMN_WIDTH, right: 0 }}
            >
              <CurrentTimeLine startHour={bounds.startHour} endHour={bounds.endHour} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
