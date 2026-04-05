import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RemindersService } from './reminders.service';

@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get('confirm/:token')
  async confirmAttendance(
    @Param('token') token: string,
    @Res() res: Response,
  ) {
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
    let title: string;
    let body: string;
    let iconColor: string;
    let icon: string;

    if (result.success) {
      title = 'Asistencia confirmada';
      icon = '✅';
      iconColor = '#16a34a';
      body = `
        <p style="margin: 0 0 16px; font-size: 15px; color: #4b5563; line-height: 1.7;">
          Gracias, tu asistencia ha sido confirmada exitosamente.
        </p>
        <p style="margin: 0; font-size: 14px; color: #6b5ea8; line-height: 1.6;">
          👤 <strong>${result.clinicianName}</strong> te espera en tu próxima sesión.
        </p>
      `;
    } else if (result.message === 'already_confirmed') {
      title = 'Ya confirmaste tu asistencia';
      icon = 'ℹ️';
      iconColor = '#8a72d1';
      body = `
        <p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.7;">
          Ya habías confirmado tu asistencia anteriormente. ¡Te esperamos!
        </p>
      `;
    } else if (result.message === 'appointment_inactive') {
      title = 'Cita no vigente';
      icon = '⚠️';
      iconColor = '#d97706';
      body = `
        <p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.7;">
          Esta cita ya fue completada o cancelada. Si tienes dudas, contacta a tu profesional.
        </p>
      `;
    } else {
      title = 'Enlace no válido';
      icon = '❌';
      iconColor = '#dc2626';
      body = `
        <p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.7;">
          Este enlace de confirmación no es válido o ya expiró.
        </p>
      `;
    }

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — Kio Health</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f7ff; font-family: Inter, Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f7ff; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 60px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width: 480px; background-color: #ffffff; border-radius: 20px;
                      box-shadow: 0 4px 24px rgba(138, 114, 209, 0.10); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b 0%, #2d2560 100%);
                       padding: 28px 40px; text-align: center;">
              <div style="font-size: 28px; margin-bottom: 8px;">${icon}</div>
              <div style="width: 40px; height: 3px; background: linear-gradient(90deg, #8a72d1, #ae93fe);
                          border-radius: 2px; margin: 0 auto;"></div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px 40px 32px;">
              <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: ${iconColor}; line-height: 1.3;">
                ${title}
              </h1>
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #faf9ff; border-top: 1px solid #ede9fe;
                       padding: 20px 40px; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600;
                         color: #8a72d1; letter-spacing: 0.05em; text-transform: uppercase;">
                Kio Health
              </p>
              <p style="margin: 0; font-size: 11px; color: #c4b5fd; line-height: 1.5;">
                Tu plataforma clínica de confianza
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}
