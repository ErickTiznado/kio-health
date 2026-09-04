import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { PatientsService } from './patients.service';
import { PatientDocumentsService } from './patients-documents.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientsDto } from './dto/query-patients.dto';
import { QueryTimelineDto } from './dto/query-timeline.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import {
  documentStorage,
  multerFileFilter,
  MAX_FILE_SIZE_BYTES,
} from './document-upload.config';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentClinician } from '../auth/decorators/current-clinician.decorator';
import type { RequestUser } from '../auth/interfaces/request-user.interface';
import { AccessLogService } from '../access-log/access-log.service';
import { RiskFlagsService } from '../risk-flags/risk-flags.service';
import { ResolveRiskFlagsDto } from '../risk-flags/dto/resolve-risk-flags.dto';
import { PortalTokenService } from '../portal/portal-token.service';

// Protegido por el JwtAuthGuard global (ver app.module.ts).
@Controller('patients')
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly patientDocumentsService: PatientDocumentsService,
    private readonly accessLogService: AccessLogService,
    private readonly riskFlagsService: RiskFlagsService,
    private readonly portalTokenService: PortalTokenService,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: RequestUser,
    @CurrentClinician() clinicianId: string,
    @Body() createPatientDto: CreatePatientDto,
    @Req() req: Request,
  ) {
    const result = await this.patientsService.create(
      clinicianId,
      createPatientDto,
    );

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
    @CurrentUser() user: RequestUser,
    @CurrentClinician() clinicianId: string,
    @Query() query: QueryPatientsDto,
    @Req() req: Request,
  ) {
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
    @CurrentUser() user: RequestUser,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Query() query: QueryTimelineDto,
    @Req() req: Request,
  ) {
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
    @CurrentUser() user: RequestUser,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
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
    @CurrentUser() user: RequestUser,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
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

  // ---- Document endpoints ----

  @Post(':id/documents')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: documentStorage,
      fileFilter: multerFileFilter,
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
    }),
  )
  async uploadDocument(
    @CurrentUser() user: RequestUser,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @Req() req: Request,
  ) {
    const result = await this.patientDocumentsService.uploadDocument(
      id,
      clinicianId,
      file,
      dto,
    );

    await this.accessLogService.logAccess(
      user.userId,
      'UPLOAD_DOCUMENT',
      `Patient:${id}`,
      id,
      `Document: ${file.originalname}`,
      req.ip,
      req.headers['user-agent'],
    );

    return result;
  }

  @Get(':id/documents')
  async listDocuments(
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
  ) {
    return this.patientDocumentsService.listDocuments(id, clinicianId);
  }

  @Get(':id/documents/:docId/file')
  async getDocumentFile(
    @CurrentUser() user: RequestUser,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Param('docId') docId: string,
    @Req() req: Request,
    @Res() res: import('express').Response,
  ) {
    const { buffer, mimeType, originalName } =
      await this.patientDocumentsService.downloadDocument(
        id,
        docId,
        clinicianId,
      );

    await this.accessLogService.logAccess(
      user.userId,
      'VIEW_DOCUMENT',
      `Patient:${id}`,
      id,
      `Document: ${docId}`,
      req.ip,
      req.headers['user-agent'],
    );

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(originalName)}"`,
      'Content-Length': buffer.length,
      'Cache-Control': 'private, max-age=3600',
    });
    res.send(buffer);
  }

  @Delete(':id/documents/:docId')
  async deleteDocument(
    @CurrentUser() user: RequestUser,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Param('docId') docId: string,
    @Req() req: Request,
  ) {
    await this.patientDocumentsService.deleteDocument(id, docId, clinicianId);

    await this.accessLogService.logAccess(
      user.userId,
      'DELETE_DOCUMENT',
      `Patient:${id}`,
      id,
      `Document: ${docId}`,
      req.ip,
      req.headers['user-agent'],
    );

    return { success: true };
  }

  // ---- Patient CRUD ----

  @Get('dashboard/active-risk-flags-count')
  async getActiveRiskFlagsCount(
    @CurrentUser() user: RequestUser,
    @CurrentClinician() clinicianId: string,
    @Req() req: Request,
  ) {
    await this.accessLogService.logAccess(
      user.userId,
      'VIEW_DASHBOARD',
      'Dashboard:RiskFlags',
      undefined,
      undefined,
      req.ip,
      req.headers['user-agent'],
    );
    const count =
      await this.patientsService.getActiveRiskFlagsCount(clinicianId);
    return { count };
  }

  /**
   * SeÃ±al de retenciÃ³n: pacientes sin sesiÃ³n reciente ni cita prÃ³xima.
   * IMPORTANTE: declarada antes de ':id' para que Nest no la capture como id.
   */
  @Get('inactive')
  async findInactive(
    @CurrentClinician() clinicianId: string,
    @Query('days') days?: string,
  ) {
    const parsed = days ? parseInt(days, 10) : 30;
    const safeDays = Number.isFinite(parsed)
      ? Math.min(Math.max(parsed, 7), 365)
      : 30;
    return this.patientsService.findInactive(clinicianId, safeDays);
  }

  @Get(':id/attendance')
  async getAttendance(
    @CurrentClinician() clinicianId: string,
    @Param('id') patientId: string,
  ) {
    return this.patientsService.getAttendance(patientId, clinicianId);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: RequestUser,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
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
    @CurrentUser() user: RequestUser,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @Req() req: Request,
  ) {
    const result = await this.patientsService.update(
      id,
      clinicianId,
      updatePatientDto,
    );

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
    @CurrentUser() user: RequestUser,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const result = await this.patientsService.archive(id, clinicianId);

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

  @Patch(':id/unarchive')
  async unarchive(
    @CurrentUser() user: RequestUser,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const result = await this.patientsService.unarchive(id, clinicianId);

    await this.accessLogService.logAccess(
      user.userId,
      'UNARCHIVE_PATIENT',
      `Patient:${id}`,
      id,
      undefined,
      req.ip,
      req.headers['user-agent'],
    );

    return result;
  }

  // â”€â”€ Risk Flag Endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  @Get(':id/risk-flags')
  async getRiskFlags(
    @CurrentClinician() clinicianId: string,
    @Param('id') patientId: string,
  ) {
    await this.patientsService.findOne(patientId, clinicianId);
    return this.riskFlagsService.getRiskFlags(patientId, clinicianId);
  }

  /**
   * Revoca en bloque los tokens de acceso del paciente (links de email y
   * portal). Ãštil si un correo se reenviÃ³ o el enlace se filtrÃ³.
   */
  @Post(':id/portal/revoke-tokens')
  async revokePortalTokens(
    @CurrentClinician() clinicianId: string,
    @Param('id') patientId: string,
  ) {
    await this.patientsService.findOne(patientId, clinicianId);
    return this.portalTokenService.revokeAllForPatient(clinicianId, patientId);
  }

  @Patch(':id/risk-flags/resolve')
  async resolveRiskFlags(
    @CurrentClinician() clinicianId: string,
    @Param('id') patientId: string,
    @Body() dto: ResolveRiskFlagsDto,
  ) {
    await this.patientsService.findOne(patientId, clinicianId);
    return this.riskFlagsService.resolveRiskFlags(
      patientId,
      clinicianId,
      dto.flagTypesToResolve,
    );
  }
}
