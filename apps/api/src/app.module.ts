import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, AuthModule, AppointmentsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

