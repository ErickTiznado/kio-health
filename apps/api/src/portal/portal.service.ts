import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PortalTokenService } from './portal-token.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { RiskFlagsService } from '../risk-flags/risk-flags.service';
import { EmailService } from '../lib/email.service';
import {
  validateScaleScores,
  calculateScaleRiskLevel,
  PHQ9_SUICIDALITY_ITEM_INDEX,
} from '../lib/scales.util';

export type PortalActionFailure =
  | 'invalid_token'
  | 'not_found'
  | 'inactive'
  | 'already_confirmed'
  | 'already_requested';

export interface PortalAppointmentContext {
  ok: true;
  appointmentId: string;
  startTime: Date;
  formattedDate: string;
  formattedTime: string;
  clinicianName: string;
  confirmed: boolean;
  rescheduleRequested: boolean;
}

export type PortalActionResult =
  | { ok: false; reason: PortalActionFailure }
  | PortalAppointmentContext;

/** Escapa texto controlado por el paciente antes de inyectarlo en HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

@Injectable()
export class PortalService {
  private readonly logger = new Logger(PortalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly portalTokens: PortalTokenService,
    private readonly appointmentsService: AppointmentsService,
    private readonly riskFlagsService: RiskFlagsService,
    private readonly emailService: EmailService,
  ) {}

  private formatInTimezone(date: Date, timezone: string) {
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

  /**
   * Resuelve token + cita del paciente con los datos mínimos para la página.
   * Techo de PHI: fecha/hora, nombre del profesional y estado. Nada clínico.
   */
  async getActionContext(
    rawToken: string,
    appointmentId: string,
  ): Promise<PortalActionResult> {
    const resolved = await this.portalTokens.resolvePatient(rawToken);
    if (!resolved) return { ok: false, reason: 'invalid_token' };

    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, patientId: resolved.patientId },
      select: {
        id: true,
        startTime: true,
        status: true,
        rescheduleRequestedAt: true,
        clinician: {
          select: { timezone: true, user: { select: { fullName: true } } },
        },
        reminders: { select: { confirmedAt: true } },
      },
    });

    if (!appointment) return { ok: false, reason: 'not_found' };
    if (appointment.status !== 'SCHEDULED') {
      return { ok: false, reason: 'inactive' };
    }

    const { formattedDate, formattedTime } = this.formatInTimezone(
      appointment.startTime,
      appointment.clinician.timezone,
    );

    return {
      ok: true,
      appointmentId: appointment.id,
      startTime: appointment.startTime,
      formattedDate,
      formattedTime,
      clinicianName: appointment.clinician.user.fullName ?? 'Tu profesional',
      confirmed: appointment.reminders.some((r) => r.confirmedAt !== null),
      rescheduleRequested: appointment.rescheduleRequestedAt !== null,
    };
  }

  /** Marca la asistencia como confirmada (idempotente a nivel de UX). */
  async confirmAttendance(
    rawToken: string,
    appointmentId: string,
  ): Promise<PortalActionResult> {
    const context = await this.getActionContext(rawToken, appointmentId);
    if (!context.ok) return context;
    if (context.confirmed) return { ok: false, reason: 'already_confirmed' };

    await this.prisma.appointmentReminder.updateMany({
      where: { appointmentId: context.appointmentId },
      data: { confirmedAt: new Date() },
    });

    return { ...context, confirmed: true };
  }

  /** Cancela la cita en nombre del paciente y avisa al clínico por email. */
  async cancelAppointment(
    rawToken: string,
    appointmentId: string,
  ): Promise<PortalActionResult> {
    const resolved = await this.portalTokens.resolvePatient(rawToken);
    if (!resolved) return { ok: false, reason: 'invalid_token' };

    const context = await this.getActionContext(rawToken, appointmentId);
    if (!context.ok) return context;

    const updated = await this.appointmentsService.cancelByPatient(
      appointmentId,
      resolved.patientId,
    );

    // Aviso al clínico — best-effort: la cancelación ya ocurrió.
    try {
      await this.emailService.sendPatientCancellationNotice({
        to: updated.clinician.user.email,
        patientName: updated.patient.fullName,
        appointmentDate: updated.startTime,
        timezone: updated.clinician.timezone,
      });
    } catch (error) {
      this.logger.error(
        `No se pudo notificar la cancelación al clínico: ${String(error)}`,
      );
    }

    return context;
  }

  // ── Lado clínico ─────────────────────────────────────────────────────────

  /**
   * Asigna un cuestionario pre-sesión a una cita y envía el link del portal
   * al paciente. Idempotente: re-asignar una PENDING reenvía el email.
   */
  async assignScale(
    clinicianId: string,
    appointmentId: string,
    scaleType: 'PHQ9' | 'GAD7',
  ) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, clinicianId, status: 'SCHEDULED' },
      select: {
        id: true,
        patientId: true,
        patient: { select: { fullName: true, contactEmail: true } },
        clinician: { select: { user: { select: { fullName: true } } } },
      },
    });
    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }
    if (!appointment.patient.contactEmail) {
      throw new BadRequestException(
        'El paciente no tiene correo de contacto registrado',
      );
    }

    const assignment = await this.prisma.scaleAssignment.upsert({
      where: {
        appointmentId_scaleType: { appointmentId, scaleType },
      },
      update: { status: 'PENDING', completedAt: null },
      create: {
        appointmentId,
        patientId: appointment.patientId,
        scaleType,
      },
    });

    const token = await this.portalTokens.issueToken(appointment.patientId);
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';

    await this.emailService.sendScaleAssignmentEmail({
      to: appointment.patient.contactEmail,
      patientName: appointment.patient.fullName,
      clinicianName: appointment.clinician.user.fullName ?? 'Tu profesional',
      scaleType,
      portalUrl: `${frontendUrl}/p/${token}`,
    });

    return assignment;
  }

  // ── API JSON del portal SPA ──────────────────────────────────────────────
  // Techo de PHI: NUNCA diagnóstico, notas, teléfono ni histórico clínico.

  /** Identidad mínima para el chrome del portal. */
  async getPortalSession(rawToken: string) {
    const resolved = await this.portalTokens.resolvePatient(rawToken);
    if (!resolved) return null;

    const patient = await this.prisma.patient.findUnique({
      where: { id: resolved.patientId },
      select: {
        fullName: true,
        clinician: {
          select: { timezone: true, user: { select: { fullName: true } } },
        },
      },
    });
    if (!patient) return null;

    return {
      patientFirstName: patient.fullName.split(' ')[0],
      clinicianName: patient.clinician.user.fullName ?? 'Tu profesional',
      timezone: patient.clinician.timezone,
    };
  }

  /** Citas SCHEDULED de los próximos 60 días — solo horario y estado. */
  async listAppointments(rawToken: string) {
    const resolved = await this.portalTokens.resolvePatient(rawToken);
    if (!resolved) return null;

    const now = new Date();
    const horizon = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        patientId: resolved.patientId,
        status: 'SCHEDULED',
        startTime: { gte: now, lte: horizon },
      },
      orderBy: { startTime: 'asc' },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        type: true,
        rescheduleRequestedAt: true,
        reminders: { select: { confirmedAt: true } },
      },
    });

    return appointments.map((a) => ({
      id: a.id,
      startTime: a.startTime,
      endTime: a.endTime,
      type: a.type,
      confirmed: a.reminders.some((r) => r.confirmedAt !== null),
      rescheduleRequested: a.rescheduleRequestedAt !== null,
    }));
  }

  /** Cuestionarios pendientes asignados a citas vigentes. */
  async listScaleAssignments(rawToken: string) {
    const resolved = await this.portalTokens.resolvePatient(rawToken);
    if (!resolved) return null;

    return this.prisma.scaleAssignment.findMany({
      where: {
        patientId: resolved.patientId,
        status: 'PENDING',
        appointment: { status: 'SCHEDULED' },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        scaleType: true,
        createdAt: true,
        appointment: { select: { startTime: true } },
      },
    });
  }

  /**
   * Auto-reporte del paciente: guarda la escala (source PATIENT), completa la
   * asignación, recalcula banderas y detecta crisis (ítem 9 del PHQ-9 o total
   * SEVERE) → email urgente al clínico + pantalla de recursos en el portal.
   */
  async submitScaleAssignment(
    rawToken: string,
    assignmentId: string,
    scores: number[],
  ): Promise<
    | { ok: false; reason: 'invalid_token' | 'not_found' }
    | { ok: true; crisis: boolean }
  > {
    const resolved = await this.portalTokens.resolvePatient(rawToken);
    if (!resolved) return { ok: false, reason: 'invalid_token' };

    const assignment = await this.prisma.scaleAssignment.findFirst({
      where: {
        id: assignmentId,
        patientId: resolved.patientId,
        status: 'PENDING',
      },
      select: {
        id: true,
        scaleType: true,
        appointmentId: true,
        patient: {
          select: {
            fullName: true,
            clinician: {
              select: { user: { select: { email: true } } },
            },
          },
        },
      },
    });
    if (!assignment) return { ok: false, reason: 'not_found' };

    validateScaleScores(assignment.scaleType, scores);
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const riskLevel = calculateScaleRiskLevel(assignment.scaleType, totalScore);

    await this.prisma.$transaction([
      this.prisma.clinicalScale.upsert({
        where: {
          appointmentId_scaleType: {
            appointmentId: assignment.appointmentId,
            scaleType: assignment.scaleType,
          },
        },
        update: {
          scores,
          totalScore,
          riskLevel,
          source: 'PATIENT',
        },
        create: {
          appointmentId: assignment.appointmentId,
          patientId: resolved.patientId,
          scaleType: assignment.scaleType,
          scores,
          totalScore,
          riskLevel,
          source: 'PATIENT',
        },
      }),
      this.prisma.scaleAssignment.update({
        where: { id: assignment.id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      }),
    ]);

    await this.riskFlagsService.recalculateForAppointment({
      patientId: resolved.patientId,
      clinicianId: resolved.clinicianId,
      appointmentId: assignment.appointmentId,
    });

    const suicidalityFlag =
      assignment.scaleType === 'PHQ9' &&
      scores[PHQ9_SUICIDALITY_ITEM_INDEX] > 0;
    const crisis = suicidalityFlag || riskLevel === 'SEVERE';

    if (crisis) {
      try {
        await this.emailService.sendUrgentScaleAlert({
          to: assignment.patient.clinician.user.email,
          patientName: assignment.patient.fullName,
          scaleType: assignment.scaleType,
          totalScore,
          riskLevel,
          suicidalityFlag,
        });
      } catch (error) {
        this.logger.error(
          `No se pudo enviar la alerta urgente de escala: ${String(error)}`,
        );
      }
    }

    return { ok: true, crisis };
  }

  /** Registra la solicitud de reprogramación y avisa al clínico. */
  async requestReschedule(
    rawToken: string,
    appointmentId: string,
    message?: string,
  ): Promise<PortalActionResult> {
    const context = await this.getActionContext(rawToken, appointmentId);
    if (!context.ok) return context;
    if (context.rescheduleRequested) {
      return { ok: false, reason: 'already_requested' };
    }

    const trimmed = message?.trim().slice(0, 500);

    const updated = await this.prisma.appointment.update({
      where: { id: context.appointmentId },
      data: { rescheduleRequestedAt: new Date() },
      select: {
        startTime: true,
        patient: { select: { fullName: true } },
        clinician: {
          select: { timezone: true, user: { select: { email: true } } },
        },
      },
    });

    try {
      await this.emailService.sendRescheduleRequestNotice({
        to: updated.clinician.user.email,
        patientName: updated.patient.fullName,
        appointmentDate: updated.startTime,
        timezone: updated.clinician.timezone,
        message: trimmed ? escapeHtml(trimmed) : undefined,
      });
    } catch (error) {
      this.logger.error(
        `No se pudo notificar la solicitud de reprogramación: ${String(error)}`,
      );
    }

    return { ...context, rescheduleRequested: true };
  }
}
