# Despliegue — estado y consolidación pendiente

## Estado actual (el problema)

El frontend se despliega **dos veces** y hay **dos `vercel.json` incompatibles**.
Esto es deuda que hay que resolver, pero **el paso final requiere una
confirmación manual en el dashboard de Vercel** que no puede hacerse desde el
repo. Este documento deja todo listo para ejecutarlo en minutos.

### Las dos copias del frontend

1. **Vercel** sirve el SPA y proxya `/api/*` a Railway (para evitar el bloqueo de
   cookies cross-site — commit `89a21d2`).
2. **Railway** también sirve el SPA: el `Dockerfile` (línea 24 buildea el web,
   línea 44 lo copia a `apps/api/public`) y NestJS lo expone vía
   `ServeStaticModule` (`app.module.ts`).

Son dos copias que pueden divergir.

### Los dos `vercel.json`

| Archivo | Sintaxis | Tiene |
|---|---|---|
| `vercel.json` (raíz) | `routes` (legacy) | proxy `/api/*`, catch-all SPA. **Sin** headers no-cache |
| `apps/web/vercel.json` | `rewrites` + `headers` (moderna) | proxy `/api/*`, headers anti-stale-bundle. **Sin** catch-all explícito |

En Vercel, `routes` y `rewrites`/`headers` son **mutuamente excluyentes**: si
gana el de la raíz, los headers no-cache del otro se ignoran en silencio. Cuál
gana depende del **"Root Directory"** configurado en el dashboard de Vercel, que
**no está versionado**.

La URL de Railway (`trustworthy-enchantment-production.up.railway.app`) está
hardcodeada en ambos.

## Paso 0 — Confirmar (bloqueante)

En el dashboard de Vercel → Settings → General → **Root Directory**:
- Si es la **raíz del repo** → el activo es `vercel.json` (raíz).
- Si es **`apps/web`** → el activo es `apps/web/vercel.json`.

El historial de git apunta a que se convergió en Vercel; el último commit de
config (`fa36206`) editó el de la raíz, pero `1ebcc78` había movido el archivo a
`apps/web` "para que el proxy del monorepo funcione". **Confirmar antes de tocar
nada.**

## Recomendación: Vercel como canónico

El frontend vive en Vercel; Railway solo corre la API. Es lo que persiguen los 5
commits recientes de deploy y el cambio más reversible.

### Cambios a aplicar (una vez confirmado el Root Directory)

1. **Dejar un solo `vercel.json`** — preferir `apps/web/vercel.json` (tiene los
   headers no-cache). Si el Root Directory es la raíz, mover su contenido allí y
   borrar el de `apps/web`, o cambiar el Root Directory a `apps/web` y borrar el
   de la raíz. Añadir al que quede un catch-all SPA explícito si el
   framework-detection de Vercel no lo cubre.
2. **Quitar el serve-static de NestJS** (`ServeStaticModule.forRoot(...)` en
   `apps/api/src/app.module.ts`). ⚠️ **Solo si Vercel sirve el frontend** — si en
   realidad lo sirve Railway, esto tumba producción.
3. **Quitar el build del web del `Dockerfile`**: cambiar
   `turbo run build --filter=api --filter=web` → `--filter=api`, y borrar la línea
   `COPY --from=builder /app/apps/web/dist apps/api/public`.
4. **Extraer la URL de Railway** a un único sitio (en `rewrites` de Vercel no
   puede ser env var, pero al menos deja de estar duplicada).

## Alternativa: Railway sirve todo (mismo origen)

Railway sirve API + frontend desde el mismo origen; se elimina Vercel y ambos
`vercel.json`.

**Ventaja añadida:** al ser mismo origen desaparece el problema de cookies
cross-site, lo que permite `SameSite=Lax` en `auth.controller.ts` (hoy `None` en
prod) y **cierra el hueco de CSRF** que sigue abierto. **Coste:** se pierde el CDN
de Vercel para el frontend.

Si se elige esta vía: borrar ambos `vercel.json`, quitar el despliegue de Vercel,
y cambiar `sameSite: IS_PROD ? 'none' : 'lax'` → `'lax'` en `auth.controller.ts`.

---

**Decisión pendiente del equipo.** Ninguna de las dos vías se ejecutó en esta
tanda porque ambas tocan infraestructura de forma que puede tumbar producción si
la suposición sobre el Root Directory es incorrecta.
