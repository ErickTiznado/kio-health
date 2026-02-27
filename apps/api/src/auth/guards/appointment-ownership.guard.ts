import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AppointmentOwnershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const appointmentId = request.params.id;
    const clinicianId = request.user?.clinicianId;

    if (!appointmentId || !clinicianId) {
      return false; // Let it fail cleanly if no IDs
    }

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { clinicianId: true },
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    if (appointment.clinicianId !== clinicianId) {
      throw new ForbiddenException('No tienes permiso para acceder a esta cita');
    }

    return true;
  }
}
