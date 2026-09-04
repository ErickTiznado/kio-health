# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Cuatro audiencias confirmadas. La prioridad relativa entre ellas está **sin decidir**;
hoy toda la superficie clínica (`apps/web`) está construida para las tres primeras y el
portal para la cuarta.

- **Psicólogo en consulta privada.** Profesional independiente, sin equipo administrativo.
  Gestiona él mismo agenda, pacientes, notas de sesión y cobros, normalmente entre sesión
  y sesión o al cerrar el día.
- **Clínica multi-profesional.** Varios psicólogos bajo una misma clínica, con roles
  `OWNER` / `ADMIN` / `MEMBER` (`ClinicMember`), agenda y listado de pacientes compartidos
  según rol. Se une por invitación (`/join/:token`).
- **Personal administrativo / recepción.** No da terapia: agenda, cobra y gestiona
  documentación. Opera dentro del modelo de roles de clínica, no como rol propio del sistema.
- **Paciente, vía portal.** No es usuario de la app clínica. Entra por enlace con token
  (`PortalTokenService`) desde un email de recordatorio para confirmar citas, rellenar
  escalas y ver su información. Nunca crea cuenta ni contraseña.

## Product Purpose

Kio Health es una plataforma de gestión clínica para psicólogos: agenda, pacientes,
sesiones, notas clínicas cifradas, finanzas y clínicas multi-profesional. Existe para que
el trabajo administrativo alrededor de la terapia — agendar, documentar, cobrar, recordar —
ocurra en un solo lugar y no le robe tiempo ni atención a la sesión.

El éxito es que un psicólogo pueda cerrar el ciclo completo de una sesión sin salir del
producto, y que la información clínica sensible que deja allí esté protegida por defecto.

## Positioning

Cuatro mecanismos confirmados, en conjunto, son lo que un producto vecino no podría copiar
de forma trivial:

1. **Confidencialidad clínica como promesa central, no como detalle técnico.** El cifrado
   autenticado (AES-256-GCM) de PII del paciente y del contenido de las notas psicológicas
   es parte de la propuesta de valor, no una nota al pie de la arquitectura.
2. **El flujo de sesión completo en un solo recorrido.** Agenda → sesión → nota clínica →
   cobro, sin saltar entre herramientas.
3. **Diseñado específicamente para psicología.** Escalas, banderas de riesgo, addendums,
   contexto clínico y medicación/alergias — no un CRM médico genérico adaptado.
4. **Portal de paciente sin fricción.** El paciente participa (confirma, rellena escalas)
   sin crear cuenta ni recordar contraseña.

## Operating Context

- **Superficies clínicas (`apps/web`):** dashboard, agenda, pacientes y ficha de paciente,
  sesión, finanzas, clínica, ajustes, registro de accesos, onboarding.
- **Superficies públicas:** login, alta, recuperación y cambio de contraseña, aceptación de
  invitación a clínica.
- **Superficie de paciente:** portal autenticado por token de portador, más acciones de
  email renderizadas en servidor (`portal/actions/*`).
- **Ritmo de uso real:** el clínico trabaja en ráfagas cortas entre sesiones, a menudo con
  el paciente aún en la sala o recién salido. El portal se abre casi siempre desde el móvil,
  desde un email de recordatorio.
- **Dominios funcionales del backend:** `appointments`, `patients`, `finance`, `tasks`,
  `reminders`, `risk-flags`, `addendums`, `access-log`, `search`, `export`, `clinics`,
  `billing`, `subscriptions`, `integrations`, `portal`.

## Capabilities and Constraints

- **Idioma:** producto y copy en **español**. Mercado hispanohablante. No asumir inglés ni
  internacionalizar sin petición explícita.
- **Estado:** en **beta, preparando lanzamiento**. No hay clientes públicos. Está prohibido
  fabricar testimonios, logos de clientes, métricas, casos de éxito o precios.
- **Régimen de datos:** datos clínicos sensibles bajo obligaciones legales explícitas
  (RGPD / habeas data). Cualquier superficie que muestre, exporte o comparta información de
  paciente hereda esas obligaciones.
- **Modelo de negocio:** **suscripción** (módulos `billing` y `subscriptions` en el backend).
  Planes, precios y tramos concretos: **sin definir** — no inventarlos.
- **Restricción técnica que afecta al diseño:** los campos cifrados no son buscables ni
  filtrables en SQL. Ninguna vista puede prometer buscar, ordenar o filtrar por diagnóstico,
  contexto clínico, teléfono, contacto de emergencia, medicación, alergias ni contenido de
  notas.
- **Dark mode es requisito, no opción.** Toda superficie tiene que existir en claro y oscuro.
- Terminología del dominio a respetar: paciente (no "cliente"), sesión, cita, nota clínica,
  addendum, escala, bandera de riesgo, clínica.

## Brand Commitments

- **Nombre:** Kio Health. Assets en `apps/web/public/` (`kio.svg`, `logo.png`, `LogoFavi.png`,
  `KioLogo.ico`).
- **Sistema visual vinculante:** `.claude/skills/kio-design-system/SKILL.md` es la fuente de
  verdad visual del proyecto y define paleta, radios, tipografía, sombras, espaciado,
  patrones de componente y una lista explícita de efectos prohibidos. Todo trabajo visual lo
  respeta salvo que el usuario lo cambie deliberadamente.
- **Marca cromática:** púrpura `kio` `#ae93fe`, `kanji` `#8a72d1`, `cruz` `#ddd3fa`, sobre
  base cálida `#f5f3ef` en claro y paleta slate en oscuro.
- **Carácter:** plano y limpio; la jerarquía se comunica con espacio, peso tipográfico y
  color, no con efectos decorativos.

## Evidence on Hand

- Interfaz existente y madura en `apps/web` (React 19 + Vite + Tailwind v4).
- Contrato de sistema de diseño escrito: `.claude/skills/kio-design-system/SKILL.md`.
- Documentación de arquitectura y seguridad: `CLAUDE.md`, `README.md`.
- Assets de marca en `apps/web/public/`.
- **Ausencias que no se deben rellenar inventando:** no hay testimonios, ni clientes
  nombrables, ni benchmarks, ni tabla de precios, ni cifras de uso, ni certificaciones de
  cumplimiento acreditadas.

## Product Principles

1. **La confidencialidad se ve, no solo se cumple.** Cuando una superficie toca datos
   clínicos, el diseño lo hace evidente en vez de esconderlo tras una promesa de marketing.
2. **El tiempo entre sesiones es el presupuesto real.** Cada flujo clínico se juzga por si
   se puede completar en una ráfaga corta y con interrupciones.
3. **Un solo recorrido, sin bifurcaciones.** Agenda, sesión, nota y cobro son un continuo;
   diseñar cualquiera de ellos como isla contradice la propuesta.
4. **El paciente participa sin cargar con la herramienta.** Todo lo que se le pide ocurre en
   móvil, sin cuenta, sin aprendizaje previo.
5. **No prometer lo que el cifrado impide.** Búsqueda, filtro y orden solo sobre lo que
   realmente es consultable.

## Accessibility & Inclusion

Sin estándar confirmado. **Decisión abierta:** no se ha establecido un objetivo formal
(p. ej. WCAG 2.1 AA) ni necesidades de usuario específicas documentadas. Registrar aquí
cuando se decida en vez de asumirlo.
