import { addDays, format, getDay, getDaysInMonth, startOfMonth } from 'date-fns';
import type { Appointment, RecentPatient, DaySummary } from '../types/appointments.types';

/* ── Date / Greeting ────────────────────────────── */

/** Format today's date as a localized header string (e.g. "Viernes, 14 de febrero"). */
export function formatDateHeader(): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
}

/**
 * Hour from which the product treats the clinical day as closed.
 *
 * Shared on purpose: the greeting used to switch to "Buenas noches" at 18:00
 * while every widget below it still spoke as if the day were ahead ("Día
 * libre", "Sin próxima cita"). One threshold, one story.
 */
export const END_OF_DAY_HOUR = 18;

/** Return a time-of-day greeting in Spanish. */
export function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < END_OF_DAY_HOUR) return 'Buenas tardes';
    return 'Buenas noches';
}

/** True once the clinical day is over, in the clinician's local time. */
export function isAfterHours(now: Date = new Date()): boolean {
    return now.getHours() >= END_OF_DAY_HOUR;
}

/* ── Appointment selectors ──────────────────────── */

/** Pick the next upcoming appointment from an unsorted list. */
export function getNextAppointment(
    appointments: Appointment[] | undefined,
): Appointment | null {
    if (!appointments?.length) return null;

    const now = Date.now();
    return (
        [...appointments]
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .find((app) => new Date(app.endTime).getTime() > now) ?? null
    );
}

/* ── Widget data mappers ────────────────────────── */

const PATIENT_COLORS = [
    'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-200',
    'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-200',
    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-200',
    'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-200',
    'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-200',
    'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-200',
] as const;

/**
 * FNV-1a de 32 bits. Barato, determinista y sin dependencias.
 *
 * Existe para que el color del avatar salga del id del paciente y no de su
 * posición en la lista de recientes: indexar por `i` hacía que el color de una
 * persona cambiara cada vez que cambiaba el orden, y una identidad cromática
 * inestable es peor que no tener ninguna — enseña a no fiarse de ella.
 */
function hashId(id: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < id.length; i++) {
        hash ^= id.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
}

/** Color de avatar estable para un paciente, derivado de su id. */
export function getPatientColor(id: string): string {
    return PATIENT_COLORS[hashId(id) % PATIENT_COLORS.length];
}

export interface MappedRecentPatient {
    id: string;
    name: string;
    /**
     * Free-text context for the visit. Deliberately NOT the patient's diagnosis:
     * that field is encrypted at rest and must not be surfaced on the main
     * dashboard, where anyone glancing at the clinician's screen can read it.
     */
    reason: string | null;
    time: string;
    color: string;
}

/** Map raw `RecentPatient[]` from the API to the shape the widget expects. */
export function mapRecentPatients(patients: RecentPatient[]): MappedRecentPatient[] {
    return patients.map((p) => {
        const hoursAgo = Math.floor(
            (Date.now() - new Date(p.lastAppointmentTime).getTime()) / 3_600_000,
        );

        let time: string;
        if (hoursAgo < 1) time = 'Ahora';
        else if (hoursAgo < 24) time = `Hace ${hoursAgo}h`;
        else if (hoursAgo < 48) time = 'Ayer';
        else time = `Hace ${Math.floor(hoursAgo / 24)}d`;

        return {
            id: p.id,
            name: p.name,
            reason: p.reason ?? null,
            time,
            color: getPatientColor(p.id),
        };
    });
}

export interface CalendarDay {
    day: number;
    /** ISO date (yyyy-MM-dd), so the cell can label itself accessibly. */
    date: string;
    /** Full accessible label, e.g. "sábado 1 de agosto". */
    label: string;
    density: string;
    status: string;
    appointmentCount: number;
    isToday: boolean;
    isPast: boolean;
}

/**
 * A cell in the availability grid. `null` is a leading blank: the days of the
 * week before the 1st falls, without which every date sits under the wrong
 * weekday column.
 */
export type CalendarCell = CalendarDay | null;

/**
 * Build the availability grid for the current month.
 *
 * Two things this must get right, both of which it previously got wrong:
 * 1. The month is padded with leading blanks so each date lands under its real
 *    weekday (week starts Monday, matching the `L M X J V S D` header).
 * 2. Every day of the month is included, not a fixed 28 — otherwise the 29th
 *    through 31st silently do not exist.
 *
 * It deliberately does NOT compute free hours. That used to be derived from a
 * hardcoded 09:00–18:00 workday, shipped on every cell of every month, and
 * never rendered — because the product has no way for a clinician to configure
 * their hours, so any figure built on those bounds is a claim the interface
 * cannot support. Dead weight that invites someone to surface it: removed.
 */
export function buildCalendarDays(daySummary: DaySummary | undefined): CalendarCell[] {
    const monthStart = startOfMonth(new Date());
    const daysInMonth = getDaysInMonth(monthStart);
    const todayKey = format(new Date(), 'yyyy-MM-dd');

    // getDay(): 0 = Sunday. Shift so Monday = 0, matching the header row.
    const leadingBlanks = (getDay(monthStart) + 6) % 7;

    const cells: CalendarCell[] = Array.from({ length: leadingBlanks }, () => null);

    for (let i = 0; i < daysInMonth; i++) {
        const dayDate = addDays(monthStart, i);
        const dateKey = format(dayDate, 'yyyy-MM-dd');
        const summary = daySummary?.[dateKey];
        const count = summary?.count ?? 0;

        let density = 'free';
        let status = 'Disponible';

        if (count >= 6) {
            density = 'full';
            status = 'Lleno';
        } else if (count >= 4) {
            density = 'high';
            status = 'Casi lleno';
        } else if (count >= 2) {
            density = 'medium';
            status = 'Demanda media';
        } else if (count >= 1) {
            density = 'low';
            status = 'Poca demanda';
        }

        cells.push({
            day: dayDate.getDate(),
            date: dateKey,
            label: dayDate.toLocaleDateString('es-MX', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
            }),
            density,
            status,
            appointmentCount: count,
            isToday: dateKey === todayKey,
            isPast: dateKey < todayKey,
        });
    }

    return cells;
}
