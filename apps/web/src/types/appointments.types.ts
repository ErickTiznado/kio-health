export interface Patient {
  id: string;
  fullName: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  clinicianId: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  paymentStatus: 'PENDING' | 'PAID';
  price: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  patient: Patient;
}
