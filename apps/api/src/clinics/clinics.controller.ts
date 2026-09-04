import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type * as Express from 'express';
import { ClinicsService } from './clinics.service';
import { AccessLogService } from '../access-log/access-log.service';
import { QueryAccessLogsDto } from '../access-log/dto/query-access-logs.dto';
import { ClinicAdminGuard } from './guards/clinic-admin.guard';
import { ClinicOwnerGuard } from './guards/clinic-owner.guard';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

type AuthenticatedUser = {
  clinicianId: string;
  clinicId?: string;
  clinicRole?: string;
};

// Autenticación por el JwtAuthGuard global; los endpoints de gestión añaden
// ClinicAdminGuard / ClinicOwnerGuard para el rol (ver app.module.ts).
@Controller('clinics')
export class ClinicsController {
  constructor(
    private readonly clinicsService: ClinicsService,
    private readonly accessLogService: AccessLogService,
  ) {}

  private getUser(req: Express.Request): AuthenticatedUser {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user?.clinicianId) {
      throw new UnauthorizedException(
        'El usuario no tiene un perfil clínico asociado',
      );
    }
    return user;
  }

  @Post()
  createClinic(@Req() req: Express.Request, @Body() dto: CreateClinicDto) {
    const user = this.getUser(req);
    return this.clinicsService.createClinic(user.clinicianId, dto);
  }

  @Get('mine')
  getMyClinic(@Req() req: Express.Request) {
    const user = this.getUser(req);
    return this.clinicsService.getMyClinic(user.clinicianId);
  }

  @Patch('mine')
  @UseGuards(ClinicAdminGuard)
  updateClinic(@Req() req: Express.Request, @Body() dto: UpdateClinicDto) {
    const user = this.getUser(req);
    return this.clinicsService.updateClinic(user.clinicId!, dto);
  }

  @Delete('mine')
  @UseGuards(ClinicOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteClinic(@Req() req: Express.Request) {
    const user = this.getUser(req);
    return this.clinicsService.deleteClinic(user.clinicId!);
  }

  @Post('mine/invitations')
  @UseGuards(ClinicAdminGuard)
  createInvitation(@Req() req: Express.Request, @Body() dto: InviteMemberDto) {
    const user = this.getUser(req);
    return this.clinicsService.createInvitation(
      user.clinicId!,
      user.clinicianId,
      dto,
    );
  }

  @Get('mine/invitations')
  @UseGuards(ClinicAdminGuard)
  listInvitations(@Req() req: Express.Request) {
    const user = this.getUser(req);
    return this.clinicsService.listInvitations(user.clinicId!);
  }

  @Delete('mine/invitations/:id')
  @UseGuards(ClinicAdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  revokeInvitation(
    @Req() req: Express.Request,
    @Param('id') invitationId: string,
  ) {
    const user = this.getUser(req);
    return this.clinicsService.revokeInvitation(user.clinicId!, invitationId);
  }

  // Aquí vivía `POST mine/members`: el alta en la que un OWNER o ADMIN tecleaba
  // la contraseña de su colega. Retirado — en un producto cuya promesa es la
  // confidencialidad clínica, nadie debe poder fijar la credencial de otra
  // persona. El alta de un colega sin cuenta va por
  // `POST /clinics/join/register`, donde la contraseña la elige él.

  @Delete('mine/members/:clinicianId')
  @UseGuards(ClinicAdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @Req() req: Express.Request,
    @Param('clinicianId') targetClinicianId: string,
  ) {
    const user = this.getUser(req);
    return this.clinicsService.removeMember(user.clinicId!, targetClinicianId);
  }

  @Patch('mine/members/:clinicianId/role')
  @UseGuards(ClinicOwnerGuard)
  updateMemberRole(
    @Req() req: Express.Request,
    @Param('clinicianId') targetClinicianId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    const user = this.getUser(req);
    return this.clinicsService.updateMemberRole(
      user.clinicId!,
      targetClinicianId,
      dto,
    );
  }

  @Get('mine/patients')
  @UseGuards(ClinicAdminGuard)
  getClinicPatients(@Req() req: Express.Request) {
    const user = this.getUser(req);
    return this.clinicsService.getClinicPatients(user.clinicId!);
  }

  @Get('mine/finance/summary')
  @UseGuards(ClinicAdminGuard)
  getClinicFinanceSummary(
    @Req() req: Express.Request,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const user = this.getUser(req);
    const now = new Date();
    return this.clinicsService.getClinicFinanceSummary(
      user.clinicId!,
      month ? parseInt(month, 10) : now.getMonth() + 1,
      year ? parseInt(year, 10) : now.getFullYear(),
    );
  }

  @Get('mine/attendance')
  @UseGuards(ClinicAdminGuard)
  getClinicAttendance(
    @Req() req: Express.Request,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const user = this.getUser(req);
    const now = new Date();
    return this.clinicsService.getClinicAttendance(
      user.clinicId!,
      month ? parseInt(month, 10) : now.getMonth() + 1,
      year ? parseInt(year, 10) : now.getFullYear(),
    );
  }

  /**
   * Registro de accesos de toda la clínica: accesos a expedientes de
   * pacientes de los miembros + eventos de autenticación de los miembros.
   * Decisión de producto: los admins NO ven otra actividad no-clínica.
   */
  @Get('mine/access-logs')
  @UseGuards(ClinicAdminGuard)
  getClinicAccessLogs(
    @Req() req: Express.Request,
    @Query() query: QueryAccessLogsDto,
  ) {
    const user = this.getUser(req);
    return this.accessLogService.findForClinic(user.clinicId!, query);
  }

  @Post('join')
  @HttpCode(HttpStatus.NO_CONTENT)
  acceptInvitation(@Req() req: Express.Request, @Body('token') token: string) {
    const user = this.getUser(req);
    return this.clinicsService.acceptInvitation(user.clinicianId, token);
  }

  @Post('leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  leaveClinic(@Req() req: Express.Request) {
    const user = this.getUser(req);
    return this.clinicsService.leaveClinic(user.clinicianId);
  }
}
