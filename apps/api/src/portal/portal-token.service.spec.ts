import { Test, TestingModule } from '@nestjs/testing';
import { PortalTokenService } from './portal-token.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, type PrismaMock } from '../test/prisma-mock';

const CLINICIAN_A = 'clinician-a-uuid';
const PATIENT_1 = 'patient-1-uuid';

describe('PortalTokenService', () => {
  let service: PortalTokenService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortalTokenService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PortalTokenService>(PortalTokenService);
  });

  describe('issueToken', () => {
    it('guarda solo el hash, nunca el token crudo', async () => {
      prisma.patientPortalToken.create.mockResolvedValue({ id: 't1' });

      const raw = await service.issueToken(PATIENT_1);

      expect(raw.length).toBeGreaterThanOrEqual(40); // 32 bytes base64url
      const createCalls = prisma.patientPortalToken.create.mock
        .calls as unknown as Array<
        [{ data: { tokenHash: string; expiresAt: Date } }]
      >;
      const createArg = createCalls[0][0];
      expect(createArg.data.tokenHash).not.toBe(raw);
      expect(createArg.data.tokenHash).toMatch(/^[0-9a-f]{64}$/); // sha256 hex
      // Expira ~30 días adelante
      const days =
        (createArg.data.expiresAt.getTime() - Date.now()) / 86_400_000;
      expect(days).toBeGreaterThan(29);
      expect(days).toBeLessThan(31);
    });

    it('dos emisiones producen tokens distintos', async () => {
      prisma.patientPortalToken.create.mockResolvedValue({ id: 't' });
      const a = await service.issueToken(PATIENT_1);
      const b = await service.issueToken(PATIENT_1);
      expect(a).not.toBe(b);
    });
  });

  describe('resolvePatient', () => {
    it('rechaza tokens con formato absurdo sin tocar la BD', async () => {
      expect(await service.resolvePatient('')).toBeNull();
      expect(await service.resolvePatient('corto')).toBeNull();
      expect(await service.resolvePatient('x'.repeat(300))).toBeNull();
      expect(prisma.patientPortalToken.findUnique).not.toHaveBeenCalled();
    });

    it('devuelve null si el token expiró', async () => {
      prisma.patientPortalToken.findUnique.mockResolvedValue({
        id: 't1',
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1000),
        patient: { id: PATIENT_1, clinicianId: CLINICIAN_A },
      });

      const result = await service.resolvePatient('a'.repeat(43));
      expect(result).toBeNull();
    });

    it('devuelve null si el token fue revocado', async () => {
      prisma.patientPortalToken.findUnique.mockResolvedValue({
        id: 't1',
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 100_000),
        patient: { id: PATIENT_1, clinicianId: CLINICIAN_A },
      });

      const result = await service.resolvePatient('a'.repeat(43));
      expect(result).toBeNull();
    });

    it('resuelve paciente y clínico con token vigente', async () => {
      prisma.patientPortalToken.findUnique.mockResolvedValue({
        id: 't1',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 100_000),
        patient: { id: PATIENT_1, clinicianId: CLINICIAN_A },
      });
      prisma.patientPortalToken.update.mockResolvedValue({ id: 't1' });

      const result = await service.resolvePatient('a'.repeat(43));
      expect(result).toEqual({
        patientId: PATIENT_1,
        clinicianId: CLINICIAN_A,
      });
    });
  });

  describe('revokeAllForPatient', () => {
    it('el ownership va en la query (patient.clinicianId)', async () => {
      prisma.patientPortalToken.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.revokeAllForPatient(CLINICIAN_A, PATIENT_1);

      expect(result).toEqual({ revoked: 2 });
      const updateManyCalls = prisma.patientPortalToken.updateMany.mock
        .calls as unknown as Array<[{ where: Record<string, unknown> }]>;
      const arg = updateManyCalls[0][0];
      expect(arg.where).toMatchObject({
        patientId: PATIENT_1,
        revokedAt: null,
        patient: { clinicianId: CLINICIAN_A },
      });
    });
  });
});
