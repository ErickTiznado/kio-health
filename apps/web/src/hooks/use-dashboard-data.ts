import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { addDays, format, startOfMonth } from 'date-fns';
import {
    fetchNextAppointment,
    fetchDaySummary,
    fetchPendingNotesCount,
    fetchAppointmentsByDate,
    getTodayDateString,
} from '../lib/appointments.api';
import { getPatient, getActiveRiskFlagsCount } from '../lib/patients.api';
import { getRecentPatientsFromStorage } from '../lib/recent-patients.storage';
import {
    mapRecentPatients,
    buildCalendarDays,
    isAfterHours,
} from '../lib/dashboard.helpers';
import type { Appointment, RecentPatient } from '../types/appointments.types';
import type { CalendarCell, MappedRecentPatient } from '../lib/dashboard.helpers';
import { appointmentKeys, patientKeys } from '../lib/query-keys';

/* ── Payloads ────────────────────────────────────── */

/** Referencia estable para el caso sin ids; evita un array nuevo por render. */
const EMPTY_IDS: string[] = [];

/**
 * Los ids de cita que acompañan a `GET /appointments/pending-notes-count`.
 *
 * El endpoint manda el `count` junto a los ids de las citas que lo componen,
 * acotados a 50 por el servidor y ordenados por `startTime` descendente. El
 * `count` es exacto siempre; la lista NO es el conjunto completo en cuanto
 * `count > 50`, así que nada puede presentarla como tal.
 *
 * `PendingNotesCount` (en `types/appointments.types.ts`, de otro carril) todavía
 * declara solo `{ count }`, así que este dato no está en el contrato tipado.
 * Antes se resolvía ensanchando el genérico del `useQuery` a un tipo local con
 * `appointmentIds?: string[]`: compilaba —el campo opcional lo hacía asignable—
 * pero era un aserto que el compilador no podía verificar contra la capa API. Si
 * alguien cambiaba la forma de la respuesta, TypeScript callaba y el atajo
 * desaparecía en silencio.
 *
 * Aquí se lee en runtime desde `unknown` y se valida elemento a elemento: no se
 * afirma nada sobre el tipo que no se haya comprobado. Si el campo deja de
 * llegar, o llega con otra forma, el resultado es `[]` — el mismo repliegue
 * seguro que ya usa el atajo: sin ids leídos no hay enlace directo, se va al
 * filtro de la agenda. Cuando el campo entre en `PendingNotesCount`, esta
 * función se sustituye por la lectura directa.
 */
function readPendingNoteIds(payload: unknown): string[] {
    if (typeof payload !== 'object' || payload === null) return EMPTY_IDS;
    const ids = (payload as { appointmentIds?: unknown }).appointmentIds;
    if (!Array.isArray(ids)) return EMPTY_IDS;
    return ids.every((id) => typeof id === 'string') ? (ids as string[]) : EMPTY_IDS;
}

/* ── Return type ─────────────────────────────────── */

export interface DashboardData {
    /** Next upcoming appointment or null */
    nextAppointment: Appointment | null;
    /** Recent patients mapped for the widget */
    recentPatients: MappedRecentPatient[];
    /** Calendar grid: leading blanks + every day of the current month */
    calendarCells: CalendarCell[];
    /** Completed appointments missing a psych note */
    pendingNotesCount: number;
    /**
     * Ids de las citas que componen `pendingNotesCount`.
     *
     * Acotados a 50 por el servidor y ordenados por hora de inicio descendente:
     * el contador es exacto, esta lista no lo es en cuanto pasa de 50. No puede
     * usarse para enumerar "las notas pendientes" ni para afirmar cuántas hay.
     * Su único uso hoy es el atajo de una sola nota: con `pendingNotesCount === 1`
     * hay exactamente un id, y entonces la sesión concreta es mejor destino que
     * la agenda filtrada.
     */
    pendingNoteAppointmentIds: string[];
    /** Patients with active risk flags */
    riskFlagsCount: number;
    /** All appointments for today */
    todayAppointments: Appointment[];
    /** True while next appointment is loading */
    isLoading: boolean;
    /** True while today's appointments are loading */
    isTodayLoading: boolean;
    /**
     * Per-query loading flags.
     *
     * These exist for the same reason `errors` does. A widget that only knows
     * about `isError` still renders its reassuring empty state while the request
     * is in flight — `pendingNotesCount` and `riskFlagsCount` default to `0`, so
     * "Todo al día · Sin notas pendientes ni banderas de riesgo" was painted in
     * emerald over data nobody had read yet. On a clinical surface "we don't
     * know" and "there is nothing" are different claims.
     */
    isPendingNotesLoading: boolean;
    isRiskFlagsLoading: boolean;
    isCalendarLoading: boolean;
    isRecentPatientsLoading: boolean;
    /**
     * True from `END_OF_DAY_HOUR` onwards, re-evaluated every minute.
     *
     * The dashboard stays open between sessions, so a clinician who opened the
     * tab at 17:00 would otherwise never see the day close.
     */
    isAfterHours: boolean;
    /**
     * Per-query failure flags. A widget MUST consult its error flag before
     * rendering an empty state; "no data" and "could not load" are different
     * claims, and on a clinical surface the difference is not cosmetic.
     *
     * A flag is true for BOTH a hard error and a paused-offline query. React
     * Query parks a request it cannot make in `pending`/`paused` indefinitely —
     * it never becomes `isError` — so a widget that only checked `isError`
     * would still fall through to "Día libre" having read nothing at all.
     */
    errors: {
        next: boolean;
        today: boolean;
        calendar: boolean;
        pendingNotes: boolean;
        riskFlags: boolean;
        recentPatients: boolean;
    };
    /** Retry callbacks paired with `errors`. */
    retry: {
        next: () => void;
        today: () => void;
        calendar: () => void;
        attention: () => void;
        recentPatients: () => void;
    };
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
    const {
        data: nextAppointment = null,
        isLoading,
        isError: isNextError,
        isPaused: isNextPaused,
        refetch: refetchNext,
    } = useQuery({
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

    // `recentPatientQueries` is a fresh array on every render, so memoizing against
    // it directly is a no-op. Depend on the resolved payloads instead.
    const recentPatientData = recentPatientQueries.map((q) => q.data);
    const isRecentPatientsError = recentPatientQueries.some((q) => q.isError || q.isPaused);
    // Sin entradas guardadas no hay nada que hidratar: el empty state es correcto
    // desde el primer render y no debe esconderse tras un skeleton eterno.
    const isRecentPatientsLoading =
        storedRecentPatients.length > 0 && recentPatientQueries.some((q) => q.isLoading);
    const recentPatientsKey = recentPatientData.map((d) => d?.id ?? '').join('|');

    const rawPatients: RecentPatient[] = useMemo(() => {
        return storedRecentPatients
            .map((entry, index) => {
                const data = recentPatientData[index];
                if (!data) return null;
                const patient: RecentPatient = {
                    id: entry.id,
                    name: data.fullName,
                    reason: null,
                    lastAppointmentTime: new Date(entry.timestamp).toISOString(),
                };
                return patient;
            })
            .filter((p): p is RecentPatient => p !== null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storedRecentPatients, recentPatientsKey]);

    /* 3. Availability calendar */
    const calendarRange = useMemo(() => {
        const monthStart = startOfMonth(new Date());
        const rangeEnd = addDays(monthStart, 41);
        return {
            from: format(monthStart, 'yyyy-MM-dd'),
            to: format(rangeEnd, 'yyyy-MM-dd'),
        };
    }, []);

    const {
        data: rawDaySummary,
        isLoading: isCalendarLoading,
        isError: isCalendarError,
        isPaused: isCalendarPaused,
        refetch: refetchCalendar,
    } = useQuery({
        queryKey: appointmentKeys.daySummary(`${calendarRange.from}-${calendarRange.to}`),
        queryFn: () => fetchDaySummary(calendarRange.from, calendarRange.to),
        staleTime: 1000 * 60 * 10,
    });

    /* 4. Pending notes count */
    const {
        data: pendingNotesData,
        isLoading: isPendingNotesLoading,
        isError: isPendingNotesError,
        isPaused: isPendingNotesPaused,
        refetch: refetchPendingNotes,
        // Sin rango: el conteo sigue siendo el histórico total, que es lo que la
        // superficie dice ("sesiones completadas sin nota clínica", sin periodo).
        // Por eso `appointmentKeys.pendingNotes()` se queda sin parámetros — meter
        // un rango sin meterlo en la clave serviría el conteo de otro periodo desde
        // la caché.
    } = useQuery({
        queryKey: appointmentKeys.pendingNotes(),
        queryFn: fetchPendingNotesCount,
        staleTime: 1000 * 60 * 5,
    });

    /* 4.5. Active risk flags count */
    const {
        data: riskFlagsData,
        isLoading: isRiskFlagsLoading,
        isError: isRiskFlagsError,
        isPaused: isRiskFlagsPaused,
        refetch: refetchRiskFlags,
    } = useQuery({
        queryKey: ['risk-flags', 'active-count'],
        queryFn: getActiveRiskFlagsCount,
        staleTime: 1000 * 60 * 5,
    });

    /* 5. Today's appointments (full list) */
    const {
        data: todayAppointments = [],
        isLoading: isTodayLoading,
        isError: isTodayError,
        isPaused: isTodayPaused,
        refetch: refetchToday,
    } = useQuery({
        queryKey: appointmentKeys.list({ date: getTodayDateString() }),
        queryFn: () => fetchAppointmentsByDate(getTodayDateString()),
        staleTime: 1000 * 60 * 5,
    });

    /* 6. Franja de cierre del día */
    // El booleano solo cambia una vez al día, y React descarta un `setState` con
    // el mismo valor: el coste real es una comparación por minuto, sin render.
    const [afterHours, setAfterHours] = useState(() => isAfterHours());

    useEffect(() => {
        const id = setInterval(() => setAfterHours(isAfterHours()), 60_000);
        return () => clearInterval(id);
    }, []);

    /* ── Derived / memoized transformations ── */

    const recentPatients = useMemo(
        () => mapRecentPatients(rawPatients ?? []),
        [rawPatients],
    );

    const calendarCells = useMemo(
        () => buildCalendarDays(rawDaySummary),
        [rawDaySummary],
    );

    const pendingNotesCount = pendingNotesData?.count ?? 0;
    const pendingNoteAppointmentIds = readPendingNoteIds(pendingNotesData);
    const riskFlagsCount = riskFlagsData?.count ?? 0;

    return {
        nextAppointment,
        recentPatients,
        calendarCells,
        pendingNotesCount,
        pendingNoteAppointmentIds,
        riskFlagsCount,
        todayAppointments,
        isLoading,
        isTodayLoading,
        isPendingNotesLoading,
        isRiskFlagsLoading,
        isCalendarLoading,
        isRecentPatientsLoading,
        isAfterHours: afterHours,
        errors: {
            next: isNextError || isNextPaused,
            today: isTodayError || isTodayPaused,
            calendar: isCalendarError || isCalendarPaused,
            pendingNotes: isPendingNotesError || isPendingNotesPaused,
            riskFlags: isRiskFlagsError || isRiskFlagsPaused,
            recentPatients: isRecentPatientsError,
        },
        retry: {
            next: () => void refetchNext(),
            today: () => void refetchToday(),
            calendar: () => void refetchCalendar(),
            attention: () => {
                void refetchPendingNotes();
                void refetchRiskFlags();
            },
            recentPatients: () => {
                recentPatientQueries.forEach((q) => void q.refetch());
            },
        },
    };
}
