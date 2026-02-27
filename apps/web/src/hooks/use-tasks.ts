import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { taskKeys } from '../lib/query-keys';

export interface Task {
  id: string;
  description: string;
  isCompleted: boolean;
  dueDate: string | null;
  createdAt: string;
}

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
      const { data } = await api.post(`/patients/${patientId}/tasks`, { description, dueDate });
      return data;
    },
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(patientId) });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const { data } = await api.patch(`/tasks/${id}`, { isCompleted });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};
