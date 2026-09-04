import { MapPin, Banknote, Calendar, CheckCircle, MailCheck, Clock, MailX, UserX, RefreshCw, Repeat } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { Appointment } from '../../../types/appointments.types';
import {
  DEFAULT_GRID_START_HOUR,
  HOUR_HEIGHT_PX,
  getDurationMinutes,
  parseAppointmentDate,
  type DragPayload,
} from '../lib/grid';

interface AppointmentPillProps {
  appointment: Appointment;
  onSelect: (appointment: Appointment) => void;
  onQuickPay?: (appointment: Appointment) => void;
  onQuickReschedule?: (appointment: Appointment) => void;
  /**
   * Primera hora que pinta la retícula que contiene esta píldora. El `top` se
   * calcula en absoluto desde ahí; si la vista empieza a otra hora y no se le
   * pasa, la cita se dibuja a filas de distancia de su hora real.
   */
  offsetHour?: number;
  /** Reparto de ancho cuando la cita solapa con otras. */
  layout?: { column: number; columns: number };
  /**
   * La píldora tapa la celda que hay debajo, así que el `onDrop` de la celda
   * nunca se dispara sobre una franja ocupada. Estas dos props dejan pasar el
   * arrastre a la retícula.
   */
  onSlotDragOver?: (event: React.DragEvent) => void;
  onSlotDrop?: (event: React.DragEvent) => void;
}

const STATUS_BORDER_COLORS: Record<string, string> = {
  COMPLETED: 'border-l-emerald-500',
  IN_PROGRESS: 'border-l-teal-500',
  CANCELLED: 'border-l-red-400',
  NO_SHOW: 'border-l-orange-400',
  SCHEDULED: 'border-l-blue-500',
};

const STATUS_HOVER_BG: Record<string, string> = {
  COMPLETED: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20',
  IN_PROGRESS: 'hover:bg-teal-50/50 dark:hover:bg-teal-900/20',
  CANCELLED: 'hover:bg-red-50/30 dark:hover:bg-red-900/10',
  NO_SHOW: 'hover:bg-orange-50/30 dark:hover:bg-orange-900/10',
  SCHEDULED: 'hover:bg-blue-50/50 dark:hover:bg-blue-900/20',
};

/** El estado, dicho en voz alta: el color del borde izquierdo no se lee. */
const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'completada',
  IN_PROGRESS: 'en curso',
  CANCELLED: 'cancelada',
  NO_SHOW: 'no asistió',
  SCHEDULED: 'agendada',
};

/**
 * Aviso de estado de la píldora. Una sola fuente para el texto visible y para
 * el nombre accesible: el `aria-label` del contenedor sustituye al contenido,
 * así que lo que no esté aquí no llega al lector de pantalla.
 */
interface PillNote {
  key: string;
  icon: LucideIcon;
  text: string;
  className: string;
}

function buildNotes(appointment: Appointment): PillNote[] {
  const notes: PillNote[] = [];

  if (appointment.status === 'CANCELLED' && appointment.cancelledBy === 'PATIENT') {
    notes.push({
      key: 'cancelled-by-patient',
      icon: UserX,
      text: 'Cancelada por el paciente',
      className: 'text-red-500 dark:text-red-400',
    });
  }

  if (appointment.status === 'SCHEDULED' && appointment.rescheduleRequestedAt) {
    notes.push({
      key: 'reschedule-requested',
      icon: RefreshCw,
      text: 'Solicita reprogramar',
      className: 'text-kanji-deep dark:text-kio',
    });
  }

  const reminder = appointment.reminder;
  if (reminder) {
    if (reminder.confirmedAt) {
      notes.push({
        key: 'reminder',
        icon: CheckCircle,
        text: 'Asistencia confirmada',
        className: 'text-emerald-600 dark:text-emerald-400',
      });
    } else if (reminder.status === 'SENT') {
      notes.push({
        key: 'reminder',
        icon: MailCheck,
        text: 'Recordatorio enviado',
        className: 'text-amber-600 dark:text-amber-400',
      });
    } else if (reminder.status === 'PENDING') {
      notes.push({
        key: 'reminder',
        icon: Clock,
        text: 'Recordatorio programado',
        // `gray-600` y no `gray-500`: el neutro de metadato del sistema. Sobre
        // lino (#f5f3ef) `gray-500` mide 4.42:1 y no cruza AA; `gray-600` da
        // 6.82:1. Mismo criterio que el eje horario de las retículas.
        className: 'text-gray-600 dark:text-slate-400',
      });
    } else if (reminder.status === 'FAILED') {
      notes.push({
        key: 'reminder',
        icon: MailX,
        text: 'Recordatorio fallido',
        className: 'text-red-500 dark:text-red-400',
      });
    }
  }

  return notes;
}

/**
 * Appointment Card component with semantic border and clean layout.
 *
 * El contenedor no es un `role="button"`: los dos atajos rápidos son botones de
 * verdad y anidarlos dentro de otro botón no es un patrón ARIA válido. El
 * objetivo de detalle es un `<button>` que cubre la tarjeta, y los atajos viven
 * fuera de su subárbol.
 */
export function AppointmentPill({
  appointment,
  onSelect,
  onQuickPay,
  onQuickReschedule,
  offsetHour = DEFAULT_GRID_START_HOUR,
  layout,
  onSlotDragOver,
  onSlotDrop,
}: AppointmentPillProps) {
  const startDate = parseAppointmentDate(appointment.startTime);
  const durationMinutes = getDurationMinutes(appointment);

  const startOffsetMinutes = (startDate.getHours() - offsetHour) * 60 + startDate.getMinutes();

  const topPx = (startOffsetMinutes / 60) * HOUR_HEIGHT_PX;
  const heightPx = (durationMinutes / 60) * HOUR_HEIGHT_PX;

  const isShort = heightPx < 60;

  // Reparto horizontal cuando la cita comparte franja con otras.
  const columns = layout?.columns ?? 1;
  const column = layout?.column ?? 0;
  const leftPercent = (column / columns) * 100;
  const widthPercent = 100 / columns;

  // Determine border color based on status
  const borderClass = STATUS_BORDER_COLORS[appointment.status] || STATUS_BORDER_COLORS.SCHEDULED;
  const hoverBgClass = STATUS_HOVER_BG[appointment.status] || STATUS_HOVER_BG.SCHEDULED;

  const firstName = appointment.patient.fullName;

  const isInactive = appointment.status === 'CANCELLED' || appointment.status === 'NO_SHOW';
  const isInProgress = appointment.status === 'IN_PROGRESS';
  const isDraggable = appointment.status === 'SCHEDULED';

  const notes = buildNotes(appointment);

  const showQuickPay = Boolean(onQuickPay) && !isInactive && !isShort;
  const showQuickReschedule = Boolean(onQuickReschedule) && isDraggable && !isShort;
  const hasQuickActions = showQuickPay || showQuickReschedule;

  // Todo lo que la píldora muestra, en el nombre accesible: el `aria-label`
  // sustituye al contenido, así que omitir el estado lo dejaba mudo.
  const ariaLabel = [
    format(startDate, 'HH:mm'),
    firstName,
    STATUS_LABELS[appointment.status],
    appointment.reason,
    appointment.seriesId ? 'cita recurrente' : null,
    ...notes.map((note) => note.text),
  ]
    .filter(Boolean)
    .join(' · ');

  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    if (!isDraggable) {
      e.preventDefault();
      return;
    }

    // Minutos entre el inicio de la cita y el punto exacto donde se agarró.
    // Sin esto, soltar encaja la cita al borde de la celda y la mueve sola.
    const rect = e.currentTarget.getBoundingClientRect();
    const grabbedPx = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    const grabOffsetMinutes = (grabbedPx / HOUR_HEIGHT_PX) * 60;

    const payload: DragPayload = {
      id: appointment.id,
      durationMinutes,
      grabOffsetMinutes,
    };
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragOver={onSlotDragOver}
      onDrop={onSlotDrop}
      className={`absolute rounded-md border-l-4 ${borderClass} ${isInactive ? 'bg-gray-50 dark:bg-slate-800/50 opacity-60' : 'bg-surface dark:bg-slate-800'} ${hoverBgClass} shadow-sm dark:shadow-none transition-all duration-200 hover:shadow-md dark:hover:shadow-none hover:-translate-y-0.5 group overflow-hidden z-20 hover:z-30 focus-within:z-30 pointer-events-auto`}
      style={{
        top: `${topPx}px`,
        height: `${heightPx}px`,
        minHeight: '32px',
        left: `calc(${leftPercent}% + 6px)`,
        width: `calc(${widthPercent}% - 12px)`,
      }}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        // También arrastrable: algunos navegadores no propagan el inicio del
        // arrastre desde un control de formulario al ancestro `draggable`, y
        // reagendar tirando de la píldora es la interacción principal de la
        // retícula. El rectángulo del botón coincide con el de la tarjeta, así
        // que el punto de agarre se calcula igual.
        draggable={isDraggable}
        onDragStart={handleDragStart}
        onClick={(e) => {
          // Prevent click when dragging
          if (e.defaultPrevented) return;
          onSelect(appointment);
        }}
        className={`absolute inset-0 px-2 py-1.5 text-left flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-kio/50 ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
      >
        {isShort ? (
          // Short Appointment Layout (Single Line)
          <div className="flex items-center gap-2 h-full">
            <span className="text-xs text-gray-600 dark:text-slate-400 font-medium whitespace-nowrap">
              {format(startDate, 'HH:mm')}
            </span>
            <span className={`text-sm font-bold truncate flex-1 ${isInactive ? 'text-gray-400 dark:text-slate-500 line-through' : 'text-gray-900 dark:text-white'}`}>
              {firstName}
            </span>
            {isInProgress && <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shrink-0" aria-hidden="true" />}
          </div>
        ) : (
          // Standard Appointment Layout
          <>
            {/* Header: Time and Context Icon. El `pr-12` reserva el hueco de los
                atajos rápidos, que se pintan encima al pasar el ratón o el foco. */}
            <div className={`flex items-center gap-1.5 text-gray-600 dark:text-slate-400 mb-0.5 ${hasQuickActions ? 'pr-12' : ''}`}>
              {/* Always show MapPin as all appointments are in-person */}
              <MapPin size={14} strokeWidth={2} aria-hidden="true" />
              <span className="text-xs font-medium">
                {format(startDate, 'HH:mm')}
              </span>
              {appointment.seriesId && (
                <Repeat size={11} strokeWidth={2.5} className="text-kanji-deep dark:text-kio" aria-hidden="true" />
              )}
            </div>

            {/* Patient Name */}
            <div className="flex items-center gap-1.5">
              {isInProgress && <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shrink-0" aria-hidden="true" />}
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
              // Texto real, no adorno: la cursiva ya dice que es el valor por
              // defecto, así que el color no necesita bajar a `gray-400`
              // (2.85:1 sobre lino). `gray-600` mantiene la jerarquía y se lee.
              <p className="text-xs text-gray-600 dark:text-slate-400 truncate mt-0.5 italic">
                Consulta general
              </p>
            )}

            {/* Estado del recordatorio y acciones del paciente — texto visible,
                no solo `title`: en táctil y con lector de pantalla el hover no
                existe. El mismo texto viaja en el `aria-label`. */}
            {notes.map((note) => {
              const NoteIcon = note.icon;
              return (
                <div key={note.key} className="flex items-center gap-1 mt-1 min-w-0">
                  <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium truncate ${note.className}`}>
                    <NoteIcon size={11} aria-hidden="true" className="shrink-0" /> {note.text}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </button>

      {/* Atajos de ratón/teclado, fuera del subárbol del botón de detalle: dos
          controles anidados dentro de otro control no son ARIA válido. No caben
          a 44px dentro de una píldora de 40px de alto, así que no se exponen
          como objetivo táctil (`pointer-events-none` hasta que hay hover o
          foco). Las mismas acciones están a tamaño completo en el cajón. */}
      {hasQuickActions && (
        <div className="absolute top-0.5 right-0.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-opacity duration-150 flex items-center gap-0.5 bg-white/90 dark:bg-slate-800/90 rounded-md z-10">
          {showQuickPay && onQuickPay && (
            <button
              type="button"
              aria-label={`Registrar pago de ${firstName}`}
              className="p-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 transition-colors"
              onClick={() => onQuickPay(appointment)}
            >
              <Banknote size={14} aria-hidden="true" />
            </button>
          )}
          {showQuickReschedule && onQuickReschedule && (
            <button
              type="button"
              aria-label={`Reagendar la cita de ${firstName}`}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 text-kanji-deep dark:text-slate-400 dark:hover:text-white transition-colors"
              onClick={() => onQuickReschedule(appointment)}
            >
              <Calendar size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
