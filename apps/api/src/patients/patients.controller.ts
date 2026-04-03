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
  UseInterceptors,
  UploadedFile,
  Redirect,
} from '@nestjs/common';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentClinician } from '../auth/decorators/current-clinician.decorator';
import { AccessLogService } from '../access-log/access-log.service';
import { RiskFlagsService } from '../risk-flags/risk-flags.service';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly patientDocumentsService: PatientDocumentsService,
    private readonly accessLogService: AccessLogService,
    private readonly riskFlagsService: RiskFlagsService,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: any,
    @CurrentClinician() clinicianId: string,
    @Body() createPatientDto: CreatePatientDto,
    @Req() req: any,
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
    @CurrentUser() user: any,
    @CurrentClinician() clinicianId: string,
    @Query() query: QueryPatientsDto,
    @Req() req: any,
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
    @CurrentUser() user: any,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Query() query: QueryTimelineDto,
    @Req() req: any,
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
    @CurrentUser() user: any,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Req() req: any,
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
    @CurrentUser() user: any,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Req() req: any,
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
    @CurrentUser() user: any,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @Req() req: any,
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
  @Redirect()
  async getDocumentFile(
    @CurrentUser() user: any,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Param('docId') docId: string,
    @Req() req: any,
  ) {
    const { signedUrl } = await this.patientDocumentsService.getSignedUrl(
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

    return { url: signedUrl, statusCode: 302 };
  }

  @Delete(':id/documents/:docId')
  async deleteDocument(
    @CurrentUser() user: any,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Param('docId') docId: string,
    @Req() req: any,
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

  @Get(':id')
  async findOne(
    @CurrentUser() user: any,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Req() req: any,
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
    @CurrentUser() user: any,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @Req() req: any,
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
    @CurrentUser() user: any,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Req() req: any,
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
    @CurrentUser() user: any,
    @CurrentClinician() clinicianId: string,
    @Param('id') id: string,
    @Req() req: any,
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

  // ── Risk Flag Endpoints ──────────────────────────────────────

  @Get(':id/risk-flags')
  async getRiskFlags(
    @CurrentClinician() clinicianId: string,
    @Param('id') patientId: string,
  ) {
    await this.patientsService.findOne(patientId, clinicianId);
    return this.riskFlagsService.getRiskFlags(patientId);
  }

  @Patch(':id/risk-flags/resolve')
  async resolveRiskFlags(
    @CurrentClinician() clinicianId: string,
    @Param('id') patientId: string,
    @Body('flagTypesToResolve') flagTypesToResolve: string[],
  ) {
    await this.patientsService.findOne(patientId, clinicianId);
    return this.riskFlagsService.resolveRiskFlags(patientId, flagTypesToResolve as any);
  }
}
