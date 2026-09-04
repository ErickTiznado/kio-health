import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { CreatePatientDto, UpdatePatientDto, QueryPatientsDto, Patient, PatientsResponse, PatientsSort, TimelineResponse } from '../types/patients.types';
import { appointmentKeys, patientKeys } from '../lib/query-keys';
import { capture } from '../lib/analytics';
import { listPatientDocuments, uploadPatientDocument, deletePatientDocument, fetchDocumentBlob } from '../lib/patients.api';
import { fetchAppointmentsByDate, getTodayDateString } from '../lib/appointments.api';
import type { Appointment } from '../types/appointments.types';

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

/**
 * Filtros que resuelve el SERVIDOR. No se replican en cliente: filtrar sobre la
 * página traída sólo puede ver lo que cupo en ella, y en una lista de pacientes
 * eso convierte «ninguno tiene bandera activa» en una afirmación que la vista no
 * puede sostener. Con estos parámetros `meta.total` es el total ya filtrado.
 */
export interface PatientsListFilters {
  riskFlag?: boolean;
  hasBalance?: boolean;
  sort?: PatientsSort;
}

export const usePatients = (
  page: number = 1,
  search: string = '',
  status?: 'ACTIVE' | 'ARCHIVED',
  limit: number = 10,
  filters: PatientsListFilters = {},
) => {
  const { riskFlag, hasBalance, sort } = filters;
  // Las claves opcionales sólo se añaden cuando tienen valor: así la petición
  // sin filtros es literalmente la de antes y el orden por defecto no se
  // anuncia como una elección.
  const params: QueryPatientsDto = { page, search, status, limit };
  if (riskFlag !== undefined) params.riskFlag = riskFlag;
  if (hasBalance !== undefined) params.hasBalance = hasBalance;
  if (sort !== undefined) params.sort = sort;

  return useQuery({
    queryKey: patientKeys.list({ page, search, status, limit, riskFlag, hasBalance, sort }),
    queryFn: () => fetchPatients(params),
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
    onSuccess: (_data, variables) => {
      // Solo booleanos: qué campos del formulario se rellenan de verdad. Si
      // nadie toca diagnóstico o contexto clínico, el alta pide demasiado para
      // el hueco de tiempo que tiene el clínico, y hay que plegar esos campos.
      capture('patient_created', {
        has_diagnosis: Boolean(variables.diagnosis),
        has_clinical_context: Boolean(variables.clinicalContext),
        has_emergency_contact: Boolean(variables.emergencyContact),
        has_phone: Boolean(variables.contactPhone),
      });
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

/**
 * La cita de HOY de este paciente que todavía se puede abrir en sesión
 * (`SCHEDULED` o `IN_PROGRESS`), o `null` si hoy no hay ninguna.
 *
 * Por qué no sale de `GET /patients/:id`: ese payload trae `appointments`
 * ordenadas por `startTime: 'desc'`, así que `appointments[0]` es la MÁS
 * RECIENTE, nunca la próxima (ver `patients.types.ts`). Leerlo como "próxima
 * cita" fue exactamente el bug que hacía que el listado afirmara que ningún
 * paciente tenía cita agendada, y no se va a repetir aquí.
 *
 * Se pide, entonces, la agenda del día — el endpoint que ya existe — con la
 * MISMA clave de caché que usa el dashboard (`use-dashboard-data.ts`), de modo
 * que abrir la ficha después de ver el panel no dispara una petición nueva.
 * `getTodayDateString()` calcula el día civil en hora LOCAL: derivarlo de
 * `toISOString()` adelanta la fecha al oeste de Greenwich por la tarde.
 *
 * Alcance deliberado: esto responde "¿hay sesión que abrir ahora?", NO "¿cuál
 * es su próxima cita?". La segunda pregunta necesita un dato que hoy ningún
 * endpoint devuelve por paciente.
 */
export const usePatientTodayAppointment = (patientId: string) => {
  const today = getTodayDateString();
  return useQuery({
    queryKey: appointmentKeys.list({ date: today }),
    queryFn: () => fetchAppointmentsByDate(today),
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5,
    select: (appointments: Appointment[]) =>
      appointments.find(
        (apt) =>
          apt.patientId === patientId &&
          (apt.status === 'SCHEDULED' || apt.status === 'IN_PROGRESS'),
      ) ?? null,
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
