import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

/**
 * Escapa texto que no eligió el destinatario antes de meterlo en el HTML.
 *
 * Misma función que `escapeHtml` en `portal.service.ts`, duplicada aquí a
 * propósito: extraerla a un módulo común tocaría ese archivo, que pertenece a
 * otro carril. Queda anotado como necesidad entre carriles.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Saneado para la LÍNEA DE ASUNTO, que es texto plano y no HTML.
 *
 * Aquí `escapeHtml` sería el saneado equivocado: una clínica llamada "Salud &
 * Bienestar" llegaría como "Salud &amp; Bienestar" en la bandeja de entrada. Lo
 * que sí hay que quitar de una cabecera son los saltos de línea y los caracteres
 * de control —la forma clásica de inyectar cabeceras— y un largo acotado para
 * que un nombre de 5000 caracteres no se coma el asunto entero.
 */
function sanitizeHeaderText(value: string, maxLength = 120): string {
  const flattened = value
    // \p{Cc}: caracteres de control Unicode, CR y LF incluidos.
    .replace(/\p{Cc}+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return flattened.length > maxLength
    ? `${flattened.slice(0, maxLength - 1)}…`
    : flattened;
}

// ─── Detail row helper ────────────────────────────────────────────────────────
function detailRow(label: string, value: string, last = false): string {
  const border = last ? '' : 'border-bottom: 1px solid #f0ecff;';
  return `
    <tr>
      <td style="padding: 13px 20px; ${border}">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="110" style="vertical-align: top; padding-right: 12px;">
              <span style="font-size: 11px; font-weight: 600; color: #9ca3af;
                           text-transform: uppercase; letter-spacing: 0.07em;
                           font-family: Inter, Roboto, sans-serif; line-height: 1.8;">
                ${label}
              </span>
            </td>
            <td style="vertical-align: top;">
              <span style="font-size: 14px; font-weight: 700; color: #1e1b4b;
                           font-family: Inter, Roboto, sans-serif; line-height: 1.8;">
                ${value}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

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

  /**
   * Invitación para unirse a una clínica.
   *
   * Devuelve si salió o no, en vez de lanzar: quien invita ya tiene el enlace
   * en pantalla y ese sigue siendo el camino principal, así que un fallo de
   * correo no puede tumbar una invitación que ya existe en la base de datos.
   * Sin `RESEND_API_KEY` ni siquiera se intenta — se avisa y se devuelve false.
   */
  async sendClinicInvitationEmail(params: {
    to: string;
    clinicName: string;
    invitedRole: string;
    joinUrl: string;
    expiresInHours: number;
  }): Promise<boolean> {
    const { to, clinicName, invitedRole, joinUrl, expiresInHours } = params;

    if (!process.env.RESEND_API_KEY) {
      this.logger.warn(
        `RESEND_API_KEY sin configurar: no se envía la invitación de ${clinicName} a ${to}.`,
      );
      return false;
    }

    const roleLabels: Record<string, string> = {
      OWNER: 'Propietario',
      ADMIN: 'Administrador',
      MEMBER: 'Miembro',
    };

    // `clinicName` lo teclea el OWNER/ADMIN de la clínica (`POST /clinics`,
    // `PATCH /clinics/mine`) sin validar el contenido, y el destinatario es una
    // dirección arbitraria que ese mismo admin escribe en `InviteMemberDto`.
    // Es el único camino de este servicio donde texto elegido por quien invita
    // llega a alguien elegido por quien invita, en un correo firmado desde
    // noreply@kioind.com: sin escapar, un nombre de clínica con marcado planta
    // enlaces propios dentro de un mensaje con la marca del producto.
    // `invitedRole` viaja como `string` en esta firma, así que se escapa por la
    // misma razón aunque hoy solo pueda venir del enum de Prisma.
    const safeClinicName = escapeHtml(clinicName);
    const safeRoleLabel = escapeHtml(roleLabels[invitedRole] ?? invitedRole);

    const content = `
      <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700;
                 color: #1e1b4b; line-height: 1.3; font-family: Inter, Roboto, sans-serif;">
        Te invitaron a ${safeClinicName}
      </h1>
      <p style="margin: 0 0 24px; font-size: 15px; color: #4b5563;
                line-height: 1.7; font-family: Inter, Roboto, sans-serif;">
        Vas a entrar como
        <strong style="color: #1e1b4b;">${safeRoleLabel}</strong>.
        Si aún no tienes cuenta en Kio Health, el enlace te deja crearla con
        este mismo correo; si ya la tienes, te pedirá iniciar sesión.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px;">
        <tr>
          <td align="center">
            <a href="${joinUrl}"
               style="display: inline-block; padding: 13px 40px; background-color: #ae93fe;
                      color: #ffffff; font-family: Inter, Roboto, sans-serif; font-size: 15px;
                      font-weight: 700; text-decoration: none; border-radius: 10px;">
              Aceptar invitación
            </a>
          </td>
        </tr>
      </table>
      <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.7;
                text-align: center; font-family: Inter, Roboto, sans-serif;">
        El enlace caduca en ${expiresInHours} horas y solo puede usarse una vez.
        Si no esperabas esta invitación, ignora este correo.
      </p>
    `;

    try {
      const { error } = await this.resend.emails.send({
        from: 'Kio Health <noreply@kioind.com>',
        to,
        // El asunto es texto plano: `sanitizeHeaderText`, no `escapeHtml`
        // (ver el comentario de la función).
        subject: `Invitación para unirte a ${sanitizeHeaderText(clinicName)} — Kio Health`,
        html: this.wrapInBase(content),
      });

      if (error) {
        this.logger.error(
          `Failed to send clinic invitation to ${to}: ${error.message}`,
        );
        return false;
      }

      return true;
    } catch (err) {
      // Red caída, DNS, timeout: nada de esto puede propagarse al admin, que
      // ya tiene el enlace y puede pasárselo por su cuenta.
      this.logger.error(
        `Failed to send clinic invitation to ${to}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return false;
    }
  }

  async sendAppointmentReminder(params: {
    to: string;
    patientName: string;
    clinicianName: string;
    appointmentDate: Date;
    appointmentType: string;
    timezone: string;
    /** 'hoy' | 'mañana' | null → null usa la fecha completa en el texto. */
    dayLabel: 'hoy' | 'mañana' | null;
    confirmUrl: string;
    cancelUrl: string;
    rescheduleUrl: string;
  }): Promise<void> {
    const {
      to,
      patientName,
      clinicianName,
      appointmentDate,
      appointmentType,
      timezone,
      dayLabel,
      confirmUrl,
      cancelUrl,
      rescheduleUrl,
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

    const formattedDate = dateFormatter.format(appointmentDate);

    const subject = dayLabel
      ? `Recordatorio: Tu cita es ${dayLabel} — Kio Health`
      : 'Recordatorio de tu próxima cita — Kio Health';

    const { error } = await this.resend.emails.send({
      from: 'Kio Health <noreply@kioind.com>',
      to,
      subject,
      html: this.buildAppointmentReminderEmail({
        patientName,
        clinicianName,
        dayPhrase: dayLabel ?? `el ${formattedDate}`,
        formattedDate,
        formattedTime: timeFormatter.format(appointmentDate),
        appointmentType: typeLabels[appointmentType] || appointmentType,
        confirmUrl,
        cancelUrl,
        rescheduleUrl,
      }),
    });

    if (error) {
      throw new Error(`Failed to send reminder to ${to}: ${error.message}`);
    }
  }

  /** Aviso al clínico: el paciente canceló su cita desde el enlace del email. */
  async sendPatientCancellationNotice(params: {
    to: string;
    patientName: string;
    appointmentDate: Date;
    timezone: string;
  }): Promise<void> {
    const { to, patientName, appointmentDate, timezone } = params;
    const { formattedDate, formattedTime } = this.formatDateTime(
      appointmentDate,
      timezone,
    );

    const content = `
      <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700;
                 color: #1e1b4b; line-height: 1.3; font-family: Inter, Roboto, sans-serif;">
        Cita cancelada por el paciente
      </h1>
      <p style="margin: 0 0 20px; font-size: 15px; color: #4b5563;
                line-height: 1.7; font-family: Inter, Roboto, sans-serif;">
        <strong style="color: #1e1b4b;">${patientName}</strong> canceló su cita
        desde el enlace del recordatorio.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border: 1.5px solid #ddd3fa; border-radius: 14px;
                    margin: 0 0 20px; background-color: #faf9ff;">
        ${detailRow('Paciente', patientName)}
        ${detailRow('Fecha', formattedDate)}
        ${detailRow('Hora', formattedTime, true)}
      </table>
      <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.7;
                font-family: Inter, Roboto, sans-serif;">
        El horario quedó libre en tu agenda. La cita aparece como
        "Cancelada por paciente" en Kio Health.
      </p>
    `;

    const { error } = await this.resend.emails.send({
      from: 'Kio Health <noreply@kioind.com>',
      to,
      subject: `${patientName} canceló su cita — Kio Health`,
      html: this.wrapInBase(content),
    });

    if (error) {
      // Best-effort: la cancelación ya ocurrió; solo registrar.
      this.logger.error(
        `Failed to send cancellation notice to ${to}: ${error.message}`,
      );
    }
  }

  /** Aviso al clínico: el paciente pide reprogramar (mensaje ya escapado). */
  async sendRescheduleRequestNotice(params: {
    to: string;
    patientName: string;
    appointmentDate: Date;
    timezone: string;
    /** HTML-escaped por el caller antes de llegar aquí. */
    message?: string;
  }): Promise<void> {
    const { to, patientName, appointmentDate, timezone, message } = params;
    const { formattedDate, formattedTime } = this.formatDateTime(
      appointmentDate,
      timezone,
    );

    const messageBlock = message
      ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="background-color: #f5f3ff; border-radius: 10px; margin: 0 0 20px;">
        <tr>
          <td style="padding: 14px 16px;">
            <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: #8a72d1;
                      text-transform: uppercase; letter-spacing: 0.07em;
                      font-family: Inter, Roboto, sans-serif;">
              Mensaje del paciente
            </p>
            <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;
                      font-family: Inter, Roboto, sans-serif;">
              “${message}”
            </p>
          </td>
        </tr>
      </table>`
      : '';

    const content = `
      <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700;
                 color: #1e1b4b; line-height: 1.3; font-family: Inter, Roboto, sans-serif;">
        Solicitud de cambio de horario
      </h1>
      <p style="margin: 0 0 20px; font-size: 15px; color: #4b5563;
                line-height: 1.7; font-family: Inter, Roboto, sans-serif;">
        <strong style="color: #1e1b4b;">${patientName}</strong> solicitó
        reprogramar su próxima cita.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border: 1.5px solid #ddd3fa; border-radius: 14px;
                    margin: 0 0 20px; background-color: #faf9ff;">
        ${detailRow('Paciente', patientName)}
        ${detailRow('Cita actual', `${formattedDate}, ${formattedTime}`, true)}
      </table>
      ${messageBlock}
      <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.7;
                font-family: Inter, Roboto, sans-serif;">
        La cita sigue vigente hasta que la reprogrames desde tu agenda en
        Kio Health.
      </p>
    `;

    const { error } = await this.resend.emails.send({
      from: 'Kio Health <noreply@kioind.com>',
      to,
      subject: `${patientName} solicita reprogramar su cita — Kio Health`,
      html: this.wrapInBase(content),
    });

    if (error) {
      this.logger.error(
        `Failed to send reschedule notice to ${to}: ${error.message}`,
      );
    }
  }

  /** Invitación al paciente a responder un cuestionario desde el portal. */
  async sendScaleAssignmentEmail(params: {
    to: string;
    patientName: string;
    clinicianName: string;
    scaleType: string;
    portalUrl: string;
  }): Promise<void> {
    const { to, patientName, clinicianName, scaleType, portalUrl } = params;
    const scaleLabels: Record<string, string> = {
      PHQ9: 'PHQ-9 (estado de ánimo)',
      GAD7: 'GAD-7 (ansiedad)',
    };
    const firstName = patientName.split(' ')[0];

    const content = `
      <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700;
                 color: #1e1b4b; line-height: 1.3; font-family: Inter, Roboto, sans-serif;">
        Hola, ${firstName}
      </h1>
      <p style="margin: 0 0 24px; font-size: 15px; color: #4b5563;
                line-height: 1.7; font-family: Inter, Roboto, sans-serif;">
        <strong style="color: #1e1b4b;">${clinicianName}</strong> te pide
        responder un breve cuestionario
        (<strong>${scaleLabels[scaleType] ?? scaleType}</strong>) antes de tu
        próxima sesión. Toma menos de 3 minutos.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px;">
        <tr>
          <td align="center">
            <a href="${portalUrl}"
               style="display: inline-block; padding: 13px 40px; background-color: #ae93fe;
                      color: #ffffff; font-family: Inter, Roboto, sans-serif; font-size: 15px;
                      font-weight: 700; text-decoration: none; border-radius: 10px;">
              Responder cuestionario
            </a>
          </td>
        </tr>
      </table>
      <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.7;
                text-align: center; font-family: Inter, Roboto, sans-serif;">
        Tus respuestas solo las verá tu profesional.
      </p>
    `;

    const { error } = await this.resend.emails.send({
      from: 'Kio Health <noreply@kioind.com>',
      to,
      subject: `${clinicianName} te envió un cuestionario — Kio Health`,
      html: this.wrapInBase(content),
    });

    if (error) {
      throw new Error(
        `Failed to send scale assignment to ${to}: ${error.message}`,
      );
    }
  }

  /** Alerta URGENTE al clínico: auto-reporte con señal de crisis. */
  async sendUrgentScaleAlert(params: {
    to: string;
    patientName: string;
    scaleType: string;
    totalScore: number;
    riskLevel: string;
    suicidalityFlag: boolean;
  }): Promise<void> {
    const {
      to,
      patientName,
      scaleType,
      totalScore,
      riskLevel,
      suicidalityFlag,
    } = params;

    const content = `
      <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700;
                 color: #dc2626; line-height: 1.3; font-family: Inter, Roboto, sans-serif;">
        ⚠️ Alerta clínica urgente
      </h1>
      <p style="margin: 0 0 20px; font-size: 15px; color: #4b5563;
                line-height: 1.7; font-family: Inter, Roboto, sans-serif;">
        <strong style="color: #1e1b4b;">${patientName}</strong> completó un
        auto-reporte con indicadores que requieren tu atención inmediata.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border: 1.5px solid #fecaca; border-radius: 14px;
                    margin: 0 0 20px; background-color: #fef2f2;">
        ${detailRow('Paciente', patientName)}
        ${detailRow('Escala', scaleType === 'PHQ9' ? 'PHQ-9' : 'GAD-7')}
        ${detailRow('Puntaje total', `${totalScore} — ${riskLevel}`)}
        ${detailRow(
          'Ítem de riesgo',
          suicidalityFlag
            ? 'Ítem 9 del PHQ-9 respondido > 0 (ideación)'
            : 'Puntaje total en rango severo',
          true,
        )}
      </table>
      <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.7;
                font-family: Inter, Roboto, sans-serif;">
        Revisa el expediente en Kio Health y contacta al paciente según tu
        protocolo de crisis.
      </p>
    `;

    const { error } = await this.resend.emails.send({
      from: 'Kio Health <noreply@kioind.com>',
      to,
      subject: `🚨 URGENTE: auto-reporte de ${patientName} — Kio Health`,
      html: this.wrapInBase(content),
    });

    if (error) {
      throw new Error(`Failed to send urgent alert to ${to}: ${error.message}`);
    }
  }

  private formatDateTime(date: Date, timezone: string) {
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
    return {
      formattedDate: dateFormatter.format(date),
      formattedTime: timeFormatter.format(date),
    };
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
    dayPhrase: string;
    formattedDate: string;
    formattedTime: string;
    appointmentType: string;
    confirmUrl: string;
    cancelUrl: string;
    rescheduleUrl: string;
  }): string {
    const {
      patientName,
      clinicianName,
      dayPhrase,
      formattedDate,
      formattedTime,
      appointmentType,
      confirmUrl,
      cancelUrl,
      rescheduleUrl,
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
        Tienes una cita programada para <strong style="color: #1e1b4b;">${dayPhrase}</strong>
        con <strong style="color: #1e1b4b;">${clinicianName}</strong>.
        Aquí están los detalles:
      </p>

      <!-- Details card -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border: 1.5px solid #ddd3fa; border-radius: 14px;
                    margin: 0 0 28px; background-color: #faf9ff;">
        ${detailRow('Fecha', formattedDate)}
        ${detailRow('Hora', formattedTime)}
        ${detailRow('Tipo de sesión', appointmentType)}
        ${detailRow('Profesional', clinicianName, true)}
      </table>

      <!-- CTA principal -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 20px;">
        <tr>
          <td align="center">
            <a href="${confirmUrl}"
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

      <!-- Acciones secundarias -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px;">
        <tr>
          <td align="center" style="font-size: 13px; font-family: Inter, Roboto, sans-serif;">
            <a href="${rescheduleUrl}" style="color: #8a72d1; text-decoration: underline;">
              Solicitar cambio de horario
            </a>
            <span style="color: #ddd3fa; padding: 0 8px;">|</span>
            <a href="${cancelUrl}" style="color: #9ca3af; text-decoration: underline;">
              Cancelar cita
            </a>
          </td>
        </tr>
      </table>

      <!-- Fallback link -->
      <p style="margin: 0 0 24px; font-size: 12px; color: #d1d5db; text-align: center;
                line-height: 1.5; word-break: break-all;
                font-family: Inter, Roboto, sans-serif;">
        Si el botón no funciona, copia este enlace:<br>
        <a href="${confirmUrl}" style="color: #ae93fe; text-decoration: none;">
          ${confirmUrl}
        </a>
      </p>

      <!-- Divider -->
      <div style="height: 1px; background-color: #ede9fe; margin: 0 0 20px;"></div>

      <!-- Notice -->
      <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.7;
                text-align: center; font-family: Inter, Roboto, sans-serif;">
        Puedes confirmar, cancelar o pedir un cambio de horario desde los
        enlaces de este correo — tu profesional será notificado al instante.
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
    const frontendUrl = process.env.FRONTEND_URL ?? 'https://kioind.com';
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
