import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentClinician } from '../auth/decorators/current-clinician.decorator';

// Protegido por el JwtAuthGuard global (ver app.module.ts).
@Controller('search')
export class SearchController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async search(
    @CurrentClinician() clinicianId: string,
    @Query('q') query: string,
  ) {
    if (!query || query.length < 2) return { patients: [], appointments: [] };

    const patients = await this.prisma.patient.findMany({
      where: {
        clinicianId: clinicianId,
        // contactPhone está cifrado (AES-256-GCM): un `contains` sobre la
        // columna nunca puede coincidir. Se busca sólo por nombre, igual que
        // en PatientsService.findAll().
        fullName: { contains: query, mode: 'insensitive' },
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
        patient: { select: { fullName: true } },
      },
    });

    return {
      patients,
      appointments: appointments.map((a) => ({
        id: a.id,
        label: `${a.reason} - ${a.patient.fullName}`,
        startTime: a.startTime,
        type: 'appointment',
      })),
    };
  }
}
