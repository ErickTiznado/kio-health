import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RemindersService } from './reminders.service';

@Injectable()
export class RemindersCron {
  private readonly logger = new Logger(RemindersCron.name);

  constructor(private readonly remindersService: RemindersService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleReminders() {
    try {
      await this.remindersService.processReminders();
    } catch (error) {
      this.logger.error(
        `Cron error: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
    }
  }
}
