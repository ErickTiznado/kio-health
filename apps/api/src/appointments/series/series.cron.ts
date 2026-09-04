import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SeriesService } from './series.service';

@Injectable()
export class SeriesCron {
  private readonly logger = new Logger(SeriesCron.name);

  constructor(private readonly seriesService: SeriesService) {}

  /** Extiende la ventana de 12 semanas de todas las series activas. */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async extendSeries() {
    try {
      await this.seriesService.extendAllDue();
    } catch (error) {
      this.logger.error(
        `Series cron error: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
    }
  }
}
