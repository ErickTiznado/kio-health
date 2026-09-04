import { Module } from '@nestjs/common';
import { RiskFlagsService } from './risk-flags.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Módulo sin controller a propósito: las rutas de risk-flags las expone
 * `PatientsController` (`/patients/:id/risk-flags`), que valida propiedad vía
 * `patientsService.findOne(patientId, clinicianId)`. Este módulo solo provee
 * el servicio a `PatientsModule` y `AppointmentsModule`.
 */
@Module({
  imports: [PrismaModule],
  providers: [RiskFlagsService],
  exports: [RiskFlagsService],
})
export class RiskFlagsModule {}
