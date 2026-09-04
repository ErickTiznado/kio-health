import { api } from './api';

export interface AccessLogEntry {
  id: string;
  action: string;
  resource: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: { email: string } | null;
  patient: { id: string; fullName: string } | null;
}

export interface AccessLogsResponse {
  data: AccessLogEntry[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface AccessLogsQuery {
  page?: number;
  limit?: number;
  action?: string;
  patientId?: string;
  from?: string;
  to?: string;
}

/** Registro de accesos del clínico (sus pacientes + sus propios eventos). */
export async function getMyAccessLogs(
  query: AccessLogsQuery,
): Promise<AccessLogsResponse> {
  const res = await api.get<AccessLogsResponse>('/access-logs', {
    params: query,
  });
  return res.data;
}

/** Registro de accesos de toda la clínica (solo OWNER/ADMIN). */
export async function getClinicAccessLogs(
  query: AccessLogsQuery,
): Promise<AccessLogsResponse> {
  const res = await api.get<AccessLogsResponse>('/clinics/mine/access-logs', {
    params: query,
  });
  return res.data;
}
