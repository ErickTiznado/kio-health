import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { addDays, format, startOfMonth } from 'date-fns';
import {
    fetchNextAppointment,
    fetchRecentPatients,
    fetchDaySummary,
    fetchPendingNotesCount,
} from '../lib/appointments.api';
import {
    mapRecentPatients,
    buildCalendarDays,
} from '../lib/dashboard.helpers';
import type { Appointment } from '../types/appointments.types';
import type { CalendarDay, MappedRecentPatient } from '../lib/dashboard.helpers';

/* ── Query keys (colocation) ────────────────────── */

const QUERY_KEYS = {
    nextAppointment: ['next-appointment'] as const,
    recentPatients: ['recent-patients'] as const,
    daySummary: (from: string, to: string) => ['day-summary', from, to] as const,
    pendingNotes: ['pending-notes-count'] as const,
} as const;

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
    /** True while next appointment is loading */
    isLoading: boolean;
}

/* ── Hook ────────────────────────────────────────── */

/**
 * Single entry-point for all Dashboard data.
 *
 * Encapsulates four parallel queries and all data transformations.
 * The page component only receives ready-to-render values (ISP).
 */
export function useDashboardData(): DashboardData {
    /* 1. Next upcoming appointment (any future date) */
    const { data: nextAppointment = null, isLoading } = useQuery({
        queryKey: QUERY_KEYS.nextAppointment,
        queryFn: fetchNextAppointment,
        staleTime: 1000 * 60 * 5,
    });

    /* 2. Recent patients */
    const { data: rawPatients } = useQuery({
        queryKey: QUERY_KEYS.recentPatients,
        queryFn: fetchRecentPatients,
        staleTime: 1000 * 60 * 5,
    });

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
        queryKey: QUERY_KEYS.daySummary(calendarRange.from, calendarRange.to),
        queryFn: () => fetchDaySummary(calendarRange.from, calendarRange.to),
        staleTime: 1000 * 60 * 10,
    });

    /* 4. Pending notes count */
    const { data: pendingNotesData } = useQuery({
        queryKey: QUERY_KEYS.pendingNotes,
        queryFn: fetchPendingNotesCount,
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
        isLoading,
    };
}
