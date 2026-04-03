import { Injectable } from '@nestjs/common';
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
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate risk flags based on clinical data
   * Rules:
   * - PHQ-9 >= 20 → SEVERE_DEPRESSION
   * - GAD-7 >= 15 → SEVERE_ANXIETY
   * - Tags: "autolesión" → AUTOLESION, "ideación suicida" → SUICIDAL_IDEATION, "urgente" → URGENT
   * - PHQ-9 delta > 10 from previous → SUDDEN_DETERIORATION
   */
  async calculateRiskFlags(input: RiskFlagCalculationInput): Promise<RiskFlagType[]> {
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

      if (tagsLower.some((t) => t.includes('autolesión') || t.includes('autolesion'))) {
        flags.push(RiskFlagTypeEnum.AUTOLESION);
      }

      if (
        tagsLower.some(
          (t) => t.includes('ideación suicida') || t.includes('ideacion suicida') || t.includes('suicida')
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
  async updateRiskFlags(patientId: string, flagTypes: RiskFlagType[]): Promise<any> {
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
   * Get risk flags for a patient
   */
  async getRiskFlags(patientId: string): Promise<any> {
    return this.prisma.riskFlag.findUnique({
      where: { patientId },
    });
  }

  /**
   * Resolve specific risk flags (manual clearance)
   */
  async resolveRiskFlags(patientId: string, flagTypesToResolve: RiskFlagType[]): Promise<any> {
    const existing = await this.prisma.riskFlag.findUnique({
      where: { patientId },
    });

    if (!existing) {
      return null;
    }

    const remainingFlags = existing.flagTypes.filter(
      (flag: RiskFlagType) => !flagTypesToResolve.includes(flag)
    );

    return this.prisma.riskFlag.update({
      where: { patientId },
      data: {
        flagTypes: remainingFlags,
        resolvedAt: remainingFlags.length === 0 ? new Date() : null,
      },
    });
  }

  /**
   * Clear all risk flags (rare, manual operation)
   */
  async clearAllFlags(patientId: string): Promise<any> {
    return this.prisma.riskFlag.update({
      where: { patientId },
      data: {
        flagTypes: [],
        resolvedAt: new Date(),
      },
    });
  }
}
