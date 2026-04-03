import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { RiskFlagsService } from './risk-flags.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RiskFlagType } from '#generated/prisma';

@Controller('patients/:patientId/risk-flags')
@UseGuards(JwtAuthGuard)
export class RiskFlagsController {
  constructor(private readonly riskFlagsService: RiskFlagsService) {}

  @Get()
  async getRiskFlags(@Param('patientId') patientId: string) {
    return this.riskFlagsService.getRiskFlags(patientId);
  }

  @Patch('resolve')
  async resolveRiskFlags(
    @Param('patientId') patientId: string,
    @Body('flagTypesToResolve') flagTypesToResolve: RiskFlagType[],
  ) {
    return this.riskFlagsService.resolveRiskFlags(patientId, flagTypesToResolve);
  }
}
