import { Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { RemindersService } from './reminders.service';
import { Public } from '../auth/decorators/public.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { renderPortalPage } from '../portal/portal-pages.helper';

@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  // Protegido por el JwtAuthGuard global (ver app.module.ts) + AdminGuard:
  // dispara la cola GLOBAL de recordatorios, no es una acción por-clínico.
  @UseGuards(AdminGuard)
  @Post('trigger')
  async triggerReminders() {
    await this.remindersService.processReminders();
    return { ok: true };
  }

  /**
   * LEGACY: confirmación con el token uuid de emails ya enviados antes de la
   * capa de tokens del portal. Los emails nuevos apuntan a /portal/actions.
   * Nota conocida: este GET muta (limitación del flujo legacy); se elimina
   * junto con la columna confirmation_token en una release posterior.
   */
  @Public()
  @Get('confirm/:token')
  async confirmAttendance(@Param('token') token: string, @Res() res: Response) {
    const result = await this.remindersService.confirmAttendance(token);
    res.setHeader('Content-Type', 'text/html');
    res.send(this.buildConfirmationPage(result));
  }

  private buildConfirmationPage(result: {
    success: boolean;
    message: string;
    appointmentDate?: Date;
    clinicianName?: string;
  }): string {
    if (result.success) {
      return renderPortalPage({
        title: 'Asistencia confirmada',
        icon: '✅',
        iconColor: '#16a34a',
        bodyHtml: `
          <p style="margin: 0 0 16px; font-size: 15px; color: #4b5563; line-height: 1.7;">
            Gracias, tu asistencia ha sido confirmada exitosamente.
          </p>
          <p style="margin: 0; font-size: 14px; color: #6b5ea8; line-height: 1.6;">
            👤 <strong>${result.clinicianName}</strong> te espera en tu próxima sesión.
          </p>`,
      });
    }

    if (result.message === 'already_confirmed') {
      return renderPortalPage({
        title: 'Ya confirmaste tu asistencia',
        icon: 'ℹ️',
        iconColor: '#8a72d1',
        bodyHtml: `
          <p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.7;">
            Ya habías confirmado tu asistencia anteriormente. ¡Te esperamos!
          </p>`,
      });
    }

    if (result.message === 'appointment_inactive') {
      return renderPortalPage({
        title: 'Cita no vigente',
        icon: '⚠️',
        iconColor: '#d97706',
        bodyHtml: `
          <p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.7;">
            Esta cita ya fue completada o cancelada. Si tienes dudas, contacta a tu profesional.
          </p>`,
      });
    }

    return renderPortalPage({
      title: 'Enlace no válido',
      icon: '❌',
      iconColor: '#dc2626',
      bodyHtml: `
        <p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.7;">
          Este enlace de confirmación no es válido o ya expiró.
        </p>`,
    });
  }
}
