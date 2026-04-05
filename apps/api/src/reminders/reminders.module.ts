import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailModule } from '../lib/email.module';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { RemindersCron } from './reminders.cron';
import { AppointmentScheduledListener } from './listeners/appointment-scheduled.listener';
import { AppointmentRescheduledListener } from './listeners/appointment-rescheduled.listener';
import { AppointmentCancelledListener } from './listeners/appointment-cancelled.listener';

@Module({
  imports: [ScheduleModule.forRoot(), EmailModule],
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
