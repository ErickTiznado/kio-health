import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { PatientsService } from './patients.service';
import { PatientDocumentsService } from './patients-documents.service';
import { PatientsController } from './patients.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UPLOADS_BASE_DIR } from './document-upload.config';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MulterModule.register({ dest: UPLOADS_BASE_DIR }),
  ],
  controllers: [PatientsController],
  providers: [PatientsService, PatientDocumentsService],
})
export class PatientsModule {}
