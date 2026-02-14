export interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string | null;
  diagnosis: string | null;
  clinicalContext: string | null;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';
export type AppointmentType = 'CONSULTATION' | 'EVALUATION' | 'FOLLOW_UP';

export interface Appointment {
  id: string;
  patientId: string;
  clinicianId: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  reason: string | null;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  paymentStatus: 'PENDING' | 'PAID';
  paymentMethod: PaymentMethod | null;
  price: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  patient: Patient;
  /** Only present when fetched via /appointments/next */
  sessionNumber?: number;
}

export interface RecentPatient {
  id: string;
  name: string;
  reason: string | null;
  lastAppointmentTime: string;
}

/** Response from GET /appointments/pending-notes-count */
export interface PendingNotesCount {
  count: number;
}

/** Map of date string (YYYY-MM-DD) → appointment count */
export type DaySummary = Record<string, number>;

/** Payload sent to PATCH /appointments/:id/checkout */
export interface CheckoutPayload {
  amount: number;
  paymentStatus: 'PENDING' | 'PAID';
  paymentMethod: PaymentMethod;
  nextAppointmentDate: string | null;
  shouldSendEmail: boolean;
}

/** Response from PATCH /appointments/:id/checkout */
export interface CheckoutResponse {
  updatedAppointment: Appointment;
  nextAppointment: Appointment | null;
}
