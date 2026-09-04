import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import { PortalService } from './portal.service';
import { SubmitScaleDto } from './dto/submit-scale.dto';
import { RescheduleRequestDto } from './dto/reschedule-request.dto';

/**
 * API JSON del portal SPA del paciente (rutas /p del frontend).
 * Autenticación: token bearer del paciente en el header X-Patient-Token —
 * NUNCA la cookie del clínico (el portal usa una instancia axios separada).
 * Techo de PHI: horarios, nombre del profesional y cuestionarios pendientes.
 */
@Controller('portal')
@Throttle({ default: { limit: 30, ttl: 60000 } })
export class PortalApiController {
  constructor(private readonly portalService: PortalService) {}

  private requireToken(token: string | undefined): string {
    if (!token) {
      throw new UnauthorizedException('Token de acceso requerido');
    }
    return token;
  }

  @Public()
  @Get('session')
  async getSession(@Headers('x-patient-token') token?: string) {
    const session = await this.portalService.getPortalSession(
      this.requireToken(token),
    );
    if (!session) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
    return session;
  }

  @Public()
  @Get('appointments')
  async listAppointments(@Headers('x-patient-token') token?: string) {
    const appointments = await this.portalService.listAppointments(
      this.requireToken(token),
    );
    if (appointments === null) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
    return appointments;
  }

  @Public()
  @Post('appointments/:id/confirm')
  async confirm(
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Headers('x-patient-token') token?: string,
  ) {
    return this.mapActionResult(
      await this.portalService.confirmAttendance(
        this.requireToken(token),
        appointmentId,
      ),
    );
  }

  @Public()
  @Post('appointments/:id/cancel')
  async cancel(
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Headers('x-patient-token') token?: string,
  ) {
    return this.mapActionResult(
      await this.portalService.cancelAppointment(
        this.requireToken(token),
        appointmentId,
      ),
    );
  }

  @Public()
  @Post('appointments/:id/reschedule-request')
  async requestReschedule(
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Body() dto: RescheduleRequestDto,
    @Headers('x-patient-token') token?: string,
  ) {
    return this.mapActionResult(
      await this.portalService.requestReschedule(
        this.requireToken(token),
        appointmentId,
        dto.message,
      ),
    );
  }

  @Public()
  @Get('scale-assignments')
  async listScaleAssignments(@Headers('x-patient-token') token?: string) {
    const assignments = await this.portalService.listScaleAssignments(
      this.requireToken(token),
    );
    if (assignments === null) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
    return assignments;
  }

  @Public()
  @Post('scale-assignments/:id/submit')
  async submitScale(
    @Param('id', ParseUUIDPipe) assignmentId: string,
    @Body() dto: SubmitScaleDto,
    @Headers('x-patient-token') token?: string,
  ) {
    const result = await this.portalService.submitScaleAssignment(
      this.requireToken(token),
      assignmentId,
      dto.scores,
    );
    if (!result.ok) {
      if (result.reason === 'invalid_token') {
        throw new UnauthorizedException('Token inválido o expirado');
      }
      throw new NotFoundException('Cuestionario no encontrado o ya respondido');
    }
    return result;
  }

  /** Un resultado fallido del flujo compartido se traduce a HTTP semántico. */
  private mapActionResult<T extends { ok: boolean }>(result: T): T {
    if (!result.ok) {
      const reason = (result as { reason?: string }).reason;
      if (reason === 'invalid_token') {
        throw new UnauthorizedException('Token inválido o expirado');
      }
      if (reason === 'not_found' || reason === 'inactive') {
        throw new NotFoundException('Cita no encontrada o no vigente');
      }
      // already_confirmed / already_requested: idempotencia amable
      return result;
    }
    return result;
  }
}
