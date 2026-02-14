import { addDays, format, startOfMonth } from 'date-fns';
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

/** Return a time-of-day greeting in Spanish. */
export function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
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
    'bg-rose-100 text-rose-600',
    'bg-blue-100 text-blue-600',
    'bg-emerald-100 text-emerald-600',
    'bg-purple-100 text-purple-600',
    'bg-amber-100 text-amber-600',
    'bg-cyan-100 text-cyan-600',
] as const;

export interface MappedRecentPatient {
    id: string;
    name: string;
    reason: string;
    time: string;
    color: string;
}

/** Map raw `RecentPatient[]` from the API to the shape the widget expects. */
export function mapRecentPatients(patients: RecentPatient[]): MappedRecentPatient[] {
    return patients.map((p, i) => {
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
            reason: p.reason ?? 'Sin motivo registrado',
            time,
            color: PATIENT_COLORS[i % PATIENT_COLORS.length],
        };
    });
}

export interface CalendarDay {
    day: number;
    density: string;
    status: string;
    freeHours: string[];
}

/** Build 28 calendar day objects from a day-summary map for the AvailabilityWidget. */
export function buildCalendarDays(daySummary: DaySummary | undefined): CalendarDay[] {
    const monthStart = startOfMonth(new Date());

    return Array.from({ length: 28 }, (_, i) => {
        const dayDate = addDays(monthStart, i);
        const count = daySummary?.[format(dayDate, 'yyyy-MM-dd')] ?? 0;

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
            status = `${count} cita${count > 1 ? 's' : ''}`;
        }

        return { day: dayDate.getDate(), density, status, freeHours: [] };
    });
}
