import type { Appointment } from './appointments.types';

export type AppointmentType = 'CONSULTATION' | 'EVALUATION' | 'FOLLOW_UP';

export interface AgendaAppointment extends Appointment {
  type: AppointmentType;
  reason: string;
}

export type CalendarView = 'week' | 'day';
