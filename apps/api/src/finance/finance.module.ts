import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AppointmentPaidListener } from './listeners/appointment-paid.listener';

@Module({
  imports: [PrismaModule],
  controllers: [FinanceController],
  providers: [FinanceService, AppointmentPaidListener],
})
export class FinanceModule {}
