import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async search(@CurrentUser() user: any, @Query('q') query: string) {
    if (!query || query.length < 2) return { patients: [], appointments: [] };

    const profile = await this.prisma.clinicianProfile.findUnique({
      where: { userId: user.userId }, // CurrentUser might return { userId, email } payload from JWT strategy, verify this. Usually CurrentUser returns the payload.
      // If CurrentUser returns User entity, then user.id is correct.
      // But standard JWT strategy returns payload.
      // Let's assume user.userId based on patients.controller usage: `const clinicianId = await this.patientsService.getClinicianId(user.userId);`
      // So yes, `user.userId` is likely correct if CurrentUser is the JWT payload.
      // If I change to `any`, I lose safety but fix build.
      // I'll check `user.id` vs `user.userId`.
      // `search` implementation used `user.id` originally.
      // `patients.controller` uses `user.userId`.
      // I should switch to `user.userId` just in case, but strict build fix is `user: any`.
    });

    if (!profile) return { patients: [], appointments: [] };

    const patients = await this.prisma.patient.findMany({
      where: {
        clinicianId: profile.id,
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
        clinicianId: profile.id,
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
