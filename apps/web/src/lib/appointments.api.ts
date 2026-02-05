import api from './api';
import type { Appointment } from '../types/appointments.types';

/**
 * Fetch appointments for a specific date.
 * @param date - Date in YYYY-MM-DD format
 */
export async function fetchAppointmentsByDate(date: string): Promise<Appointment[]> {
  const response = await api.get<Appointment[]>('/appointments', {
    params: { date },
  });
  return response.data;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}
