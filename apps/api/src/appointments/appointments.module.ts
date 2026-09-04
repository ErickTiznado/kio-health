import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { SeriesService } from './series/series.service';
import { SeriesController } from './series/series.controller';
import { SeriesCron } from './series/series.cron';
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
  controllers: [AppointmentsController, SeriesController],
  providers: [AppointmentsService, SeriesService, SeriesCron],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
