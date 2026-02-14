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

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) { }

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
      select: { startTime: true },
      orderBy: { startTime: 'asc' },
    });

    // Group by date string
    const countByDay: Record<string, number> = {};
    for (const apt of appointments) {
      const dayKey = apt.startTime.toISOString().split('T')[0];
      countByDay[dayKey] = (countByDay[dayKey] || 0) + 1;
    }

    return countByDay;
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

    // Remove the appointments array from patient object to keep response clean
    const { appointments: _appointments, ...patientData } = patient;

    return {
      appointment,
      patient: patientData,
      totalBalance,
      lastVisit: lastVisit?.startTime || null,
    };
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
   * If status is PAID, create a transaction.
   */
  async updatePayment(userId: string, appointmentId: string, dto: UpdatePaymentDto) {
    const profile = await this.resolveClinicianProfile(userId);
    const appointment = await this.findAppointmentOrFail(appointmentId);
    this.assertOwnership(appointment.clinicianId, profile.id);

    return this.prisma.$transaction(async (tx) => {
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

      // 2. Handle Transaction Creation/Deletion
      if (dto.status === 'PAID') {
        // Create INCOME transaction if not exists (or update?)
        // Requirement says "create FinanceTransaction".
        // Let's check if one already exists to avoid duplicates or update it.
        const existingTx = await tx.financeTransaction.findUnique({
          where: { appointmentId },
        });

        if (existingTx) {
          // Update existing transaction
          await tx.financeTransaction.update({
            where: { id: existingTx.id },
            data: {
              amount: updatedAppointment.price,
              type: 'INCOME',
              date: new Date(),
            }
          });
        } else {
          // Create new transaction
          await tx.financeTransaction.create({
            data: {
              clinicianId: profile.id,
              appointmentId: appointment.id,
              type: 'INCOME',
              amount: updatedAppointment.price,
              description: `Pago de cita: ${updatedAppointment.patient.fullName}`,
              date: new Date(),
            },
          });
        }
      } else if (dto.status === 'PENDING') {
        // If switched back to PENDING, delete the transaction if it exists
        // This keeps financial records consistent with "Paid" appointments.
        await tx.financeTransaction.deleteMany({
          where: { appointmentId },
        });
      }

      return updatedAppointment;
    });
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
