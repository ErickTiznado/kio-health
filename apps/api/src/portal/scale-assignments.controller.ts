import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { PortalService } from './portal.service';
import { AssignScaleDto } from './dto/assign-scale.dto';
import { CurrentClinician } from '../auth/decorators/current-clinician.decorator';

/**
 * Lado clínico de los cuestionarios pre-sesión. Vive en PortalModule (no en
 * AppointmentsModule) porque necesita la capa de tokens + email del portal;
 * el prefijo de ruta sigue siendo /appointments para coherencia REST.
 * Protegido por el JwtAuthGuard global; ownership por query en el service.
 */
@Controller('appointments')
export class ScaleAssignmentsController {
  constructor(private readonly portalService: PortalService) {}

  @Post(':id/scale-assignments')
  async assignScale(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Body() dto: AssignScaleDto,
  ) {
    return this.portalService.assignScale(
      clinicianId,
      appointmentId,
      dto.scaleType,
    );
  }
}
