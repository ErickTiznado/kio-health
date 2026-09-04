import { api } from './api';
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
  ClinicalScale,
  CreateClinicalScalePayload,
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
    params: { date, tz: getClientTimeZone() },
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
    params: { from, to, tz: getClientTimeZone() },
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
    params: { from, to, tz: getClientTimeZone() },
  });
  return response.data;
}

/**
 * Get the next upcoming scheduled appointment from now onwards.
 *
 * El payload trae `hasNote`, pero aquí la cita es futura y `SCHEDULED`: será
 * `false` casi siempre y eso NO significa "nota pendiente". Una nota pendiente
 * exige `status === 'COMPLETED'` (ver `hasPendingNote` en `AgendaPage`).
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

/* ── Appointment Edit ───────────────────────── */

export interface UpdateAppointmentPayload {
  type?: Appointment['type'];
  reason?: string | null;
  price?: number;
}

export async function updateAppointment(
  appointmentId: string,
  payload: UpdateAppointmentPayload,
): Promise<Appointment> {
  const response = await api.patch<Appointment>(
    `/appointments/${appointmentId}`,
    payload,
  );
  return response.data;
}

/* ── Tag Suggestions ────────────────────────── */

export async function fetchTagSuggestions(): Promise<string[]> {
  const response = await api.get<string[]>('/appointments/tags');
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

/* ── Series recurrentes ─────────────────────── */

export interface CreateSeriesPayload {
  patientId: string;
  startTime: string;
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  type?: string;
  reason?: string;
  price?: number;
  duration?: number;
  until?: string;
  maxOccurrences?: number;
}

export interface CreateSeriesResponse {
  series: { id: string; status: string };
  created: Appointment[];
  /** Fechas ISO de ocurrencias saltadas por conflicto de horario. */
  conflicts: string[];
}

export async function createAppointmentSeries(
  payload: CreateSeriesPayload,
): Promise<CreateSeriesResponse> {
  const response = await api.post<CreateSeriesResponse>(
    '/appointment-series',
    payload,
  );
  return response.data;
}

export async function cancelAppointmentSeries(
  seriesId: string,
): Promise<{ cancelled: number }> {
  const response = await api.delete<{ cancelled: number }>(
    `/appointment-series/${seriesId}`,
  );
  return response.data;
}

/**
 * The clinician's IANA timezone, as reported by the browser. Sent with every
 * date-scoped query so the server computes day boundaries in the clinician's
 * zone instead of its own.
 */
export function getClientTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

/**
 * Today's date as YYYY-MM-DD in LOCAL time.
 *
 * This used to be `toISOString().split('T')[0]`, i.e. the UTC date. West of
 * Greenwich that flips to tomorrow in the evening — precisely during the
 * "closing the day" window — so the dashboard asked for the wrong day and then
 * rendered the answer under the heading "Agenda de hoy".
 */
export function getTodayDateString(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
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

/* ── PDF Export ─────────────────────────────── */

/**
 * Download the session PDF for a given appointment.
 * Triggers a browser download using a Blob URL.
 */
export async function exportSessionPdf(
  appointmentId: string,
  includePrivate = false,
): Promise<void> {
  const response = await api.get(`/appointments/${appointmentId}/export/pdf`, {
    params: { includePrivate: includePrivate ? 'true' : undefined },
    responseType: 'blob',
  });
  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `sesion-${appointmentId.slice(0, 8)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function upsertClinicalScale(
  appointmentId: string,
  payload: CreateClinicalScalePayload,
): Promise<ClinicalScale> {
  const response = await api.post<ClinicalScale>(
    `/appointments/${appointmentId}/clinical-scale`,
    payload,
  );
  return response.data;
}

