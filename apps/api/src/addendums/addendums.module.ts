import { Module } from '@nestjs/common';
import { AddendumService } from './addendums.service';
import { AddendumsController } from './addendums.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AccessLogModule } from '../access-log/access-log.module';

@Module({
  imports: [PrismaModule, AccessLogModule],
  controllers: [AddendumsController],
  providers: [AddendumService],
  exports: [AddendumService],
})
export class AddendumsModule {}
