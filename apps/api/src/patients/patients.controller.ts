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
import { CurrentClinician } from '../auth/decorators/current-clinician.decorator';
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
    @CurrentClinician() clinicianId: string,
    @Body() createPatientDto: CreatePatientDto,
    @Req() req: any,
  ) {
    const result = await this.patientsService.create(clinicianId, createPatientDto);
    
    // Log access
    await this.accessLogService.logAccess(
      user.userId,
      'CREATE_PATIENT',
      `Patient`,
      result.id,
      undefined,
      req.ip,
      req.headers['user-agent'],
    );
    
    return result;
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @CurrentClinician() clinicianId: string,
    @Query() query: QueryPatientsDto,
    @Req() req: any,
  ) {
    
    // Log access
    await this.accessLogService.logAccess(
      user.userId,
      'LIST_PATIENTS',
      'Patients',
      undefined,
      `Query: ${JSON.stringify(query)}`,
      req.ip,
      req.headers['user-agent'],
    );
    
    return this.patientsService.findAll(clinicianId, query);
  }

  @Get(':id/timeline')
  async getTimeline(
    @CurrentUser() user: any,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Query() query: QueryTimelineDto,
    @Req() req: any,
  ) {
    
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
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    
    // Log access
    await this.accessLogService.logAccess(
      user.userId,
      'VIEW_MOOD_HISTORY',
      `Patient:${id}`,
      id,
      undefined,
      req.ip,
      req.headers['user-agent'],
    );
    
    return this.patientsService.getMoodHistory(id, clinicianId);
  }

  @Get(':id/last-note')
  async getLastNote(
    @CurrentUser() user: any,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    
    // Log access
    await this.accessLogService.logAccess(
      user.userId,
      'VIEW_LAST_NOTE',
      `Patient:${id}`,
      id,
      undefined,
      req.ip,
      req.headers['user-agent'],
    );
    
    return this.patientsService.getLastNote(id, clinicianId);
  }

  @Get(':id/scales')
  async getScalesHistory(
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
  ) {
    return this.patientsService.getScalesHistory(id, clinicianId);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: any,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    
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
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @Req() req: any,
  ) {
    const result = await this.patientsService.update(id, clinicianId, updatePatientDto);
    
    // Log access
    await this.accessLogService.logAccess(
      user.userId,
      'UPDATE_PATIENT',
      `Patient:${id}`,
      id,
      `Fields updated: ${Object.keys(updatePatientDto).join(', ')}`,
      req.ip,
      req.headers['user-agent'],
    );
    
    return result;
  }

  @Patch(':id/archive')
  async archive(
    @CurrentUser() user: any,
    @CurrentClinician() clinicianId: string, 
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const result = await this.patientsService.archive(id, clinicianId);
    
    // Log access
    await this.accessLogService.logAccess(
      user.userId,
      'ARCHIVE_PATIENT',
      `Patient:${id}`,
      id,
      undefined,
      req.ip,
      req.headers['user-agent'],
    );
    
    return result;
  }
}
