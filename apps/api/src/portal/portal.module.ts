import { Module } from '@nestjs/common';
import { PortalController } from './portal.controller';
import { PortalApiController } from './portal-api.controller';
import { ScaleAssignmentsController } from './scale-assignments.controller';
import { PortalService } from './portal.service';
import { PortalTokenService } from './portal-token.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../lib/email.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { RiskFlagsModule } from '../risk-flags/risk-flags.module';

/**
 * Capa de acceso del paciente (sin cuentas): tokens bearer, acciones desde el
 * email (páginas server-rendered), API JSON para el portal SPA (/p) y la
 * asignación de cuestionarios pre-sesión del lado clínico.
 */
@Module({
  imports: [PrismaModule, EmailModule, AppointmentsModule, RiskFlagsModule],
  controllers: [
    PortalController,
    PortalApiController,
    ScaleAssignmentsController,
  ],
  providers: [PortalService, PortalTokenService],
  exports: [PortalTokenService],
})
export class PortalModule {}
