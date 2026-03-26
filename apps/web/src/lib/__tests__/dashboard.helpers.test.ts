import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getGreeting,
  getNextAppointment,
  mapRecentPatients,
  buildCalendarDays,
} from '../dashboard.helpers';
import type { Appointment, RecentPatient } from '../../types/appointments.types';

// ── Factories ──────────────────────────────────────────────────────────────

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'apt-1',
    patientId: 'pat-1',
    clinicianId: 'cli-1',
    startTime: new Date(Date.now() + 3_600_000).toISOString(), // 1h from now
    endTime: new Date(Date.now() + 7_200_000).toISOString(),   // 2h from now
    duration: 60,
    status: 'SCHEDULED',
    patient: { fullName: 'Test Patient', id: 'pat-1' },
    ...overrides,
  } as Appointment;
}

function makeRecentPatient(overrides: Partial<RecentPatient> = {}): RecentPatient {
  return {
    id: 'pat-1',
    name: 'Ana García',
    reason: 'Ansiedad',
    lastAppointmentTime: new Date().toISOString(),
    ...overrides,
  } as RecentPatient;
}

// ── getGreeting ────────────────────────────────────────────────────────────

describe('getGreeting', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('retorna "Buenos días" entre 00:00 y 11:59', () => {
    vi.setSystemTime(new Date('2026-03-13T08:00:00'));
    expect(getGreeting()).toBe('Buenos días');
  });

  it('retorna "Buenos días" a las 00:00', () => {
    vi.setSystemTime(new Date('2026-03-13T00:00:00'));
    expect(getGreeting()).toBe('Buenos días');
  });

  it('retorna "Buenas tardes" entre 12:00 y 17:59', () => {
    vi.setSystemTime(new Date('2026-03-13T15:30:00'));
    expect(getGreeting()).toBe('Buenas tardes');
  });

  it('retorna "Buenas noches" a partir de las 18:00', () => {
    vi.setSystemTime(new Date('2026-03-13T20:00:00'));
    expect(getGreeting()).toBe('Buenas noches');
  });

  it('retorna "Buenas noches" a las 23:59', () => {
    vi.setSystemTime(new Date('2026-03-13T23:59:59'));
    expect(getGreeting()).toBe('Buenas noches');
  });
});

// ── getNextAppointment ─────────────────────────────────────────────────────

describe('getNextAppointment', () => {
  it('retorna null con lista vacía', () => {
    expect(getNextAppointment([])).toBeNull();
  });

  it('retorna null con undefined', () => {
    expect(getNextAppointment(undefined)).toBeNull();
  });

  it('retorna la única cita futura', () => {
    const apt = makeAppointment();
    expect(getNextAppointment([apt])).toEqual(apt);
  });

  it('descarta citas cuyo endTime ya pasó', () => {
    const past = makeAppointment({
      id: 'past',
      startTime: new Date(Date.now() - 7_200_000).toISOString(),
      endTime: new Date(Date.now() - 3_600_000).toISOString(),
    });
    expect(getNextAppointment([past])).toBeNull();
  });

  it('retorna la más próxima cuando hay varias futuras', () => {
    const soon = makeAppointment({ id: 'soon', startTime: new Date(Date.now() + 1_800_000).toISOString() });
    const later = makeAppointment({ id: 'later', startTime: new Date(Date.now() + 10_800_000).toISOString() });
    // Desordenadas a propósito
    expect(getNextAppointment([later, soon])?.id).toBe('soon');
  });

  it('ignora citas pasadas y devuelve la futura', () => {
    const past = makeAppointment({
      id: 'past',
      startTime: new Date(Date.now() - 7_200_000).toISOString(),
      endTime: new Date(Date.now() - 3_600_000).toISOString(),
    });
    const future = makeAppointment({ id: 'future' });
    expect(getNextAppointment([past, future])?.id).toBe('future');
  });
});

// ── mapRecentPatients ──────────────────────────────────────────────────────

describe('mapRecentPatients', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('retorna array vacío con input vacío', () => {
    expect(mapRecentPatients([])).toEqual([]);
  });

  it('muestra "Ahora" cuando la cita fue hace menos de 1 hora', () => {
    vi.setSystemTime(new Date('2026-03-13T10:00:00'));
    const p = makeRecentPatient({ lastAppointmentTime: new Date('2026-03-13T09:30:00').toISOString() });
    const [result] = mapRecentPatients([p]);
    expect(result.time).toBe('Ahora');
  });

  it('muestra "Hace Nh" cuando la cita fue hace N horas (< 24h)', () => {
    vi.setSystemTime(new Date('2026-03-13T10:00:00'));
    const p = makeRecentPatient({ lastAppointmentTime: new Date('2026-03-13T07:00:00').toISOString() });
    const [result] = mapRecentPatients([p]);
    expect(result.time).toBe('Hace 3h');
  });

  it('muestra "Ayer" cuando la cita fue hace entre 24 y 48 horas', () => {
    vi.setSystemTime(new Date('2026-03-13T10:00:00'));
    const p = makeRecentPatient({ lastAppointmentTime: new Date('2026-03-12T10:00:00').toISOString() });
    const [result] = mapRecentPatients([p]);
    expect(result.time).toBe('Ayer');
  });

  it('muestra "Hace Nd" para más de 48 horas', () => {
    vi.setSystemTime(new Date('2026-03-13T10:00:00'));
    const p = makeRecentPatient({ lastAppointmentTime: new Date('2026-03-10T10:00:00').toISOString() });
    const [result] = mapRecentPatients([p]);
    expect(result.time).toBe('Hace 3d');
  });

  it('usa "Sin motivo registrado" cuando reason es null/undefined', () => {
    const p = makeRecentPatient({ reason: undefined });
    const [result] = mapRecentPatients([p]);
    expect(result.reason).toBe('Sin motivo registrado');
  });

  it('preserva el reason cuando existe', () => {
    const p = makeRecentPatient({ reason: 'Depresión' });
    const [result] = mapRecentPatients([p]);
    expect(result.reason).toBe('Depresión');
  });

  it('cicla los colores entre pacientes (6 colores disponibles)', () => {
    const patients = Array.from({ length: 7 }, (_, i) =>
      makeRecentPatient({ id: `p${i}`, name: `Paciente ${i}` }),
    );
    const results = mapRecentPatients(patients);
    // El paciente 6 debe tener el mismo color que el paciente 0
    expect(results[6].color).toBe(results[0].color);
    // Los primeros 6 deben ser todos diferentes
    const firstSixColors = results.slice(0, 6).map((r) => r.color);
    expect(new Set(firstSixColors).size).toBe(6);
  });

  it('mapea correctamente los campos id y name', () => {
    const p = makeRecentPatient({ id: 'pac-42', name: 'María López' });
    const [result] = mapRecentPatients([p]);
    expect(result.id).toBe('pac-42');
    expect(result.name).toBe('María López');
  });
});

// ── buildCalendarDays ──────────────────────────────────────────────────────

describe('buildCalendarDays', () => {
  it('siempre retorna exactamente 28 días', () => {
    expect(buildCalendarDays(undefined)).toHaveLength(28);
    expect(buildCalendarDays({})).toHaveLength(28);
  });

  it('días sin citas tienen density="free" y status="Disponible"', () => {
    const days = buildCalendarDays(undefined);
    for (const day of days) {
      expect(day.density).toBe('free');
      expect(day.status).toBe('Disponible');
      expect(day.appointmentCount).toBe(0);
    }
  });

  it('density "low" con 1 cita', () => {
    const days = buildCalendarDays({ '2026-03-01': { count: 1, appointments: [] } });
    const day = days.find((d) => d.appointmentCount === 1);
    expect(day?.density).toBe('low');
    expect(day?.status).toBe('Poca demanda');
  });

  it('density "medium" con 2–3 citas', () => {
    const days = buildCalendarDays({ '2026-03-01': { count: 2, appointments: [] } });
    const day = days.find((d) => d.appointmentCount === 2);
    expect(day?.density).toBe('medium');
    expect(day?.status).toBe('Demanda media');
  });

  it('density "high" con 4–5 citas', () => {
    const days = buildCalendarDays({ '2026-03-01': { count: 4, appointments: [] } });
    const day = days.find((d) => d.appointmentCount === 4);
    expect(day?.density).toBe('high');
    expect(day?.status).toBe('Casi lleno');
  });

  it('density "full" con 6+ citas', () => {
    const days = buildCalendarDays({ '2026-03-01': { count: 6, appointments: [] } });
    const day = days.find((d) => d.appointmentCount === 6);
    expect(day?.density).toBe('full');
    expect(day?.status).toBe('Lleno');
  });

  it('freeHours excluye las horas ocupadas', () => {
    const startTime = '2026-03-01T10:00:00.000Z'; // hora 10 UTC
    const days = buildCalendarDays({
      '2026-03-01': {
        count: 1,
        appointments: [{ id: 'app-1', startTime, duration: 50 }],
      },
    });
    const day = days.find((d) => d.appointmentCount === 1);
    // La hora 10 (UTC) debe estar fuera de freeHours
    const occupiedHour = new Date(startTime).getHours();
    expect(day?.freeHours).not.toContain(`${occupiedHour}:00`);
  });

  it('freeHours cubre el rango de oficina 09:00–17:00', () => {
    const days = buildCalendarDays(undefined);
    const freeHours = days[0].freeHours;
    expect(freeHours).toContain('9:00');
    expect(freeHours).toContain('17:00');
    expect(freeHours).not.toContain('8:00');
    expect(freeHours).not.toContain('18:00');
  });
});
