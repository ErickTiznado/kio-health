import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientDocumentsService } from './patients-documents.service';
import { PatientsController } from './patients.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PatientsController],
  providers: [PatientsService, PatientDocumentsService],
})
export class PatientsModule {}
