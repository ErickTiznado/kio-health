# Kio Health

Plataforma de gestión clínica para psicólogos: agenda, pacientes, sesiones,
notas clínicas cifradas, finanzas y clínicas multi-profesional. Monorepo
Turborepo con un backend NestJS y un frontend React.

## Estructura

| Workspace | Qué es |
|---|---|
| `apps/api` | Backend NestJS 11 + Prisma + PostgreSQL (Supabase) |
| `apps/web` | Frontend React 19 + Vite + TanStack Query + Zustand |
| `packages/types` | Enums TypeScript compartidos (espejo del schema Prisma) |
| `packages/schema` | Schemas Zod compartidos (login, registro, env) |
| `packages/ui` | Librería de componentes React compartida |
| `packages/eslint-config`, `packages/typescript-config` | Configs base |

## Requisitos

- Node.js **20+**
- npm (el gestor de paquetes del repo)
- Una base de datos PostgreSQL (el proyecto usa **Supabase**; no hay flujo local por defecto)

## Puesta en marcha

```bash
# 1. Instalar dependencias (desde la raíz)
npm install

# 2. Configurar variables de entorno
cp apps/api/.env.example apps/api/.env   # rellenar DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY…
cp apps/web/.env.example apps/web/.env   # VITE_API_URL

# 3. Preparar la base de datos (desde apps/api)
cd apps/api
npx prisma generate
npx prisma migrate deploy   # aplica las migraciones
npx prisma db seed          # datos de ejemplo (usa SEED_PASSWORD)
cd ../..

# 4. Arrancar API + Web en paralelo
npm run dev
```

La API escucha en **http://localhost:3001** y el frontend en **http://localhost:5173**.

## Comandos (raíz)

```bash
npm run dev          # API + Web en paralelo
npm run build        # Build de todo
npm run lint         # Lint de todos los workspaces
npm run check-types  # Type-check de todos los workspaces
npm test             # Tests unitarios de todos los workspaces
npm run format       # Prettier
```

CI (`.github/workflows/ci.yml`) corre `lint → check-types → test → build` en cada push/PR a `main`.

## Documentación

La arquitectura, convenciones, modelo de seguridad y detalle de variables de
entorno están en **[CLAUDE.md](./CLAUDE.md)** — es la fuente de verdad de la
documentación del proyecto.
