import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { RiskFlagsService } from './risk-flags.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, type PrismaMock } from '../test/prisma-mock';
import { RiskFlagType } from '#generated/prisma';

const CLINICIAN_A = 'clinician-a-uuid';
const CLINICIAN_B = 'clinician-b-uuid';
const PATIENT_OF_B = 'patient-of-b-uuid';

describe('RiskFlagsService', () => {
  let service: RiskFlagsService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiskFlagsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RiskFlagsService>(RiskFlagsService);
  });

  describe('calculateRiskFlags', () => {
    it('marca SEVERE_DEPRESSION con PHQ-9 >= 20', async () => {
      const flags = await service.calculateRiskFlags({
        patientId: 'p1',
        phq9Score: 20,
      });
      expect(flags).toContain(RiskFlagType.SEVERE_DEPRESSION);
    });

    it('marca SEVERE_ANXIETY con GAD-7 >= 15', async () => {
      const flags = await service.calculateRiskFlags({
        patientId: 'p1',
        gad7Score: 15,
      });
      expect(flags).toContain(RiskFlagType.SEVERE_ANXIETY);
    });

    it('detecta ideación suicida desde los tags', async () => {
      const flags = await service.calculateRiskFlags({
        patientId: 'p1',
        tags: ['ideación suicida'],
      });
      expect(flags).toContain(RiskFlagType.SUICIDAL_IDEATION);
    });

    it('marca SUDDEN_DETERIORATION con un salto de PHQ-9 > 10', async () => {
      const flags = await service.calculateRiskFlags({
        patientId: 'p1',
        phq9Score: 22,
        previousPhq9Score: 5,
      });
      expect(flags).toContain(RiskFlagType.SUDDEN_DETERIORATION);
    });

    it('no duplica banderas', async () => {
      const flags = await service.calculateRiskFlags({
        patientId: 'p1',
        tags: ['suicida', 'ideación suicida'],
      });
      const suicidal = flags.filter(
        (f) => f === RiskFlagType.SUICIDAL_IDEATION,
      );
      expect(suicidal).toHaveLength(1);
    });
  });

  /**
   * Regresión de autorización.
   *
   * Contexto: `RiskFlagsController` exponía estas operaciones con solo
   * `JwtAuthGuard` y sus rutas ensombrecían (route shadowing) a las de
   * `PatientsController`, que sí validan propiedad. El controller redundante se
   * eliminó y el servicio ahora exige `clinicianId` y filtra en la propia query.
   *
   * Estos tests fijan ese contrato: la condición de propiedad tiene que viajar
   * SIEMPRE en el `where`, no en un check posterior.
   */
  describe('aislamiento entre clínicos', () => {
    it('getRiskFlags filtra por clinicianId dentro de la query', async () => {
      prisma.riskFlag.findFirst.mockResolvedValue(null);

      const result = await service.getRiskFlags(PATIENT_OF_B, CLINICIAN_A);

      expect(result).toBeNull();
      expect(prisma.riskFlag.findFirst).toHaveBeenCalledWith({
        where: {
          patientId: PATIENT_OF_B,
          patient: { clinicianId: CLINICIAN_A },
        },
      });
      // Nunca debe consultarse solo por patientId
      expect(prisma.riskFlag.findUnique).not.toHaveBeenCalled();
    });

    it('resolveRiskFlags no modifica nada si el paciente es de otro clínico', async () => {
      prisma.riskFlag.findFirst.mockResolvedValue(null);

      const result = await service.resolveRiskFlags(PATIENT_OF_B, CLINICIAN_A, [
        RiskFlagType.SUICIDAL_IDEATION,
      ]);

      expect(result).toBeNull();
      expect(prisma.riskFlag.update).not.toHaveBeenCalled();
    });

    it('clearAllFlags lanza ForbiddenException si el paciente es de otro clínico', async () => {
      prisma.riskFlag.findFirst.mockResolvedValue(null);

      await expect(
        service.clearAllFlags(PATIENT_OF_B, CLINICIAN_A),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(prisma.riskFlag.update).not.toHaveBeenCalled();
    });

    it('resolveRiskFlags sí opera cuando el paciente es del clínico', async () => {
      prisma.riskFlag.findFirst.mockResolvedValue({
        id: 'flag-1',
        flagTypes: [
          RiskFlagType.SUICIDAL_IDEATION,
          RiskFlagType.SEVERE_ANXIETY,
        ],
      });
      prisma.riskFlag.update.mockResolvedValue({ id: 'flag-1' });

      await service.resolveRiskFlags('own-patient', CLINICIAN_B, [
        RiskFlagType.SUICIDAL_IDEATION,
      ]);

      expect(prisma.riskFlag.findFirst).toHaveBeenCalledWith({
        where: {
          patientId: 'own-patient',
          patient: { clinicianId: CLINICIAN_B },
        },
        select: { id: true, flagTypes: true },
      });
      // Actualiza por id (ya validado), conservando la bandera no resuelta
      expect(prisma.riskFlag.update).toHaveBeenCalledWith({
        where: { id: 'flag-1' },
        data: {
          flagTypes: [RiskFlagType.SEVERE_ANXIETY],
          resolvedAt: null,
        },
      });
    });

    it('marca resolvedAt cuando ya no quedan banderas', async () => {
      prisma.riskFlag.findFirst.mockResolvedValue({
        id: 'flag-1',
        flagTypes: [RiskFlagType.SUICIDAL_IDEATION],
      });
      prisma.riskFlag.update.mockResolvedValue({ id: 'flag-1' });

      await service.resolveRiskFlags('own-patient', CLINICIAN_B, [
        RiskFlagType.SUICIDAL_IDEATION,
      ]);

      const callArg = prisma.riskFlag.update.mock.calls[0][0];
      expect(callArg.data.flagTypes).toEqual([]);
      expect(callArg.data.resolvedAt).toBeInstanceOf(Date);
    });
  });
});
