# Project Overview

"kio-health" is a modern healthcare management platform built as a monorepo. It features a robust backend for managing clinical data and a responsive frontend for clinicians to manage their practice, patients, and appointments.

## Tech Stack

### Frontend (`apps/web`)
*   **Framework:** React 19 (via Vite)
*   **Styling:** Tailwind CSS v4
*   **State Management:** Zustand
*   **Data Fetching:** TanStack Query (React Query) v5
*   **Routing:** React Router v7
*   **Forms:** React Hook Form + Zod validation
*   **Icons:** Lucide React
*   **HTTP Client:** Axios

### Backend (`apps/api`)
*   **Framework:** NestJS 11
*   **Database:** PostgreSQL
*   **ORM:** Prisma 6
*   **Authentication:** Passport + JWT (Bcrypt for hashing)
*   **Validation:** class-validator + class-transformer

### Shared & Tooling
*   **Monorepo Manager:** Turborepo
*   **Package Manager:** npm
*   **Linting/Formatting:** ESLint, Prettier

---

# Architecture & Domain

## Database Schema (Prisma)
The core domain revolves around **Clinicians** managing **Patients**.
*   **User:** Base account entity (Admin/Clinician).
*   **ClinicianProfile:** Extended profile with practice details (currency, defaults).
*   **Patient:** Health records, contact info, linked to a clinician.
*   **Appointment:** Scheduled sessions with status, payment tracking, and types (Consultation, Evaluation, etc.).
*   **PsychNote:** Clinical notes linked to appointments.
*   **FinanceTransaction:** Income/Expense tracking for the practice.

## Project Structure
```text
/
├── apps/
│   ├── api/          # NestJS Backend
│   │   ├── src/
│   │   │   ├── appointments/  # Appointment logic
│   │   │   ├── auth/          # Auth logic (JWT, Guards)
│   │   │   ├── prisma/        # DB Connection
│   │   │   └── users/         # User management
│   │   └── prisma/            # Schema & Migrations
│   └── web/          # React Frontend
│       ├── src/
│       │   ├── components/    # UI Components
│       │   ├── hooks/         # Custom Hooks
│       │   ├── lib/           # API clients & helpers
│       │   ├── pages/         # Route pages
│       │   ├── schemas/       # Zod schemas
│       │   ├── stores/        # Zustand stores
│       │   └── types/         # TS Types
└── packages/         # Shared internal packages
    ├── eslint-config/
    ├── schema/       # Shared Zod schemas
    ├── types/        # Shared TS types
    ├── typescript-config/
    └── ui/           # Shared UI components
```

---

# Getting Started

## Prerequisites
*   Node.js >= 18
*   PostgreSQL running locally (or configured via `.env`)

## Installation
```sh
npm install
```

## Running Development
Start both frontend and backend in development mode:
```sh
npm run dev
```
*   **Web:** http://localhost:5173 (default Vite port)
*   **API:** http://localhost:3000 (default NestJS port)

Run individual apps:
```sh
npm run dev -- --filter=web  # Frontend only
npm run dev -- --filter=api  # Backend only
```

## Building
Build all applications and packages:
```sh
npm run build
```

## Database Management
Run migrations (from `apps/api`):
```sh
cd apps/api
npx prisma migrate dev
```

---

# Development Conventions

## Frontend
*   **Components:** Functional components with hooks.
*   **Styling:** Utility-first with Tailwind CSS. Avoid custom CSS files where possible.
*   **State:** Use Zustand for global client state (auth, session), React Query for server state.
*   **Forms:** Use React Hook Form controlled by Zod schemas.

## Backend
*   **Architecture:** Modular structure (Module, Controller, Service).
*   **DTOs:** Use classes with `class-validator` decorators for request validation.
*   **Auth:** Protect routes using `JwtAuthGuard`.

## General
*   **Type Safety:** Strict TypeScript usage across the stack. Share types via `@repo/types` where applicable.
*   **Commits:** Follow conventional commits (implied by standardized workflows).
