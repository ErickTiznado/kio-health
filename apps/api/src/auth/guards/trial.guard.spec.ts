import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TrialGuard } from './trial.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ALLOW_WHEN_TRIAL_EXPIRED_KEY } from '../decorators/allow-when-trial-expired.decorator';

const AYER = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const EN_UNA_SEMANA = new Date(
  Date.now() + 7 * 24 * 60 * 60 * 1000,
).toISOString();

function makeContext(
  method: string,
  user: Record<string, unknown> | undefined,
): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ method, user }) }),
    getHandler: () => () => undefined,
    getClass: () => class {},
  } as unknown as ExecutionContext;
}

/** Reflector que responde `true` solo a las claves de metadatos indicadas. */
function makeReflector(...trueKeys: string[]): Reflector {
  return {
    getAllAndOverride: (key: string) => trueKeys.includes(key),
  } as unknown as Reflector;
}

describe('TrialGuard', () => {
  const original = process.env.TRIAL_EXPIRED_MODE;
  afterEach(() => {
    process.env.TRIAL_EXPIRED_MODE = original;
  });

  describe('prueba vigente', () => {
    it('deja pasar escrituras', () => {
      const guard = new TrialGuard(makeReflector());
      expect(
        guard.canActivate(
          makeContext('POST', { userId: 'u1', trialEndsAt: EN_UNA_SEMANA }),
        ),
      ).toBe(true);
    });
  });

  describe('prueba caducada — modo READ_ONLY (beta)', () => {
    beforeEach(() => {
      process.env.TRIAL_EXPIRED_MODE = 'READ_ONLY';
    });

    it('deja leer', () => {
      const guard = new TrialGuard(makeReflector());
      expect(
        guard.canActivate(
          makeContext('GET', { userId: 'u1', trialEndsAt: AYER }),
        ),
      ).toBe(true);
    });

    it.each(['POST', 'PATCH', 'PUT', 'DELETE'])('bloquea %s', (method) => {
      const guard = new TrialGuard(makeReflector());
      expect(() =>
        guard.canActivate(
          makeContext(method, { userId: 'u1', trialEndsAt: AYER }),
        ),
      ).toThrow(ForbiddenException);
    });

    // Sin `code`, el frontend enseñaría "no tienes permiso" cuando lo que pasa
    // es que hay que elegir plan. Son dos pantallas distintas.
    it('identifica el bloqueo con code TRIAL_EXPIRED y el modo', () => {
      const guard = new TrialGuard(makeReflector());
      try {
        guard.canActivate(
          makeContext('POST', { userId: 'u1', trialEndsAt: AYER }),
        );
        fail('debería haber lanzado');
      } catch (e) {
        const body = (e as ForbiddenException).getResponse() as Record<
          string,
          unknown
        >;
        expect(body.code).toBe('TRIAL_EXPIRED');
        expect(body.mode).toBe('READ_ONLY');
      }
    });
  });

  describe('prueba caducada — modo HARD (live)', () => {
    beforeEach(() => {
      process.env.TRIAL_EXPIRED_MODE = 'HARD';
    });

    it('bloquea también las lecturas', () => {
      const guard = new TrialGuard(makeReflector());
      expect(() =>
        guard.canActivate(
          makeContext('GET', { userId: 'u1', trialEndsAt: AYER }),
        ),
      ).toThrow(ForbiddenException);
    });
  });

  describe('excepciones', () => {
    beforeEach(() => {
      process.env.TRIAL_EXPIRED_MODE = 'HARD';
    });

    it('no toca rutas @Public()', () => {
      const guard = new TrialGuard(makeReflector(IS_PUBLIC_KEY));
      expect(
        guard.canActivate(
          makeContext('POST', { userId: 'u1', trialEndsAt: AYER }),
        ),
      ).toBe(true);
    });

    // Sin esto, en HARD el usuario no podría cargar /auth/me y vería una
    // pantalla en blanco en lugar del aviso que explica qué ha pasado.
    it('respeta @AllowWhenTrialExpired()', () => {
      const guard = new TrialGuard(makeReflector(ALLOW_WHEN_TRIAL_EXPIRED_KEY));
      expect(
        guard.canActivate(
          makeContext('GET', { userId: 'u1', trialEndsAt: AYER }),
        ),
      ).toBe(true);
    });
  });

  describe('fallar dejando pasar', () => {
    beforeEach(() => {
      process.env.TRIAL_EXPIRED_MODE = 'HARD';
    });

    it('sin usuario no decide nada — eso es cosa de JwtAuthGuard', () => {
      const guard = new TrialGuard(makeReflector());
      expect(guard.canActivate(makeContext('POST', undefined))).toBe(true);
    });

    it('sin fecha de fin no bloquea', () => {
      const guard = new TrialGuard(makeReflector());
      expect(
        guard.canActivate(
          makeContext('POST', { userId: 'u1', trialEndsAt: null }),
        ),
      ).toBe(true);
    });
  });
});
