---
target: the principal dashboard
total_score: 14
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 4
timestamp: 2026-08-09T21-28-50Z
slug: apps-web-src-pages-dashboardpage-tsx
---
Method: dual-agent (A: revisión de diseño · B: detector + evidencia de navegador)

## Design Health Score

| # | Heurística | Score | Hallazgo clave |
|---|-----------|-------|----------------|
| 1 | Visibilidad del estado del sistema | 1 | Dos endpoints devuelven 500 y la UI los pinta como éxito vacío. `useDashboardData` nunca lee `isError`. |
| 2 | Correspondencia con el mundo real | 2 | "citas digitales", "Registrar Visita", "Doctor" como fallback — vocabulario ajeno al contrato de PRODUCT.md. |
| 3 | Control y libertad del usuario | 1 | Tour autolanzado a 1.5s; backdrop invisible cuyo clic lo descarta para siempre; sin Escape; sin forma de reabrirlo. |
| 4 | Consistencia y estándares | 2 | `rounded-[40px]` fuera de escala, `font-black` prohibido por DESIGN.md, `purple-400/#a855f7` fuera de paleta, `bg-surface` idéntico al fondo de página. |
| 5 | Prevención de errores | 2 | "Registrar Visita" y "Finalizar Sesión" no tienen `onClick`. Dos CTAs muertas. |
| 6 | Reconocer antes que recordar | 2 | El calendario desalinea los días de la semana; su único dato vive en hover. |
| 7 | Flexibilidad y eficiencia | 1 | 2 elementos interactivos en `<main>`; "Agenda de Hoy" a 1440px de scroll en móvil; sin atajos. |
| 8 | Estética y minimalismo | 1 | 60px `font-black` + gradiente a sangre + dos círculos de 384px para comunicar "no hay nada". |
| 9 | Diagnóstico y recuperación de errores | 0 | No existe estado de error en toda la página. Ni `isError`, ni retry, ni toast. |
| 10 | Ayuda y documentación | 2 | El tour existe y su copy es correcto, pero su ejecución lo convierte en obstáculo. |
| **Total** | | **14/40** | **Poor — se requiere revisión mayor de UX** |

## Design Specificity Verdict

**Genérico con maquillaje clínico.** Quita el gradiente púrpura y esta composición es un dashboard SaaS de 2021: hero grande, calendario de densidad, tarjeta de pendientes con número gigante, lista de "vistos recientemente". Podría reutilizarse en un CRM de dentistas cambiando dos etiquetas.

La prueba está en lo que PRODUCT.md declara como diferenciador — escalas, banderas de riesgo, addendums, contexto clínico — contra lo que el dashboard prioriza:

- Las **banderas de riesgo** no tienen widget propio. Viven en una rama `else if` que solo se evalúa si `pendingNotesCount === 0`. Una alerta clínica suprimida por una tarea de papeleo.
- Del **cobro** no hay rastro; el continuo "agenda → sesión → nota → cobro" se rompe en su punto de entrada.
- Lo que ocupa el 45% del alto es un **calendario de disponibilidad**: preocupación de recepción, no de terapia.

**Deterministic scan.** `detect.mjs` sobre `DashboardPage.tsx`, `components/widgets/` y `DashboardLayout.tsx`: exit 2, **1 solo hallazgo** — `gray-on-color` en `DashboardLayout.tsx:215` (`text-gray-500` sobre `bg-red-50`). Ningún hallazgo en la página ni en los widgets. El detector es casi inútil aquí: los problemas graves son de comportamiento y de datos, no de patrones de clase. La medición manual de contraste encontró **15 fallos AA en modo claro** que el detector no ve.

**Visual overlays.** No disponibles. El panel del navegador no compone frames en este entorno (`Screenshot timed out: the Browser pane is not displayed`), así que no hubo capturas ni overlay inyectado. Toda la evidencia visual proviene de medición directa del DOM y estilos computados.

## Overall Impression

Esta pantalla está diseñada para el día vacío. El estado vacío es lo más elaborado que tiene: titular de 60px, gradiente animado, círculos decorativos. Un psicólogo con consulta establecida ve el dashboard lleno 250 días al año, y esa versión no parece haberse diseñado nunca.

La mayor oportunidad no es estética: es que la página **no distingue "no hay datos" de "no pude traer los datos"**. Hoy, con dos endpoints caídos, el dashboard afirma en tipografía de 60px que la agenda está despejada mientras el calendario, a 10cm a la derecha, pinta las citas de hoy en morado. La pantalla se contradice en la misma línea de visión.

## What's Working

1. **`PendingNotesWidget` como máquina de estados de un solo mensaje.** Tres temas (ámbar pendientes → rosa riesgo → esmeralda al día), un número grande, un botón. En un producto que se usa en ráfagas de 90 segundos, "un número y un verbo" es la forma correcta. El fallo no es la forma, es la precedencia.

2. **`TodayAgendaWidget` tiene la densidad correcta.** Hora tabular, punto de estado con anillo, nombre truncado, tipo abreviado, duración y línea de timeline en filas de ~36px, con detección de `isNow` marcando "AHORA". Está pensado para escanear de reojo. Irónicamente es el widget más pequeño y el que está más abajo.

3. **`InProgressView` vs `UpcomingView` es una bifurcación real.** El hero cambia badges, copy y acciones según si la sesión corre, y "Iniciar Consulta" solo aparece dentro de una ventana de 15 minutos. Impide entrar a una sesión que no toca: decisión de producto correcta y específica.

## Priority Issues

### [P0] El dashboard convierte un fallo de servidor en una afirmación clínica falsa

**Qué.** `GET /api/appointments/next` y `GET /api/appointments?date=…` devuelven **500**. `useDashboardData` desestructura `data = null` / `[]` y nunca lee `isError`. Resultado: "Agenda despejada", "Día libre", "No hay actividad reciente" y "Todo al día / 0" — cuatro afirmaciones falsas presentadas como hechos, mientras `day-summary` (200) confirma **2 citas hoy y 14 futuras**.

**Causa raíz, verificada.** No es zona horaria ni filtro. `npx prisma migrate status` reporta **5 migraciones sin aplicar**; `20260809120000_add_portal_tokens_and_reminders_v2` crea `appointment_reminders.kind`. Los dos endpoints que fallan incluyen `reminders: { where: { kind: 'PRIMARY' } }`; `getDaySummary`, el único que responde 200, no toca esa relación.

**Por qué importa.** Software clínico afirmando que la agenda está libre cuando hay dos pacientes. Si el clínico actúa sobre esa afirmación, el daño es real.

**Fix.** Dos frentes. *Backend:* aplicar las migraciones pendientes. *Diseño, y obligatorio aunque se arregle el backend:* `useDashboardData` expone `isError` por consulta y cada widget gana un tercer estado — superficie neutra, icono de aviso, "No pudimos cargar tu agenda", botón "Reintentar" con `refetch()`. Regla a escribir en DESIGN.md: **una superficie con datos clínicos no puede renderizar un empty state sin haber comprobado `isError`.**

**Suggested command:** `/impeccable harden`

### [P1] El tour secuestra la primera sesión, se pierde de un clic y puede bloquear la interfaz

**Qué.** Autolanzamiento a 1.5s. El backdrop es un `fixed inset-0` **sin fondo** cuyo `onClick` es `skipTour()` → `hasCompletedTour: true` persistido, sin UI para reabrirlo. Sin `Escape`, sin `role="dialog"`, sin `aria-modal`, sin gestión de foco. Y un bug de reflow reproducible: con el tour abierto, al reducir el viewport a 375px el panel queda en `left: 488px` — **113px fuera de pantalla** — mientras el backdrop con `pointer-events: auto` sigue bloqueando todo. La interfaz queda inutilizable y el tour no se puede cerrar porque su `×` (23×23px) está fuera del viewport. La posición se calcula una vez y no se recalcula en `resize`.

**Por qué importa.** El único onboarding del producto se pierde por accidente al primer clic; para teclado y lector de pantalla no existe; y una rotación de móvil deja la app muerta.

**Fix.** No autolanzar: un chip "Ver recorrido guiado (2 min)" en el header, siempre invocable. Backdrop visible que **no** descarte al clic (solo la X y "Omitir"). `Escape` cierra, flechas navegan, `role="dialog" aria-modal="true"`, foco al tooltip por paso. Recalcular posición en `resize` y clampear al viewport. Reducir de 9 pasos a 4 y no forzar navegación entre rutas.

**Suggested command:** `/impeccable onboard`

### [P1] El calendario de disponibilidad miente

**Qué.** Cabecera fija `L M M J V S D` y 28 celdas que empiezan en el día 1 sin offset de día de semana. El 1 de agosto de 2026 es sábado y se dibuja bajo "Lunes" (verificado en el DOM). Solo 28 celdas desde `startOfMonth`, así que **el 29, 30 y 31 no existen**. Y `freeSlots` se calcula como `Math.max(0, 6 - appointments)`: el 6 está inventado y `freeHours`, que sí se calcula bien en `dashboard.helpers.ts`, se ignora.

**Por qué importa.** Un calendario que se equivoca de día de la semana no es un calendario. Y "3 libres" es una cifra fabricada que un profesional usará para decir sí o no a un paciente.

**Fix.** Insertar `(getDay(monthStart)+6)%7` celdas vacías al inicio, extender a 35 celdas, mostrar `freeHours.length` real, marcar hoy con `ring-kio`, y sacar el dato de hover a texto visible. Antes de nada: decidir si este widget pertenece al dashboard o a `/agenda`.

**Suggested command:** `/impeccable layout`

### [P1] El suelo de accesibilidad no se alcanza en ninguna dimensión

**Qué.** Medido en vivo:

- **Contraste, modo claro: 15 fallos AA.** Nav activo `#ae93fe`/`#e1d8f3` = **1.82**. Botón "Nuevo" blanco/`#ae93fe` = **2.50**. "Health", "Inicio", "Psicólogo", fecha = **2.35**. "Registrar Visita" = 3.88. En el hero, sobre el gradiente real, "Agenda despejada." cae a **2.50** en el extremo claro y el párrafo a **2.13**. Modo oscuro está mejor: 6 fallos.
- **Áreas táctiles:** hamburguesa **20×20**, botón icónico del header **22×22**, cerrar tour **23×23**, "Nuevo" 44×**32**, toggle de tema 36×36.
- **Nombres accesibles:** esos dos botones icónicos de 20×20 y 22×22 **no tienen texto, ni `aria-label`, ni `title`**. Para un lector de pantalla son "botón".
- **Foco:** cero declaraciones `focus-visible|focus:ring|focus:outline` en `DashboardLayout.tsx` y en todo `components/widgets/`, mientras otros 32 archivos del proyecto sí las definen. El dashboard depende del anillo por defecto del navegador.
- **Encabezados:** el primer encabezado del documento es un `H3` ("Tu panel principal") que precede al `H1`.
- **Tipografía:** `text-[8px]` en el badge "AHORA" y `text-[9px]` en tipo y duración.

**Por qué importa.** PRODUCT.md deja el estándar de accesibilidad como decisión abierta. Con datos clínicos bajo RGPD y un público profesional con presbicia, eso no es neutralidad: es deuda sin techo.

**Fix.** Fijar WCAG 2.1 AA como objetivo en PRODUCT.md. Subir el texto sobre superficies de marca a `kanji` o blanco pleno, no `kio` sobre lino. 44px de área táctil mínima. `aria-label` en los dos botones icónicos. Una regla global de `focus-visible` con anillo `kio`. Elevar el `H3` del tour o degradarlo fuera del flujo de encabezados. Suelo tipográfico de 11px.

**Suggested command:** `/impeccable audit`

### [P1] La jerarquía está invertida

**Qué.** El hero ocupa 418px en móvil solo con su estado vacío; "Agenda de Hoy" — lo único que responde a "¿qué me toca ahora?" — arranca a `y = 1440px`. En escritorio está en la columna derecha inferior a 16px de tipo, mientras el mensaje vacío está a 60px arriba.

**Por qué importa.** PRODUCT.md, principio 2: "El tiempo entre sesiones es el presupuesto real." Un clínico con 90 segundos scrollea 1,8 pantallas para ver su día.

**Fix.** En móvil: "Agenda de Hoy" primero, próxima cita compacta en una fila (hora · nombre · CTA), alertas después, calendario colapsado tras un disclosure. En escritorio, subir `TodayAgendaWidget` al propio Command Deck junto a la próxima cita.

**Suggested command:** `/impeccable layout`

### [P2] Las banderas de riesgo se ocultan detrás de las notas pendientes

**Qué.** `PendingNotesWidget.tsx:12`: `const hasRiskFlags = !hasPending && riskFlagsCount > 0`. Una sola nota pendiente basta para que las banderas de riesgo activas desaparezcan del dashboard.

**Por qué importa.** Es la señal de mayor gravedad clínica del producto, subordinada por código a papeleo.

**Fix.** Separarlas. Riesgo es su propia tarjeta y va primero, siempre visible si `riskFlagsCount > 0`. Si falta espacio, colapsar notas, nunca riesgo.

**Suggested command:** `/impeccable layout`

## Persona Red Flags

**Alex (power user, 20+ aperturas al día).** 1.5s de relleno líquido más 0.4s de retardo del contenido: 1.9s antes de poder leer, en cada carga. El `<main>` expone 2 elementos interactivos y ningún atajo. `staleTime: 5min` sin `refetchOnWindowFocus` explícito ni refresco manual: vuelve tras una sesión y ve datos de hace cinco minutos sin saberlo. "Registrar Visita" y "Finalizar Sesión" no hacen nada; los pulsa una vez y deja de confiar en los botones de esta pantalla.

**Sam (accesibilidad).** El tour de 9 pasos es invisible para un lector de pantalla y su backdrop invisible captura clics. Las celdas del calendario son `<div>` sin `role`, sin `tabIndex` y sin nombre accesible: 28 números sin significado, con el dato real solo en hover. Los dos botones de navegación móvil no tienen nombre accesible. El nombre del propio usuario, en `text-kio` sobre lino, es el texto menos legible del encabezado (~2.2:1). Las tarjetas de `RecentPatientsWidget` son `div role="button"` sin `focus-visible` propio.

**Marcela (psicóloga, 4 minutos entre sesiones, la paciente aún guardando el abrigo).** Abre en el móvil: 1.9s de animación. Lee, a 60px, "Agenda despejada." Tiene dos pacientes hoy y la segunda está a dos metros. A los 1.5s le salta un tour de 9 pasos que empieza a navegar a `/patients`; toca fuera para quitárselo y lo pierde para siempre. Baja 1440px hasta "Agenda de Hoy": "Día libre". Mira arriba y en el calendario el 9 está pintado en morado. La pantalla se contradice y no tiene los 4 minutos para averiguar cuál mitad miente. La tarjeta verde le dice "Todo al día — 0 alertas": la frase con menos derecho a estar ahí, porque el sistema no pudo leer nada.

## Minor Observations

- **`getTodayDateString()`** (`appointments.api.ts:227`) usa `new Date().toISOString().split('T')[0]` → fecha en **UTC**. En México (GMT-6), a partir de las 18:00 locales el dashboard consulta las citas de mañana mientras el encabezado muestra hoy. Rompe justo en la ventana de "cerrar el día".
- **`p.reason` se rellena desde `query.data.diagnosis`.** El dashboard muestra el **diagnóstico** del paciente en la pantalla principal bajo la etiqueta "motivo" — el campo más sensible del modelo, cifrado en reposo, expuesto a cualquiera que mire la pantalla, en un producto cuyo principio 1 es la confidencialidad visible.
- **`recentPatients` se hidrata desde `localStorage`.** En un equipo compartido, el historial de pacientes vistos del clínico anterior queda en el navegador. Bajo RGPD merece revisión aparte.
- `useMemo(() => getRecentPatientsFromStorage(), [])` con dependencias vacías: la lista nunca se actualiza sin recargar.
- `rawPatients` depende de `recentPatientQueries`, array nuevo en cada render: el `useMemo` no memoiza nada.
- `rounded-br-none rounded-bl-none rounded-tr-none` sobre un `rounded-[40px]`: tres cancelaciones para simular un encaje que la escala de radios ya no puede describir.
- `space-y-0` en el contenedor raíz es un no-op; el espaciado real se hace con `mt-6` suelto.
- El logo ocupa `h-28` (112px) contra los 64px que DESIGN.md fija para el header.
- `// Force refresh` al final de `NextAppointmentWidget.tsx` y un archivo `PatientDetailsPage.tsx.tmp.11540.1772154891882` en `src/pages/`.
- **Discrepancia entre evaluaciones, resuelta:** A midió `scrollWidth = 583` a 375px (desbordamiento de 208px); B midió `375 == 375` sin desbordamiento en carga limpia. La causa es el bug de reflow del tour: el panel a `left: 488px` genera el desbordamiento. No hay defecto en el grid de 12 columnas.
- **No reproducido:** el error `Maximum update depth exceeded` que apareció en consola durante el arranque de esta sesión no se reprodujo en 5 cargas del dashboard ni en 1 de `/login`. Queda registrado como observado una vez y sin atribuir.

## Questions to Consider

1. **¿Por qué el dashboard tiene un hero?** Un hero es un dispositivo de persuasión para alguien que no ha decidido nada. Marcela ya pagó y ya entró. ¿Qué gana esta pantalla con 418px de gradiente que no ganaría con una fila de 72px que diga "14:30 · Ana Rodríguez · Iniciar"?
2. **Si el calendario de disponibilidad desapareciera mañana, ¿alguien lo notaría?** Antes de arreglar sus tres defectos hay que decidir si merece un tercio del Command Deck o si su sitio es `/agenda`.
3. **¿Cuál es el estado por defecto de este producto: lleno o vacío?** ¿Se ha diseñado alguna vez esta página con 8 citas, 3 notas pendientes y 2 banderas de riesgo simultáneas? La composición sugiere que no.
4. **¿Qué promete esta pantalla que el cifrado impide cumplir?** El diagnóstico aparece en dos sitios del dashboard, pero PRODUCT.md prohíbe buscar, filtrar u ordenar por él. Mostrarlo de forma prominente enseña a esperar poder actuar sobre él.
5. **Si el backend cae en producción, ¿qué le dice Kio Health a un psicólogo sobre la seguridad de un paciente?** Hoy le dice, en verde y con un cero de 60 píxeles: "Todo al día. No hay alertas pendientes."
