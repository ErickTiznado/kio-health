import { addDays, setHours, setMinutes, startOfWeek, format } from 'date-fns';
import type { AgendaAppointment, AppointmentType } from '../types/agenda.types';

interface MockSlot {
  dayOffset: number;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  patientName: string;
  reason: string;
  type: AppointmentType;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  paymentStatus: 'PENDING' | 'PAID';
  price: string;
}

const MOCK_SLOTS: MockSlot[] = [
  { dayOffset: 0, startHour: 9, startMinute: 0, durationMinutes: 60, patientName: 'Ana García López', reason: 'Ansiedad Generalizada', type: 'CONSULTATION', status: 'COMPLETED', paymentStatus: 'PAID', price: '800' },
  { dayOffset: 0, startHour: 10, startMinute: 30, durationMinutes: 45, patientName: 'Carlos Ruiz Méndez', reason: 'Terapia de Pareja', type: 'CONSULTATION', status: 'COMPLETED', paymentStatus: 'PAID', price: '1200' },
  { dayOffset: 0, startHour: 14, startMinute: 0, durationMinutes: 60, patientName: 'Lucía Fernández', reason: 'Evaluación Inicial', type: 'EVALUATION', status: 'SCHEDULED', paymentStatus: 'PENDING', price: '1000' },
  { dayOffset: 0, startHour: 16, startMinute: 0, durationMinutes: 45, patientName: 'Roberto Díaz', reason: 'Seguimiento Mensual', type: 'FOLLOW_UP', status: 'SCHEDULED', paymentStatus: 'PENDING', price: '600' },
  { dayOffset: 1, startHour: 8, startMinute: 0, durationMinutes: 60, patientName: 'María Torres', reason: 'Control de Estrés', type: 'CONSULTATION', status: 'SCHEDULED', paymentStatus: 'PENDING', price: '800' },
  { dayOffset: 1, startHour: 11, startMinute: 0, durationMinutes: 90, patientName: 'Jorge Sánchez', reason: 'Evaluación Neuropsicológica', type: 'EVALUATION', status: 'SCHEDULED', paymentStatus: 'PENDING', price: '1500' },
  { dayOffset: 1, startHour: 15, startMinute: 30, durationMinutes: 45, patientName: 'Isabel Romero', reason: 'Seguimiento Semanal', type: 'FOLLOW_UP', status: 'SCHEDULED', paymentStatus: 'PAID', price: '600' },
  { dayOffset: 2, startHour: 9, startMinute: 30, durationMinutes: 60, patientName: 'Pedro Morales', reason: 'Depresión Mayor', type: 'CONSULTATION', status: 'SCHEDULED', paymentStatus: 'PENDING', price: '800' },
  { dayOffset: 2, startHour: 13, startMinute: 0, durationMinutes: 60, patientName: 'Sofía Herrera', reason: 'Trastorno de Sueño', type: 'CONSULTATION', status: 'SCHEDULED', paymentStatus: 'PENDING', price: '800' },
  { dayOffset: 3, startHour: 10, startMinute: 0, durationMinutes: 60, patientName: 'Andrés Vargas', reason: 'Evaluación Cognitiva', type: 'EVALUATION', status: 'SCHEDULED', paymentStatus: 'PENDING', price: '1200' },
  { dayOffset: 3, startHour: 12, startMinute: 0, durationMinutes: 45, patientName: 'Elena Castillo', reason: 'Seguimiento Bimestral', type: 'FOLLOW_UP', status: 'SCHEDULED', paymentStatus: 'PAID', price: '600' },
  { dayOffset: 3, startHour: 16, startMinute: 30, durationMinutes: 60, patientName: 'Daniela Reyes', reason: 'Manejo de Ira', type: 'CONSULTATION', status: 'SCHEDULED', paymentStatus: 'PENDING', price: '800' },
  { dayOffset: 4, startHour: 8, startMinute: 30, durationMinutes: 60, patientName: 'Fernando León', reason: 'Fobia Social', type: 'CONSULTATION', status: 'SCHEDULED', paymentStatus: 'PENDING', price: '800' },
  { dayOffset: 4, startHour: 11, startMinute: 0, durationMinutes: 45, patientName: 'Valentina Cruz', reason: 'Seguimiento Quincenal', type: 'FOLLOW_UP', status: 'SCHEDULED', paymentStatus: 'PAID', price: '600' },
  { dayOffset: 4, startHour: 14, startMinute: 0, durationMinutes: 90, patientName: 'Ricardo Peña', reason: 'Evaluación de TDAH', type: 'EVALUATION', status: 'SCHEDULED', paymentStatus: 'PENDING', price: '1500' },
];

/**
 * Generate mock agenda appointments for the given week.
 * @param weekStart - The Monday of the target week
 */
export function generateWeeklyAppointments(weekStart: Date): AgendaAppointment[] {
  return MOCK_SLOTS.map((slot, index) => {
    const dayDate = addDays(weekStart, slot.dayOffset);
    const startTime = setMinutes(setHours(dayDate, slot.startHour), slot.startMinute);
    const endTime = new Date(startTime.getTime() + slot.durationMinutes * 60 * 1000);

    return {
      id: `mock-${format(weekStart, 'yyyy-MM-dd')}-${index}`,
      patientId: `patient-${index}`,
      clinicianId: 'clinician-1',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: slot.status,
      paymentStatus: slot.paymentStatus,
      price: slot.price,
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patient: {
        id: `patient-${index}`,
        fullName: slot.patientName,
      },
      type: slot.type,
      reason: slot.reason,
    };
  });
}
