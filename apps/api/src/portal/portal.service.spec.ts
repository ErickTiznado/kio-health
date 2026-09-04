import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PortalService } from './portal.service';
import { PortalTokenService } from './portal-token.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { RiskFlagsService } from '../risk-flags/risk-flags.service';
import { EmailService } from '../lib/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, type PrismaMock } from '../test/prisma-mock';

const PATIENT_1 = 'patient-1-uuid';
const CLINICIAN_A = 'clinician-a-uuid';
const ASSIGNMENT_1 = 'assignment-1-uuid';
const APPT_1 = 'appointment-1-uuid';
const TOKEN = 'a'.repeat(43);

describe('PortalService — auto-reporte de escalas', () => {
  let service: PortalService;
  let prisma: PrismaMock;

  const portalTokensMock = {
    resolvePatient: jest.fn(),
    issueToken: jest.fn().mockResolvedValue('fresh-token'),
  };
  const appointmentsServiceMock = { cancelByPatient: jest.fn() };
  const riskFlagsMock = { recalculateForAppointment: jest.fn() };
  const emailMock = {
    sendUrgentScaleAlert: jest.fn().mockResolvedValue(undefined),
    sendScaleAssignmentEmail: jest.fn().mockResolvedValue(undefined),
  };

  function primeAssignment(scaleType: 'PHQ9' | 'GAD7') {
    portalTokensMock.resolvePatient.mockResolvedValue({
      patientId: PATIENT_1,
      clinicianId: CLINICIAN_A,
    });
    prisma.scaleAssignment.findFirst.mockResolvedValue({
      id: ASSIGNMENT_1,
      scaleType,
      appointmentId: APPT_1,
      patient: {
        fullName: 'Ana Prueba',
        clinician: { user: { email: 'clinico@example.com' } },
      },
    });
    prisma.clinicalScale.upsert.mockResolvedValue({ id: 'scale-1' });
    prisma.scaleAssignment.update.mockResolvedValue({ id: ASSIGNMENT_1 });
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortalService,
        { provide: PrismaService, useValue: prisma },
        { provide: PortalTokenService, useValue: portalTokensMock },
        { provide: AppointmentsService, useValue: appointmentsServiceMock },
        { provide: RiskFlagsService, useValue: riskFlagsMock },
        { provide: EmailService, useValue: emailMock },
      ],
    }).compile();

    service = module.get<PortalService>(PortalService);
  });

  it('token inválido → invalid_token, sin tocar la BD', async () => {
    portalTokensMock.resolvePatient.mockResolvedValue(null);

    const result = await service.submitScaleAssignment(TOKEN, ASSIGNMENT_1, []);

    expect(result).toEqual({ ok: false, reason: 'invalid_token' });
    expect(prisma.scaleAssignment.findFirst).not.toHaveBeenCalled();
  });

  it('asignación de otro paciente → not_found (ownership por query)', async () => {
    portalTokensMock.resolvePatient.mockResolvedValue({
      patientId: PATIENT_1,
      clinicianId: CLINICIAN_A,
    });
    prisma.scaleAssignment.findFirst.mockResolvedValue(null);

    const result = await service.submitScaleAssignment(
      TOKEN,
      'assignment-of-other',
      [0, 0, 0, 0, 0, 0, 0],
    );

    expect(result).toEqual({ ok: false, reason: 'not_found' });
    const findArg = prisma.scaleAssignment.findFirst.mock.calls[0][0] as {
      where: Record<string, unknown>;
    };
    expect(findArg.where).toMatchObject({
      patientId: PATIENT_1,
      status: 'PENDING',
    });
  });

  it('longitud incorrecta de respuestas → BadRequestException', async () => {
    primeAssignment('PHQ9');

    await expect(
      service.submitScaleAssignment(TOKEN, ASSIGNMENT_1, [1, 2, 3]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('PHQ-9 severo (>=20): guarda source PATIENT, recalcula banderas y alerta', async () => {
    primeAssignment('PHQ9');
    const scores = [3, 3, 3, 3, 3, 3, 3, 0, 0]; // total 21, ítem 9 = 0

    const result = await service.submitScaleAssignment(
      TOKEN,
      ASSIGNMENT_1,
      scores,
    );

    expect(result).toEqual({ ok: true, crisis: true });
    const upsertArg = prisma.clinicalScale.upsert.mock.calls[0][0] as {
      create: { source: string; totalScore: number; riskLevel: string };
    };
    expect(upsertArg.create).toMatchObject({
      source: 'PATIENT',
      totalScore: 21,
      riskLevel: 'SEVERE',
    });
    expect(riskFlagsMock.recalculateForAppointment).toHaveBeenCalledWith({
      patientId: PATIENT_1,
      clinicianId: CLINICIAN_A,
      appointmentId: APPT_1,
    });
    expect(emailMock.sendUrgentScaleAlert).toHaveBeenCalled();
  });

  it('ítem 9 del PHQ-9 > 0 dispara crisis aunque el total sea bajo', async () => {
    primeAssignment('PHQ9');
    const scores = [0, 0, 0, 0, 0, 0, 0, 0, 1]; // total 1, pero ideación

    const result = await service.submitScaleAssignment(
      TOKEN,
      ASSIGNMENT_1,
      scores,
    );

    expect(result).toEqual({ ok: true, crisis: true });
    const alertArg = emailMock.sendUrgentScaleAlert.mock.calls[0][0] as {
      suicidalityFlag: boolean;
    };
    expect(alertArg.suicidalityFlag).toBe(true);
  });

  it('GAD-7 leve: sin crisis y sin email urgente', async () => {
    primeAssignment('GAD7');
    const scores = [1, 1, 0, 0, 1, 0, 0]; // total 3 → MINIMAL

    const result = await service.submitScaleAssignment(
      TOKEN,
      ASSIGNMENT_1,
      scores,
    );

    expect(result).toEqual({ ok: true, crisis: false });
    expect(emailMock.sendUrgentScaleAlert).not.toHaveBeenCalled();
  });
});

describe('PortalService — techo de PHI del portal', () => {
  let service: PortalService;
  let prisma: PrismaMock;

  const portalTokensMock = { resolvePatient: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortalService,
        { provide: PrismaService, useValue: prisma },
        { provide: PortalTokenService, useValue: portalTokensMock },
        {
          provide: AppointmentsService,
          useValue: { cancelByPatient: jest.fn() },
        },
        {
          provide: RiskFlagsService,
          useValue: { recalculateForAppointment: jest.fn() },
        },
        { provide: EmailService, useValue: {} },
      ],
    }).compile();

    service = module.get<PortalService>(PortalService);
  });

  it('listAppointments nunca selecciona campos clínicos', async () => {
    portalTokensMock.resolvePatient.mockResolvedValue({
      patientId: PATIENT_1,
      clinicianId: CLINICIAN_A,
    });
    prisma.appointment.findMany.mockResolvedValue([]);

    await service.listAppointments(TOKEN);

    const arg = prisma.appointment.findMany.mock.calls[0][0] as {
      select: Record<string, unknown>;
    };
    const selectedKeys = Object.keys(arg.select);
    // Techo de PHI: nada de notas, diagnóstico, precio ni razón de consulta
    for (const forbidden of [
      'notes',
      'reason',
      'price',
      'psychNote',
      'patient',
    ]) {
      expect(selectedKeys).not.toContain(forbidden);
    }
  });

  it('getPortalSession expone solo nombre de pila, profesional y timezone', async () => {
    portalTokensMock.resolvePatient.mockResolvedValue({
      patientId: PATIENT_1,
      clinicianId: CLINICIAN_A,
    });
    prisma.patient.findUnique.mockResolvedValue({
      fullName: 'Ana María Prueba',
      clinician: {
        timezone: 'America/Mexico_City',
        user: { fullName: 'Dr. Prueba' },
      },
    });

    const session = await service.getPortalSession(TOKEN);

    expect(session).toEqual({
      patientFirstName: 'Ana',
      clinicianName: 'Dr. Prueba',
      timezone: 'America/Mexico_City',
    });
  });
});
