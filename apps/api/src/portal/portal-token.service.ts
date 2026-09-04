import { Injectable, Logger } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const TOKEN_TTL_DAYS = 30;

/**
 * Capa única de acceso del paciente: los links de email (recordatorios,
 * cuestionarios) y el portal SPA usan el MISMO mecanismo de token bearer.
 *
 * - El token crudo (32 bytes base64url) viaja solo en el email/URL.
 * - En BD se guarda únicamente su sha256 (hash at rest).
 * - Varios tokens pueden estar vigentes a la vez para un paciente
 *   (emails en tránsito); expiran a los 30 días y son revocables en bloque.
 */
@Injectable()
export class PortalTokenService {
  private readonly logger = new Logger(PortalTokenService.name);

  constructor(private readonly prisma: PrismaService) {}

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  /** Emite un token nuevo para el paciente y devuelve el valor crudo. */
  async issueToken(patientId: string): Promise<string> {
    const raw = randomBytes(32).toString('base64url');
    const expiresAt = new Date(
      Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.prisma.patientPortalToken.create({
      data: { patientId, tokenHash: this.hashToken(raw), expiresAt },
    });

    return raw;
  }

  /**
   * Resuelve un token crudo a su paciente. Devuelve null si no existe,
   * expiró o fue revocado — el caller decide el mensaje (no filtrar cuál).
   */
  async resolvePatient(
    rawToken: string,
  ): Promise<{ patientId: string; clinicianId: string } | null> {
    if (!rawToken || rawToken.length < 20 || rawToken.length > 128) {
      return null;
    }

    const token = await this.prisma.patientPortalToken.findUnique({
      where: { tokenHash: this.hashToken(rawToken) },
      include: { patient: { select: { id: true, clinicianId: true } } },
    });

    if (!token || token.revokedAt || token.expiresAt < new Date()) {
      return null;
    }

    // Best-effort: no bloquear la petición por el timestamp de uso.
    this.prisma.patientPortalToken
      .update({ where: { id: token.id }, data: { lastUsedAt: new Date() } })
      .catch((err: unknown) =>
        this.logger.warn(`No se pudo actualizar lastUsedAt: ${String(err)}`),
      );

    return {
      patientId: token.patient.id,
      clinicianId: token.patient.clinicianId,
    };
  }

  /** Revoca todos los tokens vigentes de un paciente (ownership por query). */
  async revokeAllForPatient(
    clinicianId: string,
    patientId: string,
  ): Promise<{ revoked: number }> {
    const result = await this.prisma.patientPortalToken.updateMany({
      where: { patientId, revokedAt: null, patient: { clinicianId } },
      data: { revokedAt: new Date() },
    });

    return { revoked: result.count };
  }

  /** Limpieza diaria: borra tokens expirados o revocados hace más de 7 días. */
  async pruneExpired(): Promise<number> {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const result = await this.prisma.patientPortalToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { lt: cutoff } }],
      },
    });

    return result.count;
  }
}
