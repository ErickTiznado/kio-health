import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { RequestUser } from '../../auth/interfaces/request-user.interface';

@Injectable()
export class ClinicOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as RequestUser | undefined;

    if (user?.clinicRole !== 'OWNER') {
      throw new ForbiddenException('Se requiere ser propietario de la clínica');
    }

    return true;
  }
}
