import { Module } from '@nestjs/common';
import { EmailModule } from '../lib/email.module';
import { PortalModule } from '../portal/portal.module';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { RemindersCron } from './reminders.cron';
import { AppointmentScheduledListener } from './listeners/appointment-scheduled.listener';
import { AppointmentRescheduledListener } from './listeners/appointment-rescheduled.listener';
import { AppointmentCancelledListener } from './listeners/appointment-cancelled.listener';

@Module({
  imports: [EmailModule, PortalModule],
  controllers: [RemindersController],
  providers: [
    RemindersService,
    RemindersCron,
    AppointmentScheduledListener,
    AppointmentRescheduledListener,
    AppointmentCancelledListener,
  ],
  exports: [RemindersService],
})
export class RemindersModule {}
