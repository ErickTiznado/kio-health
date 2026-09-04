import {
  TRIAL_DAYS,
  computeTrialEnd,
  getTrialLockMode,
  isTrialExpired,
  trialDaysRemaining,
} from './trial';

describe('trial', () => {
  const AHORA = new Date('2026-08-19T12:00:00.000Z');

  describe('computeTrialEnd()', () => {
    it('cuenta 15 días desde el momento dado', () => {
      expect(computeTrialEnd(AHORA).toISOString()).toBe(
        '2026-09-03T12:00:00.000Z',
      );
    });

    it('usa la constante, no un número suelto', () => {
      const fin = computeTrialEnd(AHORA);
      const dias = (fin.getTime() - AHORA.getTime()) / (24 * 60 * 60 * 1000);
      expect(dias).toBe(TRIAL_DAYS);
    });
  });

  describe('isTrialExpired()', () => {
    it('es falso mientras queda tiempo', () => {
      expect(isTrialExpired('2026-08-20T12:00:00.000Z', AHORA)).toBe(false);
    });

    it('es verdadero pasada la fecha', () => {
      expect(isTrialExpired('2026-08-18T12:00:00.000Z', AHORA)).toBe(true);
    });

    it('es verdadero justo al cumplirse el instante', () => {
      expect(isTrialExpired(AHORA, AHORA)).toBe(true);
    });

    // El fallo tiene que ser dejar pasar. Bloquear por omisión dejaría a un
    // clínico sin poder documentar una sesión que ya dio por culpa de una fila
    // sin fecha — mucho peor que regalar unos días.
    it('trata null y undefined como prueba vigente, no como caducada', () => {
      expect(isTrialExpired(null, AHORA)).toBe(false);
      expect(isTrialExpired(undefined, AHORA)).toBe(false);
    });

    it('trata una fecha ilegible como prueba vigente', () => {
      expect(isTrialExpired('no-es-una-fecha', AHORA)).toBe(false);
    });
  });

  describe('trialDaysRemaining()', () => {
    it('redondea hacia arriba: quedan 2 días si falta día y medio', () => {
      expect(trialDaysRemaining('2026-08-21T00:00:00.000Z', AHORA)).toBe(2);
    });

    it('devuelve 0 y nunca negativo tras caducar', () => {
      expect(trialDaysRemaining('2026-08-01T12:00:00.000Z', AHORA)).toBe(0);
    });

    it('devuelve null sin fecha', () => {
      expect(trialDaysRemaining(null, AHORA)).toBeNull();
    });
  });

  describe('getTrialLockMode()', () => {
    const original = process.env.TRIAL_EXPIRED_MODE;
    afterEach(() => {
      process.env.TRIAL_EXPIRED_MODE = original;
    });

    it('por defecto es READ_ONLY — el modo de la beta', () => {
      delete process.env.TRIAL_EXPIRED_MODE;
      expect(getTrialLockMode()).toBe('READ_ONLY');
    });

    it('es HARD solo con el valor exacto', () => {
      process.env.TRIAL_EXPIRED_MODE = 'HARD';
      expect(getTrialLockMode()).toBe('HARD');
    });

    // Un valor con erratas no puede endurecer el bloqueo por accidente.
    it('cae a READ_ONLY ante cualquier otro valor', () => {
      process.env.TRIAL_EXPIRED_MODE = 'hard';
      expect(getTrialLockMode()).toBe('READ_ONLY');
      process.env.TRIAL_EXPIRED_MODE = 'cualquier-cosa';
      expect(getTrialLockMode()).toBe('READ_ONLY');
    });
  });
});
