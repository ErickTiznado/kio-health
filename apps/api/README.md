# @repo/api — Kio Health backend

Backend NestJS 11 con Prisma ORM sobre PostgreSQL (Supabase). Expone la API REST
bajo el prefijo `/api`. Ver la [documentación del proyecto](../../CLAUDE.md) para
arquitectura, modelo de seguridad y convenciones.

## Comandos (desde `apps/api`)

```bash
npm run dev                # NestJS en watch mode (puerto 3001)
npm run build              # Build de producción
npm run lint               # ESLint --fix
npm run check-types        # tsc --noEmit
npm test                   # Tests unitarios (Jest)
npm run test:e2e           # Tests e2e
npm run test:integration   # Tests de integración (requieren BD real)
```

## Prisma

```bash
npx prisma generate        # Regenera el cliente (no se versiona)
npx prisma migrate dev     # Crear/aplicar migraciones en dev
npx prisma migrate deploy  # Aplicar migraciones en prod
npx prisma db seed         # Seed (config en prisma.config.ts)
npx prisma studio          # Explorador visual de la BD
```

**Los cambios de schema van siempre por migración, nunca por `prisma db push`.**

## Puntos clave

- **Auth**: JWT en cookies httpOnly. `JwtAuthGuard` es global (`APP_GUARD`) —
  toda ruta nace protegida; usa `@Public()` para las excepciones.
- **Cifrado**: los campos PII de `Patient` y el contenido de `PsychNote` se
  cifran con AES-256-GCM en la capa de servicio (`ENCRYPTION_KEY`).
- **Ownership**: los servicios filtran por `clinicianId` en la query (`findFirst`).

Variables de entorno: ver `.env.example`.
