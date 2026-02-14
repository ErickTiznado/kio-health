import { api } from './api';
import type { CreatePatientDto, UpdatePatientDto, QueryPatientsDto, Patient, PatientsResponse } from '../types/patients.types';

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
