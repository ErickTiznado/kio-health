# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

Kio Health is a healthcare management platform for psychologists to manage appointments, patients, sessions, and finances. It's a Turborepo monorepo with two apps and shared packages.

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
npm test             # Run unit tests in all workspaces
npm run format       # Prettier format all .ts/.tsx/.md files
```

CI (`.github/workflows/ci.yml`) runs `lint` → `check-types` → `test` → `build` on push/PR to `main`. Keep all four green.

### API (`apps/api`)
```bash
npm run dev -w api                # NestJS watch mode
npm run build -w api              # Build API
npm test -w api                   # Run Jest unit tests
npm run test:watch -w api         # Watch mode tests
npm run test:e2e -w api           # E2E tests (jest-e2e config)
npm run test:integration -w api   # Integration tests — needs a real DB
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
npx prisma db seed           # Seed database (config in prisma.config.ts)
npx prisma studio            # Visual DB browser
```

**Schema changes go through migrations — never `prisma db push`.** `db push` was the origin of the schema drift that once left `beta_invitations` missing in production (the container runs `prisma migrate deploy` on boot). One source of truth: `schema.prisma` + `prisma/migrations/`. The seed command lives only in `prisma.config.ts` (the `package.json#prisma` block was removed; Prisma 6 deprecated it).

> **Known migration debt:** three folders under `prisma/migrations/` lack a timestamp prefix (`add_medication_allergies_to_patient`, `create_addendums_table`, `create_risk_flags_table`) because they were applied by hand before being written as migrations. They sort *before* every `2026*` migration lexicographically, which works only by accident. Renaming them requires updating `_prisma_migrations` in the live DB in the same step (or `migrate deploy` sees drift), so do it only with DB access — do not rename the folders alone.

## Architecture

### Backend (NestJS)

Feature-module pattern: each domain (`auth/`, `appointments/`, `patients/`, `finance/`, `tasks/`, `search/`, `export/`) has its own module, controller, service, and DTOs.

**Global modules**: `PrismaModule` and `EncryptionModule` are global — no need to import them in feature modules.

**Auth & Authorization**:
- JWT stored in **httpOnly cookies** (`access_token`, 15 min expiry; `refresh_token`, 7 days). `JwtStrategy` reads from cookie first, then falls back to Authorization header.
- `JwtAuthGuard` is **global** — registered as `APP_GUARD` in `app.module.ts` (second, after `ThrottlerGuard`). **Every route is protected by default; a new controller is authenticated automatically.** To expose a public endpoint, add `@Public()` (`auth/decorators/public.decorator.ts`). Public today: health check, the `auth/` login/signup/refresh/logout/password/invite endpoints, `clinics/join`, the Google OAuth callback, and the reminder-confirmation link. When adding a `@Public()` endpoint, ask whether it truly cannot require an access token — `refresh` and the OAuth callback are the load-bearing cases.
- **Ownership is enforced at the query level, not by authentication.** The global guard only proves *who* you are; it does not prove the row is yours. The canonical pattern: service methods take `clinicianId` and pass it to `findFirst` (never `findUnique` + post-check) so a foreign row simply isn't returned. `AppointmentOwnershipGuard` is optional defense-in-depth for `:id` appointment routes — do not treat "has a guard" as the ownership mechanism.
- **Never declare the same route path in two controllers.** Which handler wins is decided by Nest's dependency-resolution order, not the `imports` array in `AppModule` — so a controller without an ownership guard can silently shadow one that has it (this happened with `risk-flags/`). `src/route-collisions.spec.ts` boots the app and fails CI on any duplicate `method + route-shape`; keep it green.
- Use **`@CurrentClinician()`** decorator (not `@CurrentUser()`) — throws `UnauthorizedException` if the user has no clinician profile. Returns `clinicianId` from the JWT payload.
- `RefreshToken` model stores hashed tokens; `POST /auth/refresh` rotates both tokens.

**Encryption** (`EncryptionService` at `src/lib/encryption.service.ts`):
- AES-256-GCM (authenticated). Key: 32 bytes = 64 hex chars (`ENCRYPTION_KEY` env var).
- Encrypted `Patient` fields (6): `diagnosis`, `clinicalContext`, `contactPhone`, `emergencyContact` (JSON-stringified before encrypt), `medicacionActual`, `alergias`. Also encrypted: `PsychNote.content` and `PsychNote.privateNotes`. Encrypt/decrypt in the service layer, not controllers.
- Encrypted fields are **not searchable or filterable in SQL**. Anything that needs querying must stay in plaintext columns (e.g. `getClinicPatients()` selects only unencrypted fields).
- `dateOfBirth` is **not** encrypted (it is a `DateTime`; encrypting it needs a schema change to `String`).
- Decryption **throws** on auth tag mismatch — do not catch silently.

**DTOs**: Class-based with `class-validator` decorators. `class-transformer` auto-transforms request bodies (enabled globally in `main.ts`).

**Rate limiting**: `ThrottlerModule` applies 100 req/min globally. Login endpoint uses a stricter `@Throttle` override (5 req / 15 min).

**Database**: PostgreSQL. Prisma models use PascalCase, tables use snake_case (`@@map`). All IDs are UUIDs.

Key entity chain: `User` → `ClinicianProfile` (1:1) → `Patient[]` → `Appointment[]` → `FinanceTransaction`

`Appointment` has optional 1:1 relations to `PsychNote` and `FinanceTransaction`.

**Ownership pattern**: All service methods that query clinician-owned data accept `clinicianId` as a parameter and pass it to `findFirst` (not `findUnique`) to enforce ownership at the query level.

### Frontend (React + Vite)

**Routing**: React Router v7 with `RequireAuth` wrapper. Protected routes are lazy-loaded; public/auth routes are static imports on purpose.
- Public: `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/join/:token`
- Protected: `/dashboard`, `/agenda`, `/finance`, `/session/:appointmentId`, `/patients`, `/patients/:id`, `/onboarding`, `/settings`, `/clinic`, `/change-password`
- Plus `/` (redirects by auth state) and `*` (404)

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
- `VITE_API_URL` — Backend API base URL (default: `http://localhost:3001`; the API listens on 3001 in local dev)
