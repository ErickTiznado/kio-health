# @repo/web — Kio Health frontend

SPA React 19 con Vite, React Router v7, TanStack Query y Zustand. Consume la API
NestJS. Ver la [documentación del proyecto](../../CLAUDE.md) para arquitectura y
convenciones.

## Comandos (desde `apps/web`)

```bash
npm run dev            # Servidor Vite (puerto 5173)
npm run build          # tsc + vite build
npm run preview        # Preview del build de producción
npm run lint           # ESLint
npm test               # Tests unitarios (Vitest)
npm run test:e2e       # Tests E2E (Playwright)
```

## Puntos clave

- **Cliente API**: `src/lib/api.ts` (Axios con `withCredentials`). Úsalo siempre;
  nunca axios/fetch crudos. El interceptor renueva el access token en silencio
  ante un 401.
- **Estado**: Zustand para estado de cliente; TanStack Query para estado de
  servidor (query keys en `src/lib/query-keys.ts`).
- **Estilos**: Tailwind CSS v4 con los colores de marca definidos en `index.css`.

Variables de entorno: ver `.env.example` (`VITE_API_URL`, `VITE_SENTRY_DSN`).
