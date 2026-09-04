import { Test, TestingModule } from '@nestjs/testing';
import { RemindersService } from './reminders.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../lib/email.service';
import { PortalTokenService } from '../portal/portal-token.service';
import { createPrismaMock, type PrismaMock } from '../test/prisma-mock';

const APPT = 'appointment-uuid';
const HOUR = 60 * 60 * 1000;

function makeAppointment(overrides: Record<string, unknown> = {}) {
  return {
    id: APPT,
    status: 'SCHEDULED',
    startTime: new Date(Date.now() + 48 * HOUR),
    patient: { contactEmail: 'paciente@example.com' },
    clinician: {
      remindersEnabled: true,
      reminderLeadHours: 24,
      reminderSecondLeadHours: null,
    },
    ...overrides,
  };
}

describe('RemindersService.scheduleReminder', () => {
  let service: RemindersService;
  let prisma: PrismaMock;

  const emailMock = { sendAppointmentReminder: jest.fn() };
  const portalTokensMock = { issueToken: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmailService, useValue: emailMock },
        { provide: PortalTokenService, useValue: portalTokensMock },
      ],
    }).compile();

    service = module.get<RemindersService>(RemindersService);
  });

  function upsertCalls() {
    const calls = prisma.appointmentReminder.upsert.mock
      .calls as unknown as Array<
      [
        {
          where: { appointmentId_kind: { kind: string } };
          create: { scheduledFor: Date };
        },
      ]
    >;
    return calls.map((c) => c[0]);
  }

  it('agenda el toque principal a startTime - leadHours', async () => {
    const appointment = makeAppointment();
    prisma.appointment.findUnique.mockResolvedValue(appointment);

    await service.scheduleReminder(APPT);

    const calls = upsertCalls();
    expect(calls).toHaveLength(1);
    expect(calls[0].where.appointmentId_kind.kind).toBe('PRIMARY');
    const expected = appointment.startTime.getTime() - 24 * HOUR;
    expect(calls[0].create.scheduledFor.getTime()).toBe(expected);
  });

  it('same-day: cita a 5h con lead de 24h → recordatorio AHORA (no skip)', async () => {
    prisma.appointment.findUnique.mockResolvedValue(
      makeAppointment({ startTime: new Date(Date.now() + 5 * HOUR) }),
    );

    await service.scheduleReminder(APPT);

    const calls = upsertCalls();
    expect(calls).toHaveLength(1);
    // scheduledFor ≈ ahora (tolerancia 5s)
    expect(
      Math.abs(calls[0].create.scheduledFor.getTime() - Date.now()),
    ).toBeLessThan(5000);
  });

  it('cita a menos de 1h → no se agenda nada y se cancela lo pendiente', async () => {
    prisma.appointment.findUnique.mockResolvedValue(
      makeAppointment({ startTime: new Date(Date.now() + 30 * 60 * 1000) }),
    );
    prisma.appointmentReminder.updateMany.mockResolvedValue({ count: 0 });

    await service.scheduleReminder(APPT);

    expect(prisma.appointmentReminder.upsert).not.toHaveBeenCalled();
    expect(prisma.appointmentReminder.updateMany).toHaveBeenCalled();
  });

  it('clínico con recordatorios desactivados → cancela y no agenda', async () => {
    prisma.appointment.findUnique.mockResolvedValue(
      makeAppointment({
        clinician: {
          remindersEnabled: false,
          reminderLeadHours: 24,
          reminderSecondLeadHours: null,
        },
      }),
    );
    prisma.appointmentReminder.updateMany.mockResolvedValue({ count: 1 });

    await service.scheduleReminder(APPT);

    expect(prisma.appointmentReminder.upsert).not.toHaveBeenCalled();
  });

  it('segundo toque configurado → agenda PRIMARY y SECOND_TOUCH', async () => {
    const appointment = makeAppointment({
      clinician: {
        remindersEnabled: true,
        reminderLeadHours: 24,
        reminderSecondLeadHours: 2,
      },
    });
    prisma.appointment.findUnique.mockResolvedValue(appointment);

    await service.scheduleReminder(APPT);

    const kinds = upsertCalls().map((c) => c.where.appointmentId_kind.kind);
    expect(kinds).toEqual(['PRIMARY', 'SECOND_TOUCH']);
  });

  it('segundo toque >= lead principal se ignora (guardia de coherencia)', async () => {
    prisma.appointment.findUnique.mockResolvedValue(
      makeAppointment({
        clinician: {
          remindersEnabled: true,
          reminderLeadHours: 24,
          reminderSecondLeadHours: 24,
        },
      }),
    );
    prisma.appointmentReminder.updateMany.mockResolvedValue({ count: 0 });

    await service.scheduleReminder(APPT);

    const kinds = upsertCalls().map((c) => c.where.appointmentId_kind.kind);
    expect(kinds).toEqual(['PRIMARY']);
  });

  it('sin email de contacto → no hace nada', async () => {
    prisma.appointment.findUnique.mockResolvedValue(
      makeAppointment({ patient: { contactEmail: null } }),
    );

    await service.scheduleReminder(APPT);

    expect(prisma.appointmentReminder.upsert).not.toHaveBeenCalled();
    expect(prisma.appointmentReminder.updateMany).not.toHaveBeenCalled();
  });
});
