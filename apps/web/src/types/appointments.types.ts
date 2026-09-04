import type { EmergencyContact } from './patients.types';

export interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string | null;
  diagnosis: string | null;
  clinicalContext: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  emergencyContact?: EmergencyContact | null;
  treatmentGoals?: string[];
  medicacionActual?: string | null;
  alergias?: string | null;
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
  reminder?: {
    status: string;
    sentAt: string | null;
    confirmedAt: string | null;
  } | null;
  cancelledBy?: 'CLINICIAN' | 'PATIENT' | null;
  rescheduleRequestedAt?: string | null;
  seriesId?: string | null;
  createdAt: string;
  updatedAt: string;
  patient: Patient;
  /**
   * ¿Esta cita tiene nota clínica asociada?
   *
   * El backend colapsa la relación a un booleano a propósito: `PsychNote.content`
   * y `privateNotes` van cifrados, y ni siquiera el id de la nota debe viajar a
   * una vista de calendario. Lo pueblan los endpoints de lectura de agenda
   * (`GET /appointments` por día y por rango) y `GET /appointments/next`.
   *
   * Cuidado: en `/next` la cita es futura y `SCHEDULED`, así que `hasNote` será
   * `false` casi siempre. Eso NO es "nota pendiente": pendiente exige `COMPLETED`.
   */
  hasNote: boolean;
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


/** Map of date string (YYYY-MM-DD) -> detailed summary */
export type DaySummary = Record<
  string,
  {
    count: number;
    appointments: Array<{
      id: string;
      startTime: string; // ISO
      duration: number; // minutes
    }>;
  }
>;

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
  duration?: number; // In minutes
}

/** Payload sent to PATCH /appointments/:id/reschedule */
export interface ReschedulePayload {
  startTime: string; // ISO
  duration?: number; // In minutes
}

export const NoteTemplateType = {
  SOAP: 'SOAP',
  FREE: 'FREE',
  INITIAL: 'INITIAL',
  CBT: 'CBT',
} as const;

export type NoteTemplateType = (typeof NoteTemplateType)[keyof typeof NoteTemplateType];

/**
 * Shape of the JSON stored in `PsychNote.content`.
 * FREE notes use `body`; SOAP notes use `s`/`o`/`a`/`p`.
 * `sessionGoal` is shared by both templates.
 */
export interface NoteContent {
  body?: string;
  s?: string;
  o?: string;
  a?: string;
  p?: string;
  sessionGoal?: string;
}

export interface PsychNote {
  id: string;
  appointmentId: string;
  patientId: string;
  templateType: NoteTemplateType;
  content: unknown; // JSON — cast to `NoteContent` at the usage site
  moodRating: number | null;
  privateNotes: string | null;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePsychNoteDto {
  templateType: NoteTemplateType;
  content: unknown;
  moodRating?: number;
  privateNotes?: string;
  tags?: string[];
}

/**
 * Clinical summary of a patient shown alongside the session editor.
 * Built in `SessionPage` from the fetched `Patient` and passed down to
 * `EditorContainer` → `PatientContextPanel` → `ClinicalDetailsModal`.
 */
export interface PsychContext {
  diagnosis: string;
  clinicalContext: string;
  treatmentGoals: string[];
  totalSessions?: number;
  emergencyContact?: EmergencyContact | null;
  medicacionActual?: string | null;
  alergias?: string | null;
}

export interface SessionContext {
  appointment: Appointment;
  patient: Patient;
  lastVisit: string | null;
  sessionNumber: number;
  clinicalScales?: ClinicalScale[];
}

export type ScaleType = 'PHQ9' | 'GAD7';
export type ScaleRiskLevel = 'MINIMAL' | 'MILD' | 'MODERATE' | 'MODERATELY_SEVERE' | 'SEVERE';

export interface ClinicalScale {
  id: string;
  patientId: string;
  appointmentId: string;
  scaleType: ScaleType;
  scores: number[];
  totalScore: number;
  riskLevel: ScaleRiskLevel;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClinicalScalePayload {
  scaleType: ScaleType;
  scores: number[];
}

