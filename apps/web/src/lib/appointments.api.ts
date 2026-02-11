import api from './api';
import type {
  Appointment,
  CheckoutPayload,
  CheckoutResponse,
} from '../types/appointments.types';

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
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
