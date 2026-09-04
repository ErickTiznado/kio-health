import 'dotenv/config';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { AccessLogModule } from './access-log/access-log.module';
import { ExportModule } from './export/export.module';
import { TasksModule } from './tasks/tasks.module';
import { FinanceModule } from './finance/finance.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { SearchModule } from './search/search.module';
import { EncryptionModule } from './lib/encryption.module';
import { ClinicsModule } from './clinics/clinics.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AddendumsModule } from './addendums/addendums.module';
import { RiskFlagsModule } from './risk-flags/risk-flags.module';
import { RemindersModule } from './reminders/reminders.module';
import { PortalModule } from './portal/portal.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { TrialGuard } from './auth/guards/trial.guard';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    PrismaModule,
    AuthModule,
    AppointmentsModule,
    UsersModule,
    PatientsModule,
    AccessLogModule,
    ExportModule,
    TasksModule,
    FinanceModule,
    SearchModule,
    EncryptionModule,
    ClinicsModule,
    IntegrationsModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    SubscriptionsModule,
    AddendumsModule,
    RiskFlagsModule,
    RemindersModule,
    PortalModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // El orden importa: ThrottlerGuard corre primero (rate-limit aplica también
    // a endpoints públicos), luego JwtAuthGuard exige token salvo en @Public().
    // Con JwtAuthGuard global, TODA ruta nueva nace protegida por defecto.
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Tercero, y el orden importa: lee `request.user`, que solo existe después
    // de que JwtAuthGuard haya validado el token.
    {
      provide: APP_GUARD,
      useClass: TrialGuard,
    },
  ],
})
export class AppModule {}
