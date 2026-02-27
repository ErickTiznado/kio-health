import type { Appointment, PsychNote } from './appointments.types';

export interface EmergencyContact {
  name: string;
  phone: string;
  relation?: string;
}

export interface Patient {
  id: string;
  clinicianId: string;
  fullName: string;
  dateOfBirth?: string;
  diagnosis?: string;
  clinicalContext?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'WAITLIST';
  contactPhone?: string;
  emergencyContact?: EmergencyContact;
  treatmentGoals?: string[];
  createdAt: string;
  updatedAt: string;
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
}

export interface PatientsResponse {
  data: Patient[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

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
