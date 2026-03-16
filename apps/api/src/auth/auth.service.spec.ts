import { UnauthorizedException, ConflictException } from '@nestjs/common';
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
    jwtService = { sign: jest.fn().mockReturnValue('mock.jwt.token') } as unknown as JwtService;
    service = new AuthService(prisma as any, jwtService);
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
      expect(result).toEqual({ id: user.id, email: user.email, role: user.role });
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
      await expect(service.validateUser('notfound@example.com', 'pass')).rejects.toThrow(
        new UnauthorizedException('Credenciales inválidas'),
      );
    });

    it('throws UnauthorizedException with same message on wrong password', async () => {
      const user = makeUser();
      prisma.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser(user.email, 'wrongpass')).rejects.toThrow(
        new UnauthorizedException('Credenciales inválidas'),
      );
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

      await service.login({ id: fullUser.id, email: fullUser.email, role: fullUser.role });

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

      await service.login({ id: fullUser.id, email: fullUser.email, role: fullUser.role });

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

      const result = await service.login({ id: fullUser.id, email: fullUser.email, role: fullUser.role });

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

  // ── signup ────────────────────────────────────────────────────────────────

  describe('signup()', () => {
    it('creates User, Clinic, ClinicianProfile, ClinicMember, Subscription in transaction', async () => {
      const newUser = makeUser();
      const newClinic = makeClinic();
      const newProfile = makeClinicianProfile({ userId: newUser.id });

      // login() call inside signup
      const fullUser = {
        ...newUser,
        profile: {
          ...newProfile,
          googleIntegration: null,
          clinicMemberships: [{ clinicId: newClinic.id, role: 'OWNER' }],
        },
      };

      // First findUnique = duplicate check (should return null)
      // Second findUnique = login() fetching full user
      prisma.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValue(fullUser);

      // The $transaction runs the callback with prisma as tx
      // Then login() is called, which calls user.findUnique again
      prisma.user.create.mockResolvedValue(newUser);
      prisma.clinic.create.mockResolvedValue(newClinic);
      prisma.clinicianProfile.create.mockResolvedValue(newProfile);
      prisma.clinicMember.create.mockResolvedValue({});
      prisma.clinicSubscription.create.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({});

      await service.signup({
        email: 'new@user.com',
        password: 'Password123!',
        clinicName: 'Mi Clínica',
      } as any);

      expect(prisma.user.create).toHaveBeenCalledTimes(1);
      expect(prisma.clinic.create).toHaveBeenCalledTimes(1);
      expect(prisma.clinicianProfile.create).toHaveBeenCalledTimes(1);
      expect(prisma.clinicMember.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ role: 'OWNER' }) }),
      );
      expect(prisma.clinicSubscription.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'TRIALING' }) }),
      );
    });

    it('hashes the password before storing', async () => {
      const newUser = makeUser();
      prisma.user.findUnique
        .mockResolvedValueOnce(null) // duplicate check
        .mockResolvedValue({
          ...newUser,
          profile: { ...makeClinicianProfile(), googleIntegration: null, clinicMemberships: [] },
        });
      prisma.user.create.mockResolvedValue(newUser);
      prisma.clinic.create.mockResolvedValue(makeClinic());
      prisma.clinicianProfile.create.mockResolvedValue(makeClinicianProfile());
      prisma.clinicMember.create.mockResolvedValue({});
      prisma.clinicSubscription.create.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({});

      await service.signup({ email: 'a@b.com', password: 'plain', clinicName: 'C' } as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('plain', 10);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ passwordHash: 'hashed_password' }),
        }),
      );
    });

    it('throws ConflictException on duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser()); // existing user
      await expect(
        service.signup({ email: 'exists@test.com', password: 'pass', clinicName: 'C' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── completeProfile ────────────────────────────────────────────────────────

  describe('completeProfile()', () => {
    it('throws ConflictException if clinician profile already exists', async () => {
      prisma.clinicianProfile.findUnique.mockResolvedValue(makeClinicianProfile());
      await expect(
        service.completeProfile('user-id', { type: 'PSYCHOLOGIST', currency: 'MXN' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });
});
