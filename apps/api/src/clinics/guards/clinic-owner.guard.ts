import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class ClinicOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { clinicRole?: string };

    if (user?.clinicRole !== 'OWNER') {
      throw new ForbiddenException('Se requiere ser propietario de la clínica');
    }

    return true;
  }
}
