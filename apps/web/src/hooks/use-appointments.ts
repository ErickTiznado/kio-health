import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  updateAppointment,
  fetchTagSuggestions,
  type UpdateAppointmentPayload,
} from '../lib/appointments.api';
import { appointmentKeys } from '../lib/query-keys';
import { toast } from 'sonner';
import { getErrorMessage } from '../lib/errors';

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentPayload }) =>
      updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      toast.success('Cita actualizada correctamente');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Error al actualizar la cita'));
    },
  });
};

export const useTagSuggestions = () => {
  return useQuery({
    queryKey: [...appointmentKeys.all, 'tags'],
    queryFn: fetchTagSuggestions,
    staleTime: 5 * 60 * 1000,
  });
};
