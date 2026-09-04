import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

/**
 * Guarda automática contra route shadowing.
 *
 * Contexto: dos controllers declararon la misma ruta con distinto nombre de
 * parámetro (`:id` vs `:patientId`). Solo uno atiende, y cuál gana depende del
 * orden de resolución de dependencias de Nest — no del código. El controller
 * sin guard ensombreció al que validaba propiedad → fuga de datos.
 *
 * Este test arranca el AppModule real, vuelca la tabla de rutas de Express y
 * falla si dos handlers comparten MÉTODO + forma-de-ruta (params normalizados).
 * Es la única barrera automática; sin él, un shadowing vuelve a colarse en
 * silencio.
 */

// PrismaService mockeado: el test no toca la BD, solo inspecciona el router.
const prismaMock = {
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
  onModuleInit: () => Promise.resolve(),
  onModuleDestroy: () => Promise.resolve(),
};

// El router interno de Express no está tipado; describimos solo lo que leemos.
interface RouteLayer {
  route?: { path: string; methods: Record<string, boolean> };
}
interface ExpressWithRouter {
  _router?: { stack: RouteLayer[] };
  router?: { stack: RouteLayer[] };
}

// Normaliza `/patients/:id` y `/patients/:patientId` a la misma forma para que
// una colisión real (misma ruta, distinto nombre de param) se detecte.
const normalize = (path: string) => path.replace(/:[A-Za-z0-9_]+/g, ':param');

describe('Route collisions (route shadowing guard)', () => {
  it('no hay dos handlers para el mismo método + forma-de-ruta', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    const app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api'); // igual que main.ts
    await app.init();

    try {
      const server = app.getHttpAdapter().getInstance() as ExpressWithRouter;
      const stack = server._router?.stack ?? server.router?.stack ?? [];

      const seen = new Map<string, string>();
      const collisions: string[] = [];

      for (const layer of stack) {
        if (!layer.route) continue;
        const path = layer.route.path;
        for (const method of Object.keys(layer.route.methods)) {
          const key = `${method.toUpperCase()} ${normalize(path)}`;
          if (seen.has(key)) {
            collisions.push(
              `${key}  →  "${seen.get(key)}" colisiona con "${path}"`,
            );
          } else {
            seen.set(key, path);
          }
        }
      }

      expect(collisions).toEqual([]);
      // Sanity: el router debe tener rutas (si no, el volcado falló y el test
      // pasaría vacío dando falsa seguridad).
      expect(seen.size).toBeGreaterThan(20);
    } finally {
      await app.close();
    }
  });
});
