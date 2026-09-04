import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RemindersService } from './reminders.service';
import { PortalTokenService } from '../portal/portal-token.service';

@Injectable()
export class RemindersCron {
  private readonly logger = new Logger(RemindersCron.name);

  constructor(
    private readonly remindersService: RemindersService,
    private readonly portalTokens: PortalTokenService,
  ) {}

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

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async pruneExpiredPortalTokens() {
    try {
      const pruned = await this.portalTokens.pruneExpired();
      if (pruned > 0) {
        this.logger.log(`Pruned ${pruned} expired portal tokens`);
      }
    } catch (error) {
      this.logger.error(
        `Token prune error: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
    }
  }
}
