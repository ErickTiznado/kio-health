import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

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
  ): Promise<{ id: string; email: string; role: string }> {
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

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(user: {
    id: string;
    email: string;
    role: string;
  }): Promise<{ accessToken: string; refreshToken: string; user: Record<string, unknown> }> {
    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            type: true,
            licenseNumber: true,
            currency: true,
            sessionDefaultDuration: true,
            sessionDefaultPrice: true,
          },
        },
      },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      clinicianId: fullUser?.profile?.id,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.createRefreshToken(user.id);

    return { accessToken, refreshToken, user: fullUser as Record<string, unknown> };
  }

  async refreshAccessToken(
    rawRefreshToken: string,
  ): Promise<{ accessToken: string; newRefreshToken: string }> {
    const tokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: { select: { id: true } },
          },
        },
      },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await this.prisma.refreshToken.delete({ where: { tokenHash } });
      }
      throw new UnauthorizedException('Token de actualización expirado o inválido');
    }

    // Rotate: delete old token, issue new one
    await this.prisma.refreshToken.delete({ where: { tokenHash } });
    const newRefreshToken = await this.createRefreshToken(stored.userId);

    const payload: JwtPayload = {
      sub: stored.user.id,
      email: stored.user.email,
      role: stored.user.role,
      clinicianId: stored.user.profile?.id,
    };

    const accessToken = this.jwtService.sign(payload);

    return { accessToken, newRefreshToken };
  }

  async revokeRefreshToken(rawRefreshToken: string): Promise<void> {
    const tokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }

  async getCurrentUser(userId: string): Promise<Record<string, unknown>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            type: true,
            licenseNumber: true,
            currency: true,
            sessionDefaultDuration: true,
            sessionDefaultPrice: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user as Record<string, unknown>;
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
