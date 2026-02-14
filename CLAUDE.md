# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kio Health is a healthcare management platform for clinicians (psychologists, nutritionists) to manage appointments, patients, sessions, and finances. It's a Turborepo monorepo with two apps and shared packages.

## Monorepo Structure

- **`apps/api`** — NestJS 11 backend with Prisma ORM + PostgreSQL
- **`apps/web`** — React 19 SPA with Vite, React Router, TanStack Query, Zustand
- **`packages/types`** (`@repo/types`) — Shared TypeScript enums mirroring Prisma schema
- **`packages/schema`** (`@repo/schema`) — Shared Zod validation schemas (login, register, env)
- **`packages/ui`** (`@repo/ui`) — Shared React component library (stub, minimal usage)
- **`packages/eslint-config`** (`@repo/eslint-config`) — Shared ESLint flat configs
- **`packages/typescript-config`** (`@repo/typescript-config`) — Shared tsconfig bases

## Commands

### Root (Turborepo)
```bash
npm run dev          # Start all apps in parallel (API + Web)
npm run build        # Build all apps and packages
npm run lint         # Lint all workspaces
npm run check-types  # Type-check all workspaces
npm run format       # Prettier format all .ts/.tsx/.md files
```

### API (`apps/api`)
```bash
npm run dev -w api                # NestJS watch mode
npm run build -w api              # Build API
npm test -w api                   # Run Jest unit tests
npm run test:watch -w api         # Watch mode tests
npm run test:e2e -w api           # E2E tests (jest-e2e config)
npm run test:cov -w api           # Coverage report
npm run lint -w api               # ESLint with --fix
```

### Web (`apps/web`)
```bash
npm run dev -w web        # Vite dev server (port 5173)
npm run build -w web      # tsc + vite build
npm run lint -w web       # ESLint
npm run preview -w web    # Preview production build
```

### Prisma (run from `apps/api`)
```bash
cd apps/api
npx prisma migrate dev       # Create/apply migrations
npx prisma generate          # Regenerate client
npx prisma db seed           # Seed database (ts-node prisma/seed.ts)
npx prisma studio            # Visual DB browser
```

## Architecture

### Backend (NestJS)

Feature-module pattern: each domain (`auth/`, `users/`, `appointments/`) has its own module, controller, service, and DTOs.

- **Auth**: JWT-based. `JwtAuthGuard` protects all routes except `POST /auth/login`. Use `@CurrentUser()` decorator to access JWT payload (sub, email, role).
- **Prisma**: Global module (`prisma/prisma.module.ts`) provides `PrismaService` for database access.
- **DTOs**: Class-based with `class-validator` decorators for request validation.
- **Database**: PostgreSQL. Prisma models use PascalCase, tables use snake_case (`@@map`). All IDs are UUIDs.

Key entities: `User` → `ClinicianProfile` (1:1) → `Patient[]` → `Appointment[]` → `FinanceTransaction`

### Frontend (React + Vite)

- **Routing**: React Router v7 with `RequireAuth` wrapper for protected routes. Routes: `/login`, `/dashboard`, `/agenda`, `/session/:appointmentId`, `/onboarding`, `/settings`.
- **State**: Zustand for auth state (persisted to localStorage). TanStack React Query for server state.
- **Forms**: react-hook-form + Zod resolvers.
- **API client**: Axios instance (`lib/api.ts`) with JWT interceptor and 401 auto-logout.
- **Styling**: Tailwind CSS v4 with custom theme colors defined via `@theme` in `index.css` (primary: `kanji` #8a72d1, accent: `cruz` #ddd3fa, `kio` #ae93fe).

### Shared Packages

`@repo/types` enums must stay in sync with Prisma schema enums. `@repo/schema` provides Zod schemas used for both frontend form validation and env var validation.

## Conventions

- **Files**: kebab-case (`use-session-checkout.ts`, `complete-checkout.dto.ts`)
- **Components**: PascalCase (`LoginPage`, `RequireAuth`)
- **Hooks**: `use` prefix, camelCase (`useAuthStore`, `useSessionCheckout`)
- **API routes**: RESTful, kebab-case paths
- **Prisma**: camelCase fields with `@map` to snake_case columns
- **Formatting**: Prettier (singleQuote, trailingComma: all)
- **Package manager**: npm (not yarn/pnpm)

## Environment Variables

API requires: `DATABASE_URL`, `DIRECT_URL` (Prisma), `JWT_SECRET`
Web requires: `VITE_API_URL` (defaults to `http://localhost:3000`)
