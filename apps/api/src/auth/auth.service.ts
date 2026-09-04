import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { SignupDto } from './dto/signup.dto';
import { BetaRequestDto } from './dto/beta-request.dto';
import { EmailService } from '../lib/email.service';
import { AccessLogService } from '../access-log/access-log.service';
import { computeTrialEnd, getTrialLockMode } from '../lib/trial';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly accessLogService: AccessLogService,
  ) {}

  async checkEmailAvailable(email: string): Promise<{ available: boolean }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true },
    });
    return { available: !existing };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<{
    id: string;
    email: string;
    role: string;
    mustChangePassword: boolean;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Fire-and-forget: userId null (email desconocido) queda auditado.
      void this.accessLogService.logAccess(
        null,
        'LOGIN_FAILED',
        'Auth',
        undefined,
        `Email desconocido: ${email.toLowerCase().trim()}`,
      );
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      void this.accessLogService.logAccess(
        user.id,
        'LOGIN_FAILED',
        'Auth',
        undefined,
        'Contraseña incorrecta',
      );
      throw new UnauthorizedException('Credenciales inválidas');
    }

    void this.accessLogService.logAccess(user.id, 'LOGIN_SUCCESS', 'Auth');

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };
  }

  async login(user: {
    id: string;
    email: string;
    role: string;
    mustChangePassword?: boolean;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Record<string, unknown>;
  }> {
    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        mustChangePassword: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            type: true,
            licenseNumber: true,
            currency: true,
            sessionDefaultDuration: true,
            sessionDefaultPrice: true,
            plan: true,
            trialEndsAt: true,
            googleIntegration: { select: { id: true } },
            clinicMemberships: {
              select: { clinicId: true, role: true },
              take: 1,
            },
          },
        },
      },
    });

    const membership = fullUser?.profile?.clinicMemberships?.[0];
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      clinicianId: fullUser?.profile?.id,
      clinicId: membership?.clinicId,
      clinicRole: membership?.role,
      trialEndsAt: fullUser?.profile?.trialEndsAt?.toISOString() ?? null,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.createRefreshToken(user.id);

    // Strip clinicMemberships from response before returning
    const { profile, ...rest } = fullUser as Record<string, unknown> & {
      profile: Record<string, unknown> & { clinicMemberships: unknown[] };
    };
    const { clinicMemberships: _m, ...profileRest } = profile ?? {};
    const responseUser = {
      ...rest,
      // Preserve null when user has no profile — empty object {} would be truthy
      // and cause the frontend to redirect to /dashboard instead of /onboarding
      profile: profile ? profileRest : null,
      clinicId: membership?.clinicId ?? null,
      clinicRole: membership?.role ?? null,
      trialLockMode: getTrialLockMode(),
    };

    return { accessToken, refreshToken, user: responseUser };
  }

  async refreshAccessToken(
    rawRefreshToken: string,
  ): Promise<{ accessToken: string; newRefreshToken: string }> {
    const tokenHash = createHash('sha256')
      .update(rawRefreshToken)
      .digest('hex');

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                id: true,
                trialEndsAt: true,
                clinicMemberships: {
                  select: { clinicId: true, role: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await this.prisma.refreshToken.delete({ where: { tokenHash } });
      }
      throw new UnauthorizedException(
        'Token de actualización expirado o inválido',
      );
    }

    // Rotate: delete old token, issue new one
    await this.prisma.refreshToken.delete({ where: { tokenHash } });
    const newRefreshToken = await this.createRefreshToken(stored.userId);

    const membership = stored.user.profile?.clinicMemberships?.[0];
    const payload: JwtPayload = {
      sub: stored.user.id,
      email: stored.user.email,
      role: stored.user.role,
      clinicianId: stored.user.profile?.id,
      clinicId: membership?.clinicId,
      clinicRole: membership?.role,
      trialEndsAt: stored.user.profile?.trialEndsAt?.toISOString() ?? null,
    };

    const accessToken = this.jwtService.sign(payload);

    return { accessToken, newRefreshToken };
  }

  async revokeRefreshToken(rawRefreshToken: string): Promise<void> {
    const tokenHash = createHash('sha256')
      .update(rawRefreshToken)
      .digest('hex');
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }

  async getCurrentUser(userId: string): Promise<Record<string, unknown>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        mustChangePassword: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            type: true,
            licenseNumber: true,
            currency: true,
            sessionDefaultDuration: true,
            sessionDefaultPrice: true,
            plan: true,
            trialEndsAt: true,
            googleIntegration: { select: { id: true } },
            clinicMemberships: {
              select: { clinicId: true, role: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const membership = user.profile?.clinicMemberships?.[0];
    const { profile, ...rest } = user as Record<string, unknown> & {
      profile: Record<string, unknown> & { clinicMemberships: unknown[] };
    };
    const { clinicMemberships: _m, ...profileRest } = profile ?? {};

    return {
      ...rest,
      profile: profileRest,
      clinicId: membership?.clinicId ?? null,
      clinicRole: membership?.role ?? null,
      trialLockMode: getTrialLockMode(),
    };
  }

  async completeProfile(
    userId: string,
    dto: CompleteProfileDto,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Record<string, unknown>;
  }> {
    const existing = await this.prisma.clinicianProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new ConflictException('El perfil clínico ya existe');
    }

    await this.prisma.clinicianProfile.create({
      data: {
        userId,
        type: dto.type,
        // Sin `plan`: se queda en el default INDIVIDUAL del esquema y deja de
        // gobernar permisos. Lo que decide el acceso ahora es la prueba.
        trialEndsAt: computeTrialEnd(),
        licenseNumber: dto.licenseNumber ?? null,
        currency: dto.currency,
        sessionDefaultDuration: dto.sessionDefaultDuration,
        sessionDefaultPrice: dto.sessionDefaultPrice,
      },
    });

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    return this.login(user);
  }

  /// Registra una solicitud de acceso a la beta desde la landing pública.
  ///
  /// Responde siempre igual, exista ya la solicitud o no: el endpoint es
  /// anónimo, así que distinguir los dos casos lo convertiría en un oráculo
  /// para averiguar quién está en la lista.
  async requestBetaAccess(dto: BetaRequestDto): Promise<{ received: true }> {
    const email = dto.email.toLowerCase().trim();
    const fullName = dto.fullName?.trim() || null;

    await this.prisma.betaRequest.upsert({
      where: { email },
      create: { email, fullName, practiceKind: dto.practiceKind ?? null },
      update: {
        // Solo se completan huecos; una segunda solicitud no borra lo enviado.
        fullName: fullName ?? undefined,
        practiceKind: dto.practiceKind ?? undefined,
      },
    });

    return { received: true };
  }

  async validateBetaInvite(
    token: string,
  ): Promise<{ valid: boolean; email: string }> {
    const invitation = await this.prisma.betaInvitation.findUnique({
      where: { token },
    });
    if (
      !invitation ||
      invitation.acceptedAt ||
      invitation.expiresAt < new Date()
    ) {
      throw new BadRequestException('Invitación inválida o expirada');
    }
    return { valid: true, email: invitation.invitedEmail };
  }

  async signup(dto: SignupDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Record<string, unknown>;
  }> {
    // Validar token de invitación beta
    const invitation = await this.prisma.betaInvitation.findUnique({
      where: { token: dto.inviteToken },
    });
    if (!invitation) {
      throw new BadRequestException('Token de invitación inválido');
    }
    if (invitation.acceptedAt) {
      throw new BadRequestException('Esta invitación ya fue usada');
    }
    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('La invitación ha expirado');
    }
    if (invitation.invitedEmail !== dto.email.toLowerCase().trim()) {
      throw new BadRequestException(
        'Este link de invitación no corresponde a tu correo',
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está en uso');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Canje atómico de la invitación.
    //
    // El `updateMany` con `acceptedAt: null` en el WHERE es lo que gana la
    // carrera: si dos requests concurrentes traen el mismo token, solo una
    // afecta filas (count === 1) y la otra aborta antes de crear el usuario.
    // Va DENTRO de la transacción junto al create para que un fallo al crear
    // el usuario revierta también el canje — si no, el token quedaría quemado
    // sin cuenta asociada.
    const user = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.betaInvitation.updateMany({
        where: { token: dto.inviteToken, acceptedAt: null },
        data: { acceptedAt: new Date() },
      });

      if (claimed.count !== 1) {
        throw new BadRequestException('Esta invitación ya fue usada');
      }

      return tx.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          fullName: dto.fullName.trim(),
          passwordHash,
          role: 'CLINICIAN',
        },
      });
    });

    return this.login({ id: user.id, email: user.email, role: user.role });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la actual',
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false },
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return silently to prevent email enumeration
    if (!user) return;

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

    void this.accessLogService.logAccess(
      user.id,
      'PASSWORD_RESET_REQUESTED',
      'Auth',
    );

    await this.emailService.sendPasswordResetEmail(user.email, resetUrl);
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const stored = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!stored || stored.usedAt !== null || stored.expiresAt < new Date()) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: stored.userId },
        data: { passwordHash, mustChangePassword: false },
      }),
      this.prisma.passwordResetToken.update({
        where: { tokenHash },
        data: { usedAt: new Date() },
      }),
    ]);
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const token = randomUUID();
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return token;
  }
}
