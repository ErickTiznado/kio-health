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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClinicsService } from './clinics.service';
import { ClinicAdminGuard } from './guards/clinic-admin.guard';
import { ClinicOwnerGuard } from './guards/clinic-owner.guard';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { CreateMemberAccountDto } from './dto/create-member-account.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

type AuthenticatedUser = {
  clinicianId: string;
  clinicId?: string;
  clinicRole?: string;
};

@Controller('clinics')
@UseGuards(JwtAuthGuard)
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

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

  @Post('mine/members')
  @UseGuards(ClinicAdminGuard)
  createMemberAccount(
    @Req() req: Express.Request,
    @Body() dto: CreateMemberAccountDto,
  ) {
    const user = this.getUser(req);
    return this.clinicsService.createMemberAccount(user.clinicId!, dto);
  }

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
