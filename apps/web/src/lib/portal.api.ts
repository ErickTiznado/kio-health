import axios from 'axios';
import { usePortalStore } from '../stores/portal.store';

/**
 * Cliente HTTP del portal del PACIENTE.
 *
 * Instancia separada de `lib/api.ts` a propósito:
 * - sin withCredentials (la cookie del clínico no pinta nada aquí)
 * - sin interceptor de refresh de sesión
 * - autenticación por header X-Patient-Token (capa de tokens del portal)
 */
const portalApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`,
});

portalApi.interceptors.request.use((config) => {
  const token = usePortalStore.getState().token;
  if (token) {
    config.headers['X-Patient-Token'] = token;
  }
  return config;
});

export interface PortalSession {
  patientFirstName: string;
  clinicianName: string;
  timezone: string;
}

export interface PortalAppointment {
  id: string;
  startTime: string;
  endTime: string;
  type: string;
  confirmed: boolean;
  rescheduleRequested: boolean;
}

export interface PortalScaleAssignment {
  id: string;
  scaleType: 'PHQ9' | 'GAD7';
  createdAt: string;
  appointment: { startTime: string };
}

export async function getPortalSession(): Promise<PortalSession> {
  const res = await portalApi.get<PortalSession>('/portal/session');
  return res.data;
}

export async function getPortalAppointments(): Promise<PortalAppointment[]> {
  const res = await portalApi.get<PortalAppointment[]>('/portal/appointments');
  return res.data;
}

export async function confirmPortalAppointment(id: string): Promise<void> {
  await portalApi.post(`/portal/appointments/${id}/confirm`);
}

export async function cancelPortalAppointment(id: string): Promise<void> {
  await portalApi.post(`/portal/appointments/${id}/cancel`);
}

export async function requestPortalReschedule(
  id: string,
  message?: string,
): Promise<void> {
  await portalApi.post(`/portal/appointments/${id}/reschedule-request`, {
    message,
  });
}

export async function getPortalScaleAssignments(): Promise<PortalScaleAssignment[]> {
  const res = await portalApi.get<PortalScaleAssignment[]>(
    '/portal/scale-assignments',
  );
  return res.data;
}

export async function submitPortalScale(
  assignmentId: string,
  scores: number[],
): Promise<{ ok: boolean; crisis: boolean }> {
  const res = await portalApi.post<{ ok: boolean; crisis: boolean }>(
    `/portal/scale-assignments/${assignmentId}/submit`,
    { scores },
  );
  return res.data;
}
