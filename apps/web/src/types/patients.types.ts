import type { Appointment, PsychNote } from './appointments.types';

export interface EmergencyContact {
  name?: string;
  phone?: string;
  relation?: string;
}

export interface Patient {
  id: string;
  clinicianId: string;
  fullName: string;
  dateOfBirth?: string;
  diagnosis?: string;
  clinicalContext?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  contactPhone?: string;
  emergencyContact?: EmergencyContact;
  treatmentGoals?: string[];
  createdAt: string;
  updatedAt: string;
  riskFlag?: RiskFlag;
  appointments?: {
    id: string;
    startTime: string;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  }[];
}

export interface CreatePatientDto {
  fullName: string;
  dateOfBirth?: string;
  diagnosis?: string;
  clinicalContext?: string;
  contactPhone?: string;
  emergencyContact?: EmergencyContact;
  treatmentGoals?: string[];
}

export type UpdatePatientDto = Partial<CreatePatientDto>;

export interface QueryPatientsDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ACTIVE' | 'ARCHIVED';
}

export interface PatientsResponse {
  data: Patient[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export interface PatientDocument {
  id: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  category?: string;
  createdAt: string;
}

export type DocumentCategory = 'referencia' | 'laboratorio' | 'receta' | 'otro';

export type TimelineItem = Appointment & {
  psychNote?: PsychNote;
};

export interface TimelineResponse {
  data: TimelineItem[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export type RiskFlagType =
  | 'SEVERE_DEPRESSION'
  | 'SEVERE_ANXIETY'
  | 'AUTOLESION'
  | 'SUICIDAL_IDEATION'
  | 'URGENT'
  | 'SUDDEN_DETERIORATION';

export interface RiskFlag {
  id: string;
  patientId: string;
  flagTypes: RiskFlagType[];
  lastUpdated: string;
  resolvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PsychNoteAddendum {
  id: string;
  appointmentId: string;
  patientId: string;
  content: string;
  privateNotes?: string;
  createdBy: string;
  createdAt: string;
  type: 'ADDENDUM' | 'CORRECTION';
}
