import api from './api';
import type {
  Appointment,
  CheckoutPayload,
  CheckoutResponse,
  RecentPatient,
  DaySummary,
  PendingNotesCount,
  CreateAppointmentPayload,
  ReschedulePayload,
  SessionContext,
  PsychNote,
  CreatePsychNoteDto,
} from '../types/appointments.types';

/**
 * Get the full context for an active session.
 */
export async function fetchSessionContext(appointmentId: string): Promise<SessionContext> {
  const response = await api.get<SessionContext>(`/appointments/${appointmentId}/context`);
  return response.data;
}

/**
 * Fetch appointments for a specific date.
 * @param date - Date in YYYY-MM-DD format
 */
export async function fetchAppointmentsByDate(
  date: string,
): Promise<Appointment[]> {
  const response = await api.get<Appointment[]>('/appointments', {
    params: { date },
  });
  return response.data;
}

/**
 * Fetch appointments for a date range (e.g. weekly view).
 * @param from - Start date in YYYY-MM-DD format
 * @param to - End date in YYYY-MM-DD format
 */
export async function fetchAppointmentsByRange(
  from: string,
  to: string,
): Promise<Appointment[]> {
  const response = await api.get<Appointment[]>('/appointments', {
    params: { from, to },
  });
  return response.data;
}

/**
 * Complete a session checkout: mark as COMPLETED, record payment,
 * and optionally schedule the next appointment.
 */
export async function completeCheckout(
  appointmentId: string,
  payload: CheckoutPayload,
): Promise<CheckoutResponse> {
  const response = await api.patch<CheckoutResponse>(
    `/appointments/${appointmentId}/checkout`,
    payload,
  );
  return response.data;
}

/**
 * Get recent unique patients from completed appointments.
 */
export async function fetchRecentPatients(): Promise<RecentPatient[]> {
  const response = await api.get<RecentPatient[]>(
    '/appointments/recent-patients',
  );
  return response.data;
}

/**
 * Get appointment count per day for a date range.
 * @param from - Start date in YYYY-MM-DD format
 * @param to - End date in YYYY-MM-DD format
 */
export async function fetchDaySummary(
  from: string,
  to: string,
): Promise<DaySummary> {
  const response = await api.get<DaySummary>('/appointments/day-summary', {
    params: { from, to },
  });
  return response.data;
}

/**
 * Get the next upcoming scheduled appointment from now onwards.
 */
export async function fetchNextAppointment(): Promise<Appointment | null> {
  const response = await api.get<Appointment | null>('/appointments/next');
  return response.data;
}

/**
 * Get the count of completed appointments without a psych note.
 */
export async function fetchPendingNotesCount(): Promise<PendingNotesCount> {
  const response = await api.get<PendingNotesCount>(
    '/appointments/pending-notes-count',
  );
  return response.data;
}

/* ── Status transition calls ────────────────── */

export async function startSession(appointmentId: string): Promise<Appointment> {
  const response = await api.patch<Appointment>(`/appointments/${appointmentId}/start`);
  return response.data;
}

export async function cancelAppointment(appointmentId: string): Promise<Appointment> {
  const response = await api.patch<Appointment>(`/appointments/${appointmentId}/cancel`);
  return response.data;
}

export async function markNoShow(appointmentId: string): Promise<Appointment> {
  const response = await api.patch<Appointment>(`/appointments/${appointmentId}/no-show`);
  return response.data;
}

export async function updateNotes(appointmentId: string, notes: string): Promise<Appointment> {
  const response = await api.patch<Appointment>(`/appointments/${appointmentId}/notes`, { notes });
  return response.data;
}

export interface UpdatePaymentPayload {
  status: 'PENDING' | 'PAID';
  amount?: number;
  method?: 'CASH' | 'CARD' | 'TRANSFER';
}

export async function updatePayment(appointmentId: string, payload: UpdatePaymentPayload): Promise<Appointment> {
  const response = await api.patch<Appointment>(`/appointments/${appointmentId}/payment`, payload);
  return response.data;
}

/* ── Scheduling ─────────────────────────────── */

export async function createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
  const response = await api.post<Appointment>('/appointments', payload);
  return response.data;
}

export async function rescheduleAppointment(appointmentId: string, payload: ReschedulePayload): Promise<Appointment> {
  const response = await api.patch<Appointment>(`/appointments/${appointmentId}/reschedule`, payload);
  return response.data;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/* ── Clinical Notes ─────────────────────────── */

export async function fetchPsychNote(appointmentId: string): Promise<PsychNote> {
  const response = await api.get<PsychNote>(`/appointments/${appointmentId}/notes`);
  return response.data;
}

export async function upsertPsychNote(
  appointmentId: string,
  payload: CreatePsychNoteDto,
): Promise<PsychNote> {
  const response = await api.post<PsychNote>(`/appointments/${appointmentId}/notes`, payload);
  return response.data;
}
