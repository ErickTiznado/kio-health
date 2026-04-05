import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { PsychNoteAddendum } from '../types/patients.types';
import { addendumKeys } from '../lib/query-keys';
import { toast } from 'sonner';

const fetchAddendums = async (appointmentId: string): Promise<PsychNoteAddendum[]> => {
  const { data } = await api.get<PsychNoteAddendum[]>(
    `/appointments/${appointmentId}/addendums`
  );
  return data;
};

const createAddendum = async ({
  appointmentId,
  content,
  privateNotes,
}: {
  appointmentId: string;
  content: string;
  privateNotes?: string;
}): Promise<PsychNoteAddendum> => {
  const { data } = await api.post<PsychNoteAddendum>(
    `/appointments/${appointmentId}/addendum`,
    { content, privateNotes }
  );
  return data;
};

export const useAddendums = (appointmentId: string) => {
  return useQuery({
    queryKey: addendumKeys.appointment(appointmentId),
    queryFn: () => fetchAddendums(appointmentId),
    enabled: !!appointmentId,
  });
};

export const useCreateAddendum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAddendum,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: addendumKeys.appointment(variables.appointmentId),
      });
      toast.success('Anexo agregado correctamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al crear anexo';
      if (message.includes('30 days')) {
        toast.error('No se pueden crear anexos después de 30 días');
      } else {
        toast.error(message);
      }
    },
  });
};
