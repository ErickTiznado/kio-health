import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/**
 * Restringe una ruta a usuarios con role ADMIN (el rol viene del JWT,
 * poblado por JwtStrategy.validate — cero queries a la BD).
 * Usar junto al JwtAuthGuard global, nunca en rutas @Public().
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role?: string } }>();

    if (request.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Requiere rol de administrador');
    }

    return true;
  }
}
