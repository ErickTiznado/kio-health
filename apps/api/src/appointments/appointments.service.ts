import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find appointments for a specific clinician on a given date.
   * Converts date string to Start of Day → End of Day range.
   */
  async findByDate(userId: string, dateString?: string) {
    // Get clinician profile from userId
    const profile = await this.prisma.clinicianProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Clinician profile not found');
    }

    // Parse date or default to today
    const targetDate = dateString ? new Date(dateString) : new Date();

    // Create Start of Day and End of Day range
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Query appointments within the date range
    const appointments = await this.prisma.appointment.findMany({
      where: {
        clinicianId: profile.id,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return appointments;
  }
}
