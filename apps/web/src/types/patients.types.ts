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
  contactEmail?: string;
  emergencyContact?: EmergencyContact;
  treatmentGoals?: string[];
  /**
   * Cifrados en servidor (AES-256-GCM), igual que `diagnosis` o
   * `clinicalContext`: el backend los acepta al crear/editar y los devuelve ya
   * descifrados. Se declaran aquí porque son parte del expediente, no una
   * extensión opcional: hasta ahora `PatientProfileEditor` los leía con un
   * ensanchamiento local del tipo y los enviaba con una intersección en el
   * payload, de modo que el tipo compartido mentía sobre lo que llega del API.
   *
   * No son buscables ni filtrables en SQL — ver `QueryPatientsDto`.
   */
  medicacionActual?: string | null;
  alergias?: string | null;
  createdAt: string;
  updatedAt: string;
  riskFlag?: RiskFlag;
  /** Suma de sesiones COMPLETED con pago pendiente (0 = sin deuda). */
  pendingBalance?: number;
  /**
   * SÓLO lo puebla `GET /patients/:id` (`PatientsService.findOne`). El LISTADO
   * (`GET /patients`, `findAll` y `findAllByBalanceDesc`) hace
   * `include: { riskFlag: true }` y NO trae citas: en cualquier fila del
   * listado este campo es `undefined`, no una lista vacía.
   *
   * Y donde sí llega, el orden es `startTime: 'desc'`: `appointments[0]` es la
   * cita MÁS RECIENTE, nunca la próxima. Leerlo como «próxima cita» fue
   * exactamente el bug que hacía que la lista de pacientes afirmara que ningún
   * paciente tenía cita agendada.
   */
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
  contactEmail?: string;
  emergencyContact?: EmergencyContact;
  treatmentGoals?: string[];
  medicacionActual?: string;
  alergias?: string;
}

export type UpdatePatientDto = Partial<CreatePatientDto>;

/**
 * Orden del listado. `'balance'` SÓLO es válido junto a `hasBalance: true`: el
 * saldo pendiente es un agregado de citas, no una columna ordenable de
 * pacientes, y el backend responde 400 en cualquier otra combinación en vez de
 * devolver en silencio un orden distinto del prometido.
 */
export type PatientsSort = 'recent' | 'balance';

export interface QueryPatientsDto {
  page?: number;
  /** Techo del backend: 500. */
  limit?: number;
  /** Busca sólo por `fullName`: el resto de campos identificativos van cifrados. */
  search?: string;
  status?: 'ACTIVE' | 'ARCHIVED';
  /**
   * `true` → sólo pacientes con bandera de riesgo ACTIVA, definida como
   * `resolvedAt` nulo Y `flagTypes` no vacío. Ausente → sin filtro.
   */
  riskFlag?: boolean;
  /** `true` → sólo pacientes con saldo pendiente > 0. Ausente → sin filtro. */
  hasBalance?: boolean;
  sort?: PatientsSort;
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
