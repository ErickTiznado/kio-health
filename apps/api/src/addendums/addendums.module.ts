import { Module } from '@nestjs/common';
import { AddendumService } from './addendums.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Módulo sin controller a propósito: las rutas de anexos las expone
 * `AppointmentsController` (`/appointments/:id/addendum(s)`), protegidas con
 * `AppointmentOwnershipGuard`. Este módulo solo provee el servicio; el audit
 * log de CREATE_ADDENDUM lo escribe el controller (tiene ip/user-agent).
 */
@Module({
  imports: [PrismaModule],
  providers: [AddendumService],
  exports: [AddendumService],
})
export class AddendumsModule {}
