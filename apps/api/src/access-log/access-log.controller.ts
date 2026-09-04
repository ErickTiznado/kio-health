import { Controller, Get, Query } from '@nestjs/common';
import { AccessLogService } from './access-log.service';
import { QueryAccessLogsDto } from './dto/query-access-logs.dto';
import { CurrentClinician } from '../auth/decorators/current-clinician.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

// Protegido por el JwtAuthGuard global (ver app.module.ts).
// La vista de clínica vive en ClinicsController (GET /clinics/mine/access-logs).
@Controller('access-logs')
export class AccessLogController {
  constructor(private readonly accessLogService: AccessLogService) {}

  /** Registro de accesos del clínico: sus pacientes + sus propios eventos. */
  @Get()
  async findMine(
    @CurrentClinician() clinicianId: string,
    @CurrentUser() user: { userId: string },
    @Query() query: QueryAccessLogsDto,
  ) {
    return this.accessLogService.findForClinician(
      clinicianId,
      user.userId,
      query,
    );
  }
}
