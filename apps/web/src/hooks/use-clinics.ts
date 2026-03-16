import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/auth.store';
import { api } from '../lib/api';
import { clinicKeys } from '../lib/query-keys';
import * as clinicsApi from '../lib/clinics.api';
import type { InviteMemberDto, CreateMemberAccountDto } from '../types/clinic.types';

function useRefreshAuth() {
  const { fetchCurrentUser } = useAuthStore();
  const queryClient = useQueryClient();

  return async () => {
    await api.post('/auth/refresh');
    await fetchCurrentUser();
    queryClient.invalidateQueries({ queryKey: clinicKeys.all });
  };
}

export function useMyClinic() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: clinicKeys.mine(),
    queryFn: clinicsApi.getMyClinic,
    enabled: !!user?.clinicId,
  });
}

export function useClinicInvitations() {
  return useQuery({
    queryKey: clinicKeys.invitations(),
    queryFn: clinicsApi.listInvitations,
  });
}

export function useClinicPatients() {
  return useQuery({
    queryKey: clinicKeys.patients(),
    queryFn: clinicsApi.getClinicPatients,
  });
}

export function useClinicFinance(month: number, year: number) {
  return useQuery({
    queryKey: clinicKeys.finance(month, year),
    queryFn: () => clinicsApi.getClinicFinanceSummary(month, year),
  });
}

export function useCreateClinic() {
  const refreshAuth = useRefreshAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clinicsApi.createClinic,
    onSuccess: async () => {
      await refreshAuth();
      queryClient.invalidateQueries({ queryKey: clinicKeys.all });
      toast.success('Clínica creada exitosamente');
    },
    onError: () => toast.error('Error al crear la clínica'),
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: InviteMemberDto) => clinicsApi.createInvitation(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicKeys.invitations() });
    },
    onError: () => toast.error('Error al crear la invitación'),
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clinicsApi.revokeInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicKeys.invitations() });
      toast.success('Invitación revocada');
    },
    onError: () => toast.error('Error al revocar la invitación'),
  });
}

export function useCreateMemberAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateMemberAccountDto) => clinicsApi.createMemberAccount(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicKeys.mine() });
      toast.success('Cuenta creada y miembro agregado a la clínica');
    },
    onError: () => toast.error('Error al crear la cuenta'),
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clinicianId: string) => clinicsApi.removeMember(clinicianId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicKeys.mine() });
      toast.success('Miembro removido de la clínica');
    },
    onError: () => toast.error('Error al remover el miembro'),
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clinicianId, role }: { clinicianId: string; role: string }) =>
      clinicsApi.updateMemberRole(clinicianId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicKeys.mine() });
      toast.success('Rol actualizado');
    },
    onError: () => toast.error('Error al actualizar el rol'),
  });
}

export function useAcceptInvitation() {
  const refreshAuth = useRefreshAuth();

  return useMutation({
    mutationFn: (token: string) => clinicsApi.acceptInvitation(token),
    onSuccess: async () => {
      await refreshAuth();
      toast.success('Te has unido a la clínica exitosamente');
    },
    onError: () => toast.error('Error al aceptar la invitación'),
  });
}

export function useLeaveClinic() {
  const refreshAuth = useRefreshAuth();

  return useMutation({
    mutationFn: clinicsApi.leaveClinic,
    onSuccess: async () => {
      await refreshAuth();
      toast.success('Has abandonado la clínica');
    },
    onError: () => toast.error('Error al abandonar la clínica'),
  });
}
