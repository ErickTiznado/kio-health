import { api } from './api';
import type {
  Clinic,
  ClinicInvitation,
  ClinicPatient,
  ClinicMemberFinance,
  InvitationLink,
  CreateClinicDto,
  InviteMemberDto,
  CreateMemberAccountDto,
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

export async function validateToken(token: string): Promise<{ clinicName: string; invitedRole: string }> {
  const res = await api.get<{ clinicName: string; invitedRole: string }>('/clinics/join', {
    params: { token },
  });
  return res.data;
}

export async function acceptInvitation(token: string): Promise<void> {
  await api.post('/clinics/join', { token });
}

export async function createMemberAccount(dto: CreateMemberAccountDto): Promise<{ userId: string; clinicianId: string; email: string }> {
  const res = await api.post('/clinics/mine/members', dto);
  return res.data;
}

export async function removeMember(clinicianId: string): Promise<void> {
  await api.delete(`/clinics/mine/members/${clinicianId}`);
}

export async function updateMemberRole(clinicianId: string, role: string): Promise<void> {
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

export async function leaveClinic(): Promise<void> {
  await api.post('/clinics/leave');
}
