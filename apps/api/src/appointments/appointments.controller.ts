import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
import { QueryDaySummaryDto } from './dto/query-day-summary.dto';
import { CompleteCheckoutDto } from './dto/complete-checkout.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  @Get()
  async findByDate(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Query() query: QueryAppointmentsDto,
  ) {
    return this.appointmentsService.findByDate(
      user.userId,
      query.date,
      query.from,
      query.to,
    );
  }

  @Get('recent-patients')
  async getRecentPatients(
    @CurrentUser() user: { userId: string; email: string; role: string },
  ) {
    return this.appointmentsService.getRecentPatients(user.userId);
  }

  @Get('day-summary')
  async getDaySummary(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Query() query: QueryDaySummaryDto,
  ) {
    return this.appointmentsService.getDaySummary(
      user.userId,
      query.from,
      query.to,
    );
  }

  @Get('next')
  async getNextUpcoming(
    @CurrentUser() user: { userId: string; email: string; role: string },
  ) {
    return this.appointmentsService.getNextUpcoming(user.userId);
  }

  @Get('pending-notes-count')
  async getPendingNotesCount(
    @CurrentUser() user: { userId: string; email: string; role: string },
  ) {
    return this.appointmentsService.getPendingNotesCount(user.userId);
  }

  @Patch(':id/checkout')
  async completeCheckout(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Body() dto: CompleteCheckoutDto,
  ) {
    return this.appointmentsService.completeCheckout(
      user.userId,
      appointmentId,
      dto,
    );
  }

  @Patch(':id/start')
  async startSession(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Param('id', ParseUUIDPipe) appointmentId: string,
  ) {
    return this.appointmentsService.startSession(user.userId, appointmentId);
  }

  @Patch(':id/cancel')
  async cancelAppointment(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Param('id', ParseUUIDPipe) appointmentId: string,
  ) {
    return this.appointmentsService.cancelAppointment(user.userId, appointmentId);
  }

  @Patch(':id/no-show')
  async markNoShow(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Param('id', ParseUUIDPipe) appointmentId: string,
  ) {
    return this.appointmentsService.markNoShow(user.userId, appointmentId);
  }
}
