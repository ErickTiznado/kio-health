import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class ClinicAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { clinicRole?: string };

    if (!user?.clinicRole || !['OWNER', 'ADMIN'].includes(user.clinicRole)) {
      throw new ForbiddenException(
        'Se requiere rol de administrador de clínica',
      );
    }

    return true;
  }
}
