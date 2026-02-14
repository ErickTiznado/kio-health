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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
import { QueryDaySummaryDto } from './dto/query-day-summary.dto';
import { CompleteCheckoutDto } from './dto/complete-checkout.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreatePsychNoteDto } from './dto/create-psych-note.dto';

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

  @Get(':id/export/pdf')
  async exportPdf(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Query('includePrivate') includePrivate: string,
    @Res() res: Response,
  ) {
    const buffer = await this.appointmentsService.exportPdf(
      user.userId,
      appointmentId,
      includePrivate === 'true',
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="session-${appointmentId}.pdf"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
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

  @Get(':id/notes')
  async getPsychNote(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Param('id', ParseUUIDPipe) appointmentId: string,
  ) {
    return this.appointmentsService.getPsychNote(user.userId, appointmentId);
  }

  @Post(':id/notes')
  async upsertPsychNote(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Body() dto: CreatePsychNoteDto,
  ) {
    return this.appointmentsService.upsertPsychNote(user.userId, appointmentId, dto);
  }

  @Patch(':id/notes/pin')
  async togglePin(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Param('id', ParseUUIDPipe) appointmentId: string,
  ) {
    return this.appointmentsService.togglePin(user.userId, appointmentId);
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
