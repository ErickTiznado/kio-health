import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ALLOW_WHEN_TRIAL_EXPIRED_KEY } from '../decorators/allow-when-trial-expired.decorator';
import type { RequestUser } from '../interfaces/request-user.interface';
import { getTrialLockMode, isTrialExpired } from '../../lib/trial';

/** Métodos que solo leen. En `READ_ONLY` son los únicos que siguen pasando. */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Cierra la app cuando la prueba de 15 días ha caducado.
 *
 * SE APLICA EN EL SERVIDOR, NO EN LA UI. Un "solo lectura" pintado únicamente
 * en el frontend no es un bloqueo: es una sugerencia que cualquiera salta con
 * curl. Los botones deshabilitados de la web son cortesía; la regla es esta.
 *
 * Va tercero en la cadena de `APP_GUARD` (Throttler -> JwtAuth -> Trial): lee
 * `request.user`, que solo existe después de que `JwtAuthGuard` haya validado
 * el token. Como `trialEndsAt` viaja en el JWT, no consulta la base de datos.
 *
 * Falla dejando pasar. Sin usuario, sin fecha o con fecha ilegible, no bloquea:
 * el coste de una prueba que dura de más es que alguien use el producto gratis
 * unos días; el de bloquear por error es un clínico que no puede documentar una
 * sesión que ya dio.
 */
@Injectable()
export class TrialGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const metadata = [context.getHandler(), context.getClass()];

    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, metadata)) {
      return true;
    }
    if (
      this.reflector.getAllAndOverride<boolean>(
        ALLOW_WHEN_TRIAL_EXPIRED_KEY,
        metadata,
      )
    ) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as RequestUser | undefined;

    // Sin usuario no es asunto de este guard: JwtAuthGuard ya decidió.
    if (!user) return true;

    if (!isTrialExpired(user.trialEndsAt)) return true;

    const mode = getTrialLockMode();

    if (
      mode === 'READ_ONLY' &&
      SAFE_METHODS.has(request.method.toUpperCase())
    ) {
      return true;
    }

    // El `code` es lo que distingue esto de un 403 por permisos de clínica. Sin
    // él, el frontend enseñaría "no tienes acceso a este recurso" cuando lo que
    // pasa es que hay que elegir plan, y el usuario no sabría qué hacer.
    throw new ForbiddenException({
      statusCode: 403,
      code: 'TRIAL_EXPIRED',
      mode,
      message:
        mode === 'HARD'
          ? 'Tu prueba gratuita terminó. Elige un plan para seguir usando Kio.'
          : 'Tu prueba gratuita terminó. Puedes seguir consultando tu información, pero no guardar cambios hasta elegir un plan.',
    });
  }
}
