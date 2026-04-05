import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../lib/email.service';
import { ReminderStatus } from '#generated/prisma';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
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
      const confirmationToken = uuidv4();
      const apiUrl = process.env.API_URL ?? 'http://localhost:3001';
      const confirmationUrl = `${apiUrl}/api/reminders/confirm/${confirmationToken}`;

      try {
        await this.emailService.sendAppointmentReminder({
          to: reminder.patientEmail,
          patientName: reminder.appointment.patient.fullName,
          clinicianName:
            reminder.appointment.clinician.user.fullName ?? 'Tu profesional',
          appointmentDate: reminder.appointment.startTime,
          appointmentType: reminder.appointment.type,
          timezone: reminder.appointment.clinician.timezone,
          confirmationUrl,
        });

        await this.prisma.appointmentReminder.update({
          where: { id: reminder.id },
          data: {
            status: ReminderStatus.SENT,
            sentAt: new Date(),
            confirmationToken,
          },
        });

        this.logger.log(
          `Reminder sent for appointment ${reminder.appointmentId}`,
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

  async scheduleReminder(appointmentId: string): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { select: { contactEmail: true } },
      },
    });

    if (!appointment) return;
    if (!appointment.patient.contactEmail) return;
    if (appointment.status !== 'SCHEDULED') return;

    const scheduledFor = new Date(
      appointment.startTime.getTime() - 24 * 60 * 60 * 1000,
    );

    // Don't schedule if less than 24h away
    if (scheduledFor <= new Date()) return;

    await this.prisma.appointmentReminder.upsert({
      where: { appointmentId },
      create: {
        appointmentId,
        patientEmail: appointment.patient.contactEmail,
        scheduledFor,
      },
      update: {
        patientEmail: appointment.patient.contactEmail,
        scheduledFor,
        status: ReminderStatus.PENDING,
        sentAt: null,
        failureReason: null,
        confirmationToken: null,
        confirmedAt: null,
      },
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

  async confirmAttendance(
    token: string,
  ): Promise<{
    success: boolean;
    message: string;
    appointmentDate?: Date;
    clinicianName?: string;
  }> {
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
