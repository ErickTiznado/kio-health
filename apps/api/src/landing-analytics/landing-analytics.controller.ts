import { Controller, Get, Query } from '@nestjs/common';
import {
  LandingAnalyticsService,
  type LandingStats,
} from './landing-analytics.service';
import { QueryLandingStatsDto } from './dto/query-landing-stats.dto';

/**
 * Consulta del resumen. Protegido por el JwtAuthGuard global (ver
 * app.module.ts): basta con estar autenticado, no hay dato de paciente aquí.
 */
@Controller('landing-analytics')
export class LandingAnalyticsController {
  constructor(private readonly service: LandingAnalyticsService) {}

  @Get('stats')
  async stats(@Query() query: QueryLandingStatsDto): Promise<LandingStats> {
    return this.service.getStats(query.days ?? 30);
  }
}
