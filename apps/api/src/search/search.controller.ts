import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentClinician } from '../auth/decorators/current-clinician.decorator';
import { User } from '#generated/prisma';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly prisma: PrismaService) { }

  @Get()
  async search(@CurrentClinician() clinicianId: string, @Query('q') query: string) {
    if (!query || query.length < 2) return { patients: [], appointments: [] };

    const patients = await this.prisma.patient.findMany({
      where: {
        clinicianId: clinicianId,
        OR: [
          { fullName: { contains: query, mode: 'insensitive' } },
          { contactPhone: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
      select: { id: true, fullName: true, status: true },
    });

    const appointments = await this.prisma.appointment.findMany({
      where: {
        clinicianId: clinicianId,
        reason: { contains: query, mode: 'insensitive' },
      },
      take: 3,
      select: {
        id: true,
        startTime: true,
        reason: true,
        patient: { select: { fullName: true } }
      }
    });

    return {
      patients,
      appointments: appointments.map((a: any) => ({
        id: a.id,
        label: `${a.reason} - ${a.patient.fullName}`,
        startTime: a.startTime,
        type: 'appointment'
      }))
    };
  }
}
