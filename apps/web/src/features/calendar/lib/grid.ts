import { parseISO, isSameDay, differenceInMinutes } from 'date-fns';
import type { Appointment } from '../../../types/appointments.types';

/**
 * Primitivas compartidas por la retícula semanal y la diaria.
 *
 * Ambas vistas posicionan las citas en absoluto sobre una columna de hora fija,
 * así que las constantes, el parseo de fechas, el cálculo de límites y el
 * reparto de solapamientos viven aquí y no duplicados en cada rejilla.
 */

/** Altura de una fila de una hora, en píxeles. */
export const HOUR_HEIGHT_PX = 80;

/** Ancho de la columna de etiquetas de hora. Idéntico en semana y día. */
export const HOUR_COLUMN_WIDTH = '80px';

/** Ventana por defecto de la retícula cuando no hay citas fuera de ella. */
export const DEFAULT_GRID_START_HOUR = 8;
export const DEFAULT_GRID_END_HOUR = 20;

/** Granularidad a la que se ajusta una cita al soltarla, en minutos. */
export const DRAG_SNAP_MINUTES = 15;

/** Duración asumida cuando `endTime` no es posterior a `startTime`. */
const FALLBACK_DURATION_MINUTES = 30;

/**
 * El backend serializa las fechas en ISO, pero algunos payloads llegan con un
 * espacio en lugar de la `T`. Un único punto de parseo evita que cada vista
 * repita el `replace`.
 */
export function parseAppointmentDate(value: string): Date {
  return parseISO(value.replace(' ', 'T'));
}

/** Duración en minutos de una cita, con suelo defensivo para datos corruptos. */
export function getDurationMinutes(appointment: Appointment): number {
  const start = parseAppointmentDate(appointment.startTime);
  const end = parseAppointmentDate(appointment.endTime);
  const minutes = differenceInMinutes(end, start);
  return minutes > 0 ? minutes : FALLBACK_DURATION_MINUTES;
}

/** Etiqueta de hora en 24h — el único formato horario del módulo. */
export function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

export interface GridBounds {
  startHour: number;
  endHour: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Ventana horaria que la retícula debe pintar.
 *
 * La rejilla estaba cableada a 08:00–20:00: una cita a las 07:00 caía en un
 * offset negativo y otra a las 21:00 quedaba fuera del alto renderizado, así
 * que eran invisibles e inalcanzables. La ventana por defecto se mantiene como
 * suelo y se ensancha lo justo para cubrir las citas reales del rango.
 */
export function computeGridBounds(appointments: Appointment[]): GridBounds {
  let startHour = DEFAULT_GRID_START_HOUR;
  let endHour = DEFAULT_GRID_END_HOUR;

  for (const appointment of appointments) {
    const start = parseAppointmentDate(appointment.startTime);
    if (Number.isNaN(start.getTime())) continue;
    const end = parseAppointmentDate(appointment.endTime);

    startHour = Math.min(startHour, start.getHours());

    // Una cita que cruza la medianoche se recorta al final del día: la vista
    // es por día, no por cita.
    const endsSameDay = !Number.isNaN(end.getTime()) && isSameDay(start, end);
    const candidateEnd = endsSameDay
      ? end.getHours() + (end.getMinutes() > 0 ? 1 : 0)
      : 24;
    endHour = Math.max(endHour, candidateEnd);
  }

  const safeStart = clamp(startHour, 0, 23);
  return { startHour: safeStart, endHour: clamp(endHour, safeStart + 1, 24) };
}

/** Filas de hora que corresponden a unos límites dados. */
export function buildHourSlots({ startHour, endHour }: GridBounds): number[] {
  return Array.from({ length: endHour - startHour }, (_, index) => startHour + index);
}

/** Alto total del cuerpo de la retícula, en píxeles. */
export function gridBodyHeightPx({ startHour, endHour }: GridBounds): number {
  return (endHour - startHour) * HOUR_HEIGHT_PX;
}

export interface PositionedAppointment {
  appointment: Appointment;
  /** Índice de columna dentro de su grupo de solapamiento. */
  column: number;
  /** Número de columnas del grupo; 1 cuando la cita no solapa con nadie. */
  columns: number;
}

interface LayoutItem {
  appointment: Appointment;
  start: number;
  end: number;
}

/**
 * Reparte el ancho entre citas que se pisan en el tiempo.
 *
 * Antes toda píldora ocupaba `left-1.5 right-1.5` y solo `hover:z-30` las
 * separaba, es decir: solo bajo un ratón. En una agenda de clínica compartida
 * eso escondía dobles reservas reales — el dato existía únicamente en hover,
 * que en táctil y con lector de pantalla no existe.
 */
export function layoutDayAppointments(appointments: Appointment[]): PositionedAppointment[] {
  const items: LayoutItem[] = appointments
    .map((appointment) => {
      const start = parseAppointmentDate(appointment.startTime).getTime();
      const durationMs = getDurationMinutes(appointment) * 60_000;
      return { appointment, start, end: start + durationMs };
    })
    .filter((item) => !Number.isNaN(item.start))
    .sort((a, b) => a.start - b.start || b.end - a.end);

  const positioned: PositionedAppointment[] = [];

  let cluster: LayoutItem[] = [];
  let clusterEnd = Number.NEGATIVE_INFINITY;

  const flushCluster = () => {
    if (cluster.length === 0) return;

    // Asignación golosa: cada cita entra en la primera columna ya libre.
    const columnEnds: number[] = [];
    const assignments = cluster.map((item) => {
      let column = columnEnds.findIndex((end) => end <= item.start);
      if (column === -1) column = columnEnds.length;
      columnEnds[column] = item.end;
      return { item, column };
    });

    for (const { item, column } of assignments) {
      positioned.push({
        appointment: item.appointment,
        column,
        columns: columnEnds.length,
      });
    }

    cluster = [];
    clusterEnd = Number.NEGATIVE_INFINITY;
  };

  for (const item of items) {
    if (cluster.length > 0 && item.start >= clusterEnd) flushCluster();
    cluster.push(item);
    clusterEnd = Math.max(clusterEnd, item.end);
  }
  flushCluster();

  return positioned;
}

/**
 * Convierte la posición del puntero al soltar en la hora de inicio resultante,
 * respetando el punto por el que se agarró la píldora.
 *
 * `pointerMinutesFromGridStart` es el instante bajo el cursor; restarle el
 * offset de agarre es lo que impide que arrastrar encaje siempre al borde de
 * la celda.
 */
export function resolveDropStart(
  day: Date,
  pointerMinutesFromGridStart: number,
  grabOffsetMinutes: number,
  { startHour, endHour }: GridBounds,
  durationMinutes: number,
): Date {
  const rawMinutes = pointerMinutesFromGridStart - grabOffsetMinutes;
  const snapped = Math.round(rawMinutes / DRAG_SNAP_MINUTES) * DRAG_SNAP_MINUTES;

  const maxMinutes = (endHour - startHour) * 60 - durationMinutes;
  const bounded = clamp(snapped, 0, Math.max(0, maxMinutes));

  const result = new Date(day);
  result.setHours(startHour, 0, 0, 0);
  result.setMinutes(result.getMinutes() + bounded);
  return result;
}

/** Payload que viaja en el `dataTransfer` de una píldora arrastrada. */
export interface DragPayload {
  id: string;
  durationMinutes: number;
  /** Minutos entre el inicio de la cita y el punto donde se agarró. */
  grabOffsetMinutes: number;
}

export function parseDragPayload(raw: string): DragPayload | null {
  try {
    const parsed = JSON.parse(raw) as Partial<DragPayload>;
    if (!parsed || typeof parsed.id !== 'string' || parsed.id.length === 0) return null;
    return {
      id: parsed.id,
      durationMinutes:
        typeof parsed.durationMinutes === 'number' && parsed.durationMinutes > 0
          ? parsed.durationMinutes
          : FALLBACK_DURATION_MINUTES,
      grabOffsetMinutes:
        typeof parsed.grabOffsetMinutes === 'number' && parsed.grabOffsetMinutes >= 0
          ? parsed.grabOffsetMinutes
          : 0,
    };
  } catch {
    return null;
  }
}
