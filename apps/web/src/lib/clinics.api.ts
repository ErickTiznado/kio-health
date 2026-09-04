import { api } from './api';
import type {
  Clinic,
  ClinicInvitation,
  ClinicPatient,
  ClinicMemberFinance,
  ClinicRole,
  GrantableClinicRole,
  InvitationLink,
  InvitationPreview,
  CreateClinicDto,
  InviteMemberDto,
  RegisterFromInvitationDto,
  RegisterFromInvitationResult,
} from '../types/clinic.types';

export async function createClinic(dto: CreateClinicDto): Promise<Clinic> {
  const res = await api.post<Clinic>('/clinics', dto);
  return res.data;
}

export async function getMyClinic(): Promise<Clinic> {
  const res = await api.get<Clinic>('/clinics/mine');
  return res.data;
}

export async function updateClinic(dto: { name: string }): Promise<Clinic> {
  const res = await api.patch<Clinic>('/clinics/mine', dto);
  return res.data;
}

export async function deleteClinic(): Promise<void> {
  await api.delete('/clinics/mine');
}

export async function createInvitation(dto: InviteMemberDto): Promise<InvitationLink> {
  const res = await api.post<InvitationLink>('/clinics/mine/invitations', dto);
  return res.data;
}

export async function listInvitations(): Promise<ClinicInvitation[]> {
  const res = await api.get<ClinicInvitation[]>('/clinics/mine/invitations');
  return res.data;
}

export async function revokeInvitation(id: string): Promise<void> {
  await api.delete(`/clinics/mine/invitations/${id}`);
}

/** Público. 404 si el token no existe, caducó o ya se canjeó. */
export async function validateToken(token: string): Promise<InvitationPreview> {
  const res = await api.get<InvitationPreview>('/clinics/join', {
    params: { token },
  });
  return res.data;
}

/** Canje para quien YA tiene cuenta. Requiere sesión iniciada. 204. */
export async function acceptInvitation(token: string): Promise<void> {
  await api.post('/clinics/join', { token });
}

/**
 * Canje para quien NO tiene cuenta: crea usuario, perfil clínico y membresía
 * en una sola transacción. Público.
 *
 * NO inicia sesión ni deja cookies: quien lo llame tiene que hacer después un
 * `POST /auth/login` con el correo devuelto y la contraseña recién tecleada.
 * El `clinicianId` ya existe tras esto, así que `POST /auth/complete-profile`
 * devolvería 409 — esa cuenta no pasa por el onboarding.
 */
export async function registerFromInvitation(
  dto: RegisterFromInvitationDto,
): Promise<RegisterFromInvitationResult> {
  const res = await api.post<RegisterFromInvitationResult>('/clinics/join/register', dto);
  return res.data;
}

export async function removeMember(clinicianId: string): Promise<void> {
  await api.delete(`/clinics/mine/members/${clinicianId}`);
}

/** El backend solo acepta ADMIN y MEMBER: la propiedad no se concede. */
export async function updateMemberRole(
  clinicianId: string,
  role: GrantableClinicRole,
): Promise<void> {
  await api.patch(`/clinics/mine/members/${clinicianId}/role`, { role });
}

export async function getClinicPatients(): Promise<ClinicPatient[]> {
  const res = await api.get<ClinicPatient[]>('/clinics/mine/patients');
  return res.data;
}

export async function getClinicFinanceSummary(month: number, year: number): Promise<ClinicMemberFinance[]> {
  const res = await api.get<ClinicMemberFinance[]>('/clinics/mine/finance/summary', {
    params: { month, year },
  });
  return res.data;
}

export interface ClinicMemberAttendance {
  clinicianId: string;
  email: string;
  role: ClinicRole;
  completed: number;
  noShow: number;
  cancelled: number;
  scheduled: number;
  attendanceRate: number | null;
}

export async function getClinicAttendance(month: number, year: number): Promise<ClinicMemberAttendance[]> {
  const res = await api.get<ClinicMemberAttendance[]>('/clinics/mine/attendance', {
    params: { month, year },
  });
  return res.data;
}

export async function leaveClinic(): Promise<void> {
  await api.post('/clinics/leave');
}
