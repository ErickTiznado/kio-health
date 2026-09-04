import { describe, it, expect } from 'vitest';
import {
  TRIAL_WARNING_DAYS,
  getTrialState,
  isTrialExpired,
  trialDaysRemaining,
} from '../trial';

const AHORA = new Date('2026-08-19T12:00:00.000Z');
const dentroDe = (dias: number) =>
  new Date(AHORA.getTime() + dias * 24 * 60 * 60 * 1000).toISOString();

describe('isTrialExpired', () => {
  it('es falso mientras queda tiempo', () => {
    expect(isTrialExpired(dentroDe(3), AHORA)).toBe(false);
  });

  it('es verdadero pasada la fecha', () => {
    expect(isTrialExpired(dentroDe(-1), AHORA)).toBe(true);
  });

  // Si esto se invirtiera, una cuenta interna o una fila que el backfill de la
  // migración no alcanzara quedaría bloqueada sin haber caducado nada.
  it('trata null, undefined y basura como prueba vigente', () => {
    expect(isTrialExpired(null, AHORA)).toBe(false);
    expect(isTrialExpired(undefined, AHORA)).toBe(false);
    expect(isTrialExpired('no-es-fecha', AHORA)).toBe(false);
  });
});

describe('trialDaysRemaining', () => {
  it('redondea hacia arriba', () => {
    expect(trialDaysRemaining(dentroDe(1.5), AHORA)).toBe(2);
  });

  it('nunca es negativo', () => {
    expect(trialDaysRemaining(dentroDe(-40), AHORA)).toBe(0);
  });

  it('es null sin fecha', () => {
    expect(trialDaysRemaining(null, AHORA)).toBeNull();
  });
});

describe('getTrialState', () => {
  it('en plena prueba no avisa de nada', () => {
    const estado = getTrialState(dentroDe(12), 'READ_ONLY', AHORA);
    expect(estado).toMatchObject({
      isTracked: true,
      isExpired: false,
      isReadOnly: false,
      isHardLocked: false,
      isEndingSoon: false,
    });
  });

  it(`avisa a partir de ${TRIAL_WARNING_DAYS} días`, () => {
    expect(getTrialState(dentroDe(TRIAL_WARNING_DAYS), 'READ_ONLY', AHORA).isEndingSoon).toBe(true);
    expect(getTrialState(dentroDe(TRIAL_WARNING_DAYS + 1), 'READ_ONLY', AHORA).isEndingSoon).toBe(false);
  });

  it('caducada en READ_ONLY: solo lectura, sin bloqueo total', () => {
    const estado = getTrialState(dentroDe(-1), 'READ_ONLY', AHORA);
    expect(estado.isReadOnly).toBe(true);
    expect(estado.isHardLocked).toBe(false);
  });

  it('caducada en HARD: la app queda cerrada', () => {
    const estado = getTrialState(dentroDe(-1), 'HARD', AHORA);
    expect(estado.isHardLocked).toBe(true);
    expect(estado.isReadOnly).toBe(false);
  });

  // El modo llega del servidor. Si falta —respuesta antigua en caché, usuario
  // rehidratado de localStorage— se elige el menos destructivo: nadie se queda
  // fuera de la historia clínica de sus pacientes por un campo ausente.
  it('sin modo conocido cae en solo lectura, nunca en bloqueo duro', () => {
    const estado = getTrialState(dentroDe(-1), undefined, AHORA);
    expect(estado.isReadOnly).toBe(true);
    expect(estado.isHardLocked).toBe(false);
  });

  it('sin fecha no hay prueba que vigilar', () => {
    const estado = getTrialState(null, 'HARD', AHORA);
    expect(estado).toMatchObject({
      isTracked: false,
      isExpired: false,
      isHardLocked: false,
      isEndingSoon: false,
      daysRemaining: null,
    });
  });
});
