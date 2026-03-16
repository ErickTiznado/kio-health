import { Controller, Get, Query } from '@nestjs/common';
import { ClinicsService } from './clinics.service';

@Controller('clinics')
export class ClinicsPublicController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Get('join')
  validateToken(@Query('token') token: string) {
    return this.clinicsService.validateInvitationToken(token);
  }
}
