import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LandingAnalyticsService } from './landing-analytics.service';
import { LandingAnalyticsController } from './landing-analytics.controller';
import { LandingAnalyticsPublicController } from './landing-analytics-public.controller';

@Module({
  imports: [PrismaModule],
  controllers: [LandingAnalyticsPublicController, LandingAnalyticsController],
  providers: [LandingAnalyticsService],
})
export class LandingAnalyticsModule {}
