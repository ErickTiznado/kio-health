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
import { EncryptionService } from '../lib/encryption';
import { ExportService } from '../export/export.service';

import { EventEmitter2 } from '@nestjs/event-emitter';

import { startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exportService: ExportService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async getMonthDensity(userId: string, date: Date | string) {
    const profile = await this.resolveClinicianProfile(userId);
    const targetDate = new Date(date);
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        clinicianId: profile.id,
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
  async findByDate(userId: string, dateString?: string, from?: string, to?: string) {
    const profile = await this.resolveClinicianProfile(userId);

    let startOfRange: Date;
    let endOfRange: Date;

    if (from && to) {
      startOfRange = new Date(from);
      startOfRange.setHours(0, 0, 0, 0);
      endOfRange = new Date(to);
      endOfRange.setHours(23, 59, 59, 999);
    } else {
      const targetDate = dateString ? new Date(dateString) : new Date();
      startOfRange = new Date(targetDate);
      startOfRange.setHours(0, 0, 0, 0);
      endOfRange = new Date(targetDate);
      endOfRange.setHours(23, 59, 59, 999);
    }

    return this.prisma.appointment.findMany({
      where: {
        clinicianId: profile.id,
        startTime: { gte: startOfRange, lte: endOfRange },
      },
      include: {
        patient: { select: { id: true, fullName: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * Get recent unique patients from the clinician's completed appointments.
   * Returns the last 6 unique patients with their most recent appointment info.
   */
  async getRecentPatients(userId: string) {
    const profile = await this.resolveClinicianProfile(userId);

    const recentAppointments = await this.prisma.appointment.findMany({
      where: {
        clinicianId: profile.id,
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
  async getDaySummary(userId: string, from: string, to: string) {
    const profile = await this.resolveClinicianProfile(userId);

    const startOfRange = new Date(from);
    startOfRange.setHours(0, 0, 0, 0);
    const endOfRange = new Date(to);
    endOfRange.setHours(23, 59, 59, 999);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        clinicianId: profile.id,
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
  async getNextUpcoming(userId: string) {
    const profile = await this.resolveClinicianProfile(userId);

    const appointment = await this.prisma.appointment.findFirst({
      where: {
        clinicianId: profile.id,
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

    // Count previously completed sessions for context ("Sesión #N")
    const completedSessions = await this.prisma.appointment.count({
      where: {
        patientId: appointment.patientId,
        clinicianId: profile.id,
        status: 'COMPLETED',
      },
    });

    return {
      ...appointment,
      sessionNumber: completedSessions + 1,
    };
  }

  /**
   * Count completed appointments that don't have an associated psych note yet.
   * Used by the PendingNotesWidget on the dashboard.
   */
  async getPendingNotesCount(userId: string): Promise<{ count: number }> {
    const profile = await this.resolveClinicianProfile(userId);

    const count = await this.prisma.appointment.count({
      where: {
        clinicianId: profile.id,
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
  async getSessionContext(userId: string, appointmentId: string) {
    const profile = await this.resolveClinicianProfile(userId);
    const appointment = await this.findAppointmentOrFail(appointmentId);
    this.assertOwnership(appointment.clinicianId, profile.id);

    // Get patient with extended details
    const patient = await this.prisma.patient.findUnique({
      where: { id: appointment.patientId },
      include: {
        appointments: {
          where: {
            status: 'COMPLETED',
            paymentStatus: 'PENDING',
          },
          select: { price: true },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Calculate total pending balance
    const totalBalance = patient.appointments.reduce(
      (sum, apt) => sum + Number(apt.price),
      0,
    );

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
        clinicianId: profile.id,
        status: { in: ['COMPLETED', 'IN_PROGRESS', 'SCHEDULED'] },
        startTime: { lte: appointment.startTime },
      },
    });

    // Remove the appointments array from patient object to keep response clean
    const { appointments: _appointments, ...patientData } = patient;

    return {
      appointment,
      patient: patientData,
      totalBalance,
      lastVisit: lastVisit?.startTime || null,
      sessionNumber,
    };
  }

  /* ── Psych Notes ─────────────────────────────── */

  /**
   * Get the clinical note for an appointment.
   * Decrypts private notes before returning.
   */
  async getPsychNote(userId: string, appointmentId: string) {
    const profile = await this.resolveClinicianProfile(userId);
    const appointment = await this.findAppointmentOrFail(appointmentId);
    this.assertOwnership(appointment.clinicianId, profile.id);

    const note = await this.prisma.psychNote.findUnique({
      where: { appointmentId },
    });

    if (!note) return null;

    // Decrypt private notes if present
    if (note.privateNotes) {
      try {
        // We need to handle cases where decryption might fail (e.g. old data or bad key)
        // But here we assume it's valid if present.
        // Actually, let's wrap in try-catch to be safe, though EncryptionService throws.
        const decrypted = EncryptionService.decrypt(note.privateNotes);
        return { ...note, privateNotes: decrypted };
      } catch (error) {
        console.error('Failed to decrypt private notes:', error);
        // Return as is or empty? Let's return as is to show something is wrong or maybe undefined?
        // Better to return empty string or error?
        // Let's return generic error message in field
        return { ...note, privateNotes: '[Error decrypting notes]' };
      }
    }

    return note;
  }

  /**
   * Create or update a clinical note for an appointment.
   * Encrypts private notes before saving.
   */
  async upsertPsychNote(
    userId: string,
    appointmentId: string,
    dto: CreatePsychNoteDto,
  ) {
    const profile = await this.resolveClinicianProfile(userId);
    const appointment = await this.findAppointmentOrFail(appointmentId);
    this.assertOwnership(appointment.clinicianId, profile.id);

    // Check 24h edit rule (Integridad Clínica)
    const now = new Date();
    const deadline = new Date(appointment.endTime);
    deadline.setHours(deadline.getHours() + 24);

    if (now > deadline) {
      // Allow creation if note doesn't exist? Usually "Edición de Historial" implies modification.
      // If creating a note for an old appointment, maybe it's okay? "Backfilling".
      // But modifying an *existing* note after 24h is disallowed.
      // The prompt says: "Edición de Historial: Solo permitir editar notas de las últimas 24 horas".
      
      const existing = await this.prisma.psychNote.findUnique({ where: { appointmentId } });
      if (existing) {
        throw new ForbiddenException('Edición bloqueada: Han pasado más de 24 horas desde la sesión.');
      }
    }

    // Validate content structure based on templateType
    this.validateNoteContent(dto.templateType, dto.content);

    // Encrypt private notes if present
    let encryptedPrivateNotes: string | null = null;
    if (dto.privateNotes) {
      encryptedPrivateNotes = EncryptionService.encrypt(dto.privateNotes);
    }

    // Check if note exists
    const existingNote = await this.prisma.psychNote.findUnique({
      where: { appointmentId },
    });

    if (existingNote) {
      // Update
      return this.prisma.psychNote.update({
        where: { id: existingNote.id },
        data: {
          templateType: dto.templateType,
          content: dto.content,
          moodRating: dto.moodRating,
          privateNotes: encryptedPrivateNotes ?? existingNote.privateNotes,
          tags: dto.tags,
        },
      });
    } else {
      // Create
      return this.prisma.psychNote.create({
        data: {
          appointmentId,
          patientId: appointment.patientId,
          templateType: dto.templateType,
          content: dto.content,
          moodRating: dto.moodRating,
          privateNotes: encryptedPrivateNotes,
          tags: dto.tags,
        },
      });
    }
  }

  private validateNoteContent(type: NoteTemplateType, content: any) {
    // Simple validation logic
    if (type === NoteTemplateType.SOAP) {
      if (!content.s || !content.o || !content.a || !content.p) {
        throw new BadRequestException('SOAP note must contain s, o, a, p fields');
      }
    } else if (type === NoteTemplateType.FREE) {
      if (!content.body) {
        throw new BadRequestException('Free note must contain body field');
      }
    }
    // Add other types as needed
  }

  async togglePin(userId: string, appointmentId: string) {
    const profile = await this.resolveClinicianProfile(userId);
    const appointment = await this.findAppointmentOrFail(appointmentId);
    this.assertOwnership(appointment.clinicianId, profile.id);

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

  async exportPdf(userId: string, appointmentId: string, includePrivate: boolean) {
    const profile = await this.resolveClinicianProfile(userId);
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        clinician: { include: { user: true } },
        psychNote: true,
      },
    });

    if (!appointment) throw new NotFoundException('Appointment not found');
    this.assertOwnership(appointment.clinicianId, profile.id);

    // Decrypt private notes if requested and present
    if (includePrivate && appointment.psychNote?.privateNotes) {
      try {
        appointment.psychNote.privateNotes = EncryptionService.decrypt(appointment.psychNote.privateNotes);
      } catch (e) {
        console.error('Failed to decrypt for export', e);
        appointment.psychNote.privateNotes = '[Error decrypting]';
      }
    } else if (appointment.psychNote) {
      // Ensure strictly stripped if not requested (though service logic handles conditional rendering too)
      appointment.psychNote.privateNotes = null;
    }

    return this.exportService.generateSessionPdf(appointment, includePrivate);
  }

  /* ── Status transition methods ─────────────────── */

  /* ── Creation & Rescheduling ──────────────────── */

  /**
   * Create a new appointment.
   * - Resolves default duration/price from profile.
   * - Validates time slot overlap.
   */
  async create(userId: string, dto: CreateAppointmentDto) {
    const profile = await this.resolveClinicianProfile(userId);

    // Calculate end time based on profile duration if not provided (though DTO doesn't have endTime yet, we assume fixed duration logic)
    // Wait, the DTO I created earlier doesn't have duration. Let's use the profile default.
    const startTime = new Date(dto.startTime);
    const durationMs = profile.sessionDefaultDuration * 60 * 1000;
    const endTime = new Date(startTime.getTime() + durationMs);

    // Validate overlap
    await this.validateOverlap(profile.id, startTime, endTime);

    return this.prisma.appointment.create({
      data: {
        clinicianId: profile.id,
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
   * - Keeps the same duration.
   * - Validates time slot overlap (excluding itself).
   */
  async reschedule(userId: string, appointmentId: string, dto: RescheduleAppointmentDto) {
    const profile = await this.resolveClinicianProfile(userId);
    const appointment = await this.findAppointmentOrFail(appointmentId);
    this.assertOwnership(appointment.clinicianId, profile.id);

    // Calculate new end time maintaining original duration
    const originalDurationMs = appointment.endTime.getTime() - appointment.startTime.getTime();
    const newStartTime = new Date(dto.startTime);
    const newEndTime = new Date(newStartTime.getTime() + originalDurationMs);

    // Validate overlap excluding this appointment
    await this.validateOverlap(profile.id, newStartTime, newEndTime, appointmentId);

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
  async startSession(userId: string, appointmentId: string) {
    const profile = await this.resolveClinicianProfile(userId);
    const appointment = await this.findAppointmentOrFail(appointmentId);
    this.assertOwnership(appointment.clinicianId, profile.id);

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
  async cancelAppointment(userId: string, appointmentId: string) {
    const profile = await this.resolveClinicianProfile(userId);
    const appointment = await this.findAppointmentOrFail(appointmentId);
    this.assertOwnership(appointment.clinicianId, profile.id);

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
  async markNoShow(userId: string, appointmentId: string) {
    const profile = await this.resolveClinicianProfile(userId);
    const appointment = await this.findAppointmentOrFail(appointmentId);
    this.assertOwnership(appointment.clinicianId, profile.id);

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
  async updateNotes(userId: string, appointmentId: string, notes: string) {
    const profile = await this.resolveClinicianProfile(userId);
    const appointment = await this.findAppointmentOrFail(appointmentId);
    this.assertOwnership(appointment.clinicianId, profile.id);

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { notes },
    });
  }

  /**
   * Update payment status for an appointment.
   * If status is PAID, emit appointment.paid event.
   */
  async updatePayment(userId: string, appointmentId: string, dto: UpdatePaymentDto) {
    const profile = await this.resolveClinicianProfile(userId);
    const appointment = await this.findAppointmentOrFail(appointmentId);
    this.assertOwnership(appointment.clinicianId, profile.id);

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
    userId: string,
    appointmentId: string,
    dto: CompleteCheckoutDto,
  ) {
    const profile = await this.resolveClinicianProfile(userId);
    const appointment = await this.findAppointmentOrFail(appointmentId);

    this.assertOwnership(appointment.clinicianId, profile.id);

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
          clinicianId: profile.id,
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
            clinicianId: profile.id,
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

  private async resolveClinicianProfile(userId: string) {
    const profile = await this.prisma.clinicianProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Clinician profile not found');
    }

    return profile;
  }

  private async findAppointmentOrFail(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
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
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  private assertOwnership(
    appointmentClinicianId: string,
    profileId: string,
  ): void {
    if (appointmentClinicianId !== profileId) {
      throw new ForbiddenException(
        'You do not have permission to modify this appointment',
      );
    }
  }
}
