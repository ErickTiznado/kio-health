import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PatientOwnershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const patientId = request.params.id;
    const clinicianId = request.user?.clinicianId;

    if (!patientId || !clinicianId) {
      return false; // Let it fail cleanly if no IDs
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: { clinicianId: true },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    if (patient.clinicianId !== clinicianId) {
      throw new ForbiddenException('No tienes permiso para acceder a este paciente');
    }

    return true;
  }
}
