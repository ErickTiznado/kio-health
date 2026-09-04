import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { taskKeys } from '../lib/query-keys';

export interface Task {
  id: string;
  description: string;
  isCompleted: boolean;
  dueDate: string | null;
  createdAt: string;
}

export const TASK_DESCRIPTION_MAX_LENGTH = 280;

// Snapshot + parcheo de la lista concreta del paciente. Las mutaciones son
// optimistas para que un fallo de red no deje la UI mintiendo: o se aplica el
// cambio, o se revierte y sale un toast.
type ListSnapshot = ReturnType<QueryClient['getQueryData']>;

const patchList = (
  queryClient: QueryClient,
  patientId: string,
  updater: (tasks: Task[]) => Task[],
) => {
  const key = taskKeys.list(patientId);
  const previous = queryClient.getQueryData<Task[]>(key);
  if (previous) queryClient.setQueryData<Task[]>(key, updater(previous));
  return previous as ListSnapshot;
};

const restoreList = (
  queryClient: QueryClient,
  patientId: string,
  previous: ListSnapshot,
) => {
  if (previous !== undefined) {
    queryClient.setQueryData(taskKeys.list(patientId), previous);
  }
};

export const useTasks = (patientId: string) => {
  return useQuery({
    queryKey: taskKeys.list(patientId),
    queryFn: async () => {
      const { data } = await api.get<Task[]>(`/patients/${patientId}/tasks`);
      return data;
    },
    enabled: !!patientId,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ patientId, description, dueDate }: { patientId: string; description: string; dueDate?: string }) => {
      const { data } = await api.post(`/patients/${patientId}/tasks`, {
        description: description.trim(),
        dueDate,
      });
      return data;
    },
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(patientId) });
    },
    onError: () => {
      toast.error('No se pudo crear la tarea');
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; patientId: string; isCompleted: boolean }) => {
      const { data } = await api.patch(`/tasks/${id}`, { isCompleted });
      return data;
    },
    onMutate: async ({ id, patientId, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.list(patientId) });
      const previous = patchList(queryClient, patientId, (tasks) =>
        tasks.map((t) => (t.id === id ? { ...t, isCompleted } : t)),
      );
      return { previous };
    },
    onError: (_err, { patientId }, context) => {
      restoreList(queryClient, patientId, context?.previous);
      toast.error('No se pudo actualizar la tarea');
    },
    onSettled: (_data, _err, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(patientId) });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; patientId: string }) => {
      await api.delete(`/tasks/${id}`);
    },
    onMutate: async ({ id, patientId }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.list(patientId) });
      const previous = patchList(queryClient, patientId, (tasks) =>
        tasks.filter((t) => t.id !== id),
      );
      return { previous };
    },
    onError: (_err, { patientId }, context) => {
      restoreList(queryClient, patientId, context?.previous);
      toast.error('No se pudo eliminar la tarea');
    },
    onSettled: (_data, _err, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(patientId) });
    },
  });
};
