import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

// ─── Inline SVG icons (email-safe, stroke-only, kanji color #8a72d1) ─────────

const SVG_CALENDAR = `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Crect x='1.5' y='2.5' width='13' height='12' rx='2' stroke='%238a72d1' stroke-width='1.4'/%3E%3Cpath d='M1.5 6.5h13' stroke='%238a72d1' stroke-width='1.4'/%3E%3Cpath d='M5 1v3M11 1v3' stroke='%238a72d1' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E" width="16" height="16" alt="" style="display:block;vertical-align:middle;" />`;

const SVG_CLOCK = `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Ccircle cx='8' cy='8' r='6.5' stroke='%238a72d1' stroke-width='1.4'/%3E%3Cpath d='M8 4.5v4l2.5 2' stroke='%238a72d1' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E" width="16" height="16" alt="" style="display:block;vertical-align:middle;" />`;

const SVG_TAG = `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M2 2h5l7 7-5 5-7-7V2z' stroke='%238a72d1' stroke-width='1.4' stroke-linejoin='round'/%3E%3Ccircle cx='5.5' cy='5.5' r='1' fill='%238a72d1'/%3E%3C/svg%3E" width="16" height="16" alt="" style="display:block;vertical-align:middle;" />`;

const SVG_USER = `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Ccircle cx='8' cy='5.5' r='2.5' stroke='%238a72d1' stroke-width='1.4'/%3E%3Cpath d='M2.5 14c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5' stroke='%238a72d1' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E" width="16" height="16" alt="" style="display:block;vertical-align:middle;" />`;

const SVG_TIMER = `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14' fill='none'%3E%3Ccircle cx='7' cy='7' r='5.5' stroke='%238a72d1' stroke-width='1.3'/%3E%3Cpath d='M7 4v3.5l2 1.5' stroke='%238a72d1' stroke-width='1.3' stroke-linecap='round'/%3E%3C/svg%3E" width="14" height="14" alt="" style="display:block;vertical-align:middle;" />`;

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: 'Kio Health <noreply@kioind.com>',
      to,
      subject: 'Restablecer contraseña — Kio Health',
      html: this.buildPasswordResetEmail(resetUrl),
    });

    if (error) {
      this.logger.error(
        `Failed to send password reset email to ${to}: ${error.message}`,
      );
    }
  }

  async sendAppointmentReminder(params: {
    to: string;
    patientName: string;
    clinicianName: string;
    appointmentDate: Date;
    appointmentType: string;
    timezone: string;
    confirmationUrl: string;
  }): Promise<void> {
    const {
      to,
      patientName,
      clinicianName,
      appointmentDate,
      appointmentType,
      timezone,
      confirmationUrl,
    } = params;

    const dateFormatter = new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: timezone,
    });
    const timeFormatter = new Intl.DateTimeFormat('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
    });

    const typeLabels: Record<string, string> = {
      CONSULTATION: 'Consulta',
      EVALUATION: 'Evaluación',
      FOLLOW_UP: 'Seguimiento',
    };

    const { error } = await this.resend.emails.send({
      from: 'Kio Health <noreply@kioind.com>',
      to,
      subject: 'Recordatorio: Tu cita es mañana — Kio Health',
      html: this.buildAppointmentReminderEmail({
        patientName,
        clinicianName,
        formattedDate: dateFormatter.format(appointmentDate),
        formattedTime: timeFormatter.format(appointmentDate),
        appointmentType: typeLabels[appointmentType] || appointmentType,
        confirmationUrl,
      }),
    });

    if (error) {
      throw new Error(`Failed to send reminder to ${to}: ${error.message}`);
    }
  }

  // ─── Private builders ─────────────────────────────────────────────────────

  private buildPasswordResetEmail(resetUrl: string): string {
    const content = `
      <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700;
                 color: #1e1b4b; line-height: 1.3; font-family: Inter, Roboto, sans-serif;">
        Restablecer tu contraseña
      </h1>
      <p style="margin: 0 0 24px; font-size: 15px; color: #4b5563;
                line-height: 1.7; font-family: Inter, Roboto, sans-serif;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta en Kio Health.
        Haz clic en el botón a continuación para crear una nueva contraseña.
      </p>

      <!-- CTA -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px;">
        <tr>
          <td align="center">
            <a href="${resetUrl}"
               style="display: inline-block; padding: 13px 36px;
                      background-color: #ae93fe;
                      color: #ffffff; font-family: Inter, Roboto, sans-serif;
                      font-size: 15px; font-weight: 700; text-decoration: none;
                      border-radius: 10px; letter-spacing: 0.01em; mso-padding-alt: 0;">
              Restablecer contraseña
            </a>
          </td>
        </tr>
      </table>

      <!-- Notice -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="background-color: #f5f3ff; border-radius: 10px; margin: 0 0 24px;">
        <tr>
          <td style="padding: 12px 16px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align: middle; padding-right: 8px;">
                  ${SVG_TIMER}
                </td>
                <td style="font-size: 13px; color: #6b5ea8; line-height: 1.6;
                            font-family: Inter, Roboto, sans-serif;">
                  Este enlace expira en <strong>1 hora</strong> y solo puede usarse una vez.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 16px; font-size: 13px; color: #9ca3af;
                line-height: 1.6; font-family: Inter, Roboto, sans-serif;">
        Si no solicitaste este cambio, puedes ignorar este correo.
        Tu contraseña seguirá siendo la misma.
      </p>

      <p style="margin: 0; font-size: 12px; color: #d1d5db; line-height: 1.5;
                word-break: break-all; font-family: Inter, Roboto, sans-serif;">
        Si el botón no funciona, copia este enlace:<br>
        <a href="${resetUrl}" style="color: #ae93fe; text-decoration: none;">${resetUrl}</a>
      </p>
    `;

    return this.wrapInBase(content);
  }

  private buildAppointmentReminderEmail(params: {
    patientName: string;
    clinicianName: string;
    formattedDate: string;
    formattedTime: string;
    appointmentType: string;
    confirmationUrl: string;
  }): string {
    const {
      patientName,
      clinicianName,
      formattedDate,
      formattedTime,
      appointmentType,
      confirmationUrl,
    } = params;

    // Capitalize first name
    const firstName =
      patientName.split(' ')[0].charAt(0).toUpperCase() +
      patientName.split(' ')[0].slice(1).toLowerCase();

    const content = `
      <!-- Greeting -->
      <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700;
                 color: #1e1b4b; line-height: 1.3; font-family: Inter, Roboto, sans-serif;">
        Hola, ${firstName}
      </h1>
      <p style="margin: 0 0 24px; font-size: 15px; color: #4b5563;
                line-height: 1.7; font-family: Inter, Roboto, sans-serif;">
        Tienes una cita programada para <strong style="color: #1e1b4b;">mañana</strong>
        con <strong style="color: #1e1b4b;">${clinicianName}</strong>.
        Aquí están los detalles:
      </p>

      <!-- Details card -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border: 1.5px solid #ddd3fa; border-radius: 14px;
                    margin: 0 0 28px; background-color: #faf9ff;">

        <!-- Fecha -->
        <tr>
          <td style="padding: 14px 18px; border-bottom: 1px solid #f0ecff;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align: middle; padding-right: 12px;">
                  <div style="width: 32px; height: 32px; background-color: #f5f3ff;
                               border-radius: 8px; display: flex; align-items: center;
                               justify-content: center; text-align: center; line-height: 32px;">
                    ${SVG_CALENDAR}
                  </div>
                </td>
                <td style="vertical-align: middle;">
                  <span style="display: block; font-size: 11px; font-weight: 600;
                               color: #9ca3af; text-transform: uppercase;
                               letter-spacing: 0.07em; margin-bottom: 2px;
                               font-family: Inter, Roboto, sans-serif;">
                    Fecha
                  </span>
                  <span style="font-size: 14px; font-weight: 700; color: #1e1b4b;
                               font-family: Inter, Roboto, sans-serif;">
                    ${formattedDate}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Hora -->
        <tr>
          <td style="padding: 14px 18px; border-bottom: 1px solid #f0ecff;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align: middle; padding-right: 12px;">
                  <div style="width: 32px; height: 32px; background-color: #f5f3ff;
                               border-radius: 8px; text-align: center; line-height: 32px;">
                    ${SVG_CLOCK}
                  </div>
                </td>
                <td style="vertical-align: middle;">
                  <span style="display: block; font-size: 11px; font-weight: 600;
                               color: #9ca3af; text-transform: uppercase;
                               letter-spacing: 0.07em; margin-bottom: 2px;
                               font-family: Inter, Roboto, sans-serif;">
                    Hora
                  </span>
                  <span style="font-size: 14px; font-weight: 700; color: #1e1b4b;
                               font-family: Inter, Roboto, sans-serif;">
                    ${formattedTime}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Tipo -->
        <tr>
          <td style="padding: 14px 18px; border-bottom: 1px solid #f0ecff;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align: middle; padding-right: 12px;">
                  <div style="width: 32px; height: 32px; background-color: #f5f3ff;
                               border-radius: 8px; text-align: center; line-height: 32px;">
                    ${SVG_TAG}
                  </div>
                </td>
                <td style="vertical-align: middle;">
                  <span style="display: block; font-size: 11px; font-weight: 600;
                               color: #9ca3af; text-transform: uppercase;
                               letter-spacing: 0.07em; margin-bottom: 2px;
                               font-family: Inter, Roboto, sans-serif;">
                    Tipo de sesión
                  </span>
                  <span style="font-size: 14px; font-weight: 700; color: #1e1b4b;
                               font-family: Inter, Roboto, sans-serif;">
                    ${appointmentType}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Profesional -->
        <tr>
          <td style="padding: 14px 18px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align: middle; padding-right: 12px;">
                  <div style="width: 32px; height: 32px; background-color: #f5f3ff;
                               border-radius: 8px; text-align: center; line-height: 32px;">
                    ${SVG_USER}
                  </div>
                </td>
                <td style="vertical-align: middle;">
                  <span style="display: block; font-size: 11px; font-weight: 600;
                               color: #9ca3af; text-transform: uppercase;
                               letter-spacing: 0.07em; margin-bottom: 2px;
                               font-family: Inter, Roboto, sans-serif;">
                    Profesional
                  </span>
                  <span style="font-size: 14px; font-weight: 700; color: #1e1b4b;
                               font-family: Inter, Roboto, sans-serif;">
                    ${clinicianName}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>

      <!-- CTA -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 20px;">
        <tr>
          <td align="center">
            <a href="${confirmationUrl}"
               style="display: inline-block; padding: 13px 40px;
                      background-color: #ae93fe;
                      color: #ffffff; font-family: Inter, Roboto, sans-serif;
                      font-size: 15px; font-weight: 700; text-decoration: none;
                      border-radius: 10px; letter-spacing: 0.01em; mso-padding-alt: 0;">
              Confirmar asistencia
            </a>
          </td>
        </tr>
      </table>

      <!-- Fallback link -->
      <p style="margin: 0 0 24px; font-size: 12px; color: #d1d5db; text-align: center;
                line-height: 1.5; word-break: break-all;
                font-family: Inter, Roboto, sans-serif;">
        Si el botón no funciona, copia este enlace:<br>
        <a href="${confirmationUrl}" style="color: #ae93fe; text-decoration: none;">
          ${confirmationUrl}
        </a>
      </p>

      <!-- Divider -->
      <div style="height: 1px; background-color: #ede9fe; margin: 0 0 20px;"></div>

      <!-- Notice -->
      <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.7;
                text-align: center; font-family: Inter, Roboto, sans-serif;">
        Si necesitas reprogramar o cancelar, contacta directamente a tu profesional
        con anticipación.
      </p>
    `;

    return this.wrapInBase(content);
  }

  /**
   * Base layout shared by all transactional emails.
   * Flat design — no gradients, no colored shadows.
   * Logo is horizontal (3:1), displayed at 156×52px.
   */
  private wrapInBase(content: string): string {
    const frontendUrl = process.env.FRONTEND_URL ?? 'https://kio.health';
    const logoUrl = `${frontendUrl}/logo.png`;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Kio Health</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f3ff;
             font-family: Inter, Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
             -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color: #f5f3ff;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Email card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width: 520px; background-color: #ffffff;
                      border-radius: 20px;
                      border: 1px solid #e8e4f3;
                      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
                      overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color: #1e1b4b; padding: 28px 40px 24px; text-align: center;">
              <a href="${frontendUrl}" style="display: inline-block; text-decoration: none;">
                <img src="${logoUrl}" alt="Kio Health"
                     width="156" height="52"
                     style="display: block; margin: 0 auto;
                            border: 0; outline: none; text-decoration: none;" />
              </a>
            </td>
          </tr>

          <!-- Accent line -->
          <tr>
            <td style="height: 3px; background-color: #ae93fe;
                       padding: 0; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #faf9ff; border-top: 1px solid #ddd3fa;
                       padding: 18px 40px; text-align: center;">
              <p style="margin: 0 0 3px; font-size: 12px; font-weight: 700;
                         color: #8a72d1; letter-spacing: 0.07em; text-transform: uppercase;
                         font-family: Inter, Roboto, sans-serif;">
                Kio Health
              </p>
              <p style="margin: 0; font-size: 11px; color: #c4b5fd; line-height: 1.5;
                         font-family: Inter, Roboto, sans-serif;">
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
