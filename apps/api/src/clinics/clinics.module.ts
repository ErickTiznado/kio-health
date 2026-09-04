import { Module } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { ClinicsController } from './clinics.controller';
import { ClinicsPublicController } from './clinics-public.controller';
import { EmailModule } from '../lib/email.module';

@Module({
  imports: [EmailModule],
  controllers: [ClinicsPublicController, ClinicsController],
  providers: [ClinicsService],
  exports: [ClinicsService],
})
export class ClinicsModule {}
