import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { CreatePatientDto, UpdatePatientDto, QueryPatientsDto, Patient, PatientsResponse, TimelineResponse } from '../types/patients.types';

const fetchPatients = async (params: QueryPatientsDto): Promise<PatientsResponse> => {
  const { data } = await api.get<PatientsResponse>('/patients', { params });
  return data;
};

const fetchPatient = async (id: string): Promise<Patient> => {
  const { data } = await api.get<Patient>(`/patients/${id}`);
  return data;
};

const createPatient = async (newPatient: CreatePatientDto): Promise<Patient> => {
  const { data } = await api.post<Patient>('/patients', newPatient);
  return data;
};

const updatePatient = async ({ id, data }: { id: string; data: UpdatePatientDto }): Promise<Patient> => {
  const { data: updated } = await api.patch<Patient>(`/patients/${id}`, data);
  return updated;
};

const archivePatient = async (id: string): Promise<Patient> => {
  const { data } = await api.patch<Patient>(`/patients/${id}/archive`);
  return data;
};

export const usePatients = (page: number = 1, search: string = '', limit: number = 10) => {
  return useQuery({
    queryKey: ['patients', page, search, limit],
    queryFn: () => fetchPatients({ page, search, limit }),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => fetchPatient(id),
    enabled: !!id,
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePatient,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', data.id] });
    },
  });
};

export const useArchivePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archivePatient,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', data.id] });
    },
  });
};

export const usePatientTimeline = (patientId: string, search: string = '') => {
  return useInfiniteQuery({
    queryKey: ['timeline', patientId, search],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get<TimelineResponse>(`/patients/${patientId}/timeline`, {
        params: { page: pageParam, limit: 10, search },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.lastPage) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    enabled: !!patientId,
  });
};

export const useTogglePin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const { data } = await api.patch(`/appointments/${appointmentId}/notes/pin`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
};
