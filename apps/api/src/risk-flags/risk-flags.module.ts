import { Module } from '@nestjs/common';
import { RiskFlagsService } from './risk-flags.service';
import { RiskFlagsController } from './risk-flags.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RiskFlagsController],
  providers: [RiskFlagsService],
  exports: [RiskFlagsService],
})
export class RiskFlagsModule {}
