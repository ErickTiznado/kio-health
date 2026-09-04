import { api } from './api';
import type { CreatePatientDto, UpdatePatientDto, QueryPatientsDto, Patient, PatientsResponse, PatientDocument } from '../types/patients.types';

/**
 * `QueryPatientsDto` incluye los filtros de servidor `riskFlag`, `hasBalance` y
 * `sort`; axios omite las claves `undefined`, así que una llamada sin ellos
 * produce exactamente la misma URL que antes. `meta.total` de la respuesta es
 * el total YA filtrado, no el de la página.
 */
export const getPatients = async (params: QueryPatientsDto): Promise<PatientsResponse> => {
  const response = await api.get<PatientsResponse>('/patients', { params });
  return response.data;
};

export const getPatient = async (id: string): Promise<Patient> => {
  const response = await api.get<Patient>(`/patients/${id}`);
  return response.data;
};

export const createPatient = async (data: CreatePatientDto): Promise<Patient> => {
  const response = await api.post<Patient>('/patients', data);
  return response.data;
};

export const updatePatient = async (id: string, data: UpdatePatientDto): Promise<Patient> => {
  const response = await api.patch<Patient>(`/patients/${id}`, data);
  return response.data;
};

export const archivePatient = async (id: string): Promise<Patient> => {
  const response = await api.patch<Patient>(`/patients/${id}/archive`);
  return response.data;
};

export const listPatientDocuments = async (patientId: string): Promise<PatientDocument[]> => {
  const response = await api.get<PatientDocument[]>(`/patients/${patientId}/documents`);
  return response.data;
};

export const uploadPatientDocument = async (
  patientId: string,
  file: File,
  category?: string,
): Promise<PatientDocument> => {
  const formData = new FormData();
  formData.append('file', file);
  if (category) formData.append('category', category);
  const response = await api.post<PatientDocument>(`/patients/${patientId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const fetchDocumentBlob = async (patientId: string, docId: string): Promise<Blob> => {
  const response = await api.get<Blob>(`/patients/${patientId}/documents/${docId}/file`, {
    responseType: 'blob',
  });
  return response.data;
};

export const deletePatientDocument = async (patientId: string, docId: string): Promise<void> => {
  await api.delete(`/patients/${patientId}/documents/${docId}`);
};

export const getActiveRiskFlagsCount = async (): Promise<{ count: number }> => {
  const response = await api.get<{ count: number }>('/patients/dashboard/active-risk-flags-count');
  return response.data;
};
