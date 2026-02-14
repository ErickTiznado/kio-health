import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccessLogService {
  constructor(private readonly prisma: PrismaService) {}

  async logAccess(
    userId: string,
    action: string,
    resource: string,
    patientId?: string,
    details?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.accessLog.create({
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
  }
}
