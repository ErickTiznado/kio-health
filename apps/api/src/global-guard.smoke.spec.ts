import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'http';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

/**
 * Smoke test HTTP del JwtAuthGuard global.
 *
 * Verifica, a través del pipeline real de Nest (no mockeando el guard), que:
 *  - una ruta @Public() responde sin credenciales,
 *  - una ruta normal responde 401 sin token.
 *
 * Es la red que confirma que el cambio a guard global no dejó ningún endpoint
 * protegido accidentalmente abierto ni ningún público bloqueado. Corre sin BD
 * (PrismaService mockeado): el guard rechaza antes de tocar la capa de datos.
 */
const prismaMock = {
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
  onModuleInit: () => Promise.resolve(),
  onModuleDestroy: () => Promise.resolve(),
};

describe('Global JwtAuthGuard (smoke HTTP)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api (health, @Public) responde sin credenciales', async () => {
    await request(server).get('/api').expect(200);
  });

  it('GET /api/patients (protegido) responde 401 sin token', async () => {
    await request(server).get('/api/patients').expect(401);
  });

  it('GET /api/auth/me (protegido) responde 401 sin token', async () => {
    await request(server).get('/api/auth/me').expect(401);
  });

  it('GET /api/reminders/confirm/:token (@Public) NO responde 401', async () => {
    // Sin token válido igual entra al handler (no lo bloquea el guard); el
    // resultado será una página HTML de "enlace no válido", nunca un 401.
    const res = await request(server).get(
      '/api/reminders/confirm/token-cualquiera',
    );
    expect(res.status).not.toBe(401);
  });
});
