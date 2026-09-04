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

  it('deja reason en null cuando no hay motivo', () => {
    // El dashboard ya no inventa un texto de relleno: el widget omite la línea.
    // Tampoco recibe el diagnóstico, que está cifrado y no debe salir aquí.
    const p = makeRecentPatient({ reason: undefined });
    const [result] = mapRecentPatients([p]);
    expect(result.reason).toBeNull();
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
  // `buildCalendarDays` construye la rejilla del mes en curso: huecos iniciales
  // (`null`) hasta el día de la semana del día 1, y luego todos los días del mes.
  // Fijamos el reloj para que las claves de `DaySummary` caigan en la ventana.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 15, 12, 0, 0)); // 15 de marzo de 2026, hora local
  });
  afterEach(() => vi.useRealTimers());

  it('rellena huecos iniciales y cubre el mes completo', () => {
    // Marzo de 2026 tiene 31 días y empieza en domingo → 6 huecos (semana L–D).
    const cells = buildCalendarDays(undefined);
    expect(cells).toHaveLength(6 + 31);
    expect(cells.slice(0, 6).every((c) => c === null)).toBe(true);
    const days = cells.filter((c) => c !== null);
    expect(days).toHaveLength(31);
    expect(days[0]!.day).toBe(1);
    expect(days[30]!.day).toBe(31);
  });

  it('alinea cada día bajo su día de la semana real', () => {
    // 1 de marzo de 2026 es domingo: séptima columna de una semana L–D.
    const cells = buildCalendarDays(undefined);
    const firstDayIndex = cells.findIndex((c) => c !== null);
    expect(firstDayIndex % 7).toBe(6);
  });

  it('marca el día de hoy', () => {
    const days = buildCalendarDays(undefined).filter((c) => c !== null);
    expect(days.filter((d) => d!.isToday)).toHaveLength(1);
    expect(days.find((d) => d!.isToday)!.day).toBe(15);
  });

  it('días sin citas tienen density="free" y status="Disponible"', () => {
    const days = buildCalendarDays(undefined).filter((c) => c !== null).map((c) => c!);
    for (const day of days) {
      expect(day.density).toBe('free');
      expect(day.status).toBe('Disponible');
      expect(day.appointmentCount).toBe(0);
    }
  });

  it('density "low" con 1 cita', () => {
    const days = buildCalendarDays({ '2026-03-01': { count: 1, appointments: [] } });
    const day = days.find((d) => d !== null && d.appointmentCount === 1);
    expect(day?.density).toBe('low');
    expect(day?.status).toBe('Poca demanda');
  });

  it('density "medium" con 2–3 citas', () => {
    const days = buildCalendarDays({ '2026-03-01': { count: 2, appointments: [] } });
    const day = days.find((d) => d !== null && d.appointmentCount === 2);
    expect(day?.density).toBe('medium');
    expect(day?.status).toBe('Demanda media');
  });

  it('density "high" con 4–5 citas', () => {
    const days = buildCalendarDays({ '2026-03-01': { count: 4, appointments: [] } });
    const day = days.find((d) => d !== null && d.appointmentCount === 4);
    expect(day?.density).toBe('high');
    expect(day?.status).toBe('Casi lleno');
  });

  it('density "full" con 6+ citas', () => {
    const days = buildCalendarDays({ '2026-03-01': { count: 6, appointments: [] } });
    const day = days.find((d) => d !== null && d.appointmentCount === 6);
    expect(day?.density).toBe('full');
    expect(day?.status).toBe('Lleno');
  });
});
