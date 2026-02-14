import { Module, Global } from '@nestjs/common';
import { AccessLogService } from './access-log.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [AccessLogService],
  exports: [AccessLogService],
})
export class AccessLogModule {}
