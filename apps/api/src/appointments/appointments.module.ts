import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ExportModule } from '../export/export.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { RiskFlagsModule } from '../risk-flags/risk-flags.module';
import { AddendumsModule } from '../addendums/addendums.module';

@Module({
  imports: [
    PrismaModule,
    ExportModule,
    IntegrationsModule,
    RiskFlagsModule,
    AddendumsModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
