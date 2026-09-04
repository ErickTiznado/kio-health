import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { createPrismaMock } from '../test/prisma-mock';
import { makeUser, makeClinicianProfile, makeClinic } from '../test/factories';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let jwtService: JwtService;

  beforeEach(() => {
    prisma = createPrismaMock();
    jwtService = {
      sign: jest.fn().mockReturnValue('mock.jwt.token'),
    } as unknown as JwtService;
    const emailService = {
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    } as any;
    const accessLogService = {
      logAccess: jest.fn().mockResolvedValue(null),
    } as any;
    service = new AuthService(
      prisma as any,
      jwtService,
      emailService,
      accessLogService,
    );
    jest.clearAllMocks();
    (jwtService.sign as jest.Mock).mockReturnValue('mock.jwt.token');
  });

  // ── validateUser ──────────────────────────────────────────────────────────

  describe('validateUser()', () => {
    it('returns user object with valid credentials', async () => {
      const user = makeUser({ email: 'test@example.com' });
      prisma.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        role: user.role,
      });
    });

    it('normalizes email to lowercase and trims before querying', async () => {
      const user = makeUser({ email: 'test@example.com' });
      prisma.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.validateUser('  TEST@EXAMPLE.COM  ', 'password');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('throws UnauthorizedException when user not found (same message — no user enumeration)', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.validateUser('notfound@example.com', 'pass'),
      ).rejects.toThrow(new UnauthorizedException('Credenciales inválidas'));
    });

    it('throws UnauthorizedException with same message on wrong password', async () => {
      const user = makeUser();
      prisma.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser(user.email, 'wrongpass'),
      ).rejects.toThrow(new UnauthorizedException('Credenciales inválidas'));
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('includes clinicianId, clinicId, clinicRole in JWT payload', async () => {
      const profile = makeClinicianProfile();
      const clinic = makeClinic();
      const fullUser = {
        ...makeUser(),
        profile: {
          ...profile,
          googleIntegration: null,
          clinicMemberships: [{ clinicId: clinic.id, role: 'OWNER' }],
        },
      };
      prisma.user.findUnique.mockResolvedValue(fullUser);
      prisma.refreshToken.create.mockResolvedValue({});

      await service.login({
        id: fullUser.id,
        email: fullUser.email,
        role: fullUser.role,
      });

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          clinicianId: profile.id,
          clinicId: clinic.id,
          clinicRole: 'OWNER',
        }),
      );
    });

    it('creates a refresh token in DB', async () => {
      const fullUser = {
        ...makeUser(),
        profile: {
          ...makeClinicianProfile(),
          googleIntegration: null,
          clinicMemberships: [],
        },
      };
      prisma.user.findUnique.mockResolvedValue(fullUser);
      prisma.refreshToken.create.mockResolvedValue({});

      await service.login({
        id: fullUser.id,
        email: fullUser.email,
        role: fullUser.role,
      });

      expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
    });

    it('strips clinicMemberships from response user object', async () => {
      const fullUser = {
        ...makeUser(),
        profile: {
          ...makeClinicianProfile(),
          googleIntegration: null,
          clinicMemberships: [{ clinicId: 'clinic-1', role: 'OWNER' }],
        },
      };
      prisma.user.findUnique.mockResolvedValue(fullUser);
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login({
        id: fullUser.id,
        email: fullUser.email,
        role: fullUser.role,
      });

      expect(result.user).not.toHaveProperty('clinicMemberships');
      if (result.user.profile) {
        expect(result.user.profile).not.toHaveProperty('clinicMemberships');
      }
    });
  });

  // ── refreshAccessToken ────────────────────────────────────────────────────

  describe('refreshAccessToken()', () => {
    it('rotates tokens: deletes old, creates new', async () => {
      const userId = 'user-123';
      const storedToken = {
        tokenHash: 'somehash',
        userId,
        expiresAt: new Date(Date.now() + 10000),
        user: {
          id: userId,
          email: 'test@test.com',
          role: 'CLINICIAN',
          profile: {
            id: 'profile-1',
            clinicMemberships: [],
          },
        },
      };
      prisma.refreshToken.findUnique.mockResolvedValue(storedToken);
      prisma.refreshToken.delete.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({});

      await service.refreshAccessToken('raw-token-value');

      expect(prisma.refreshToken.delete).toHaveBeenCalledTimes(1);
      expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
    });

    it('throws UnauthorizedException when token not found', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);
      await expect(service.refreshAccessToken('nonexistent')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException and deletes expired token', async () => {
      const expired = {
        tokenHash: 'expired-hash',
        userId: 'user-1',
        expiresAt: new Date(Date.now() - 1000), // expired
        user: null,
      };
      prisma.refreshToken.findUnique.mockResolvedValue(expired);
      prisma.refreshToken.delete.mockResolvedValue({});

      await expect(service.refreshAccessToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { tokenHash: expect.any(String) },
      });
    });
  });

  // ── validateBetaInvite ────────────────────────────────────────────────────

  describe('validateBetaInvite()', () => {
    const validInvite = {
      invitedEmail: 'beta@test.com',
      token: 'valid-uuid-token',
      expiresAt: new Date(Date.now() + 86400000), // mañana
      acceptedAt: null,
    };

    it('retorna { valid, email } si el token es válido', async () => {
      prisma.betaInvitation.findUnique.mockResolvedValue(validInvite);
      const result = await service.validateBetaInvite('valid-uuid-token');
      expect(result).toEqual({ valid: true, email: 'beta@test.com' });
    });

    it('lanza BadRequestException si el token no existe', async () => {
      prisma.betaInvitation.findUnique.mockResolvedValue(null);
      await expect(service.validateBetaInvite('no-existe')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lanza BadRequestException si ya fue aceptado', async () => {
      prisma.betaInvitation.findUnique.mockResolvedValue({
        ...validInvite,
        acceptedAt: new Date(),
      });
      await expect(service.validateBetaInvite('usado')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lanza BadRequestException si expiresAt < now', async () => {
      prisma.betaInvitation.findUnique.mockResolvedValue({
        ...validInvite,
        expiresAt: new Date(Date.now() - 1000), // ayer
      });
      await expect(service.validateBetaInvite('expirado')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── signup ────────────────────────────────────────────────────────────────

  const makeValidInvite = (
    overrides: Partial<{
      acceptedAt: Date | null;
      expiresAt: Date;
      invitedEmail: string;
    }> = {},
  ) => ({
    invitedEmail: 'new@user.com',
    token: 'valid-token',
    expiresAt: new Date(Date.now() + 86400000),
    acceptedAt: null,
    ...overrides,
  });

  describe('signup()', () => {
    // Nota: signup() sólo crea el User. El ClinicianProfile / Clinic /
    // ClinicMember / ClinicSubscription se crean después, en el onboarding.
    it('crea únicamente el User (el perfil se completa en el onboarding)', async () => {
      const newUser = makeUser();
      const newClinic = makeClinic();
      const newProfile = makeClinicianProfile({ userId: newUser.id });
      const fullUser = {
        ...newUser,
        profile: {
          ...newProfile,
          googleIntegration: null,
          clinicMemberships: [{ clinicId: newClinic.id, role: 'OWNER' }],
        },
      };

      prisma.betaInvitation.findUnique.mockResolvedValue(makeValidInvite());
      prisma.betaInvitation.updateMany.mockResolvedValue({ count: 1 });
      prisma.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValue(fullUser);
      prisma.user.create.mockResolvedValue(newUser);
      prisma.refreshToken.create.mockResolvedValue({});

      await service.signup({
        email: 'new@user.com',
        fullName: 'New User',
        password: 'Password123!',
        inviteToken: 'valid-token',
      } as any);

      expect(prisma.user.create).toHaveBeenCalledTimes(1);
      expect(prisma.clinicianProfile.create).not.toHaveBeenCalled();
      expect(prisma.clinic.create).not.toHaveBeenCalled();
      expect(prisma.clinicMember.create).not.toHaveBeenCalled();
      expect(prisma.clinicSubscription.create).not.toHaveBeenCalled();
    });

    it('hashes the password before storing', async () => {
      const newUser = makeUser({ email: 'a@b.com' });
      prisma.betaInvitation.findUnique.mockResolvedValue(
        makeValidInvite({ invitedEmail: 'a@b.com' }),
      );
      prisma.betaInvitation.updateMany.mockResolvedValue({ count: 1 });
      prisma.user.findUnique.mockResolvedValueOnce(null).mockResolvedValue({
        ...newUser,
        profile: {
          ...makeClinicianProfile(),
          googleIntegration: null,
          clinicMemberships: [],
        },
      });
      prisma.user.create.mockResolvedValue(newUser);
      prisma.refreshToken.create.mockResolvedValue({});

      await service.signup({
        email: 'a@b.com',
        fullName: 'Test User',
        password: 'plain',
        inviteToken: 'valid-token',
      } as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('plain', 10);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ passwordHash: 'hashed_password' }),
        }),
      );
    });

    it('canjea la invitación condicionando el WHERE a acceptedAt: null', async () => {
      const newUser = makeUser();
      prisma.betaInvitation.findUnique.mockResolvedValue(makeValidInvite());
      prisma.betaInvitation.updateMany.mockResolvedValue({ count: 1 });
      prisma.user.findUnique.mockResolvedValueOnce(null).mockResolvedValue({
        ...newUser,
        profile: {
          ...makeClinicianProfile(),
          googleIntegration: null,
          clinicMemberships: [],
        },
      });
      prisma.user.create.mockResolvedValue(newUser);
      prisma.refreshToken.create.mockResolvedValue({});

      await service.signup({
        email: 'new@user.com',
        fullName: 'N',
        password: 'p',
        inviteToken: 'valid-token',
      } as any);

      // La condición de carrera vive en el WHERE, no en un check previo
      expect(prisma.betaInvitation.updateMany).toHaveBeenCalledWith({
        where: { token: 'valid-token', acceptedAt: null },
        data: { acceptedAt: expect.any(Date) },
      });
    });

    it('aborta sin crear usuario si otro request canjeó el token primero', async () => {
      // La validación previa pasa (leyó la invitación aún libre), pero para
      // cuando el updateMany se ejecuta, otro request ya la canjeó.
      prisma.betaInvitation.findUnique.mockResolvedValue(makeValidInvite());
      prisma.betaInvitation.updateMany.mockResolvedValue({ count: 0 });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.signup({
          email: 'new@user.com',
          fullName: 'N',
          password: 'p',
          inviteToken: 'valid-token',
        } as any),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException si inviteToken inválido', async () => {
      prisma.betaInvitation.findUnique.mockResolvedValue(null);
      await expect(
        service.signup({
          email: 'x@x.com',
          password: 'p',
          fullName: 'X',
          inviteToken: 'bad',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException si invitación ya fue usada', async () => {
      prisma.betaInvitation.findUnique.mockResolvedValue(
        makeValidInvite({ acceptedAt: new Date() }),
      );
      await expect(
        service.signup({
          email: 'new@user.com',
          password: 'p',
          fullName: 'X',
          inviteToken: 'used',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException si email no coincide con la invitación', async () => {
      prisma.betaInvitation.findUnique.mockResolvedValue(
        makeValidInvite({ invitedEmail: 'otro@email.com' }),
      );
      await expect(
        service.signup({
          email: 'distinto@email.com',
          password: 'p',
          fullName: 'X',
          inviteToken: 'token',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException on duplicate email', async () => {
      prisma.betaInvitation.findUnique.mockResolvedValue(makeValidInvite());
      prisma.user.findUnique.mockResolvedValue(makeUser()); // email ya existe
      await expect(
        service.signup({
          email: 'new@user.com',
          password: 'pass',
          fullName: 'C',
          inviteToken: 'valid-token',
        } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── completeProfile ────────────────────────────────────────────────────────

  describe('completeProfile()', () => {
    it('throws ConflictException if clinician profile already exists', async () => {
      prisma.clinicianProfile.findUnique.mockResolvedValue(
        makeClinicianProfile(),
      );
      await expect(
        service.completeProfile('user-id', {
          type: 'PSYCHOLOGIST',
          currency: 'MXN',
        } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── requestBetaAccess ─────────────────────────────────────────────────────
  describe('requestBetaAccess', () => {
    it('normaliza el correo antes de guardarlo', async () => {
      prisma.betaRequest.upsert.mockResolvedValue({} as never);

      await service.requestBetaAccess({
        email: '  Nuevo@Consulta.COM ',
        fullName: '  Ana Ruiz  ',
        practiceKind: 'INDIVIDUAL',
      });

      expect(prisma.betaRequest.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'nuevo@consulta.com' },
          create: {
            email: 'nuevo@consulta.com',
            fullName: 'Ana Ruiz',
            practiceKind: 'INDIVIDUAL',
          },
        }),
      );
    });

    it('guarda null cuando el nombre llega vacío', async () => {
      prisma.betaRequest.upsert.mockResolvedValue({} as never);

      await service.requestBetaAccess({
        email: 'sin-nombre@consulta.com',
        fullName: '   ',
      });

      expect(prisma.betaRequest.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: {
            email: 'sin-nombre@consulta.com',
            fullName: null,
            practiceKind: null,
          },
        }),
      );
    });

    it('responde igual si el correo ya estaba en la lista', async () => {
      // El endpoint es anónimo: distinguir el alta nueva de la repetida lo
      // convertiría en un oráculo para averiguar quién ya pidió acceso.
      prisma.betaRequest.upsert.mockResolvedValue({} as never);

      await expect(
        service.requestBetaAccess({ email: 'repetido@consulta.com' }),
      ).resolves.toEqual({ received: true });
    });
  });
});
