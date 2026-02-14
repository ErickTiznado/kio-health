import 'dotenv/config';
import { Module } from '@nestjs/common';
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
import { FinanceModule } from './modules/finance/finance.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AppointmentsModule,
    UsersModule,
    PatientsModule,
    AccessLogModule,
    ExportModule,
    TasksModule,
    FinanceModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

