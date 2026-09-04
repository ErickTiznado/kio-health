import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { RiskFlagType } from '#generated/prisma';
import { RiskFlagType as RiskFlagTypeEnum } from '#generated/prisma';

export interface RiskFlagCalculationInput {
  patientId: string;
  phq9Score?: number;
  gad7Score?: number;
  tags?: string[];
  previousPhq9Score?: number;
}

@Injectable()
export class RiskFlagsService {
  private readonly logger = new Logger(RiskFlagsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Recalcula las banderas del paciente a partir de las escalas de una cita.
   * Compartido por: upsert de nota clínica, guardado de escalas del clínico y
   * auto-reporte del portal del paciente.
   *
   * - Si `tags` no se pasa, se leen de la PsychNote de la cita (si existe)
   *   para NO borrar banderas derivadas de tags al recalcular por escala.
   * - Nunca lanza: un fallo aquí no debe romper la operación principal.
   */
  async recalculateForAppointment(params: {
    patientId: string;
    clinicianId: string;
    appointmentId: string;
    tags?: string[];
  }): Promise<void> {
    const { patientId, clinicianId, appointmentId } = params;

    try {
      const appointment = await this.prisma.appointment.findFirst({
        where: { id: appointmentId, patientId },
        select: { startTime: true },
      });
      if (!appointment) return;

      let tags = params.tags;
      if (tags === undefined) {
        const note = await this.prisma.psychNote.findUnique({
          where: { appointmentId },
          select: { tags: true },
        });
        tags = note?.tags ?? [];
      }

      const scales = await this.prisma.clinicalScale.findMany({
        where: { appointmentId },
      });
      const phq9Score = scales.find((s) => s.scaleType === 'PHQ9')?.totalScore;
      const gad7Score = scales.find((s) => s.scaleType === 'GAD7')?.totalScore;

      // Cita completada anterior → delta de PHQ-9 (deterioro súbito)
      const previousAppointment = await this.prisma.appointment.findFirst({
        where: {
          patientId,
          clinicianId,
          status: 'COMPLETED',
          startTime: { lt: appointment.startTime },
        },
        orderBy: { startTime: 'desc' },
        select: { id: true },
      });

      let previousPhq9Score: number | undefined;
      if (previousAppointment) {
        const prevScales = await this.prisma.clinicalScale.findMany({
          where: { appointmentId: previousAppointment.id },
        });
        previousPhq9Score = prevScales.find(
          (s) => s.scaleType === 'PHQ9',
        )?.totalScore;
      }

      const flagTypes = await this.calculateRiskFlags({
        patientId,
        phq9Score,
        gad7Score,
        tags,
        previousPhq9Score,
      });

      await this.updateRiskFlags(patientId, flagTypes);
    } catch (e) {
      this.logger.error(
        `Error calculating risk flags for patient ${patientId}: ${(e as Error).message}`,
        (e as Error).stack,
      );
    }
  }

  /**
   * Calculate risk flags based on clinical data
   * Rules:
   * - PHQ-9 >= 20 → SEVERE_DEPRESSION
   * - GAD-7 >= 15 → SEVERE_ANXIETY
   * - Tags: "autolesión" → AUTOLESION, "ideación suicida" → SUICIDAL_IDEATION, "urgente" → URGENT
   * - PHQ-9 delta > 10 from previous → SUDDEN_DETERIORATION
   */
  async calculateRiskFlags(
    input: RiskFlagCalculationInput,
  ): Promise<RiskFlagType[]> {
    const flags: RiskFlagType[] = [];

    // Check PHQ-9 score
    if (input.phq9Score !== undefined && input.phq9Score >= 20) {
      flags.push(RiskFlagTypeEnum.SEVERE_DEPRESSION);
    }

    // Check GAD-7 score
    if (input.gad7Score !== undefined && input.gad7Score >= 15) {
      flags.push(RiskFlagTypeEnum.SEVERE_ANXIETY);
    }

    // Check tags
    if (input.tags && input.tags.length > 0) {
      const tagsLower = input.tags.map((t) => t.toLowerCase());

      if (
        tagsLower.some(
          (t) => t.includes('autolesión') || t.includes('autolesion'),
        )
      ) {
        flags.push(RiskFlagTypeEnum.AUTOLESION);
      }

      if (
        tagsLower.some(
          (t) =>
            t.includes('ideación suicida') ||
            t.includes('ideacion suicida') ||
            t.includes('suicida'),
        )
      ) {
        flags.push(RiskFlagTypeEnum.SUICIDAL_IDEATION);
      }

      if (tagsLower.some((t) => t === 'urgente' || t === 'urgent')) {
        flags.push(RiskFlagTypeEnum.URGENT);
      }
    }

    // Check PHQ-9 delta (sudden deterioration)
    if (
      input.phq9Score !== undefined &&
      input.previousPhq9Score !== undefined &&
      input.phq9Score - input.previousPhq9Score > 10
    ) {
      flags.push(RiskFlagTypeEnum.SUDDEN_DETERIORATION);
    }

    // Remove duplicates
    return Array.from(new Set(flags));
  }

  /**
   * Update or create risk flags for a patient
   */
  async updateRiskFlags(
    patientId: string,
    flagTypes: RiskFlagType[],
  ): Promise<any> {
    return this.prisma.riskFlag.upsert({
      where: { patientId },
      update: {
        flagTypes,
        lastUpdated: new Date(),
      },
      create: {
        patientId,
        flagTypes,
      },
    });
  }

  /**
   * Get risk flags for a patient.
   *
   * La propiedad se valida en la propia query (`findFirst` + `patient.clinicianId`),
   * no con un check posterior: si el paciente no es de este clínico, no hay fila
   * que devolver. Mismo patrón que el resto de servicios del proyecto.
   */
  async getRiskFlags(patientId: string, clinicianId: string): Promise<any> {
    return this.prisma.riskFlag.findFirst({
      where: { patientId, patient: { clinicianId } },
    });
  }

  /**
   * Resolve specific risk flags (manual clearance)
   */
  async resolveRiskFlags(
    patientId: string,
    clinicianId: string,
    flagTypesToResolve: RiskFlagType[],
  ): Promise<any> {
    const existing = await this.prisma.riskFlag.findFirst({
      where: { patientId, patient: { clinicianId } },
      select: { id: true, flagTypes: true },
    });

    if (!existing) {
      return null;
    }

    const remainingFlags = existing.flagTypes.filter(
      (flag: RiskFlagType) => !flagTypesToResolve.includes(flag),
    );

    return this.prisma.riskFlag.update({
      where: { id: existing.id },
      data: {
        flagTypes: remainingFlags,
        resolvedAt: remainingFlags.length === 0 ? new Date() : null,
      },
    });
  }

  /**
   * Clear all risk flags (rare, manual operation)
   */
  async clearAllFlags(patientId: string, clinicianId: string): Promise<any> {
    const existing = await this.prisma.riskFlag.findFirst({
      where: { patientId, patient: { clinicianId } },
      select: { id: true },
    });

    if (!existing) {
      throw new ForbiddenException(
        'No tienes permiso para modificar este paciente',
      );
    }

    return this.prisma.riskFlag.update({
      where: { id: existing.id },
      data: {
        flagTypes: [],
        resolvedAt: new Date(),
      },
    });
  }
}
