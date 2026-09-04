import {
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { createPrismaMock } from '../test/prisma-mock';
import { createTestEncryptionService } from '../test/encryption-helpers';
import { makeAppointment, makeClinicianProfile } from '../test/factories';
import { NoteTemplateType } from './dto/create-psych-note.dto';
import { ScaleType, ScaleRiskLevel } from '#generated/prisma';
import { calculateScaleRiskLevel } from '../lib/scales.util';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prisma: ReturnType<typeof createPrismaMock>;
  const encryptionService = createTestEncryptionService();
  const mockEventEmitter = { emit: jest.fn() };
  const mockExportService = { generateSessionPdf: jest.fn() };
  const mockGoogleCalendar = {
    syncAppointment: jest.fn().mockResolvedValue(null),
    deleteAppointment: jest.fn().mockResolvedValue(null),
  };

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new AppointmentsService(
      prisma as any,
      mockExportService as any,
      mockEventEmitter as any,
      encryptionService,
      mockGoogleCalendar as any,
      {
        recalculateForAppointment: jest.fn().mockResolvedValue(undefined),
      } as any, // mockRiskFlagsService
    );
    jest.clearAllMocks();
    mockGoogleCalendar.syncAppointment.mockResolvedValue(null);
    mockGoogleCalendar.deleteAppointment.mockResolvedValue(null);
  });

  // ── findAppointmentOrFail ─────────────────────────────────────────────────

  describe('findAppointmentOrFail (via startSession)', () => {
    it('throws ForbiddenException when appointment belongs to different clinician', async () => {
      prisma.appointment.findFirst.mockResolvedValue(null); // ownership check fails
      await expect(
        service.startSession('wrong-clinician', 'apt-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when appointment does not exist', async () => {
      prisma.appointment.findFirst.mockResolvedValue(null);
      await expect(
        service.startSession('clinician-1', 'nonexistent'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── create() ─────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('uses sessionDefaultDuration and sessionDefaultPrice from profile when DTO omits them', async () => {
      const profile = makeClinicianProfile({
        sessionDefaultDuration: 45,
        sessionDefaultPrice: 800,
      });
      prisma.clinicianProfile.findUnique.mockResolvedValue(profile);
      prisma.appointment.findFirst.mockResolvedValue(null); // no overlap
      const created = makeAppointment({
        clinicianId: 'clinician-1',
        price: 800,
      });
      prisma.appointment.create.mockResolvedValue(created);

      await service.create('clinician-1', {
        patientId: 'patient-1',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        // no duration or price
      } as any);

      const createData = prisma.appointment.create.mock.calls[0][0].data;
      const durationMs =
        createData.endTime.getTime() - createData.startTime.getTime();
      expect(durationMs).toBe(45 * 60 * 1000);
      expect(createData.price).toBe(800);
    });

    it('calculates endTime = startTime + duration', async () => {
      const profile = makeClinicianProfile({
        sessionDefaultDuration: 60,
        sessionDefaultPrice: 1000,
      });
      prisma.clinicianProfile.findUnique.mockResolvedValue(profile);
      prisma.appointment.findFirst.mockResolvedValue(null);
      prisma.appointment.create.mockImplementation(({ data }: any) =>
        Promise.resolve({ ...makeAppointment(), ...data }),
      );

      const startTime = new Date('2026-04-01T10:00:00Z');
      await service.create('clinician-1', {
        patientId: 'patient-1',
        startTime: startTime.toISOString(),
        duration: 90,
      } as any);

      const createData = prisma.appointment.create.mock.calls[0][0].data;
      const expectedEnd = new Date(startTime.getTime() + 90 * 60 * 1000);
      expect(createData.endTime).toEqual(expectedEnd);
    });

    it('throws ConflictException on overlapping SCHEDULED appointment', async () => {
      const profile = makeClinicianProfile();
      prisma.clinicianProfile.findUnique.mockResolvedValue(profile);
      prisma.appointment.findFirst.mockResolvedValue(makeAppointment()); // overlap found

      await expect(
        service.create('clinician-1', {
          patientId: 'p1',
          startTime: new Date().toISOString(),
        } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('status defaults to SCHEDULED after creation', async () => {
      const profile = makeClinicianProfile();
      prisma.clinicianProfile.findUnique.mockResolvedValue(profile);
      prisma.appointment.findFirst.mockResolvedValue(null);
      prisma.appointment.create.mockImplementation(({ data }: any) =>
        Promise.resolve({ ...makeAppointment(), ...data }),
      );

      await service.create('clinician-1', {
        patientId: 'p1',
        startTime: new Date().toISOString(),
      } as any);

      const createData = prisma.appointment.create.mock.calls[0][0].data;
      expect(createData.status).toBe('SCHEDULED');
    });
  });

  // ── State transitions ─────────────────────────────────────────────────────

  describe('startSession() — SCHEDULED → IN_PROGRESS', () => {
    it('updates status to IN_PROGRESS', async () => {
      const apt = makeAppointment({ status: 'SCHEDULED' });
      prisma.appointment.findFirst.mockResolvedValue(apt);
      prisma.appointment.update.mockResolvedValue({
        ...apt,
        status: 'IN_PROGRESS',
      });

      await service.startSession('clinician-1', apt.id as string);

      expect(prisma.appointment.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'IN_PROGRESS' } }),
      );
    });

    it('throws BadRequestException if not SCHEDULED', async () => {
      const apt = makeAppointment({ status: 'COMPLETED' });
      prisma.appointment.findFirst.mockResolvedValue(apt);

      await expect(
        service.startSession('clinician-1', apt.id as string),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelAppointment() — SCHEDULED → CANCELLED', () => {
    it('updates status to CANCELLED', async () => {
      const apt = makeAppointment({ status: 'SCHEDULED' });
      prisma.appointment.findFirst.mockResolvedValue(apt);
      prisma.appointment.update.mockResolvedValue({
        ...apt,
        status: 'CANCELLED',
      });

      await service.cancelAppointment('clinician-1', apt.id as string);

      expect(prisma.appointment.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'CANCELLED' } }),
      );
    });

    it('throws BadRequestException if not SCHEDULED', async () => {
      const apt = makeAppointment({ status: 'IN_PROGRESS' });
      prisma.appointment.findFirst.mockResolvedValue(apt);

      await expect(
        service.cancelAppointment('clinician-1', apt.id as string),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('markNoShow() — SCHEDULED → NO_SHOW', () => {
    it('throws BadRequestException if not SCHEDULED', async () => {
      const apt = makeAppointment({ status: 'COMPLETED' });
      prisma.appointment.findFirst.mockResolvedValue(apt);

      await expect(
        service.markNoShow('clinician-1', apt.id as string),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── upsertPsychNote() ─────────────────────────────────────────────────────

  describe('upsertPsychNote()', () => {
    it('encrypts content and privateNotes before saving', async () => {
      const apt = makeAppointment({ endTime: new Date(Date.now() + 3600000) }); // ends in future
      prisma.appointment.findFirst.mockResolvedValue(apt);
      prisma.psychNote.findUnique.mockResolvedValue(null);
      prisma.$transaction.mockImplementation((cb: any) => cb(prisma));
      prisma.psychNote.create.mockResolvedValue({});

      const dto = {
        templateType: NoteTemplateType.SOAP,
        content: { s: 'subjetivo', o: 'objetivo', a: 'análisis', p: 'plan' },
        privateNotes: 'notas privadas',
      };

      await service.upsertPsychNote(
        'clinician-1',
        apt.id as string,
        dto as any,
      );

      const createData = prisma.psychNote.create.mock.calls[0][0].data;
      // content should be encrypted (not a plain object string)
      expect(typeof createData.content).toBe('string');
      expect(createData.content).toMatch(
        /^[0-9a-fA-F]+:[0-9a-fA-F]+:[0-9a-fA-F]+$/,
      );
      expect(createData.privateNotes).toMatch(
        /^[0-9a-fA-F]+:[0-9a-fA-F]+:[0-9a-fA-F]+$/,
      );
    });

    it('throws ForbiddenException when editing note >24h after session ended', async () => {
      const endTime = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25h ago
      const apt = makeAppointment({ endTime });
      prisma.appointment.findFirst.mockResolvedValue(apt);
      // Existing note (so edit attempt is blocked)
      prisma.psychNote.findUnique.mockResolvedValue({
        id: 'note-1',
        appointmentId: apt.id,
      });

      await expect(
        service.upsertPsychNote(
          'clinician-1',
          apt.id as string,
          {
            templateType: NoteTemplateType.SOAP,
            content: { s: '', o: '', a: '', p: '' },
          } as any,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException for SOAP note missing required keys', async () => {
      const apt = makeAppointment({ endTime: new Date(Date.now() + 3600000) });
      prisma.appointment.findFirst.mockResolvedValue(apt);

      await expect(
        service.upsertPsychNote(
          'clinician-1',
          apt.id as string,
          {
            templateType: NoteTemplateType.SOAP,
            content: { s: 'only subjetivo' }, // missing o, a, p
          } as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for FREE note missing body field', async () => {
      const apt = makeAppointment({ endTime: new Date(Date.now() + 3600000) });
      prisma.appointment.findFirst.mockResolvedValue(apt);

      await expect(
        service.upsertPsychNote(
          'clinician-1',
          apt.id as string,
          {
            templateType: NoteTemplateType.FREE,
            content: { wrongField: 'text' },
          } as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── updatePayment() ───────────────────────────────────────────────────────

  describe('updatePayment()', () => {
    it('emits appointment.paid event only when status is PAID', async () => {
      const apt = makeAppointment();
      prisma.appointment.findFirst.mockResolvedValue(apt);
      prisma.$transaction.mockImplementation((cb: any) => cb(prisma));
      prisma.appointment.update.mockResolvedValue({
        ...apt,
        paymentStatus: 'PAID',
      });

      await service.updatePayment(
        'clinician-1',
        apt.id as string,
        {
          status: 'PAID',
          method: 'CASH',
        } as any,
      );

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'appointment.paid',
        expect.anything(),
      );
    });

    it('does NOT emit event when status is PENDING', async () => {
      const apt = makeAppointment();
      prisma.appointment.findFirst.mockResolvedValue(apt);
      prisma.$transaction.mockImplementation((cb: any) => cb(prisma));
      prisma.appointment.update.mockResolvedValue({
        ...apt,
        paymentStatus: 'PENDING',
      });
      prisma.financeTransaction.deleteMany.mockResolvedValue({ count: 0 });

      await service.updatePayment(
        'clinician-1',
        apt.id as string,
        {
          status: 'PENDING',
        } as any,
      );

      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('deletes existing finance transaction when reverting to PENDING', async () => {
      const apt = makeAppointment();
      prisma.appointment.findFirst.mockResolvedValue(apt);
      prisma.$transaction.mockImplementation((cb: any) => cb(prisma));
      prisma.appointment.update.mockResolvedValue({
        ...apt,
        paymentStatus: 'PENDING',
      });
      prisma.financeTransaction.deleteMany.mockResolvedValue({ count: 1 });

      await service.updatePayment(
        'clinician-1',
        apt.id as string,
        {
          status: 'PENDING',
        } as any,
      );

      expect(prisma.financeTransaction.deleteMany).toHaveBeenCalledWith({
        where: { appointmentId: apt.id },
      });
    });
  });

  // ── findByDate() — relación con la nota ───────────────────────────────────

  describe('findByDate() — relación con la nota clínica', () => {
    const makeRow = (overrides: Record<string, unknown> = {}) => ({
      ...makeAppointment({ status: 'COMPLETED' }),
      reminders: [],
      psychNote: null,
      ...overrides,
    });

    it('pide SOLO el id de la nota — nunca content ni privateNotes (van cifrados)', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);

      await service.findByDate('clinician-1', '2026-08-10');

      const arg = prisma.appointment.findMany.mock.calls[0][0];
      expect(arg.include.psychNote).toEqual({ select: { id: true } });
      expect(arg.include.psychNote.select).not.toHaveProperty('content');
      expect(arg.include.psychNote.select).not.toHaveProperty('privateNotes');
    });

    it('expone hasNote:true y NO filtra el id de la nota al payload', async () => {
      prisma.appointment.findMany.mockResolvedValue([
        makeRow({ psychNote: { id: 'note-secreta-1' } }),
      ]);

      const [apt] = await service.findByDate('clinician-1', '2026-08-10');

      expect(apt.hasNote).toBe(true);
      expect(apt).not.toHaveProperty('psychNote');
      expect(JSON.stringify(apt)).not.toContain('note-secreta-1');
    });

    it('expone hasNote:false cuando la cita completada no tiene nota', async () => {
      prisma.appointment.findMany.mockResolvedValue([
        makeRow({ psychNote: null }),
      ]);

      const [apt] = await service.findByDate('clinician-1', '2026-08-10');

      expect(apt.hasNote).toBe(false);
    });

    it('conserva el reshape de reminders[] → reminder singular', async () => {
      const reminder = {
        status: 'SENT',
        sentAt: new Date(),
        confirmedAt: null,
      };
      prisma.appointment.findMany.mockResolvedValue([
        makeRow({ reminders: [reminder] }),
        makeRow({ reminders: [] }),
      ]);

      const [withReminder, withoutReminder] = await service.findByDate(
        'clinician-1',
        '2026-08-10',
      );

      expect(withReminder.reminder).toEqual(reminder);
      expect(withoutReminder.reminder).toBeNull();
      expect(withReminder).not.toHaveProperty('reminders');
    });
  });

  // ── getNextUpcoming() — misma forma de payload ────────────────────────────

  describe('getNextUpcoming()', () => {
    it('expone hasNote sin devolver el objeto de la nota', async () => {
      prisma.appointment.findFirst.mockResolvedValue({
        ...makeAppointment(),
        patient: {
          id: 'patient-1',
          fullName: 'Paciente Uno',
          dateOfBirth: null,
          diagnosis: null,
          clinicalContext: null,
        },
        reminders: [],
        psychNote: null,
      });
      prisma.appointment.count.mockResolvedValue(3);

      const result = await service.getNextUpcoming('clinician-1');

      expect(result?.hasNote).toBe(false);
      expect(result).not.toHaveProperty('psychNote');
      expect(result?.sessionNumber).toBe(4);
    });
  });

  // ── getPendingNotesCount() ────────────────────────────────────────────────

  describe('getPendingNotesCount()', () => {
    beforeEach(() => {
      prisma.appointment.count.mockResolvedValue(0);
      prisma.appointment.findMany.mockResolvedValue([]);
    });

    it('sin rango cuenta el histórico completo — sin filtro de startTime', async () => {
      prisma.appointment.count.mockResolvedValue(7);
      prisma.appointment.findMany.mockResolvedValue([
        { id: 'apt-a' },
        { id: 'apt-b' },
      ]);

      const result = await service.getPendingNotesCount('clinician-1');

      expect(result).toEqual({
        count: 7,
        appointmentIds: ['apt-a', 'apt-b'],
      });

      const where = prisma.appointment.count.mock.calls[0][0].where;
      expect(where).toEqual({
        clinicianId: 'clinician-1',
        status: 'COMPLETED',
        psychNote: null,
      });
      expect(where.startTime).toBeUndefined();
    });

    it('con from/to/tz aplica un rango medio abierto en la zona del clínico', async () => {
      await service.getPendingNotesCount(
        'clinician-1',
        '2026-08-01',
        '2026-08-01',
        'America/Mexico_City',
      );

      const where = prisma.appointment.count.mock.calls[0][0].where;
      // Mexico_City = UTC-6 todo el año desde 2022.
      expect(where.startTime.gte).toEqual(new Date('2026-08-01T06:00:00.000Z'));
      // Medio abierto: `lt` al arranque del día siguiente, nunca `lte`.
      expect(where.startTime.lt).toEqual(new Date('2026-08-02T06:00:00.000Z'));
      expect(where.startTime.lte).toBeUndefined();
    });

    it('ignora el rango si solo llega un extremo (defensa en el servicio)', async () => {
      await service.getPendingNotesCount('clinician-1', '2026-08-01');

      const where = prisma.appointment.count.mock.calls[0][0].where;
      expect(where.startTime).toBeUndefined();
    });

    it('cae a UTC cuando la tz no es válida', async () => {
      await service.getPendingNotesCount(
        'clinician-1',
        '2026-08-01',
        '2026-08-01',
        'Marte/Olympus_Mons',
      );

      const where = prisma.appointment.count.mock.calls[0][0].where;
      expect(where.startTime.gte).toEqual(new Date('2026-08-01T00:00:00.000Z'));
      expect(where.startTime.lt).toEqual(new Date('2026-08-02T00:00:00.000Z'));
    });

    it('cuenta y lista sobre el MISMO where, y acota los ids', async () => {
      await service.getPendingNotesCount(
        'clinician-1',
        '2026-08-01',
        '2026-08-07',
        'America/Mexico_City',
      );

      const countArg = prisma.appointment.count.mock.calls[0][0];
      const listArg = prisma.appointment.findMany.mock.calls[0][0];

      expect(listArg.where).toEqual(countArg.where);
      expect(listArg.select).toEqual({ id: true });
      expect(listArg.take).toBe(50);
      expect(listArg.orderBy).toEqual({ startTime: 'desc' });
    });

    it('count sigue siendo exacto aunque los ids vengan truncados', async () => {
      prisma.appointment.count.mockResolvedValue(120);
      prisma.appointment.findMany.mockResolvedValue(
        Array.from({ length: 50 }, (_, i) => ({ id: `apt-${i}` })),
      );

      const result = await service.getPendingNotesCount('clinician-1');

      expect(result.count).toBe(120);
      expect(result.appointmentIds).toHaveLength(50);
    });
  });

  // ── calculateScaleRiskLevel ───────────────────────────────────────────────
  // La lógica vive ahora en lib/scales.util.ts (compartida con el portal);
  // se testea aquí para conservar la cobertura de cortes clínicos.

  describe('calculateScaleRiskLevel() (lib/scales.util)', () => {
    const calc = (type: string, score: number) =>
      calculateScaleRiskLevel(type as ScaleType, score);

    describe('PHQ-9', () => {
      it.each([
        [0, ScaleRiskLevel.MINIMAL],
        [4, ScaleRiskLevel.MINIMAL],
        [5, ScaleRiskLevel.MILD],
        [9, ScaleRiskLevel.MILD],
        [10, ScaleRiskLevel.MODERATE],
        [14, ScaleRiskLevel.MODERATE],
        [15, ScaleRiskLevel.MODERATELY_SEVERE],
        [19, ScaleRiskLevel.MODERATELY_SEVERE],
        [20, ScaleRiskLevel.SEVERE],
        [27, ScaleRiskLevel.SEVERE],
      ])('score %i → %s', (score, expected) => {
        expect(calc(ScaleType.PHQ9, score)).toBe(expected);
      });
    });

    describe('GAD-7', () => {
      it.each([
        [0, ScaleRiskLevel.MINIMAL],
        [4, ScaleRiskLevel.MINIMAL],
        [5, ScaleRiskLevel.MILD],
        [9, ScaleRiskLevel.MILD],
        [10, ScaleRiskLevel.MODERATE],
        [14, ScaleRiskLevel.MODERATE],
        [15, ScaleRiskLevel.SEVERE],
        [21, ScaleRiskLevel.SEVERE],
      ])('score %i → %s', (score, expected) => {
        expect(calc(ScaleType.GAD7, score)).toBe(expected);
      });
    });
  });
});
