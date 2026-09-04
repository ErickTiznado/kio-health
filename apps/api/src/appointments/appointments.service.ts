import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CompleteCheckoutDto } from './dto/complete-checkout.dto';
import {
  CreatePsychNoteDto,
  NoteTemplateType,
} from './dto/create-psych-note.dto';
import { CreateClinicalScaleDto } from './dto/create-clinical-scale.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { EncryptionService } from '../lib/encryption.service';
import { isValidTimeZone, zonedDayKey, zonedRange } from '../lib/timezone.util';
import {
  validateScaleScores,
  calculateScaleRiskLevel,
} from '../lib/scales.util';
import { ExportService } from '../export/export.service';
import { GoogleCalendarService } from '../integrations/google-calendar.service';

import { RiskFlagsService } from '../risk-flags/risk-flags.service';

import { EventEmitter2 } from '@nestjs/event-emitter';

import { startOfMonth, endOfMonth } from 'date-fns';

import type { Prisma } from '#generated/prisma';

/**
 * Tope de ids devueltos por `getPendingNotesCount`. El `count` sigue siendo
 * exacto; esto solo acota el payload — nadie enlaza a doscientas sesiones.
 */
const PENDING_NOTES_ID_CAP = 50;

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly exportService: ExportService,
    private readonly eventEmitter: EventEmitter2,
    private readonly encryptionService: EncryptionService,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly riskFlagsService: RiskFlagsService,
  ) {}

  async getMonthDensity(clinicianId: string, date: Date | string) {
    const targetDate = new Date(date);
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        clinicianId: clinicianId,
        startTime: { gte: start, lte: end },
        status: { not: 'CANCELLED' },
      },
      select: { startTime: true },
    });

    const density: Record<string, number> = {};

    appointments.forEach((apt) => {
      const day = apt.startTime.toISOString().split('T')[0];
      density[day] = (density[day] || 0) + 1;
    });

    return Object.entries(density).map(([date, count]) => ({ date, count }));
  }

  /**
   * Find appointments for a specific clinician.
   * Supports single date (date) or range (from/to).
   */
  async findByDate(
    clinicianId: string,
    dateString?: string,
    from?: string,
    to?: string,
    tz?: string,
  ) {
    const zone = tz && isValidTimeZone(tz) ? tz : 'UTC';

    // Day boundaries are the CLINICIAN's, computed in `zone`. The previous
    // implementation parsed the date as UTC, snapped it with `setHours` in the
    // server's zone and then padded a whole extra day "for spillover" — a
    // two-day window starting one day early, which is how "Agenda de hoy" ended
    // up listing yesterday's sessions.
    const day = dateString ?? zonedDayKey(new Date(), zone);
    const { start: startOfRange, end: endOfRange } =
      from && to ? zonedRange(from, to, zone) : zonedRange(day, day, zone);

    const results = await this.prisma.appointment.findMany({
      where: {
        clinicianId: clinicianId,
        // Half-open: `lt`, not `lte`. The end instant is the next day's start.
        startTime: { gte: startOfRange, lt: endOfRange },
      },
      include: {
        patient: { select: { id: true, fullName: true } },
        // Solo el recordatorio principal; el shape hacia el frontend sigue
        // siendo `reminder` singular (ver map de abajo).
        reminders: {
          where: { kind: 'PRIMARY' },
          select: { status: true, sentAt: true, confirmedAt: true },
          take: 1,
        },
        // SOLO el `id`. `content` y `privateNotes` van cifrados (AES-256-GCM,
        // ver `exportPdf`): incluirlos volcaria blobs cifrados en cada celda de
        // la agenda. Y ni el id sale al cliente: abajo se colapsa a `hasNote`.
        psychNote: { select: { id: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    return results.map(({ reminders, psychNote, ...apt }) => ({
      ...apt,
      reminder: reminders[0] ?? null,
      // La agenda solo necesita saber SI hay nota (filtro `?pendingNotes=true`).
      // Un booleano no filtra ids de notas clinicas a una vista de calendario.
      hasNote: psychNote !== null,
    }));
  }

  /**
   * Get recent unique patients from the clinician's completed appointments.
   * Returns the last 6 unique patients with their most recent appointment info.
   */
  async getRecentPatients(clinicianId: string) {
    const recentAppointments = await this.prisma.appointment.findMany({
      where: {
        clinicianId: clinicianId,
        status: { in: ['COMPLETED', 'SCHEDULED'] },
      },
      include: {
        patient: { select: { id: true, fullName: true } },
      },
      orderBy: { startTime: 'desc' },
      take: 30,
    });

    // Deduplicate by patient, keeping the most recent appointment
    const seen = new Set<string>();
    const uniquePatients: Array<{
      id: string;
      name: string;
      reason: string | null;
      lastAppointmentTime: Date;
    }> = [];

    for (const apt of recentAppointments) {
      if (seen.has(apt.patientId)) continue;
      seen.add(apt.patientId);
      uniquePatients.push({
        id: apt.patient.id,
        name: apt.patient.fullName,
        reason: apt.reason,
        lastAppointmentTime: apt.startTime,
      });
      if (uniquePatients.length >= 6) break;
    }

    return uniquePatients;
  }

  /**
   * Get a count of appointments per day for a given date range.
   * Used for the availability calendar widget.
   */
  async getDaySummary(
    clinicianId: string,
    from: string,
    to: string,
    tz?: string,
  ) {
    const zone = tz && isValidTimeZone(tz) ? tz : 'UTC';
    const { start: startOfRange, end: endOfRange } = zonedRange(from, to, zone);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        clinicianId: clinicianId,
        startTime: { gte: startOfRange, lt: endOfRange },
        status: { not: 'CANCELLED' },
      },
      select: { id: true, startTime: true, endTime: true },
      orderBy: { startTime: 'asc' },
    });

    // Group by date string
    const summary: Record<
      string,
      {
        count: number;
        appointments: Array<{
          id: string;
          startTime: string;
          duration: number;
        }>;
      }
    > = {};

    for (const apt of appointments) {
      // Bucket by the clinician's calendar day, not by UTC. Grouping on
      // `toISOString()` split a single local evening across two cells, which is
      // why the availability grid and the agenda reported different counts.
      const dayKey = zonedDayKey(apt.startTime, zone);

      if (!summary[dayKey]) {
        summary[dayKey] = { count: 0, appointments: [] };
      }

      summary[dayKey].count++;

      const durationMs = apt.endTime.getTime() - apt.startTime.getTime();
      const durationMinutes = Math.round(durationMs / 60000);

      summary[dayKey].appointments.push({
        id: apt.id,
        startTime: apt.startTime.toISOString(),
        duration: durationMinutes,
      });
    }

    return summary;
  }

  /**
   * Get the next upcoming scheduled appointment (from now onwards).
   * Includes expanded patient clinical data and the count of previous sessions.
   * Returns null if there are no future appointments.
   */
  async getNextUpcoming(clinicianId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        clinicianId: clinicianId,
        status: 'SCHEDULED',
        endTime: { gt: new Date() },
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            dateOfBirth: true,
            diagnosis: true,
            clinicalContext: true,
          },
        },
        reminders: {
          where: { kind: 'PRIMARY' },
          select: { status: true, sentAt: true, confirmedAt: true },
          take: 1,
        },
        // Mismo criterio que `findByDate`: solo el id, y hacia fuera un
        // booleano. Aqui la cita es SCHEDULED y futura, asi que casi siempre
        // sera `false`; se incluye para que el shape de una cita sea el mismo
        // en `GET /appointments` y en `GET /appointments/next`.
        psychNote: { select: { id: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    if (!appointment) return null;

    // Decrypt sensitive patient fields before returning
    const decryptedPatient = {
      ...appointment.patient,
      diagnosis: appointment.patient.diagnosis
        ? this.encryptionService.decrypt(appointment.patient.diagnosis)
        : null,
      clinicalContext: appointment.patient.clinicalContext
        ? this.encryptionService.decrypt(appointment.patient.clinicalContext)
        : null,
    };

    // Count previously completed sessions for context ("Sesión #N")
    const completedSessions = await this.prisma.appointment.count({
      where: {
        patientId: appointment.patientId,
        clinicianId: clinicianId,
        status: 'COMPLETED',
      },
    });

    const { reminders, psychNote, ...appointmentRest } = appointment;

    return {
      ...appointmentRest,
      reminder: reminders[0] ?? null,
      hasNote: psychNote !== null,
      patient: decryptedPatient,
      sessionNumber: completedSessions + 1,
    };
  }

  /**
   * Citas completadas que todavia no tienen nota clinica.
   *
   * Sin `from`/`to` cuenta el historico completo — exactamente lo de siempre,
   * que es lo que el dashboard llama hoy. Con rango aplica el mismo techo
   * temporal que `findByDate` y `getDaySummary` (`zonedRange` sobre la zona del
   * clinico), para que el numero del dashboard y el de la agenda puedan hablar
   * del mismo periodo en vez de contradecirse.
   *
   * Devuelve tambien los ids, acotados a `PENDING_NOTES_ID_CAP`, para poder
   * enlazar directo a `/session/:id` cuando se debe una sola nota. `count` es
   * siempre exacto aunque `appointmentIds` venga truncado.
   */
  async getPendingNotesCount(
    clinicianId: string,
    from?: string,
    to?: string,
    tz?: string,
  ): Promise<{ count: number; appointmentIds: string[] }> {
    const where: Prisma.AppointmentWhereInput = {
      clinicianId: clinicianId,
      status: 'COMPLETED',
      psychNote: null,
    };

    // Rango solo si vienen los dos extremos; el DTO ya rechaza medio rango.
    if (from && to) {
      const zone = tz && isValidTimeZone(tz) ? tz : 'UTC';
      const { start, end } = zonedRange(from, to, zone);
      // Half-open igual que en findByDate: `end` es el arranque del dia
      // siguiente, nunca `lte`.
      where.startTime = { gte: start, lt: end };
    }

    const [count, pending] = await Promise.all([
      this.prisma.appointment.count({ where }),
      this.prisma.appointment.findMany({
        where,
        select: { id: true },
        // Mas reciente primero: la nota que se acaba de deber es la que el
        // clinico busca al pulsar el widget.
        orderBy: { startTime: 'desc' },
        take: PENDING_NOTES_ID_CAP,
      }),
    ]);

    return { count, appointmentIds: pending.map((apt) => apt.id) };
  }

  /**
   * Get the full context for an active session.
   * Includes:
   * - Appointment details
   * - Patient basic info & clinical data
   * - Patient's total outstanding balance
   * - Last completed appointment date
   */
  async getSessionContext(clinicianId: string, appointmentId: string) {
    const appointment = await this.findAppointmentOrFail(
      appointmentId,
      clinicianId,
    );

    // Get patient with extended details
    const patient = await this.prisma.patient.findUnique({
      where: { id: appointment.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    // Get last completed appointment (visit)
    const lastVisit = await this.prisma.appointment.findFirst({
      where: {
        patientId: patient.id,
        status: 'COMPLETED',
        startTime: { lt: appointment.startTime }, // strictly before this one
      },
      orderBy: { startTime: 'desc' },
      select: { startTime: true },
    });

    const sessionNumber = await this.prisma.appointment.count({
      where: {
        patientId: appointment.patientId,
        clinicianId: clinicianId,
        status: { in: ['COMPLETED', 'IN_PROGRESS', 'SCHEDULED'] },
        startTime: { lte: appointment.startTime },
      },
    });

    const clinicalScales = await this.prisma.clinicalScale.findMany({
      where: { appointmentId },
      orderBy: { createdAt: 'asc' },
    });

    return {
      appointment,
      patient: {
        ...patient,
        diagnosis: patient.diagnosis
          ? this.encryptionService.decrypt(patient.diagnosis)
          : null,
        clinicalContext: patient.clinicalContext
          ? this.encryptionService.decrypt(patient.clinicalContext)
          : null,
        contactPhone: patient.contactPhone
          ? this.encryptionService.decrypt(patient.contactPhone)
          : null,
        emergencyContact: patient.emergencyContact
          ? JSON.parse(this.encryptionService.decrypt(patient.emergencyContact))
          : null,
        // Alergias y medicación alimentan el panel de contexto clínico de la
        // sesión. Sin descifrar aquí llegaban al front como ciphertext.
        medicacionActual: patient.medicacionActual
          ? this.encryptionService.decrypt(patient.medicacionActual)
          : null,
        alergias: patient.alergias
          ? this.encryptionService.decrypt(patient.alergias)
          : null,
      },
      lastVisit: lastVisit?.startTime || null,
      sessionNumber,
      clinicalScales,
    };
  }

  /* ── Psych Notes ─────────────────────────────── */

  /**
   * Get the clinical note for an appointment.
   * Decrypts private notes before returning.
   */
  async getPsychNote(clinicianId: string, appointmentId: string) {
    // Verifica pertenencia; el registro en si no se usa aqui.
    await this.findAppointmentOrFail(appointmentId, clinicianId);

    const note = await this.prisma.psychNote.findUnique({
      where: { appointmentId },
    });

    if (!note) return null;

    // Decrypt content — throws if ciphertext is tampered (GCM auth tag mismatch)
    if (typeof note.content === 'string') {
      const decryptedContentStr = this.encryptionService.decrypt(note.content);
      note.content = JSON.parse(decryptedContentStr);
    }

    // Decrypt private notes if present
    if (note.privateNotes) {
      const decrypted = this.encryptionService.decrypt(note.privateNotes);
      return { ...note, privateNotes: decrypted };
    }

    return note;
  }

  /**
   * Create or update a clinical note for an appointment.
   * Encrypts private notes before saving.
   */
  async upsertPsychNote(
    clinicianId: string,
    appointmentId: string,
    dto: CreatePsychNoteDto,
  ) {
    const appointment = await this.findAppointmentOrFail(
      appointmentId,
      clinicianId,
    );

    // Check 24h edit rule (Integridad Clínica)
    const now = new Date();
    const deadline = new Date(appointment.endTime);
    deadline.setHours(deadline.getHours() + 24);

    if (now > deadline) {
      const existing = await this.prisma.psychNote.findUnique({
        where: { appointmentId },
      });
      if (existing) {
        throw new ForbiddenException(
          'Edición bloqueada: Han pasado más de 24 horas desde la sesión y la nota clínica no puede ser alterada por motivos de integridad legal.',
        );
      }
    }

    // Validate content structure based on templateType
    this.validateNoteContent(dto.templateType, dto.content);

    // Encrypt content — throws on failure; never store plaintext
    const contentStr = JSON.stringify(dto.content);
    const encryptedContent = this.encryptionService.encrypt(contentStr);

    // Encrypt private notes if present
    let encryptedPrivateNotes: string | null = null;
    if (dto.privateNotes) {
      encryptedPrivateNotes = this.encryptionService.encrypt(dto.privateNotes);
    }

    // Check if note exists and update or create atomically
    const result = await this.prisma.$transaction(async (tx) => {
      const existingNote = await tx.psychNote.findUnique({
        where: { appointmentId },
      });

      if (existingNote) {
        // Update
        return tx.psychNote.update({
          where: { id: existingNote.id },
          data: {
            templateType: dto.templateType,
            content: encryptedContent,
            moodRating: dto.moodRating,
            privateNotes: encryptedPrivateNotes ?? existingNote.privateNotes,
            tags: dto.tags,
          },
        });
      } else {
        // Create
        return tx.psychNote.create({
          data: {
            appointmentId,
            patientId: appointment.patientId,
            templateType: dto.templateType,
            content: encryptedContent,
            moodRating: dto.moodRating,
            privateNotes: encryptedPrivateNotes,
            tags: dto.tags,
          },
        });
      }
    });

    // --- Risk Flags Calculation (compartido con escalas y portal) ---
    await this.riskFlagsService.recalculateForAppointment({
      patientId: appointment.patientId,
      clinicianId,
      appointmentId,
      tags: dto.tags || [],
    });

    return result;
  }

  private validateNoteContent(type: NoteTemplateType, content: any) {
    if (type === NoteTemplateType.SOAP) {
      if (!content || typeof content !== 'object') {
        throw new BadRequestException(
          'El contenido de la nota SOAP debe ser un objeto',
        );
      }
      // Allow empty strings during auto-save — keys just need to exist
      const requiredKeys = ['s', 'o', 'a', 'p'];
      for (const key of requiredKeys) {
        if (!(key in content)) {
          throw new BadRequestException(
            `La nota SOAP debe contener el campo '${key}'`,
          );
        }
      }
    } else if (type === NoteTemplateType.FREE) {
      if (!content || !('body' in content)) {
        throw new BadRequestException(
          'La nota libre debe contener el campo de cuerpo (body)',
        );
      }
    }
  }

  async togglePin(clinicianId: string, appointmentId: string) {
    // Verifica pertenencia; el registro en si no se usa aqui.
    await this.findAppointmentOrFail(appointmentId, clinicianId);

    const note = await this.prisma.psychNote.findUnique({
      where: { appointmentId },
    });

    if (!note) {
      throw new NotFoundException('No existe nota clínica para esta cita.');
    }

    return this.prisma.psychNote.update({
      where: { id: note.id },
      data: { isPinned: !note.isPinned },
    });
  }

  async exportPdf(
    clinicianId: string,
    appointmentId: string,
    includePrivate: boolean,
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        clinician: { include: { user: true } },
        psychNote: true,
      },
    });

    if (!appointment) throw new NotFoundException('Cita no encontrada');

    // Decrypt private notes if requested and present — throws on tampered ciphertext
    if (includePrivate && appointment.psychNote?.privateNotes) {
      appointment.psychNote.privateNotes = this.encryptionService.decrypt(
        appointment.psychNote.privateNotes,
      );
    } else if (appointment.psychNote) {
      appointment.psychNote.privateNotes = null;
    }

    // Decrypt content — throws on tampered ciphertext
    if (
      appointment.psychNote &&
      typeof appointment.psychNote.content === 'string'
    ) {
      const decContentStr = this.encryptionService.decrypt(
        appointment.psychNote.content,
      );
      appointment.psychNote.content = JSON.parse(decContentStr);
    }

    const buffer = await this.exportService.generateSessionPdf(
      appointment,
      includePrivate,
    );
    return { buffer, patientId: appointment.patientId };
  }

  async upsertClinicalScale(
    clinicianId: string,
    appointmentId: string,
    dto: CreateClinicalScaleDto,
  ) {
    const appointment = await this.findAppointmentOrFail(
      appointmentId,
      clinicianId,
    );

    validateScaleScores(dto.scaleType, dto.scores);

    const totalScore = dto.scores.reduce((a, b) => a + b, 0);
    const riskLevel = calculateScaleRiskLevel(dto.scaleType, totalScore);

    const scale = await this.prisma.clinicalScale.upsert({
      where: {
        appointmentId_scaleType: {
          appointmentId,
          scaleType: dto.scaleType,
        },
      },
      update: {
        scores: dto.scores,
        totalScore,
        riskLevel,
        // Re-entrada del clínico sobreescribe el auto-reporte del paciente.
        source: 'CLINICIAN',
      },
      create: {
        appointmentId,
        patientId: appointment.patientId,
        scaleType: dto.scaleType,
        scores: dto.scores,
        totalScore,
        riskLevel,
        source: 'CLINICIAN',
      },
    });

    // Antes las banderas solo se recalculaban al guardar la nota; ahora
    // también al guardar la escala (el método nunca lanza).
    await this.riskFlagsService.recalculateForAppointment({
      patientId: appointment.patientId,
      clinicianId,
      appointmentId,
    });

    return scale;
  }

  /* ── Status transition methods ─────────────────── */

  /* ── Creation & Rescheduling ──────────────────── */

  /**
   * Create a new appointment.
   * - Resolves default duration/price from profile if not provided in DTO.
   * - Validates time slot overlap.
   */
  async create(clinicianId: string, dto: CreateAppointmentDto) {
    const profile = await this.resolveClinicianProfile(clinicianId);
    const startTime = new Date(dto.startTime);
    const durationMinutes = dto.duration ?? profile.sessionDefaultDuration;
    const durationMs = durationMinutes * 60 * 1000;
    const endTime = new Date(startTime.getTime() + durationMs);

    // Validate overlap
    await this.validateOverlap(clinicianId, startTime, endTime);

    const appointment = await this.prisma.appointment.create({
      data: {
        clinicianId: clinicianId,
        patientId: dto.patientId,
        startTime,
        endTime,
        type: dto.type || 'CONSULTATION',
        reason: dto.reason,
        price: dto.price ?? profile.sessionDefaultPrice,
        status: 'SCHEDULED',
        paymentStatus: 'PENDING',
      },
      include: {
        patient: { select: { id: true, fullName: true } },
      },
    });

    const googleEventId = await this.googleCalendarService.syncAppointment(
      clinicianId,
      appointment,
      appointment.patient.fullName,
    );

    if (googleEventId) {
      await this.prisma.appointment.update({
        where: { id: appointment.id },
        data: { googleEventId },
      });
      appointment.googleEventId = googleEventId;
    }

    this.eventEmitter.emit('appointment.scheduled', { appointment });

    return appointment;
  }

  /**
   * Reschedule an existing appointment.
   * - Keeps the same duration unless a new one is provided.
   * - Validates time slot overlap (excluding itself).
   */
  async reschedule(
    clinicianId: string,
    appointmentId: string,
    dto: RescheduleAppointmentDto,
  ) {
    const appointment = await this.findAppointmentOrFail(
      appointmentId,
      clinicianId,
    );

    const originalDurationMs =
      appointment.endTime.getTime() - appointment.startTime.getTime();
    const newDurationMs = dto.duration
      ? dto.duration * 60 * 1000
      : originalDurationMs;

    const newStartTime = new Date(dto.startTime);
    const newEndTime = new Date(newStartTime.getTime() + newDurationMs);

    // Validate overlap excluding this appointment
    await this.validateOverlap(
      clinicianId,
      newStartTime,
      newEndTime,
      appointmentId,
    );

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        startTime: newStartTime,
        endTime: newEndTime,
      },
      include: {
        patient: { select: { id: true, fullName: true } },
      },
    });

    await this.googleCalendarService.syncAppointment(
      clinicianId,
      updated,
      updated.patient.fullName,
    );

    this.eventEmitter.emit('appointment.rescheduled', {
      appointment: updated,
    });

    return updated;
  }

  /**
   * Update editable appointment metadata: type, reason, price.
   * Does not affect scheduling — use reschedule() for date/time changes.
   */
  async updateAppointment(
    clinicianId: string,
    appointmentId: string,
    dto: UpdateAppointmentDto,
  ) {
    await this.findAppointmentOrFail(appointmentId, clinicianId);
    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.reason !== undefined && { reason: dto.reason }),
        ...(dto.price !== undefined && { price: dto.price }),
      },
      include: { patient: { select: { id: true, fullName: true } } },
    });
  }

  /**
   * Return all unique tags used in psych notes for this clinician's appointments.
   */
  async getUsedTags(clinicianId: string): Promise<string[]> {
    const notes = await this.prisma.psychNote.findMany({
      where: { appointment: { clinicianId } },
      select: { tags: true },
    });
    const allTags = notes.flatMap((n) => n.tags);
    return [...new Set(allTags)].sort();
  }

  /**
   * Check if a time range overlaps with any existing appointment for the clinician.
   * Excludes CANCELLED and NO_SHOW statuses. Public: SeriesService lo usa para
   * saltar (no abortar) ocurrencias en conflicto al materializar una serie.
   */
  async hasOverlap(
    clinicianId: string,
    start: Date,
    end: Date,
    excludeAppointmentId?: string,
  ): Promise<boolean> {
    const overlapping = await this.prisma.appointment.findFirst({
      where: {
        clinicianId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
      },
      select: { id: true },
    });

    return overlapping !== null;
  }

  /** Variante que lanza ConflictException — flujo de cita individual. */
  private async validateOverlap(
    clinicianId: string,
    start: Date,
    end: Date,
    excludeAppointmentId?: string,
  ) {
    if (await this.hasOverlap(clinicianId, start, end, excludeAppointmentId)) {
      throw new ConflictException(
        'El horario seleccionado entra en conflicto con otra cita existente.',
      );
    }
  }

  /**
   * Start a scheduled session → IN_PROGRESS.
   */
  async startSession(clinicianId: string, appointmentId: string) {
    const appointment = await this.findAppointmentOrFail(
      appointmentId,
      clinicianId,
    );

    if (appointment.status !== 'SCHEDULED') {
      throw new BadRequestException(
        `Cannot start a session that is ${appointment.status}`,
      );
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'IN_PROGRESS' },
      include: { patient: { select: { id: true, fullName: true } } },
    });
  }

  /**
   * Cancel a scheduled appointment → CANCELLED.
   */
  async cancelAppointment(clinicianId: string, appointmentId: string) {
    const appointment = await this.findAppointmentOrFail(
      appointmentId,
      clinicianId,
    );

    if (appointment.status !== 'SCHEDULED') {
      throw new BadRequestException(
        `Cannot cancel an appointment that is ${appointment.status}`,
      );
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
      include: { patient: { select: { id: true, fullName: true } } },
    });

    if (updated.googleEventId) {
      await this.googleCalendarService.deleteAppointment(
        clinicianId,
        updated.googleEventId,
      );
    }

    this.eventEmitter.emit('appointment.cancelled', { appointment: updated });

    return updated;
  }

  /**
   * Cancel a scheduled appointment on behalf of the PATIENT (portal/email link).
   * Ownership at query level: the appointment must belong to that patient —
   * a foreign appointment is simply not found. No clinician session involved.
   */
  async cancelByPatient(appointmentId: string, patientId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, patientId, status: 'SCHEDULED' },
      select: { id: true, clinicianId: true },
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: 'CANCELLED', cancelledBy: 'PATIENT' },
      include: {
        patient: { select: { id: true, fullName: true } },
        clinician: {
          select: {
            timezone: true,
            user: { select: { email: true, fullName: true } },
          },
        },
      },
    });

    if (updated.googleEventId) {
      await this.googleCalendarService.deleteAppointment(
        appointment.clinicianId,
        updated.googleEventId,
      );
    }

    // El listener existente cancela los recordatorios PENDING.
    this.eventEmitter.emit('appointment.cancelled', { appointment: updated });

    return updated;
  }

  /**
   * Mark a scheduled appointment as NO_SHOW.
   */
  async markNoShow(clinicianId: string, appointmentId: string) {
    const appointment = await this.findAppointmentOrFail(
      appointmentId,
      clinicianId,
    );

    if (appointment.status !== 'SCHEDULED') {
      throw new BadRequestException(
        `Cannot mark no-show for an appointment that is ${appointment.status}`,
      );
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'NO_SHOW' },
      include: { patient: { select: { id: true, fullName: true } } },
    });
  }

  /**
   * Update administrative/simple notes for an appointment.
   */
  async updateNotes(clinicianId: string, appointmentId: string, notes: string) {
    // Verifica pertenencia; el registro en si no se usa aqui.
    await this.findAppointmentOrFail(appointmentId, clinicianId);

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { notes },
    });
  }

  /**
   * Update payment status for an appointment.
   * If status is PAID, emit appointment.paid event.
   */
  async updatePayment(
    clinicianId: string,
    appointmentId: string,
    dto: UpdatePaymentDto,
  ) {
    // Verifica pertenencia; el registro en si no se usa aqui.
    await this.findAppointmentOrFail(appointmentId, clinicianId);

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Update Appointment
      const updatedAppointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          paymentStatus: dto.status,
          paymentMethod: dto.method,
          // Only update price if provided
          price: dto.amount !== undefined ? dto.amount : undefined,
        },
        include: {
          patient: { select: { id: true, fullName: true } },
        },
      });

      if (dto.status === 'PENDING') {
        // If switched back to PENDING, delete the transaction if it exists.
        // Keeping this logic for consistency, but relying on event for creation.
        await tx.financeTransaction.deleteMany({
          where: { appointmentId },
        });
      }

      return updatedAppointment;
    });

    if (dto.status === 'PAID') {
      this.eventEmitter.emit('appointment.paid', { appointment: result });
    }

    return result;
  }

  /**
   * Complete a session checkout: mark appointment as COMPLETED,
   * record payment, create a finance transaction, and optionally
   * schedule the next appointment.
   */
  async completeCheckout(
    clinicianId: string,
    appointmentId: string,
    dto: CompleteCheckoutDto,
  ) {
    const appointment = await this.findAppointmentOrFail(
      appointmentId,
      clinicianId,
    );

    // Una cita de serie ya tiene su siguiente sesión materializada — crear
    // otra a mano duplicaría el slot recurrente.
    if (appointment.seriesId && dto.nextAppointmentDate) {
      throw new BadRequestException(
        'Esta cita pertenece a una serie recurrente: la próxima sesión ya está agendada automáticamente.',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Mark appointment as completed with payment info
      const updatedAppointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'COMPLETED',
          paymentStatus: dto.paymentStatus,
          paymentMethod: dto.paymentMethod,
          price: dto.amount,
        },
        include: {
          patient: { select: { id: true, fullName: true } },
        },
      });

      // 2. Create finance transaction linked to appointment
      //
      // `date` se deja SIN pasar a proposito: cae al `@default(now())` del
      // schema, es decir el instante real del cobro. Es criterio de caja — el
      // dinero entra cuando se cierra la sesion, no en la fecha civil de la
      // cita — y ademas evita que un checkout hecho al dia siguiente reabra el
      // total de un mes ya cerrado.
      //
      // Contrapartida asumida: los movimientos creados a mano en finance si
      // llevan fecha civil (el usuario la elige). Si el carril de finance pasa
      // a normalizar `date` a medianoche civil para TODOS los movimientos, este
      // punto deja de ser coherente y hay que decidirlo alli, no aqui: la
      // semantica de un ingreso automatico la fija el modulo que lo lee.
      await tx.financeTransaction.create({
        data: {
          clinicianId: clinicianId,
          appointmentId,
          type: 'INCOME',
          amount: dto.amount,
          description: `Sesión — ${appointment.patient.fullName}`,
        },
      });

      // 3. Schedule next appointment if date provided
      let nextAppointment = null;

      if (dto.nextAppointmentDate) {
        const nextStart = new Date(dto.nextAppointmentDate);
        nextStart.setHours(
          appointment.startTime.getHours(),
          appointment.startTime.getMinutes(),
          0,
          0,
        );

        const durationMs =
          appointment.endTime.getTime() - appointment.startTime.getTime();
        const nextEnd = new Date(nextStart.getTime() + durationMs);

        nextAppointment = await tx.appointment.create({
          data: {
            patientId: appointment.patientId,
            clinicianId: clinicianId,
            startTime: nextStart,
            endTime: nextEnd,
            status: 'SCHEDULED',
            paymentStatus: 'PENDING',
            price: dto.amount,
          },
          include: {
            patient: { select: { id: true, fullName: true } },
          },
        });
      }

      return { updatedAppointment, nextAppointment };
    });

    if (result.nextAppointment) {
      this.eventEmitter.emit('appointment.scheduled', {
        appointment: result.nextAppointment,
      });
    }

    return result;
  }

  /* ── Private helpers (SRP) ─────────────────────── */

  private async resolveClinicianProfile(clinicianId: string) {
    const profile = await this.prisma.clinicianProfile.findUnique({
      where: { id: clinicianId },
    });

    if (!profile) {
      throw new NotFoundException('Perfil de clínico no encontrado');
    }

    return profile;
  }

  private async findAppointmentOrFail(
    appointmentId: string,
    clinicianId: string,
  ) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, clinicianId },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new ForbiddenException('Cita no encontrada o acceso denegado');
    }

    return appointment;
  }
}
