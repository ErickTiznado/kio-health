import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../lib/email.service';
import { PortalTokenService } from '../portal/portal-token.service';
import { ReminderKind, ReminderStatus } from '#generated/prisma';

/** Aviso mínimo para la regla same-day: si falta menos, no enviamos nada. */
const MIN_SAME_DAY_NOTICE_MS = 60 * 60 * 1000; // 1 hora

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly portalTokens: PortalTokenService,
  ) {}

  async processReminders(): Promise<void> {
    const pendingReminders = await this.prisma.appointmentReminder.findMany({
      where: {
        status: ReminderStatus.PENDING,
        scheduledFor: { lte: new Date() },
        appointment: { status: 'SCHEDULED' },
      },
      include: {
        appointment: {
          include: {
            patient: { select: { id: true, fullName: true } },
            clinician: {
              select: {
                timezone: true,
                user: { select: { fullName: true } },
              },
            },
          },
        },
      },
    });

    for (const reminder of pendingReminders) {
      const apiUrl = process.env.API_URL ?? 'https://kioind.com';

      try {
        // Un token fresco por envío — misma capa que usará el portal SPA.
        const token = await this.portalTokens.issueToken(
          reminder.appointment.patient.id,
        );
        const base = `${apiUrl}/api/portal/actions/${token}/appointments/${reminder.appointmentId}`;

        await this.emailService.sendAppointmentReminder({
          to: reminder.patientEmail,
          patientName: reminder.appointment.patient.fullName,
          clinicianName:
            reminder.appointment.clinician.user.fullName ?? 'Tu profesional',
          appointmentDate: reminder.appointment.startTime,
          appointmentType: reminder.appointment.type,
          timezone: reminder.appointment.clinician.timezone,
          dayLabel: this.relativeDayLabel(
            reminder.appointment.startTime,
            reminder.appointment.clinician.timezone,
          ),
          confirmUrl: `${base}/confirm`,
          cancelUrl: `${base}/cancel`,
          rescheduleUrl: `${base}/reschedule`,
        });

        await this.prisma.appointmentReminder.update({
          where: { id: reminder.id },
          data: {
            status: ReminderStatus.SENT,
            sentAt: new Date(),
          },
        });

        this.logger.log(
          `Reminder (${reminder.kind}) sent for appointment ${reminder.appointmentId}`,
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';

        await this.prisma.appointmentReminder.update({
          where: { id: reminder.id },
          data: {
            status: ReminderStatus.FAILED,
            failureReason: message,
          },
        });

        this.logger.error(
          `Failed to send reminder for appointment ${reminder.appointmentId}: ${message}`,
        );
      }
    }
  }

  /**
   * Programa (o reprograma) los recordatorios de una cita según la
   * configuración del clínico: toque principal + segundo toque opcional.
   *
   * Regla same-day: si el lead ya quedó en el pasado pero la cita está a
   * ≥1 hora, el recordatorio se agenda para AHORA con la variante "hoy"
   * (antes: skip silencioso y el paciente no recibía nada).
   */
  async scheduleReminder(appointmentId: string): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { select: { contactEmail: true } },
        clinician: {
          select: {
            remindersEnabled: true,
            reminderLeadHours: true,
            reminderSecondLeadHours: true,
          },
        },
      },
    });

    if (!appointment) return;
    if (appointment.status !== 'SCHEDULED') return;
    if (!appointment.patient.contactEmail) return;

    if (!appointment.clinician.remindersEnabled) {
      await this.cancelReminder(appointmentId);
      return;
    }

    const now = Date.now();
    const start = appointment.startTime.getTime();
    if (start <= now) return;

    const email = appointment.patient.contactEmail;
    const leadMs = appointment.clinician.reminderLeadHours * 60 * 60 * 1000;

    // ── Toque principal ────────────────────────────────────────────────
    let primaryFor: Date | null = new Date(start - leadMs);
    if (primaryFor.getTime() <= now) {
      primaryFor = start - now >= MIN_SAME_DAY_NOTICE_MS ? new Date() : null;
    }

    if (primaryFor) {
      await this.upsertReminder(
        appointmentId,
        ReminderKind.PRIMARY,
        email,
        primaryFor,
      );
    } else {
      await this.cancelReminderKind(appointmentId, ReminderKind.PRIMARY);
    }

    // ── Segundo toque (opcional) ───────────────────────────────────────
    const secondLeadHours = appointment.clinician.reminderSecondLeadHours;
    const secondValid =
      secondLeadHours !== null &&
      secondLeadHours > 0 &&
      secondLeadHours < appointment.clinician.reminderLeadHours;

    if (secondValid) {
      const secondFor = new Date(start - secondLeadHours * 60 * 60 * 1000);
      if (secondFor.getTime() > now) {
        await this.upsertReminder(
          appointmentId,
          ReminderKind.SECOND_TOUCH,
          email,
          secondFor,
        );
        return;
      }
    }

    await this.cancelReminderKind(appointmentId, ReminderKind.SECOND_TOUCH);
  }

  private async upsertReminder(
    appointmentId: string,
    kind: ReminderKind,
    patientEmail: string,
    scheduledFor: Date,
  ): Promise<void> {
    await this.prisma.appointmentReminder.upsert({
      where: { appointmentId_kind: { appointmentId, kind } },
      create: { appointmentId, kind, patientEmail, scheduledFor },
      update: {
        patientEmail,
        scheduledFor,
        status: ReminderStatus.PENDING,
        sentAt: null,
        failureReason: null,
        confirmationToken: null,
        confirmedAt: null,
      },
    });
  }

  private async cancelReminderKind(
    appointmentId: string,
    kind: ReminderKind,
  ): Promise<void> {
    await this.prisma.appointmentReminder.updateMany({
      where: { appointmentId, kind, status: ReminderStatus.PENDING },
      data: { status: ReminderStatus.CANCELLED },
    });
  }

  async cancelReminder(appointmentId: string): Promise<void> {
    await this.prisma.appointmentReminder.updateMany({
      where: {
        appointmentId,
        status: ReminderStatus.PENDING,
      },
      data: { status: ReminderStatus.CANCELLED },
    });
  }

  /** 'hoy' | 'mañana' | null (null ⇒ usar la fecha completa en el email). */
  private relativeDayLabel(
    startTime: Date,
    timezone: string,
  ): 'hoy' | 'mañana' | null {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const target = fmt.format(startTime);
    if (fmt.format(new Date()) === target) return 'hoy';
    if (fmt.format(new Date(Date.now() + 24 * 60 * 60 * 1000)) === target) {
      return 'mañana';
    }
    return null;
  }

  /**
   * Flujo LEGACY: confirmación con el token uuid guardado en el reminder.
   * Se mantiene una release para los emails ya enviados; los nuevos envíos
   * usan la capa de tokens del portal (PortalController).
   */
  async confirmAttendance(token: string): Promise<{
    success: boolean;
    message: string;
    appointmentDate?: Date;
    clinicianName?: string;
  }> {
    // Validate UUID format before hitting DB to avoid Prisma errors
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return { success: false, message: 'invalid' };
    }

    const reminder = await this.prisma.appointmentReminder.findUnique({
      where: { confirmationToken: token },
      include: {
        appointment: {
          include: {
            clinician: {
              select: {
                timezone: true,
                user: { select: { fullName: true } },
              },
            },
          },
        },
      },
    });

    if (!reminder) {
      return { success: false, message: 'invalid' };
    }

    if (reminder.confirmedAt) {
      return { success: false, message: 'already_confirmed' };
    }

    if (
      reminder.appointment.status === 'CANCELLED' ||
      reminder.appointment.status === 'COMPLETED'
    ) {
      return { success: false, message: 'appointment_inactive' };
    }

    await this.prisma.appointmentReminder.update({
      where: { id: reminder.id },
      data: { confirmedAt: new Date() },
    });

    return {
      success: true,
      message: 'confirmed',
      appointmentDate: reminder.appointment.startTime,
      clinicianName:
        reminder.appointment.clinician.user.fullName ?? 'Tu profesional',
    };
  }
}
