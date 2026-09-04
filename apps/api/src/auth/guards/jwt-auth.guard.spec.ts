import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * El JwtAuthGuard es ahora APP_GUARD global. Su única lógica propia es el
 * escape @Public(); la validación real del token la hereda de AuthGuard('jwt').
 *
 * Estos tests fijan ese contrato: en ruta pública devuelve true sin tocar la
 * estrategia passport; en ruta protegida delega en super.canActivate.
 */
describe('JwtAuthGuard', () => {
  const makeContext = (): ExecutionContext =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({}) }),
    }) as unknown as ExecutionContext;

  // Espía sobre AuthGuard('jwt').canActivate (el prototipo abuelo del guard).
  const spySuperCanActivate = (guard: JwtAuthGuard) =>
    jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockReturnValue(true);

  it('deja pasar sin validar token cuando la ruta es @Public()', () => {
    const getAllAndOverride = jest.fn().mockReturnValue(true);
    const reflector = { getAllAndOverride } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);
    const superSpy = spySuperCanActivate(guard);

    const result = guard.canActivate(makeContext());

    expect(result).toBe(true);
    expect(getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
      expect.anything(),
      expect.anything(),
    ]);
    // En ruta pública NO debe delegar en la estrategia passport.
    expect(superSpy).not.toHaveBeenCalled();
    superSpy.mockRestore();
  });

  it('delega en la validación JWT cuando la ruta NO es pública', () => {
    const getAllAndOverride = jest.fn().mockReturnValue(undefined);
    const reflector = { getAllAndOverride } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);
    const superSpy = spySuperCanActivate(guard);

    const result = guard.canActivate(makeContext());

    expect(superSpy).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
    superSpy.mockRestore();
  });
});
