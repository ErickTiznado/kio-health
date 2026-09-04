import { randomUUID } from 'crypto';

let counter = 0;
const seq = () => ++counter;

export function makeUser(overrides: Record<string, unknown> = {}) {
  const n = seq();
  return {
    id: randomUUID(),
    email: `user${n}@example.com`,
    passwordHash: 'hashed_password',
    role: 'CLINICIAN',
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: null,
    ...overrides,
  };
}

export function makeClinicianProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    userId: randomUUID(),
    type: 'PSYCHOLOGIST',
    licenseNumber: `LIC${seq()}`,
    currency: 'MXN',
    sessionDefaultDuration: 50,
    sessionDefaultPrice: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function makePatient(overrides: Record<string, unknown> = {}) {
  const n = seq();
  return {
    id: randomUUID(),
    clinicianId: randomUUID(),
    fullName: `Paciente Test ${n}`,
    status: 'ACTIVE',
    diagnosis: null,
    clinicalContext: null,
    contactPhone: null,
    emergencyContact: null,
    dateOfBirth: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function makeAppointment(overrides: Record<string, unknown> = {}) {
  const startTime = new Date(Date.now() + 60 * 60 * 1000); // 1h from now
  const endTime = new Date(startTime.getTime() + 50 * 60 * 1000);
  return {
    id: randomUUID(),
    clinicianId: randomUUID(),
    patientId: randomUUID(),
    startTime,
    endTime,
    status: 'SCHEDULED',
    paymentStatus: 'PENDING',
    paymentMethod: null,
    price: 1000,
    type: 'CONSULTATION',
    reason: null,
    notes: null,
    googleEventId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: { id: randomUUID(), fullName: `Paciente ${seq()}` },
    ...overrides,
  };
}

export function makeRefreshToken(overrides: Record<string, unknown> = {}) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  return {
    id: randomUUID(),
    userId: randomUUID(),
    tokenHash: 'a'.repeat(64),
    expiresAt,
    createdAt: new Date(),
    ...overrides,
  };
}

export function makeFinanceTransaction(
  overrides: Record<string, unknown> = {},
) {
  return {
    id: randomUUID(),
    clinicianId: randomUUID(),
    type: 'INCOME',
    category: 'SESSION',
    amount: 1000,
    description: 'Sesión',
    appointmentId: null,
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    appointment: null,
    ...overrides,
  };
}

export function makeClinic(overrides: Record<string, unknown> = {}) {
  const n = seq();
  return {
    id: randomUUID(),
    name: `Clínica Test ${n}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
