import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

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
      this.logger.error(`Failed to send password reset email to ${to}: ${error.message}`);
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private buildPasswordResetEmail(resetUrl: string): string {
    const content = `
      <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #1e1b4b; line-height: 1.3;">
        Restablecer tu contraseña
      </h1>
      <p style="margin: 0 0 20px; font-size: 15px; color: #4b5563; line-height: 1.7;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta en Kio Health.
        Haz clic en el botón a continuación para crear una nueva contraseña.
      </p>

      <!-- CTA Button -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0;">
        <tr>
          <td align="center">
            <a href="${resetUrl}"
               style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #8a72d1 0%, #ae93fe 100%);
                      color: #ffffff; font-family: Inter, Roboto, sans-serif; font-size: 15px;
                      font-weight: 700; text-decoration: none; border-radius: 12px;
                      letter-spacing: 0.01em; mso-padding-alt: 0;">
              Restablecer contraseña
            </a>
          </td>
        </tr>
      </table>

      <!-- Security notice -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="background-color: #f5f3ff; border-radius: 10px; margin: 0 0 24px;">
        <tr>
          <td style="padding: 14px 18px;">
            <p style="margin: 0; font-size: 13px; color: #6b5ea8; line-height: 1.6;">
              ⏱ &nbsp;Este enlace expira en <strong>1 hora</strong> y solo puede usarse una vez.
            </p>
          </td>
        </tr>
      </table>

      <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.6;">
        Si no solicitaste este cambio, puedes ignorar este correo con total seguridad.
        Tu contraseña seguirá siendo la misma.
      </p>

      <!-- Fallback URL -->
      <p style="margin: 20px 0 0; font-size: 12px; color: #d1d5db; line-height: 1.5; word-break: break-all;">
        Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
        <a href="${resetUrl}" style="color: #ae93fe; text-decoration: none;">${resetUrl}</a>
      </p>
    `;

    return this.wrapInBase(content);
  }

  /**
   * Brand-consistent base layout for all transactional emails.
   * Uses table-based structure for maximum email client compatibility.
   */
  private wrapInBase(content: string): string {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
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
<body style="margin: 0; padding: 0; background-color: #f8f7ff; font-family: Inter, Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f7ff; min-height: 100%;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Email card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width: 520px; background-color: #ffffff; border-radius: 20px;
                      box-shadow: 0 4px 24px rgba(138, 114, 209, 0.10); overflow: hidden;">

          <!-- ── Header ── -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b 0%, #2d2560 100%);
                       padding: 28px 40px; text-align: center;">
              <a href="${frontendUrl}" style="display: inline-block; text-decoration: none;">
                <img src="${logoUrl}" alt="Kio Health"
                     width="64" height="64"
                     style="display: block; margin: 0 auto; border-radius: 14px;
                            border: 0; outline: none; text-decoration: none;" />
              </a>
              <!-- Subtle purple divider -->
              <div style="width: 40px; height: 3px; background: linear-gradient(90deg, #8a72d1, #ae93fe);
                          border-radius: 2px; margin: 18px auto 0;"></div>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="padding: 36px 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- ── Footer ── -->
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
        <!-- /Email card -->

      </td>
    </tr>
  </table>

</body>
</html>
    `.trim();
  }
}
