import { useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { addDays, format, startOfMonth } from 'date-fns';
import {
    fetchNextAppointment,
    fetchDaySummary,
    fetchPendingNotesCount,
    fetchAppointmentsByDate,
    getTodayDateString,
} from '../lib/appointments.api';
import { getPatient } from '../lib/patients.api';
import { getRecentPatientsFromStorage } from '../lib/recent-patients.storage';
import {
    mapRecentPatients,
    buildCalendarDays,
} from '../lib/dashboard.helpers';
import type { Appointment, RecentPatient } from '../types/appointments.types';
import type { CalendarDay, MappedRecentPatient } from '../lib/dashboard.helpers';
import { appointmentKeys, patientKeys } from '../lib/query-keys';

/* ── Return type ─────────────────────────────────── */

export interface DashboardData {
    /** Next upcoming appointment or null */
    nextAppointment: Appointment | null;
    /** Recent patients mapped for the widget */
    recentPatients: MappedRecentPatient[];
    /** 28 calendar days with density */
    calendarDays: CalendarDay[];
    /** Completed appointments missing a psych note */
    pendingNotesCount: number;
    /** All appointments for today */
    todayAppointments: Appointment[];
    /** True while next appointment is loading */
    isLoading: boolean;
    /** True while today's appointments are loading */
    isTodayLoading: boolean;
}

/* ── Hook ────────────────────────────────────────── */

/**
 * Single entry-point for all Dashboard data.
 *
 * Encapsulates parallel queries and all data transformations.
 * The page component only receives ready-to-render values (ISP).
 */
export function useDashboardData(): DashboardData {
    /* 1. Next upcoming appointment (any future date) */
    const { data: nextAppointment = null, isLoading } = useQuery({
        queryKey: appointmentKeys.next(),
        queryFn: fetchNextAppointment,
        staleTime: 1000 * 60 * 5,
    });

    /* 2. Recent patients (from LocalStorage + API hydration) */
    const storedRecentPatients = useMemo(() => getRecentPatientsFromStorage(), []);

    const recentPatientQueries = useQueries({
        queries: storedRecentPatients.map((entry) => ({
            queryKey: patientKeys.detail(entry.id),
            queryFn: () => getPatient(entry.id),
            staleTime: 1000 * 60 * 5,
        })),
    });

    const rawPatients: RecentPatient[] = useMemo(() => {
        return storedRecentPatients
            .map((entry, index) => {
                const query = recentPatientQueries[index];
                if (!query?.data) return null;
                const patient: RecentPatient = {
                    id: entry.id,
                    name: query.data.fullName,
                    reason: query.data.diagnosis ?? null,
                    lastAppointmentTime: new Date(entry.timestamp).toISOString(),
                };
                return patient;
            })
            .filter((p): p is RecentPatient => p !== null);
    }, [storedRecentPatients, recentPatientQueries]);

    /* 3. Availability calendar */
    const calendarRange = useMemo(() => {
        const monthStart = startOfMonth(new Date());
        const rangeEnd = addDays(monthStart, 34);
        return {
            from: format(monthStart, 'yyyy-MM-dd'),
            to: format(rangeEnd, 'yyyy-MM-dd'),
        };
    }, []);

    const { data: rawDaySummary } = useQuery({
        queryKey: appointmentKeys.daySummary(`${calendarRange.from}-${calendarRange.to}`),
        queryFn: () => fetchDaySummary(calendarRange.from, calendarRange.to),
        staleTime: 1000 * 60 * 10,
    });

    /* 4. Pending notes count */
    const { data: pendingNotesData } = useQuery({
        queryKey: appointmentKeys.pendingNotes(),
        queryFn: fetchPendingNotesCount,
        staleTime: 1000 * 60 * 5,
    });

    /* 5. Today's appointments (full list) */
    const { data: todayAppointments = [], isLoading: isTodayLoading } = useQuery({
        queryKey: appointmentKeys.list({ date: getTodayDateString() }),
        queryFn: () => fetchAppointmentsByDate(getTodayDateString()),
        staleTime: 1000 * 60 * 5,
    });

    /* ── Derived / memoized transformations ── */

    const recentPatients = useMemo(
        () => mapRecentPatients(rawPatients ?? []),
        [rawPatients],
    );

    const calendarDays = useMemo(
        () => buildCalendarDays(rawDaySummary),
        [rawDaySummary],
    );

    const pendingNotesCount = pendingNotesData?.count ?? 0;

    return {
        nextAppointment,
        recentPatients,
        calendarDays,
        pendingNotesCount,
        todayAppointments,
        isLoading,
        isTodayLoading,
    };
}
