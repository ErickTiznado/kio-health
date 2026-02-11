import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteCheckoutDto } from './dto/complete-checkout.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find appointments for a specific clinician on a given date.
   * Converts date string to Start of Day → End of Day range.
   */
  async findByDate(userId: string, dateString?: string) {
    const profile = await this.resolveClinicianProfile(userId);

    const targetDate = dateString ? new Date(dateString) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.appointment.findMany({
      where: {
        clinicianId: profile.id,
        startTime: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        patient: { select: { id: true, fullName: true } },
      },
      orderBy: { startTime: 'asc' },
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
