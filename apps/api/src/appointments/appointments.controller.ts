import {
  Controller,
  Get,
  Post,
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
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  @Post()
  async create(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(user.userId, dto);
  }

  @Patch(':id/reschedule')
  async reschedule(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    return this.appointmentsService.reschedule(user.userId, appointmentId, dto);
  }

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

  @Get(':id/context')
  async getSessionContext(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Param('id', ParseUUIDPipe) appointmentId: string,
  ) {
    return this.appointmentsService.getSessionContext(user.userId, appointmentId);
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

  @Patch(':id/notes')
  async updateNotes(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Body('notes') notes: string,
  ) {
    return this.appointmentsService.updateNotes(user.userId, appointmentId, notes);
  }

  @Patch(':id/payment')
  async updatePayment(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.appointmentsService.updatePayment(user.userId, appointmentId, dto);
  }
}
