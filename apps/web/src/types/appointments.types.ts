export interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string | null;
  diagnosis: string | null;
  clinicalContext: string | null;
  contactPhone?: string;
  emergencyContact?: any;
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
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
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

export interface SessionContext {
  appointment: Appointment;
  patient: Patient & { appointments?: any[] };
  totalBalance: number;
  lastVisit: string | null;
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

/** Payload sent to POST /appointments */
export interface CreateAppointmentPayload {
  patientId: string;
  startTime: string; // ISO
  type?: AppointmentType;
  reason?: string;
  price?: number;
}

/** Payload sent to PATCH /appointments/:id/reschedule */
export interface ReschedulePayload {
  startTime: string; // ISO
}
