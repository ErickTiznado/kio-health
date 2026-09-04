import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { capture } from '../lib/analytics';
import { useAuthStore } from '../stores/auth.store';
import { api } from '../lib/api';
import { getErrorMessage } from '../lib/errors';
import { clinicKeys } from '../lib/query-keys';
import * as clinicsApi from '../lib/clinics.api';
import type {
  GrantableClinicRole,
  InviteMemberDto,
  RegisterFromInvitationDto,
} from '../types/clinic.types';

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

/**
 * `GET /clinics/mine/invitations` exige ClinicAdminGuard: pedirlo como MEMBER
 * devuelve 403 y la vista acababa disfrazando ese error de "no hay ninguna".
 */
export function useClinicInvitations(enabled = true) {
  return useQuery({
    queryKey: clinicKeys.invitations(),
    queryFn: clinicsApi.listInvitations,
    enabled,
  });
}

/** Igual que las invitaciones: `GET /clinics/mine/patients` es solo OWNER/ADMIN. */
export function useClinicPatients(enabled = true) {
  return useQuery({
    queryKey: clinicKeys.patients(),
    queryFn: clinicsApi.getClinicPatients,
    enabled,
  });
}

export function useClinicFinance(month: number, year: number) {
  return useQuery({
    queryKey: clinicKeys.finance(month, year),
    queryFn: () => clinicsApi.getClinicFinanceSummary(month, year),
  });
}

export function useClinicAttendance(month: number, year: number) {
  return useQuery({
    queryKey: clinicKeys.attendance(month, year),
    queryFn: () => clinicsApi.getClinicAttendance(month, year),
  });
}

export function useCreateClinic() {
  const refreshAuth = useRefreshAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clinicsApi.createClinic,
    onSuccess: async () => {
      capture('clinic_created', { role: 'OWNER' });
      await refreshAuth();
      queryClient.invalidateQueries({ queryKey: clinicKeys.all });
      toast.success('Clínica creada exitosamente');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Error al crear la clínica')),
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: InviteMemberDto) => clinicsApi.createInvitation(dto),
    onSuccess: (_data, dto) => {
      capture('clinic_invitation_created', { role: String(dto.role) });
      queryClient.invalidateQueries({ queryKey: clinicKeys.invitations() });
    },
    // El backend rechaza `role: OWNER` con un motivo escrito para leerse
    // ("La propiedad de la clínica no se puede conceder…"). Un toast genérico
    // lo tapaba y dejaba al administrador sin saber qué había pasado.
    onError: (error) => toast.error(getErrorMessage(error, 'Error al crear la invitación')),
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
    onError: (error) => toast.error(getErrorMessage(error, 'Error al revocar la invitación')),
  });
}

/*
 * `useCreateMemberAccount` se retiró junto con el formulario "Crear cuenta
 * nueva" de ClinicPage. Pedía email + contraseña, de modo que el propietario
 * fijaba la credencial de su colega y se la dictaba: compartir contraseñas
 * convertido en la ruta de alta de un producto cuya promesa central es la
 * confidencialidad clínica. `POST /clinics/mine/members` ya NO existe en el
 * backend — el endpoint se eliminó con el formulario.
 *
 * El alta pasa ahora por el enlace de invitación de un solo uso: quien lo
 * recibe y no tiene cuenta la crea en `/join/:token` con
 * `useRegisterFromInvitation` (contraseña que solo conoce esa persona), y
 * quien ya la tiene inicia sesión y canjea con `useAcceptInvitation`. La
 * pantalla elige rama con el `hasAccount` que devuelve `GET /clinics/join`.
 */

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clinicianId: string) => clinicsApi.removeMember(clinicianId),
    onSuccess: () => {
      capture('clinic_member_removed', {});
      queryClient.invalidateQueries({ queryKey: clinicKeys.mine() });
      toast.success('Miembro removido de la clínica');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Error al remover el miembro')),
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    // Solo ADMIN y MEMBER: el backend rechaza OWNER con 403, porque promover a
    // propietario no transfiere la propiedad, la duplica de forma irrevocable.
    mutationFn: ({
      clinicianId,
      role,
    }: {
      clinicianId: string;
      role: GrantableClinicRole;
    }) => clinicsApi.updateMemberRole(clinicianId, role),
    onSuccess: (_data, { role }) => {
      // El indicador honesto de si los roles se entienden. Cambiar el rol de
      // alguien poco después de invitarlo significa que no se entendió al
      // asignarlo: el problema está en cómo se explican, no en quién lo usa.
      capture('clinic_member_role_changed', { to_role: role });
      queryClient.invalidateQueries({ queryKey: clinicKeys.mine() });
      toast.success('Rol actualizado');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Error al actualizar el rol')),
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
    // El canje es atómico y puede perder la carrera: el 409 "Esta invitación ya
    // fue usada" es un hecho distinto de "algo falló", y quien lo recibe
    // necesita saber que el enlace ya no sirve en vez de reintentar.
    onError: (error) => toast.error(getErrorMessage(error, 'Error al aceptar la invitación')),
  });
}

/**
 * Alta de cuenta canjeando una invitación, para quien NO tiene cuenta en Kio.
 *
 * `POST /clinics/join/register` crea la cuenta pero no abre sesión ni deja
 * cookies, así que el inicio de sesión va aquí, con el correo que decide la
 * invitación y la contraseña que el invitado acaba de teclear.
 *
 * Si el alta funciona y el login no, la cuenta EXISTE: devolvemos
 * `loggedIn: false` en vez de propagar el fallo, para que la pantalla pueda
 * decir "tu cuenta ya está creada, entra con este correo" en lugar de sugerir
 * que hay que repetir el alta — el token ya está quemado y repetirla daría 404.
 *
 * Esa cuenta nace con `ClinicianProfile`, de modo que
 * `POST /auth/complete-profile` devolvería 409: el destino tras el login es
 * `/dashboard`, nunca `/onboarding`.
 */
export function useRegisterFromInvitation() {
  const { login, fetchCurrentUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: RegisterFromInvitationDto) => {
      const result = await clinicsApi.registerFromInvitation(dto);
      try {
        await login(result.email, dto.password);
        // El JWT del login ya trae `clinicId` y `clinicRole` porque el
        // `ClinicMember` se creó en la misma transacción que la cuenta;
        // `fetchCurrentUser` sincroniza el perfil completo en el store.
        await fetchCurrentUser();
        return { ...result, loggedIn: true };
      } catch {
        return { ...result, loggedIn: false };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: clinicKeys.all });
      if (result.loggedIn) {
        toast.success(`Te has unido a ${result.clinicName}`);
      }
    },
  });
}

export function useLeaveClinic() {
  const refreshAuth = useRefreshAuth();

  return useMutation({
    mutationFn: clinicsApi.leaveClinic,
    onSuccess: async () => {
      capture('clinic_left', {});
      await refreshAuth();
      toast.success('Has abandonado la clínica');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Error al abandonar la clínica')),
  });
}
