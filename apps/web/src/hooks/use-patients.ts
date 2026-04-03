import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { CreatePatientDto, UpdatePatientDto, QueryPatientsDto, Patient, PatientsResponse, TimelineResponse } from '../types/patients.types';
import { patientKeys } from '../lib/query-keys';
import { listPatientDocuments, uploadPatientDocument, deletePatientDocument, fetchDocumentBlob } from '../lib/patients.api';

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

const unarchivePatient = async (id: string): Promise<Patient> => {
  const { data } = await api.patch<Patient>(`/patients/${id}/unarchive`);
  return data;
};

export const usePatients = (page: number = 1, search: string = '', status?: 'ACTIVE' | 'ARCHIVED', limit: number = 10) => {
  return useQuery({
    queryKey: patientKeys.list({ page, search, status, limit }),
    queryFn: () => fetchPatients({ page, search, status, limit }),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => fetchPatient(id),
    enabled: !!id,
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePatient,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(data.id) });
    },
  });
};

export const useArchivePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archivePatient,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(data.id) });
    },
  });
};

export const useUnarchivePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unarchivePatient,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(data.id) });
    },
  });
};

export const usePatientTimeline = (patientId: string, search: string = '') => {
  return useInfiniteQuery({
    queryKey: [...patientKeys.timeline(patientId), { search }],
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

export interface ScaleHistoryPoint {
  id: string;
  scaleType: 'PHQ9' | 'GAD7';
  totalScore: number;
  riskLevel: 'MINIMAL' | 'MILD' | 'MODERATE' | 'MODERATELY_SEVERE' | 'SEVERE';
  createdAt: string;
  appointment: { startTime: string };
}

export const usePatientScales = (patientId: string) => {
  return useQuery({
    queryKey: patientKeys.scales(patientId),
    queryFn: async () => {
      const { data } = await api.get<ScaleHistoryPoint[]>(`/patients/${patientId}/scales`);
      return data;
    },
    enabled: !!patientId,
  });
};

export const usePatientDocuments = (patientId: string) => {
  return useQuery({
    queryKey: patientKeys.documents(patientId),
    queryFn: () => listPatientDocuments(patientId),
    enabled: !!patientId,
  });
};

export const useUploadDocument = (patientId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, category }: { file: File; category?: string }) =>
      uploadPatientDocument(patientId, file, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.documents(patientId) });
    },
  });
};

export const useDeleteDocument = (patientId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => deletePatientDocument(patientId, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.documents(patientId) });
    },
  });
};

export const useDocumentBlob = (patientId: string, docId: string, enabled: boolean) => {
  return useQuery({
    queryKey: [...patientKeys.documents(patientId), docId, 'blob'],
    queryFn: () => fetchDocumentBlob(patientId, docId),
    enabled: enabled && !!patientId && !!docId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
    },
  });
};
