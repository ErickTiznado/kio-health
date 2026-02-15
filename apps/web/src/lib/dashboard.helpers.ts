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
    'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-200',
    'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-200',
    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-200',
    'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-200',
    'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-200',
    'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-200',
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
    appointmentCount: number;
}

/** Build 28 calendar day objects from a day-summary map for the AvailabilityWidget. */
export function buildCalendarDays(daySummary: DaySummary | undefined): CalendarDay[] {
    const monthStart = startOfMonth(new Date());

    return Array.from({ length: 28 }, (_, i) => {
        const dayDate = addDays(monthStart, i);
        const dateKey = format(dayDate, 'yyyy-MM-dd');
        const summary = daySummary?.[dateKey];
        const count = summary?.count ?? 0;

        // Calculate free hours logic
        // Office hours: 09:00 - 18:00 (9 hours total)
        const OFFICE_START = 9;
        const OFFICE_END = 18;
        const allSlots = Array.from({ length: OFFICE_END - OFFICE_START }, (_, k) => k + OFFICE_START); // [9, 10, ... 17]

        // Get busy hours from appointments (simple hour extraction)
        // This is a naive implementation; for real production we'd check full ranges.
        // But for this widget, integer start hours are sufficient.
        const busyHours = new Set<number>();
        if (summary?.appointments) {
            summary.appointments.forEach(apt => {
                const hour = new Date(apt.startTime).getHours();
                busyHours.add(hour);
                // If duration > 60, block next hour too
                if (apt.duration > 60) busyHours.add(hour + 1);
            });
        }

        const freeHours = allSlots
            .filter(h => !busyHours.has(h))
            .map(h => `${h}:00`);


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

        return {
            day: dayDate.getDate(),
            density,
            status,
            freeHours: freeHours,
            appointmentCount: count
        };
    });
}
