import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { RequestUser } from '../interfaces/request-user.interface';

export const CurrentClinician = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as RequestUser | undefined;

    if (!user || !user.clinicianId) {
      throw new UnauthorizedException(
        'El usuario no tiene un perfil clínico asociado',
      );
    }

    return user.clinicianId;
  },
);
