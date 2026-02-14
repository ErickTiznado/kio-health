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
  createdAt: string;
  updatedAt: string;
  appointments?: {
    id: string;
    startTime: string;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
    paymentStatus: 'PENDING' | 'PAID';
    paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | null;
    price: string;
  }[];
  totalDebt?: number;
}

export interface CreatePatientDto {
  fullName: string;
  dateOfBirth?: string;
  diagnosis?: string;
  clinicalContext?: string;
  contactPhone?: string;
  emergencyContact?: EmergencyContact;
}

export interface UpdatePatientDto extends Partial<CreatePatientDto> { }

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
