import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientsDto } from './dto/query-patients.dto';
import { QueryTimelineDto } from './dto/query-timeline.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessLogService } from '../access-log/access-log.service';
import { Request } from 'express';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly accessLogService: AccessLogService,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() createPatientDto: CreatePatientDto,
  ) {
    const clinicianId = await this.patientsService.getClinicianId(user.userId);
    return this.patientsService.create(clinicianId, createPatientDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query() query: QueryPatientsDto,
  ) {
    const clinicianId = await this.patientsService.getClinicianId(user.userId);
    return this.patientsService.findAll(clinicianId, query);
  }

  @Get(':id/timeline')
  async getTimeline(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Query() query: QueryTimelineDto,
    @Req() req: Request,
  ) {
    const clinicianId = await this.patientsService.getClinicianId(user.userId);
    
    // Log access
    await this.accessLogService.logAccess(
      user.userId,
      'VIEW_TIMELINE',
      `Patient:${id}`,
      id,
      `Query: ${JSON.stringify(query)}`,
      req.ip,
      req.headers['user-agent'],
    );

    return this.patientsService.getTimeline(id, clinicianId, query);
  }

  @Get(':id/mood-history')
  async getMoodHistory(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    const clinicianId = await this.patientsService.getClinicianId(user.userId);
    return this.patientsService.getMoodHistory(id, clinicianId);
  }

  @Get(':id/last-note')
  async getLastNote(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    const clinicianId = await this.patientsService.getClinicianId(user.userId);
    return this.patientsService.getLastNote(id, clinicianId);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const clinicianId = await this.patientsService.getClinicianId(user.userId);
    
    // Log access
    await this.accessLogService.logAccess(
      user.userId,
      'VIEW_PROFILE',
      `Patient:${id}`,
      id,
      undefined,
      req.ip,
      req.headers['user-agent'],
    );

    return this.patientsService.findOne(id, clinicianId);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    const clinicianId = await this.patientsService.getClinicianId(user.userId);
    return this.patientsService.update(id, clinicianId, updatePatientDto);
  }

  @Patch(':id/archive')
  async archive(@CurrentUser() user: any, @Param('id') id: string) {
    const clinicianId = await this.patientsService.getClinicianId(user.userId);
    return this.patientsService.archive(id, clinicianId);
  }
}
