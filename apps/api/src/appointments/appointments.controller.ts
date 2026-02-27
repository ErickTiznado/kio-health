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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentClinician } from '../auth/decorators/current-clinician.decorator';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
import { QueryDaySummaryDto } from './dto/query-day-summary.dto';
import { CompleteCheckoutDto } from './dto/complete-checkout.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreatePsychNoteDto } from './dto/create-psych-note.dto';
import { CreateAnthropometryDto } from './dto/create-anthropometry.dto';
import { AccessLogService } from '../access-log/access-log.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { CreateClinicalScaleDto } from './dto/create-clinical-scale.dto';
import { AppointmentOwnershipGuard } from '../auth/guards/appointment-ownership.guard';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly accessLogService: AccessLogService,
  ) { }

  @Post()
  async create(
    @CurrentClinician() clinicianId: string,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(clinicianId, dto);
  }

  @UseGuards(AppointmentOwnershipGuard)
  @Patch(':id/reschedule')
  async reschedule(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    return this.appointmentsService.reschedule(clinicianId, appointmentId, dto);
  }

  @Get()
  async findByDate(
    @CurrentClinician() clinicianId: string,
    @Query() query: QueryAppointmentsDto,
  ) {
    return this.appointmentsService.findByDate(
      clinicianId,
      query.date,
      query.from,
      query.to,
    );
  }

  @Get('recent-patients')
  async getRecentPatients(
    @CurrentClinician() clinicianId: string,
  ) {
    return this.appointmentsService.getRecentPatients(clinicianId);
  }

  @Get('day-summary')
  async getDaySummary(
    @CurrentClinician() clinicianId: string,
    @Query() query: QueryDaySummaryDto,
  ) {
    return this.appointmentsService.getDaySummary(
      clinicianId,
      query.from,
      query.to,
    );
  }

  @Get('next')
  async getNextUpcoming(
    @CurrentClinician() clinicianId: string,
  ) {
    return this.appointmentsService.getNextUpcoming(clinicianId);
  }

  @Get('pending-notes-count')
  async getPendingNotesCount(
    @CurrentClinician() clinicianId: string,
  ) {
    return this.appointmentsService.getPendingNotesCount(clinicianId);
  }

  @UseGuards(AppointmentOwnershipGuard)
  @Get(':id/context')
  async getSessionContext(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Req() req: any,
  ) {
    const result = await this.appointmentsService.getSessionContext(clinicianId, appointmentId);
    
    // Log access
    await this.accessLogService.logAccess(
      req.user.userId,
      'VIEW_SESSION_CONTEXT',
      `Appointment:${appointmentId}`,
      result?.patient?.id,
      undefined,
      req.ip,
      req.headers['user-agent'],
    );
    
    return result;
  }

  @UseGuards(AppointmentOwnershipGuard)
  @Get(':id/export/pdf')
  async exportPdf(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Query('includePrivate') includePrivate: string,
    @Res() res: any,
    @Req() req: any,
  ) {
    const { buffer, patientId } = await this.appointmentsService.exportPdf(
      clinicianId,
      appointmentId,
      includePrivate === 'true',
    );

    // Log access with patientId for HIPAA audit trail
    await this.accessLogService.logAccess(
      req.user.userId,
      'EXPORT_PDF',
      `Appointment:${appointmentId}`,
      patientId,
      `Include private: ${includePrivate}`,
      req.ip,
      req.headers['user-agent'],
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="session-${appointmentId}.pdf"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @UseGuards(AppointmentOwnershipGuard)
  @Patch(':id/checkout')
  async completeCheckout(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Body() dto: CompleteCheckoutDto,
  ) {
    return this.appointmentsService.completeCheckout(
      clinicianId,
      appointmentId,
      dto,
    );
  }

  @UseGuards(AppointmentOwnershipGuard)
  @Patch(':id/start')
  async startSession(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) appointmentId: string,
  ) {
    return this.appointmentsService.startSession(clinicianId, appointmentId);
  }

  @UseGuards(AppointmentOwnershipGuard)
  @Patch(':id/cancel')
  async cancelAppointment(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) appointmentId: string,
  ) {
    return this.appointmentsService.cancelAppointment(clinicianId, appointmentId);
  }

  @UseGuards(AppointmentOwnershipGuard)
  @Patch(':id/no-show')
  async markNoShow(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) appointmentId: string,
  ) {
    return this.appointmentsService.markNoShow(clinicianId, appointmentId);
  }

  @UseGuards(AppointmentOwnershipGuard)
  @Get(':id/notes')
  async getPsychNote(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Req() req: any,
  ) {
    const result = await this.appointmentsService.getPsychNote(clinicianId, appointmentId);
    
    // Log access
    await this.accessLogService.logAccess(
      req.user.userId,
      'VIEW_PSYCH_NOTE',
      `PsychNote:${result?.id || 'Unknown'}`,
      result?.patientId,
      `Appointment ID: ${appointmentId}`,
      req.ip,
      req.headers['user-agent'],
    );
    
    return result;
  }

  @UseGuards(AppointmentOwnershipGuard)
  @Post(':id/notes')
  async upsertPsychNote(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Body() dto: CreatePsychNoteDto,
    @Req() req: any,
  ) {
    const result = await this.appointmentsService.upsertPsychNote(clinicianId, appointmentId, dto);
    
    // Log access
    await this.accessLogService.logAccess(
      req.user.userId,
      'UPSERT_PSYCH_NOTE',
      `PsychNote:${result.id}`,
      result.patientId,
      `Appointment ID: ${appointmentId}, Template: ${dto.templateType}`,
      req.ip,
      req.headers['user-agent'],
    );
    
    return result;
  }

  @UseGuards(AppointmentOwnershipGuard)
  @Post(':id/anthropometry')
  async upsertAnthropometry(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Body() dto: CreateAnthropometryDto,
  ) {
    return this.appointmentsService.upsertAnthropometry(clinicianId, appointmentId, dto);
  }

  @UseGuards(AppointmentOwnershipGuard)
  @Post(':id/meal-plan')
  async upsertMealPlan(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Body() dto: CreateMealPlanDto,
  ) {
    return this.appointmentsService.upsertMealPlan(clinicianId, appointmentId, dto);
  }

  @UseGuards(AppointmentOwnershipGuard)
  @Post(':id/clinical-scale')
  async upsertClinicalScale(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Body() dto: CreateClinicalScaleDto,
  ) {
    return this.appointmentsService.upsertClinicalScale(clinicianId, appointmentId, dto);
  }

  @UseGuards(AppointmentOwnershipGuard)
  @Patch(':id/notes/pin')
  async togglePin(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) appointmentId: string,
  ) {
    return this.appointmentsService.togglePin(clinicianId, appointmentId);
  }

  @UseGuards(AppointmentOwnershipGuard)
  @Patch(':id/notes')
  async updateNotes(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Body('notes') notes: string,
  ) {
    return this.appointmentsService.updateNotes(clinicianId, appointmentId, notes);
  }

  @UseGuards(AppointmentOwnershipGuard)
  @Patch(':id/payment')
  async updatePayment(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.appointmentsService.updatePayment(clinicianId, appointmentId, dto);
  }
}
