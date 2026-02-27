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

Feature-module pattern: each domain (`auth/`, `appointments/`, `patients/`, `finance/`, `tasks/`, `search/`, `export/`) has its own module, controller, service, and DTOs.

**Global modules**: `PrismaModule` and `EncryptionModule` are global — no need to import them in feature modules.

**Auth & Authorization**:
- JWT stored in **httpOnly cookies** (`access_token`, 15 min expiry; `refresh_token`, 7 days). `JwtStrategy` reads from cookie first, then falls back to Authorization header.
- `JwtAuthGuard` protects all routes globally except `POST /auth/login`.
- Use **`@CurrentClinician()`** decorator (not `@CurrentUser()`) — throws `UnauthorizedException` if the user has no clinician profile. Returns the full JWT payload with `clinicianId`.
- `AppointmentOwnershipGuard` — apply via `@UseGuards(AppointmentOwnershipGuard)` on appointment endpoints that need ownership validation. Throws `ForbiddenException` if the appointment doesn't belong to the current clinician.
- `RefreshToken` model stores hashed tokens; `POST /auth/refresh` rotates both tokens.

**Encryption** (`EncryptionService` at `src/lib/encryption.service.ts`):
- AES-256-GCM (authenticated). Key: 32 bytes = 64 hex chars (`ENCRYPTION_KEY` env var).
- Encrypted patient fields: `diagnosis`, `clinicalContext`, `contactPhone`, `emergencyContact` (JSON-stringified before encrypt). Encrypt/decrypt in `PatientsService`, not controllers.
- Decryption **throws** on auth tag mismatch — do not catch silently.

**DTOs**: Class-based with `class-validator` decorators. `class-transformer` auto-transforms request bodies (enabled globally in `main.ts`).

**Rate limiting**: `ThrottlerModule` applies 100 req/min globally. Login endpoint uses a stricter `@Throttle` override (5 req / 15 min).

**Database**: PostgreSQL. Prisma models use PascalCase, tables use snake_case (`@@map`). All IDs are UUIDs.

Key entity chain: `User` → `ClinicianProfile` (1:1) → `Patient[]` → `Appointment[]` → `FinanceTransaction`

`Appointment` has optional 1:1 relations to `PsychNote`, `Anthropometry`, `MealPlan`, and `FinanceTransaction`.

**Ownership pattern**: All service methods that query clinician-owned data accept `clinicianId` as a parameter and pass it to `findFirst` (not `findUnique`) to enforce ownership at the query level.

### Frontend (React + Vite)

**Routing**: React Router v7 with `RequireAuth` wrapper. Routes: `/login`, `/dashboard`, `/agenda`, `/session/:appointmentId`, `/patients`, `/patients/:id`, `/onboarding`, `/settings`.

**State**:
- Zustand (`auth.store.ts`, `notes.store.ts`) for client state. Auth store persists `user`/`isAuthenticated` to localStorage; actual session validity is determined by the httpOnly cookie. **`logout()` is async** — always `await` it before navigating.
- TanStack React Query v5 for all server state. Query key factory is in `src/lib/query-keys.ts` — use it for consistent cache invalidation.

**API client** (`src/lib/api.ts`):
- Axios instance with `withCredentials: true` (required for cookie transport).
- Response interceptor handles 401s: queues concurrent requests, calls `POST /auth/refresh` silently, retries originals, then calls `logout()` if refresh fails.
- **Always use this centralized client** — never raw axios or fetch.

**Forms**: react-hook-form + Zod resolvers. Zod schemas live in `@repo/schema` for anything shared with the backend.

**API functions**: Thin async wrappers around the `api` client live in `src/lib/*.api.ts` files. Hooks in `src/hooks/` compose these with TanStack Query (`useQuery` / `useMutation`).

**Component organization**:
- `src/components/` — general/shared components (session editor, patient forms, UI primitives)
- `src/features/calendar/` — appointment scheduling components
- `src/features/finance/` — finance tracking components
- `src/pages/` — route-level page components

**Key dependencies**: `sonner` (toasts), `dompurify` (sanitize markdown — never render user HTML without it), `recharts` (charts), `date-fns` (date utils), `lucide-react` (icons), `cmdk` (command palette).

**Styling**: Tailwind CSS v4. Custom brand colors defined via `@theme` in `index.css`:
- `kanji` (`#8a72d1`) — primary brand purple
- `kio` (`#ae93fe`) — lighter accent
- `cruz` (`#ddd3fa`) — pale accent
Dark mode uses a `.dark` class with CSS custom properties (slate palette).

### Shared Packages

`@repo/types` enums must stay in sync with Prisma schema enums. When adding a new Prisma enum, add the corresponding TypeScript enum to `@repo/types`.

## Conventions

- **Files**: kebab-case (`use-session-checkout.ts`, `complete-checkout.dto.ts`)
- **Components**: PascalCase (`LoginPage`, `RequireAuth`)
- **Hooks**: `use` prefix, camelCase (`useAuthStore`, `useSessionCheckout`)
- **API routes**: RESTful, kebab-case paths
- **Prisma**: camelCase fields with `@map` to snake_case columns
- **Formatting**: Prettier (singleQuote, trailingComma: all)
- **Package manager**: npm (not yarn/pnpm)

## Environment Variables

**API** (`apps/api/.env`):
- `DATABASE_URL` — PgBouncer pooled connection (used for queries)
- `DIRECT_URL` — Direct PostgreSQL connection (used for migrations only)
- `JWT_SECRET` — Min 32 chars (validated at startup); 64 hex chars recommended
- `ENCRYPTION_KEY` — Exactly 64 hex chars (32 bytes); required for patient PII encryption
- `ALLOWED_ORIGINS` — Comma-separated list of allowed CORS origins (default: `http://localhost:5173`)
- `PORT`, `NODE_ENV`
- `SEED_PASSWORD` — Password used by `prisma db seed` only

**Web** (`apps/web/.env`):
- `VITE_API_URL` — Backend API base URL (default: `http://localhost:3000`)
