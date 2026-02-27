import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentClinician = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.clinicianId) {
      throw new UnauthorizedException('El usuario no tiene un perfil clínico asociado');
    }
    
    return user.clinicianId;
  },
);
