import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSessionContext, startSession, markNoShow, updateNotes, upsertAnthropometry, upsertMealPlan } from '../lib/appointments.api';
import type { CreateAnthropometryPayload, CreateMealPlanPayload } from '../types/appointments.types';

export const useSessionSnapshot = (appointmentId: string) => {
  return useQuery({
    queryKey: ['session', appointmentId],
    queryFn: () => fetchSessionContext(appointmentId),
    enabled: !!appointmentId,
  });
};

export const useStartSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startSession,
    onSuccess: (_data, appointmentId) => {
      queryClient.invalidateQueries({ queryKey: ['session', appointmentId] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useMarkNoShow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNoShow,
    onSuccess: (_data, appointmentId) => {
      queryClient.invalidateQueries({ queryKey: ['session', appointmentId] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useUpdateNotes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, notes }: { appointmentId: string; notes: string }) =>
      updateNotes(appointmentId, notes),
    onSuccess: (_data, { appointmentId }) => {
      // Optimistically we might not need to refetch immediately if we are debouncing,
      // but let's keep it consistent.
      queryClient.invalidateQueries({ queryKey: ['session', appointmentId] });
    },
  });
};

export const useUpsertAnthropometry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, data }: { appointmentId: string; data: CreateAnthropometryPayload }) =>
      upsertAnthropometry(appointmentId, data),
    onSuccess: (_data, { appointmentId }) => {
      queryClient.invalidateQueries({ queryKey: [session, appointmentId] });
    },
  });
};

export const useUpsertMealPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, data }: { appointmentId: string; data: CreateMealPlanPayload }) =>
      upsertMealPlan(appointmentId, data),
    onSuccess: (_data, { appointmentId }) => {
      queryClient.invalidateQueries({ queryKey: [session, appointmentId] });
    },
  });
};

