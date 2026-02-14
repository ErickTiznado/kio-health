import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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

  /* ── Status transition methods ─────────────────── */

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
