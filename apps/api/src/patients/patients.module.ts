import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientDocumentsService } from './patients-documents.service';
import { PatientsController } from './patients.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RiskFlagsModule } from '../risk-flags/risk-flags.module';

@Module({
  imports: [PrismaModule, AuthModule, RiskFlagsModule],
  controllers: [PatientsController],
  providers: [PatientsService, PatientDocumentsService],
  exports: [PatientsService],
})
export class PatientsModule {}
