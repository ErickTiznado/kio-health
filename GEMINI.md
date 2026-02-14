# Project Overview

This is a monorepo for a web application called "kio-health". It consists of a React frontend and a NestJS backend. The project is built using Turborepo.

## Frontend (`apps/web`)

The frontend is a React application built with Vite. It uses:

*   **UI:** Tailwind CSS
*   **Routing:** React Router
*   **State Management:** Zustand
*   **Data Fetching:** Axios and TanStack Query
*   **Forms:** React Hook Form
*   **Validation:** Zod

## Backend (`apps/api`)

The backend is a NestJS application. It uses:

*   **Database:** PostgreSQL (inferred from `adapter-pg`)
*   **ORM:** Prisma
*   **Authentication:** JWT with Passport

## Shared Packages (`packages`)

The monorepo contains the following shared packages:

*   **`@repo/ui`:** A React component library.
*   **`@repo/schema`:** Zod schemas for validation.
*   **`@repo/types`:** TypeScript types.
*   **`@repo/eslint-config`:** ESLint configurations.
*   **`@repo/typescript-config`:** TypeScript configurations.

# Building and Running

## Installation

```sh
npm install
```

## Development

To run the frontend and backend in development mode, run the following command from the root of the project:

```sh
npm run dev
```

You can also run a specific app:

```sh
# Run the web app
npm run dev -- --filter=web

# Run the api app
npm run dev -- --filter=api
```

## Build

To build all apps and packages, run the following command from the root of the project:

```sh
npm run build
```

## Other Commands

*   **Lint:** `npm run lint`
*   **Format:** `npm run format`
*   **Type Check:** `npm run check-types`

# Development Conventions

*   The project uses TypeScript for static type checking.
*   ESLint is used for code linting.
*   Prettier is used for code formatting.
*   The project follows the conventions of a Turborepo monorepo.
*   The project uses a shared UI library, schemas, and types to ensure consistency across the applications.
