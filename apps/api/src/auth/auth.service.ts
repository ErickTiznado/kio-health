import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { SignupDto } from './dto/signup.dto';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<{ id: string; email: string; role: string; mustChangePassword: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return { id: user.id, email: user.email, role: user.role, mustChangePassword: user.mustChangePassword };
  }

  async login(user: { id: string; email: string; role: string; mustChangePassword?: boolean }): Promise<{
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
      profile: profileRest,
      clinicId: membership?.clinicId ?? null,
      clinicRole: membership?.role ?? null,
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
        plan: dto.plan,
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

  async signup(dto: SignupDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Record<string, unknown>;
  }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está en uso');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        fullName: dto.fullName.trim(),
        passwordHash,
        role: 'CLINICIAN',
      },
    });

    return this.login({ id: user.id, email: user.email, role: user.role });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false },
    });
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
