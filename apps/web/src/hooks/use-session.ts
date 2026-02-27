import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSessionContext, startSession, markNoShow, updateNotes, upsertAnthropometry, upsertMealPlan, upsertClinicalScale } from '../lib/appointments.api';
import type { CreateAnthropometryPayload, CreateMealPlanPayload, CreateClinicalScalePayload } from '../types/appointments.types';
import { appointmentKeys } from '../lib/query-keys';
import { toast } from 'sonner';

export const useSessionSnapshot = (appointmentId: string) => {
  return useQuery({
    queryKey: appointmentKeys.context(appointmentId),
    queryFn: () => fetchSessionContext(appointmentId),
    enabled: !!appointmentId,
  });
};

export const useStartSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startSession,
    onSuccess: (_data, appointmentId) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.context(appointmentId) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

export const useMarkNoShow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNoShow,
    onSuccess: (_data, appointmentId) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.context(appointmentId) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
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

export const useUpsertAnthropometry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, data }: { appointmentId: string; data: CreateAnthropometryPayload }) =>
      upsertAnthropometry(appointmentId, data),
    onSuccess: (_data, { appointmentId }) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.context(appointmentId) });
    },
  });
};

export const useUpsertMealPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, data }: { appointmentId: string; data: CreateMealPlanPayload }) =>
      upsertMealPlan(appointmentId, data),
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
