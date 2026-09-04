import { BadRequestException } from '@nestjs/common';
import { ScaleType, ScaleRiskLevel } from '#generated/prisma';

export const SCALE_LENGTHS: Record<ScaleType, number> = {
  PHQ9: 9,
  GAD7: 7,
};

/** Índice (0-based) del ítem 9 del PHQ-9 — cribado de ideación suicida. */
export const PHQ9_SUICIDALITY_ITEM_INDEX = 8;

/**
 * Valida longitud y rango (0-3 Likert) de las respuestas de una escala.
 * Fuente única de verdad — usada por el flujo del clínico y el del portal.
 */
export function validateScaleScores(
  scaleType: ScaleType,
  scores: number[],
): void {
  const expectedLength = SCALE_LENGTHS[scaleType];
  if (scores.length !== expectedLength) {
    throw new BadRequestException(
      `${scaleType} requires exactly ${expectedLength} scores, got ${scores.length}`,
    );
  }
  if (scores.some((s) => !Number.isInteger(s) || s < 0 || s > 3)) {
    throw new BadRequestException(
      'Cada respuesta debe ser un entero entre 0 y 3',
    );
  }
}

/** Cortes estándar de PHQ-9 / GAD-7 (server-authoritative). */
export function calculateScaleRiskLevel(
  scaleType: ScaleType,
  total: number,
): ScaleRiskLevel {
  if (scaleType === ScaleType.PHQ9) {
    if (total <= 4) return ScaleRiskLevel.MINIMAL;
    if (total <= 9) return ScaleRiskLevel.MILD;
    if (total <= 14) return ScaleRiskLevel.MODERATE;
    if (total <= 19) return ScaleRiskLevel.MODERATELY_SEVERE;
    return ScaleRiskLevel.SEVERE;
  }
  // GAD-7
  if (total <= 4) return ScaleRiskLevel.MINIMAL;
  if (total <= 9) return ScaleRiskLevel.MILD;
  if (total <= 14) return ScaleRiskLevel.MODERATE;
  return ScaleRiskLevel.SEVERE;
}
