import {
  Injectable,
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
import { CreatePsychNoteDto, NoteTemplateType } from './dto/create-psych-note.dto';
import { CreateAnthropometryDto } from './dto/create-anthropometry.dto';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { CreateClinicalScaleDto } from './dto/create-clinical-scale.dto';
import { EncryptionService } from '../lib/encryption.service';
import { ScaleType, ScaleRiskLevel } from '#generated/prisma';
import { ExportService } from '../export/export.service';

import { EventEmitter2 } from '@nestjs/event-emitter';

import { startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exportService: ExportService,
    private readonly eventEmitter: EventEmitter2,
    private readonly encryptionService: EncryptionService,
  ) { }

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
  async findByDate(clinicianId: string, dateString?: string, from?: string, to?: string) {

    let startOfRange: Date;
    let endOfRange: Date;

    if (from && to) {
      startOfRange = new Date(from);
      startOfRange.setHours(0, 0, 0, 0);
      endOfRange = new Date(to);
      endOfRange.setDate(endOfRange.getDate() + 1); // Buffer for timezone spillover
      endOfRange.setHours(23, 59, 59, 999);
    } else {
      const targetDate = dateString ? new Date(dateString) : new Date();
      startOfRange = new Date(targetDate);
      startOfRange.setHours(0, 0, 0, 0);
      endOfRange = new Date(targetDate);
      endOfRange.setDate(endOfRange.getDate() + 1); // Buffer
      endOfRange.setHours(23, 59, 59, 999);
    }

    const results = await this.prisma.appointment.findMany({
      where: {
        clinicianId: clinicianId,
        startTime: { gte: startOfRange, lte: endOfRange },
      },
      include: {
        patient: { select: { id: true, fullName: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    return results;
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
  async getDaySummary(clinicianId: string, from: string, to: string) {

    const startOfRange = new Date(from);
    startOfRange.setHours(0, 0, 0, 0);
    const endOfRange = new Date(to);
    endOfRange.setHours(23, 59, 59, 999);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        clinicianId: clinicianId,
        startTime: { gte: startOfRange, lte: endOfRange },
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
      const dayKey = apt.startTime.toISOString().split('T')[0];

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

    return {
      ...appointment,
      patient: decryptedPatient,
      sessionNumber: completedSessions + 1,
    };
  }

  /**
   * Count completed appointments that don't have an associated psych note yet.
   * Used by the PendingNotesWidget on the dashboard.
   */
  async getPendingNotesCount(clinicianId: string): Promise<{ count: number }> {

    const count = await this.prisma.appointment.count({
      where: {
        clinicianId: clinicianId,
        status: 'COMPLETED',
        psychNote: null,
      },
    });

    return { count };
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
    const appointment = await this.findAppointmentOrFail(appointmentId, clinicianId);


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

    const anthropometry = await this.prisma.anthropometry.findUnique({
      where: { appointmentId },
    });

    const mealPlan = await this.prisma.mealPlan.findUnique({
      where: { appointmentId },
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
    },
    lastVisit: lastVisit?.startTime || null,
    sessionNumber,
    anthropometry,
    mealPlan,
    clinicalScales,
  };
  }

  /* ── Psych Notes ─────────────────────────────── */

  /**
   * Get the clinical note for an appointment.
   * Decrypts private notes before returning.
   */
  async getPsychNote(clinicianId: string, appointmentId: string) {
    const appointment = await this.findAppointmentOrFail(appointmentId, clinicianId);


    const note = await this.prisma.psychNote.findUnique({
      where: { appointmentId },
    });

    if (!note) return null;

    // Decrypt content — throws if ciphertext is tampered (GCM auth tag mismatch)
    if (typeof note.content === 'string') {
      const decryptedContentStr = this.encryptionService.decrypt(note.content as string);
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
    const appointment = await this.findAppointmentOrFail(appointmentId, clinicianId);


    // Check 24h edit rule (Integridad Clínica)
    const now = new Date();
    const deadline = new Date(appointment.endTime);
    deadline.setHours(deadline.getHours() + 24);

    if (now > deadline) {
      const existing = await this.prisma.psychNote.findUnique({ where: { appointmentId } });
      if (existing) {
        throw new ForbiddenException('Edición bloqueada: Han pasado más de 24 horas desde la sesión y la nota clínica no puede ser alterada por motivos de integridad legal.');
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
    return this.prisma.$transaction(async (tx) => {
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
  }

  private validateNoteContent(type: NoteTemplateType, content: any) {
    if (type === NoteTemplateType.SOAP) {
      if (!content || typeof content !== 'object') {
        throw new BadRequestException('El contenido de la nota SOAP debe ser un objeto');
      }
      // Allow empty strings during auto-save — keys just need to exist
      const requiredKeys = ['s', 'o', 'a', 'p'];
      for (const key of requiredKeys) {
        if (!(key in content)) {
          throw new BadRequestException(`La nota SOAP debe contener el campo '${key}'`);
        }
      }
    } else if (type === NoteTemplateType.FREE) {
      if (!content || !('body' in content)) {
        throw new BadRequestException('La nota libre debe contener el campo de cuerpo (body)');
      }
    }
  }

  async togglePin(clinicianId: string, appointmentId: string) {
    const appointment = await this.findAppointmentOrFail(appointmentId, clinicianId);


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

  async exportPdf(clinicianId: string, appointmentId: string, includePrivate: boolean) {
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
    if (appointment.psychNote && typeof appointment.psychNote.content === 'string') {
      const decContentStr = this.encryptionService.decrypt(appointment.psychNote.content);
      appointment.psychNote.content = JSON.parse(decContentStr);
    }

    const buffer = await this.exportService.generateSessionPdf(appointment, includePrivate);
    return { buffer, patientId: appointment.patientId };
  }

  async upsertAnthropometry(
    clinicianId: string,
    appointmentId: string,
    dto: CreateAnthropometryDto,
  ) {
    const appointment = await this.findAppointmentOrFail(appointmentId, clinicianId);


    return this.prisma.anthropometry.upsert({
      where: { appointmentId },
      update: dto,
      create: {
        appointmentId,
        patientId: appointment.patientId,
        ...dto,
      },
    });
  }

  async upsertMealPlan(
    clinicianId: string,
    appointmentId: string,
    dto: CreateMealPlanDto,
  ) {
    const appointment = await this.findAppointmentOrFail(appointmentId, clinicianId);


    return this.prisma.mealPlan.upsert({
      where: { appointmentId },
      update: dto,
      create: {
        appointmentId,
        patientId: appointment.patientId,
        ...dto,
      },
    });
  }

  async upsertClinicalScale(
    clinicianId: string,
    appointmentId: string,
    dto: CreateClinicalScaleDto,
  ) {
    const appointment = await this.findAppointmentOrFail(appointmentId, clinicianId);

    const expectedLength = dto.scaleType === ScaleType.PHQ9 ? 9 : 7;
    if (dto.scores.length !== expectedLength) {
      throw new BadRequestException(
        `${dto.scaleType} requires exactly ${expectedLength} scores, got ${dto.scores.length}`,
      );
    }

    const totalScore = dto.scores.reduce((a, b) => a + b, 0);
    const riskLevel = this.calculateScaleRiskLevel(dto.scaleType, totalScore);

    return this.prisma.clinicalScale.upsert({
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
      },
      create: {
        appointmentId,
        patientId: appointment.patientId,
        scaleType: dto.scaleType,
        scores: dto.scores,
        totalScore,
        riskLevel,
      },
    });
  }

  private calculateScaleRiskLevel(scaleType: ScaleType, total: number): ScaleRiskLevel {
    if (scaleType === ScaleType.PHQ9) {
      if (total <= 4) return ScaleRiskLevel.MINIMAL;
      if (total <= 9) return ScaleRiskLevel.MILD;
      if (total <= 14) return ScaleRiskLevel.MODERATE;
      if (total <= 19) return ScaleRiskLevel.MODERATELY_SEVERE;
      return ScaleRiskLevel.SEVERE;
    } else {
      // GAD-7
      if (total <= 4) return ScaleRiskLevel.MINIMAL;
      if (total <= 9) return ScaleRiskLevel.MILD;
      if (total <= 14) return ScaleRiskLevel.MODERATE;
      return ScaleRiskLevel.SEVERE;
    }
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

    return this.prisma.appointment.create({
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
  }

  /**
   * Reschedule an existing appointment.
   * - Keeps the same duration unless a new one is provided.
   * - Validates time slot overlap (excluding itself).
   */
  async reschedule(clinicianId: string, appointmentId: string, dto: RescheduleAppointmentDto) {
    const appointment = await this.findAppointmentOrFail(appointmentId, clinicianId);


    const originalDurationMs = appointment.endTime.getTime() - appointment.startTime.getTime();
    const newDurationMs = dto.duration ? dto.duration * 60 * 1000 : originalDurationMs;

    const newStartTime = new Date(dto.startTime);
    const newEndTime = new Date(newStartTime.getTime() + newDurationMs);

    // Validate overlap excluding this appointment
    await this.validateOverlap(clinicianId, newStartTime, newEndTime, appointmentId);

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        startTime: newStartTime,
        endTime: newEndTime,
      },
      include: {
        patient: { select: { id: true, fullName: true } },
      },
    });
  }

  /**
   * Check if a time range overlaps with any existing appointment for the clinician.
   * Excludes CANCELLED and NO_SHOW statuses.
   */
  private async validateOverlap(
    clinicianId: string,
    start: Date,
    end: Date,
    excludeAppointmentId?: string,
  ) {
    const overlapping = await this.prisma.appointment.findFirst({
      where: {
        clinicianId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } },
        ],
      },
    });

    if (overlapping) {
      throw new ConflictException(
        'El horario seleccionado entra en conflicto con otra cita existente.',
      );
    }
  }

  /**
   * Start a scheduled session → IN_PROGRESS.
   */
  async startSession(clinicianId: string, appointmentId: string) {
    const appointment = await this.findAppointmentOrFail(appointmentId, clinicianId);


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
    const appointment = await this.findAppointmentOrFail(appointmentId, clinicianId);


    if (appointment.status !== 'SCHEDULED') {
      throw new BadRequestException(
        `Cannot cancel an appointment that is ${appointment.status}`,
      );
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
      include: { patient: { select: { id: true, fullName: true } } },
    });
  }

  /**
   * Mark a scheduled appointment as NO_SHOW.
   */
  async markNoShow(clinicianId: string, appointmentId: string) {
    const appointment = await this.findAppointmentOrFail(appointmentId, clinicianId);


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
    const appointment = await this.findAppointmentOrFail(appointmentId, clinicianId);


    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { notes },
    });
  }

  /**
   * Update payment status for an appointment.
   * If status is PAID, emit appointment.paid event.
   */
  async updatePayment(clinicianId: string, appointmentId: string, dto: UpdatePaymentDto) {
    const appointment = await this.findAppointmentOrFail(appointmentId, clinicianId);


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
    const appointment = await this.findAppointmentOrFail(appointmentId, clinicianId);



    return this.prisma.$transaction(async (tx) => {
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

  private async findAppointmentOrFail(appointmentId: string, clinicianId: string) {
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
