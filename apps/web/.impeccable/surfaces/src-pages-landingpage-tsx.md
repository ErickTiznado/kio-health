---
version: 1
slug: "src-pages-landingpage-tsx"
primary_target: "src/pages/LandingPage.tsx"
related_targets: ["src/lib/beta.api.ts","src/hooks/use-is-dark.ts"]
---

## Scope

La landing pública en la ruta `/` (`src/pages/LandingPage.tsx`). `RootRedirect` la
renderiza solo a visitantes sin sesión; con sesión, la raíz sigue redirigiendo a
`/dashboard`, `/onboarding` o `/change-password` como siempre.

Modo de visitante: **Persuade**. Es la única superficie del proyecto en este modo;
todo lo demás en `apps/web` es Operate.

## Audiencia, trabajo y acción

- **Audiencia:** psicólogo de consulta privada o responsable de una clínica pequeña,
  llegando por primera vez y sin contexto previo del producto.
- **Trabajo:** entender en segundos qué es Kio, ver que agenda → sesión → nota → cobro
  es un solo recorrido, y comprobar que lo clínico va cifrado.
- **Acción:** pedir acceso a la beta. `POST /api/auth/beta-request` (público,
  throttle 5 req/15 min, modelo `BetaRequest`). El registro libre **no** está abierto;
  el formulario no promete cuenta inmediata.
- **Prueba:** capturas del producto real en `public/landing/` — `dashboard`, `agenda`,
  `session`, `patients`, `patient`, `finance`, cada una en `-light` y `-dark`, WebP de
  2000×1250. Se toman con Playwright headless desde la cuenta de desarrollo; el guion
  vive fuera del repo. Al regenerarlas: no usar `page.goto` tras iniciar sesión (el
  recargo pierde la sesión), un solo login por ejecución (el login está limitado a
  5 intentos/15 min) y esperar a que los widgets pinten, que tardan bastante más que
  el `networkidle`.

## Restricciones

- Los datos de las capturas son del seed, no de pacientes reales. **Toda captura lleva
  su pie «Captura real · datos de demostración»** y el pie de página lo repite. Con la
  confidencialidad como promesa central, enseñar pantallas con aspecto de historia
  clínica sin decir que son de muestra sería el mensaje contrario.
- Prohibido inventar testimonios, logos de clientes, métricas, casos de éxito o precios
  (PRODUCT.md). Hoy la página no contiene ninguno.
- Ninguna copy puede prometer buscar, filtrar u ordenar por campos cifrados. La sección
  de confidencialidad convierte esa limitación en el argumento, en vez de esconderla.

## Dirección elegida

**La demo conducida.** El visor de la app es el primer viewport, no una ilustración
bajo un hero: una captura grande que el visitante conduce con un riel de cuatro pasos
(Agenda, Sesión, Nota clínica, Cobro), y la copy cuelga de cada paso. Rechaza
explícitamente el hero con rejilla de features. Semilla de concepto `40bc9d8e`; el roll
corrió degradado (sin red, sin challengers ni quality-bar boards).

Momento memorable: el titular «El listado no puede buscar por diagnóstico. A propósito.»
— la restricción del cifrado usada como prueba de que la promesa es real.

## Decisiones visuales propias de esta superficie

El sistema de DESIGN.md se hereda sin cambios (lino, púrpura escaso, planitud, borde de
1px, radios blandos, Lucide). Lo que esta superficie añade y no existe en el resto de
la app:

- **Escala de display mayor**: titular a 48px (`sm:text-5xl`) y cuerpo a 16px/28. La app
  vive en 24px de display y 14px de cuerpo; una landing a esa escala no tiene momento
  focal. No trasladar esta escala a superficies Operate.
- **`.shot-rail`** en `src/index.css`: tematiza la barra de desplazamiento horizontal de
  los carriles de captura. Por debajo de `sm` las capturas se muestran a 760px y se
  desplazan con el dedo, porque reducir una UI de 1440px a 390px las vuelve ilegibles.
- **Lista de definición** en vez de rejilla de tarjetas iguales para el vocabulario del
  dominio.
- **Un solo momento de motion**: el fundido de 450ms del visor. Se detiene para siempre
  al primer clic, flecha o toque, y respeta `prefers-reduced-motion`.

## Decisiones abiertas

- El riel `.shot-rail` no se ha visto nunca en un navegador real: las capturas de esta
  superficie se toman en Chromium headless, que suprime las barras de desplazamiento
  superpuestas. Falta una comprobación visual.
- Sin plan de SEO, metadatos sociales (Open Graph, Twitter card) ni analítica. La página
  hereda el `<title>` y la `<meta name="description">` genéricos de `index.html`.
- Sin superficie para el portal de paciente: se describe en la lista de definición pero
  no hay captura, porque el portal no se capturó.
- El correo de aviso a quien entra en la lista no existe: `BetaRequest.invitedAt` está
  en el modelo pero nadie lo rellena todavía.
