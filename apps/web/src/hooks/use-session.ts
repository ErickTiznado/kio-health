import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSessionContext, startSession, markNoShow, updateNotes, upsertClinicalScale } from '../lib/appointments.api';
import type { CreateClinicalScalePayload } from '../types/appointments.types';
import { appointmentKeys } from '../lib/query-keys';
import { capture } from '../lib/analytics';
import { toast } from 'sonner';

export const useSessionSnapshot = (appointmentId: string) => {
  return useQuery({
    queryKey: appointmentKeys.context(appointmentId),
    queryFn: () => fetchSessionContext(appointmentId),
    enabled: !!appointmentId,
  });
};

/**
 * Mensaje del servidor si lo hay. Un "Iniciar sesión" que falla en silencio es
 * un botón muerto: se pulsa, no pasa nada, y la cita se queda en SCHEDULED sin
 * que nadie explique por qué.
 */
function errorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: { message?: string | string[] } } }).response;
  const message = response?.data?.message;
  if (Array.isArray(message)) return message[0] || fallback;
  return message || fallback;
}

export const useStartSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startSession,
    onSuccess: (_data, appointmentId) => {
      capture('session_started', {});
      queryClient.invalidateQueries({ queryKey: appointmentKeys.context(appointmentId) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
    onError: (error) =>
      toast.error(errorMessage(error, 'No se pudo iniciar la sesión. Vuelve a intentarlo.')),
  });
};

export const useMarkNoShow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNoShow,
    onSuccess: (_data, appointmentId) => {
      capture('session_no_show_marked', {});
      queryClient.invalidateQueries({ queryKey: appointmentKeys.context(appointmentId) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
    onError: (error) =>
      toast.error(errorMessage(error, 'No se pudo marcar como no asistió. Vuelve a intentarlo.')),
  });
};

export const useUpdateNotes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, notes }: { appointmentId: string; notes: string }) =>
      updateNotes(appointmentId, notes),
    onSuccess: (_data, { appointmentId }) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.context(appointmentId) });
    },
  });
};

export const useUpsertClinicalScale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, data }: { appointmentId: string; data: CreateClinicalScalePayload }) =>
      upsertClinicalScale(appointmentId, data),
    onSuccess: (_data, { appointmentId }) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.context(appointmentId) });
      toast.success('Escala guardada correctamente');
    },
    onError: () => toast.error('Error al guardar la escala'),
  });
};
