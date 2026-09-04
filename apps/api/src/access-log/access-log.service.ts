import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '#generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { QueryAccessLogsDto } from './dto/query-access-logs.dto';

/** Eventos de autenticación visibles en la vista de clínica. */
export const AUTH_ACTIONS = [
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'PASSWORD_RESET_REQUESTED',
] as const;

@Injectable()
export class AccessLogService {
  private readonly logger = new Logger(AccessLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logAccess(
    // null = evento sin usuario identificado (p. ej. login con email desconocido)
    userId: string | null,
    action: string,
    resource: string,
    patientId?: string,
    details?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      return await this.prisma.accessLog.create({
        data: {
          userId,
          action,
          resource,
          patientId,
          details,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      // Non-critical: access logging should never crash the main request
      this.logger.warn(
        `Failed to log access for user ${userId ?? 'unknown'}: ${(error as Error).message}`,
      );
      return null;
    }
  }

  /**
   * Vista del clínico individual: todo acceso a SUS pacientes (venga de quien
   * venga) + sus propios eventos sin paciente (logins, exports globales).
   */
  async findForClinician(
    clinicianId: string,
    userId: string,
    query: QueryAccessLogsDto,
  ) {
    const where: Prisma.AccessLogWhereInput = {
      OR: [{ patient: { clinicianId } }, { userId, patientId: null }],
      ...this.buildFilters(query),
    };

    return this.paginate(where, query);
  }

  /**
   * Vista de clínica (OWNER/ADMIN): accesos a expedientes de pacientes de
   * TODOS los miembros + eventos de autenticación de los miembros. No incluye
   * otra actividad no-clínica de los miembros (decisión de producto).
   */
  async findForClinic(clinicId: string, query: QueryAccessLogsDto) {
    const members = await this.prisma.clinicianProfile.findMany({
      where: { clinicMemberships: { some: { clinicId } } },
      select: { id: true, userId: true },
    });
    const memberClinicianIds = members.map((m) => m.id);
    const memberUserIds = members.map((m) => m.userId);

    const where: Prisma.AccessLogWhereInput = {
      OR: [
        { patient: { clinicianId: { in: memberClinicianIds } } },
        {
          userId: { in: memberUserIds },
          patientId: null,
          action: { in: [...AUTH_ACTIONS] },
        },
      ],
      ...this.buildFilters(query),
    };

    return this.paginate(where, query);
  }

  private buildFilters(query: QueryAccessLogsDto): Prisma.AccessLogWhereInput {
    return {
      ...(query.action ? { action: query.action } : {}),
      ...(query.patientId ? { patientId: query.patientId } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to
                ? { lte: new Date(`${query.to}T23:59:59.999Z`) }
                : {}),
            },
          }
        : {}),
    };
  }

  private async paginate(
    where: Prisma.AccessLogWhereInput,
    query: QueryAccessLogsDto,
  ) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 25, 100);

    const [total, data] = await this.prisma.$transaction([
      this.prisma.accessLog.count({ where }),
      this.prisma.accessLog.findMany({
        where,
        include: {
          // Solo campos en texto plano — nunca columnas cifradas.
          user: { select: { email: true } },
          patient: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
