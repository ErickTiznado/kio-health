import {
  ForbiddenException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { createPrismaMock } from '../test/prisma-mock';
import { createTestEncryptionService } from '../test/encryption-helpers';
import { makeAppointment, makeClinicianProfile } from '../test/factories';
import { NoteTemplateType } from './dto/create-psych-note.dto';
import { ScaleType, ScaleRiskLevel } from '#generated/prisma';

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
    );
    jest.clearAllMocks();
    mockGoogleCalendar.syncAppointment.mockResolvedValue(null);
    mockGoogleCalendar.deleteAppointment.mockResolvedValue(null);
  });

  // ── findAppointmentOrFail ─────────────────────────────────────────────────

  describe('findAppointmentOrFail (via startSession)', () => {
    it('throws ForbiddenException when appointment belongs to different clinician', async () => {
      prisma.appointment.findFirst.mockResolvedValue(null); // ownership check fails
      await expect(service.startSession('wrong-clinician', 'apt-id')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws ForbiddenException when appointment does not exist', async () => {
      prisma.appointment.findFirst.mockResolvedValue(null);
      await expect(service.startSession('clinician-1', 'nonexistent')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ── create() ─────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('uses sessionDefaultDuration and sessionDefaultPrice from profile when DTO omits them', async () => {
      const profile = makeClinicianProfile({ sessionDefaultDuration: 45, sessionDefaultPrice: 800 });
      prisma.clinicianProfile.findUnique.mockResolvedValue(profile);
      prisma.appointment.findFirst.mockResolvedValue(null); // no overlap
      const created = makeAppointment({ clinicianId: 'clinician-1', price: 800 });
      prisma.appointment.create.mockResolvedValue(created);

      const result = await service.create('clinician-1', {
        patientId: 'patient-1',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        // no duration or price
      } as any);

      const createData = prisma.appointment.create.mock.calls[0][0].data;
      const durationMs = createData.endTime.getTime() - createData.startTime.getTime();
      expect(durationMs).toBe(45 * 60 * 1000);
      expect(createData.price).toBe(800);
    });

    it('calculates endTime = startTime + duration', async () => {
      const profile = makeClinicianProfile({ sessionDefaultDuration: 60, sessionDefaultPrice: 1000 });
      prisma.clinicianProfile.findUnique.mockResolvedValue(profile);
      prisma.appointment.findFirst.mockResolvedValue(null);
      prisma.appointment.create.mockImplementation(async ({ data }: any) => ({
        ...makeAppointment(),
        ...data,
      }));

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
      prisma.appointment.create.mockImplementation(async ({ data }: any) => ({
        ...makeAppointment(),
        ...data,
      }));

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
      prisma.appointment.update.mockResolvedValue({ ...apt, status: 'IN_PROGRESS' });

      await service.startSession('clinician-1', apt.id as string);

      expect(prisma.appointment.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'IN_PROGRESS' } }),
      );
    });

    it('throws BadRequestException if not SCHEDULED', async () => {
      const apt = makeAppointment({ status: 'COMPLETED' });
      prisma.appointment.findFirst.mockResolvedValue(apt);

      await expect(service.startSession('clinician-1', apt.id as string)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cancelAppointment() — SCHEDULED → CANCELLED', () => {
    it('updates status to CANCELLED', async () => {
      const apt = makeAppointment({ status: 'SCHEDULED' });
      prisma.appointment.findFirst.mockResolvedValue(apt);
      prisma.appointment.update.mockResolvedValue({ ...apt, status: 'CANCELLED' });

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

      await expect(service.markNoShow('clinician-1', apt.id as string)).rejects.toThrow(
        BadRequestException,
      );
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

      await service.upsertPsychNote('clinician-1', apt.id as string, dto as any);

      const createData = prisma.psychNote.create.mock.calls[0][0].data;
      // content should be encrypted (not a plain object string)
      expect(typeof createData.content).toBe('string');
      expect(createData.content).toMatch(/^[0-9a-fA-F]+:[0-9a-fA-F]+:[0-9a-fA-F]+$/);
      expect(createData.privateNotes).toMatch(/^[0-9a-fA-F]+:[0-9a-fA-F]+:[0-9a-fA-F]+$/);
    });

    it('throws ForbiddenException when editing note >24h after session ended', async () => {
      const endTime = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25h ago
      const apt = makeAppointment({ endTime });
      prisma.appointment.findFirst.mockResolvedValue(apt);
      // Existing note (so edit attempt is blocked)
      prisma.psychNote.findUnique.mockResolvedValue({ id: 'note-1', appointmentId: apt.id });

      await expect(
        service.upsertPsychNote('clinician-1', apt.id as string, {
          templateType: NoteTemplateType.SOAP,
          content: { s: '', o: '', a: '', p: '' },
        } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException for SOAP note missing required keys', async () => {
      const apt = makeAppointment({ endTime: new Date(Date.now() + 3600000) });
      prisma.appointment.findFirst.mockResolvedValue(apt);

      await expect(
        service.upsertPsychNote('clinician-1', apt.id as string, {
          templateType: NoteTemplateType.SOAP,
          content: { s: 'only subjetivo' }, // missing o, a, p
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for FREE note missing body field', async () => {
      const apt = makeAppointment({ endTime: new Date(Date.now() + 3600000) });
      prisma.appointment.findFirst.mockResolvedValue(apt);

      await expect(
        service.upsertPsychNote('clinician-1', apt.id as string, {
          templateType: NoteTemplateType.FREE,
          content: { wrongField: 'text' },
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── updatePayment() ───────────────────────────────────────────────────────

  describe('updatePayment()', () => {
    it('emits appointment.paid event only when status is PAID', async () => {
      const apt = makeAppointment();
      prisma.appointment.findFirst.mockResolvedValue(apt);
      prisma.$transaction.mockImplementation((cb: any) => cb(prisma));
      prisma.appointment.update.mockResolvedValue({ ...apt, paymentStatus: 'PAID' });

      await service.updatePayment('clinician-1', apt.id as string, {
        status: 'PAID',
        method: 'CASH',
      } as any);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith('appointment.paid', expect.anything());
    });

    it('does NOT emit event when status is PENDING', async () => {
      const apt = makeAppointment();
      prisma.appointment.findFirst.mockResolvedValue(apt);
      prisma.$transaction.mockImplementation((cb: any) => cb(prisma));
      prisma.appointment.update.mockResolvedValue({ ...apt, paymentStatus: 'PENDING' });
      prisma.financeTransaction.deleteMany.mockResolvedValue({ count: 0 });

      await service.updatePayment('clinician-1', apt.id as string, {
        status: 'PENDING',
      } as any);

      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('deletes existing finance transaction when reverting to PENDING', async () => {
      const apt = makeAppointment();
      prisma.appointment.findFirst.mockResolvedValue(apt);
      prisma.$transaction.mockImplementation((cb: any) => cb(prisma));
      prisma.appointment.update.mockResolvedValue({ ...apt, paymentStatus: 'PENDING' });
      prisma.financeTransaction.deleteMany.mockResolvedValue({ count: 1 });

      await service.updatePayment('clinician-1', apt.id as string, {
        status: 'PENDING',
      } as any);

      expect(prisma.financeTransaction.deleteMany).toHaveBeenCalledWith({
        where: { appointmentId: apt.id },
      });
    });
  });

  // ── calculateScaleRiskLevel ───────────────────────────────────────────────

  describe('calculateScaleRiskLevel() (private, tested via cast)', () => {
    const calc = (type: string, score: number) =>
      (service as any).calculateScaleRiskLevel(type, score);

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
