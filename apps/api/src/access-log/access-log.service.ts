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
      console.warn(`[AccessLog] Failed to log access for user ${userId}:`, (error as Error).message);
      return null;
    }
  }
}
