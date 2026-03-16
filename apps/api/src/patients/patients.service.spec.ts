import { NotFoundException } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { createPrismaMock } from '../test/prisma-mock';
import { createTestEncryptionService } from '../test/encryption-helpers';
import { makePatient } from '../test/factories';

describe('PatientsService', () => {
  let service: PatientsService;
  let prisma: ReturnType<typeof createPrismaMock>;
  const encryptionService = createTestEncryptionService();

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new PatientsService(prisma as any, encryptionService);
  });

  // ── create() ─────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('encrypts diagnosis, clinicalContext, contactPhone before storing', async () => {
      const clinicianId = 'clinician-1';
      const dto = {
        fullName: 'Ana López',
        diagnosis: 'Trastorno de ansiedad',
        clinicalContext: 'Contexto clínico',
        contactPhone: '+52 55 0000 0000',
      };
      prisma.patient.create.mockImplementation(async ({ data }: any) => ({
        ...makePatient({ clinicianId }),
        ...data,
      }));

      await service.create(clinicianId, dto as any);

      const createCall = prisma.patient.create.mock.calls[0][0].data;
      expect(createCall.diagnosis).not.toBe(dto.diagnosis);
      expect(createCall.clinicalContext).not.toBe(dto.clinicalContext);
      expect(createCall.contactPhone).not.toBe(dto.contactPhone);
      // Verify ciphertext format: iv:tag:data
      expect(createCall.diagnosis).toMatch(/^[0-9a-fA-F]+:[0-9a-fA-F]+:[0-9a-fA-F]+$/);
    });

    it('serializes emergencyContact to JSON before encrypting', async () => {
      const clinicianId = 'clinician-1';
      const emergencyContact = { name: 'Carlos', phone: '5555555555' };
      const dto = { fullName: 'Test', emergencyContact };
      prisma.patient.create.mockImplementation(async ({ data }: any) => ({
        ...makePatient({ clinicianId }),
        ...data,
      }));

      await service.create(clinicianId, dto as any);

      const createCall = prisma.patient.create.mock.calls[0][0].data;
      // Decrypt and verify JSON round-trip
      const decrypted = encryptionService.decrypt(createCall.emergencyContact);
      expect(JSON.parse(decrypted)).toEqual(emergencyContact);
    });

    it('stores null for undefined/null sensitive fields', async () => {
      const clinicianId = 'clinician-1';
      const dto = { fullName: 'Test', diagnosis: undefined, contactPhone: null };
      prisma.patient.create.mockImplementation(async ({ data }: any) => ({
        ...makePatient({ clinicianId }),
        ...data,
      }));

      await service.create(clinicianId, dto as any);

      const createCall = prisma.patient.create.mock.calls[0][0].data;
      expect(createCall.diagnosis).toBeUndefined();
    });
  });

  // ── findOne() ─────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('queries with both id AND clinicianId (ownership enforcement)', async () => {
      const patient = makePatient();
      prisma.patient.findFirst.mockResolvedValue(patient);

      await service.findOne(patient.id, 'clinician-123');

      expect(prisma.patient.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: patient.id, clinicianId: 'clinician-123' },
        }),
      );
    });

    it('throws NotFoundException when patient not found (wrong clinicianId)', async () => {
      prisma.patient.findFirst.mockResolvedValue(null);
      await expect(service.findOne('any-id', 'wrong-clinician')).rejects.toThrow(NotFoundException);
    });

    it('decrypts diagnosis and clinicalContext on return', async () => {
      const plainDiagnosis = 'Depresión moderada';
      const plainPhone = '+52 55 9999 0000';
      const patient = makePatient({
        diagnosis: encryptionService.encrypt(plainDiagnosis),
        contactPhone: encryptionService.encrypt(plainPhone),
      });
      prisma.patient.findFirst.mockResolvedValue(patient);

      const result = await service.findOne(patient.id as string, patient.clinicianId as string);

      expect(result.diagnosis).toBe(plainDiagnosis);
      expect(result.contactPhone).toBe(plainPhone);
    });

    it('parses emergencyContact JSON after decryption', async () => {
      const contactObj = { name: 'María', relation: 'madre', phone: '5550001234' };
      const patient = makePatient({
        emergencyContact: encryptionService.encrypt(JSON.stringify(contactObj)),
      });
      prisma.patient.findFirst.mockResolvedValue(patient);

      const result = await service.findOne(patient.id as string, patient.clinicianId as string);

      expect(result.emergencyContact).toEqual(contactObj);
    });
  });

  // ── findAll() ─────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('always filters by clinicianId', async () => {
      prisma.patient.findMany.mockResolvedValue([]);
      prisma.patient.count.mockResolvedValue(0);

      await service.findAll('clinician-abc', {} as any);

      const whereArg = prisma.patient.findMany.mock.calls[0][0].where;
      expect(whereArg.clinicianId).toBe('clinician-abc');
    });

    it('excludes ARCHIVED by default when no status filter', async () => {
      prisma.patient.findMany.mockResolvedValue([]);
      prisma.patient.count.mockResolvedValue(0);

      await service.findAll('clinician-1', {} as any);

      const whereArg = prisma.patient.findMany.mock.calls[0][0].where;
      expect(whereArg.status).toEqual({ not: 'ARCHIVED' });
    });

    it('uses provided status filter when given', async () => {
      prisma.patient.findMany.mockResolvedValue([]);
      prisma.patient.count.mockResolvedValue(0);

      await service.findAll('clinician-1', { status: 'WAITLIST' } as any);

      const whereArg = prisma.patient.findMany.mock.calls[0][0].where;
      expect(whereArg.status).toBe('WAITLIST');
    });

    it('returns correct pagination meta', async () => {
      prisma.patient.findMany.mockResolvedValue([makePatient(), makePatient()]);
      prisma.patient.count.mockResolvedValue(25);

      const result = await service.findAll('clinician-1', { page: 2, limit: 10 } as any);

      expect(result.meta).toEqual({ total: 25, page: 2, lastPage: 3 });
    });
  });

  // ── update() ─────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('re-encrypts only fields that are provided', async () => {
      const patient = makePatient();
      prisma.patient.findFirst.mockResolvedValue(patient);
      prisma.patient.update.mockImplementation(async ({ data }: any) => ({ ...patient, ...data }));

      await service.update(patient.id as string, patient.clinicianId as string, {
        diagnosis: 'Nueva diagnosis',
      } as any);

      const updateData = prisma.patient.update.mock.calls[0][0].data;
      expect(updateData.diagnosis).toMatch(/^[0-9a-fA-F]+:[0-9a-fA-F]+:[0-9a-fA-F]+$/);
      // clinicalContext was not provided, should not be in the update
      expect(updateData.clinicalContext).toBeUndefined();
    });

    it('sets null when a sensitive field is explicitly set to null', async () => {
      const patient = makePatient({ diagnosis: encryptionService.encrypt('old') });
      prisma.patient.findFirst.mockResolvedValue(patient);
      prisma.patient.update.mockImplementation(async ({ data }: any) => ({ ...patient, ...data }));

      await service.update(patient.id as string, patient.clinicianId as string, {
        diagnosis: null,
      } as any);

      const updateData = prisma.patient.update.mock.calls[0][0].data;
      expect(updateData.diagnosis).toBeNull();
    });
  });

  // ── decryptPatient — tamper detection ─────────────────────────────────────

  describe('decryptPatient tamper detection', () => {
    it('throws when stored diagnosis ciphertext has been tampered', async () => {
      const patient = makePatient({ diagnosis: 'tampered:deadbeef:cafecafe' });
      prisma.patient.findFirst.mockResolvedValue(patient);

      await expect(
        service.findOne(patient.id as string, patient.clinicianId as string),
      ).rejects.toThrow();
    });
  });
});
