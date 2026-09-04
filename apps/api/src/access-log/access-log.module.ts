import { Module, Global } from '@nestjs/common';
import { AccessLogService } from './access-log.service';
import { AccessLogController } from './access-log.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [AccessLogController],
  providers: [AccessLogService],
  exports: [AccessLogService],
})
export class AccessLogModule {}
