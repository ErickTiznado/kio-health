/**
 * Tests de integración para el flujo de Beta Invitation.
 *
 * Estos tests usan la DB real de Supabase dev (DIRECT_URL en .env).
 * Crean y limpian sus propios datos usando el prefix "test-beta-".
 *
 * Requiere que la app esté configurada con las variables de entorno de desarrollo.
 *
 * Ejecución:
 *   cd apps/api && npx jest --config test/jest-integration.json
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { randomUUID } from 'crypto';

const TEST_PREFIX = 'test-beta-';

describe('Beta Invitation Flow (integration)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let testToken: string;
  const testEmail = `${TEST_PREFIX}${randomUUID().slice(0, 8)}@kio-test.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.use(cookieParser());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Crear una invitación fresca antes de cada test
    const inv = await prisma.betaInvitation.create({
      data: {
        invitedEmail: testEmail,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      },
    });
    testToken = inv.token;
  });

  afterEach(async () => {
    // Limpiar invitaciones y usuarios de prueba
    await prisma.betaInvitation.deleteMany({
      where: { invitedEmail: { startsWith: TEST_PREFIX } },
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: TEST_PREFIX } },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  // ── GET /auth/validate-invite/:token ───────────────────────────────────────

  describe('GET /auth/validate-invite/:token', () => {
    it('retorna 200 con email correcto para token válido', async () => {
      const res = await request(app.getHttpServer())
        .get(`/auth/validate-invite/${testToken}`)
        .expect(200);

      expect(res.body).toEqual({ valid: true, email: testEmail });
    });

    it('retorna 400 para token inexistente', async () => {
      await request(app.getHttpServer())
        .get('/auth/validate-invite/token-que-no-existe')
        .expect(400);
    });

    it('retorna 400 para token expirado', async () => {
      // Actualizar la invitación para que esté expirada
      await prisma.betaInvitation.update({
        where: { token: testToken },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });

      await request(app.getHttpServer())
        .get(`/auth/validate-invite/${testToken}`)
        .expect(400);
    });

    it('retorna 400 para token ya aceptado', async () => {
      await prisma.betaInvitation.update({
        where: { token: testToken },
        data: { acceptedAt: new Date() },
      });

      await request(app.getHttpServer())
        .get(`/auth/validate-invite/${testToken}`)
        .expect(400);
    });
  });

  // ── POST /auth/signup ──────────────────────────────────────────────────────

  describe('POST /auth/signup', () => {
    it('crea usuario y marca acceptedAt cuando el token es válido', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: testEmail,
          fullName: 'Usuario Beta Test',
          password: 'Password123!',
          inviteToken: testToken,
        })
        .expect(201);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testEmail);

      // Verificar que la invitación fue marcada como aceptada
      const inv = await prisma.betaInvitation.findUnique({
        where: { token: testToken },
      });
      expect(inv?.acceptedAt).not.toBeNull();
    });

    it('retorna 400 al intentar usar el mismo token dos veces', async () => {
      // Primera vez: exitoso
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: testEmail,
          fullName: 'User 1',
          password: 'Password123!',
          inviteToken: testToken,
        })
        .expect(201);

      // Segunda vez con mismo token: debe fallar
      const secondEmail = `${TEST_PREFIX}${randomUUID().slice(0, 8)}@kio-test.com`;
      await prisma.betaInvitation.create({
        data: {
          invitedEmail: secondEmail,
          expiresAt: new Date(Date.now() + 86400000),
        },
      });

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: testEmail,
          fullName: 'User 2',
          password: 'Password123!',
          inviteToken: testToken,
        })
        .expect(400);
    });

    it('retorna 400 sin inviteToken (class-validator)', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: testEmail,
          fullName: 'Sin Token',
          password: 'Password123!',
        })
        .expect(400);
    });

    it('retorna 400 cuando el email no coincide con la invitación', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'diferente@email.com',
          fullName: 'Email Distinto',
          password: 'Password123!',
          inviteToken: testToken,
        })
        .expect(400);
    });
  });
});
