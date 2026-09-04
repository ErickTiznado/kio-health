import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { RequestUser } from '../../auth/interfaces/request-user.interface';

@Injectable()
export class ClinicAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as RequestUser | undefined;

    if (!user?.clinicRole || !['OWNER', 'ADMIN'].includes(user.clinicRole)) {
      throw new ForbiddenException(
        'Se requiere rol de administrador de clínica',
      );
    }

    return true;
  }
}
