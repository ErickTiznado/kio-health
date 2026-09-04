import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ClinicsService } from './clinics.service';
import { Public } from '../auth/decorators/public.decorator';
import { RegisterFromInvitationDto } from './dto/register-from-invitation.dto';

@Controller('clinics')
export class ClinicsPublicController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get('join')
  validateToken(@Query('token') token: string) {
    return this.clinicsService.validateInvitationToken(token);
  }

  /**
   * Canje de invitación para quien AÚN NO tiene cuenta en Kio.
   *
   * Tiene que ser público porque es lo único que rompe el círculo: aceptar una
   * invitación exigía `clinicianId`, el `clinicianId` solo nace al completar
   * perfil (endpoint autenticado) y para autenticarse hacía falta un `User`,
   * que solo se creaba con un token de invitación *beta*. Una invitación de
   * clínica no podía arrancar una cuenta, así que un propietario no podía dar
   * de alta a un colega nuevo por ningún camino.
   *
   * La ruta es `join/register` y no `join` a secas porque `POST /clinics/join`
   * ya existe (el canje autenticado, para quien sí tiene cuenta) y dos
   * handlers con la misma forma de ruta se ensombrecen — `route-collisions.spec.ts`
   * falla si eso ocurre.
   *
   * Límite igual al de `POST /auth/signup`: crea una cuenta, y el token es lo
   * único que la protege.
   */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @Post('join/register')
  registerFromInvitation(@Body() dto: RegisterFromInvitationDto) {
    return this.clinicsService.registerFromInvitation(dto);
  }
}
