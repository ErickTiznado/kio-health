---
target: the principal dashboard
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
timestamp: 2026-08-09T22-52-28Z
slug: apps-web-src-pages-dashboardpage-tsx
---
Method: dual-agent (A: revisión de diseño · B: detector + evidencia de navegador)

## Design Health Score

| # | Heurística | Score | Hallazgo clave |
|---|-----------|-------|----------------|
| 1 | Visibilidad del estado del sistema | 1 | La página da tres cifras distintas para el mismo día: agenda lista 3 citas, el hero dice que la próxima es mañana, el calendario pinta 2. |
| 2 | Correspondencia con el mundo real | 3 | Vocabulario ya correcto. Restos: `'Doctor'` como fallback, "Psicólogo" cableado bajo el nombre. |
| 3 | Control y libertad | 3 | Tour invocable, Escape cierra, backdrop no descarta. Falta trampa de foco y devolver el foco al chip. |
| 4 | Consistencia y estándares | 2 | Cuatro clases Tailwind concatenadas sin espacio; segundo gradiente con hex fuera de paleta; 5 `backdrop-blur` fuera de las excepciones. |
| 5 | Prevención de errores | 3 | Sin CTAs muertas. La ventana de 15 min sigue siendo buena barrera. |
| 6 | Reconocer antes que recordar | 2 | El calendario necesita leyenda para explicarse y sus escalones de densidad son indistinguibles. |
| 7 | Flexibilidad y eficiencia | 1 | 6 elementos interactivos en `<main>`, cero atajos, 31 celdas no focalizables, datos de hasta 10 min sin señal de frescura. |
| 8 | Estética y minimalismo | 3 | El vacío ya no grita; el deck lleno se lee. |
| 9 | Diagnóstico y recuperación de errores | 4 | `WidgetError` con `role="alert"`, copy honesto, y `isError \|\| isPaused`. Terminado. |
| 10 | Ayuda y documentación | 3 | 4 pasos, sin cambio de ruta, `aria-modal`, foco al panel. `.tour-highlight` computa `box-shadow` transparente. |
| **Total** | | **25/40** | **Acceptable — antes 14/40** |

## Design Specificity Verdict

**Ya no es genérico, pero sigue siendo un dashboard antes que una herramienta clínica.** El hero se comprime cuando no hay sesión, el riesgo tiene tarjeta propia, el calendario dejó de mentir y todo widget tiene tercer estado: eso es autoría.

No pasa la prueba todavía por dos razones concretas. El continuo `agenda → sesión → nota → cobro` **sigue roto en su entrada**: no hay una sola referencia a dinero en la página, y la primera audiencia de PRODUCT.md es un psicólogo sin personal administrativo que cierra el día cobrando. Y el widget más grande del deck (790×588px) sigue siendo un calendario de densidad mensual — preocupación de recepción — mientras la pregunta clínica real ocupa 5 de 12 columnas.

**Deterministic scan.** `detect.mjs`: 2 hallazgos, 1 regla, 1 archivo — los dos `gray-on-color` de `DashboardLayout.tsx:214`. La evaluación B verificó el razonamiento de forma independiente y **coincide en que son falsos positivos**: `hover:bg-rose-50` y `hover:text-rose-700` comparten variante, así que el gris nunca se pinta sobre rosa; el detector no modela variantes. `DashboardPage.tsx`, los widgets y `TourOverlay.tsx`: **0 hallazgos**.

El detector no vio el defecto más grave del scan: cuatro clases Tailwind inválidas por falta de un espacio. Las clases rotas no existen, así que ningún linter de clases las reporta.

**Visual overlays.** No disponibles: el panel del navegador no compone frames. Toda la evidencia es DOM y estilos computados; no hay confirmación de rasterización.

## Overall Impression

La ronda anterior funcionó donde apuntó. El manejo de errores pasó de 0 a 4 y es lo mejor de la página. La jerarquía móvil se invirtió de verdad: la agenda de hoy está a 276px, no a 1440.

Pero el P0 se resolvió y **reapareció por otra puerta con el signo invertido**. Antes decía "no tienes nada" teniendo pacientes; ahora dice "tienes tres hoy" cuando hoy no hay ninguna. La regla que escribimos en DESIGN.md cubre `isError`; no cubre "el dato llegó pero es de otro día". La lección general — *una superficie clínica no afirma un hecho que no puede sostener* — sigue sin estar cubierta.

## What's Working

1. **`WidgetError` + el manejo de `isPaused`.** Distinguir "no hay datos" de "no pude leerlos" ya es raro; darse cuenta de que React Query aparca una petición offline en `pending` para siempre, y de que un widget que solo mira `isError` seguiría cayendo en "Día libre", es una observación que casi nadie hace. Replicable al resto del producto.
2. **`AttentionPanel` corrigió la precedencia sin inventar un widget.** `hasRisk` ya no depende de `!hasPending`. La forma siempre fue correcta; ahora la lógica también.
3. **`buildCalendarDays` se reconstruyó bien y con la razón escrita en el código.** 31 celdas verificadas, el 1 de agosto bajo sábado, `aria-label` por celda, contador visible.

## Priority Issues

### [P0] "Agenda de hoy" muestra la agenda de ayer

`getTodayDateString()` deriva la fecha de `toISOString()` (UTC). Con el reloj en GMT-6 a las 16:39 del domingo 9, `GET /appointments?date=2026-08-09` devuelve tres citas cuyos `startTime` son `2026-08-08T21:01Z`, `2026-08-09T00:01Z` y `2026-08-09T01:01Z` — **15:01, 18:01 y 19:01 del sábado 8 en hora local**. El widget las pinta con `format(startTime,'HH:mm')`, que descarta el día, bajo el titular "Agenda de hoy — domingo 9". Mientras tanto `/appointments/next` responde bien (lunes 10) y `day-summary` agrupa en UTC. Tres superficies, tres respuestas.

A las 16:39 esas tres se leen como **sesiones perdidas**. Y la ventana en que se rompe — la tarde/noche local, cuando UTC ya cambió de día — es exactamente la de "cerrar el día" que PRODUCT.md nombra como momento de uso.

**Fix.** (a) `getTodayDateString()` con `format(new Date(),'yyyy-MM-dd')` local, nunca `toISOString()`. (b) El backend recorta en la zona del clínico, no del servidor. (c) El mismo criterio de día alimenta agenda, hero y `day-summary`, o las cifras volverán a divergir. (d) Defensa de diseño independiente del backend: `TodayAgendaWidget` descarta o marca "ayer" cualquier cita cuyo día local no sea hoy.

**Suggested command:** `/impeccable harden`

### [P1] Cuatro clases Tailwind rotas invertían la jerarquía de la fila — YA CORREGIDO

`text-[11px]text-gray-400` y `text-[11px]font-bold`: falta el espacio, Tailwind no genera nada. Medido antes del arreglo: `SEG` y `50m` a **16px/400**, mayores que el nombre del paciente (12px/600) y que la hora (11px/700). El componente mejor valorado de la crítica anterior quedó con el código de tipo de cita como texto dominante.

Es una regresión que introduje al subir el suelo tipográfico de 8–9px a 11px. Ya está corregido y verificado: `SEG` 11px/700, `50m` 11px/500, `0/3` 11px/700, nombre del paciente a 14px/600. Recomendado añadir a CI un grep de `text-\[\d+px\](?=[a-z])`.

**Suggested command:** `/impeccable polish`

### [P1] Los números del calendario no alcanzan AA en ninguna celda

Blanco con opacidades 0.36–1.0 sobre el gradiente. Medido contra ambos topes: número de día vacío **2.66 / 2.10**, día con citas **3.37 / 2.62**, contador "·" **2.23 / 1.83**, contador "3" **2.74 / 2.21**. A 14px/700 el umbral es 4.5:1 (no es texto grande: hacen falta ≥18.66px en negrita). El peor caso es 1.83:1.

El widget se reparó estructuralmente pero su legibilidad nunca se midió. Además la escala de densidad `white/15 → /25 → /40 → /60 → white` es indistinguible entre pasos contiguos.

**Fix.** Subir todas las celdas a texto blanco pleno y codificar densidad con un token opaco sobre el gradiente en lugar de opacidad del blanco.

**Suggested command:** `/impeccable colorize`

### [P1] El diagnóstico y el contexto clínico ocupan el elemento más grande de la pantalla

`DiagnosisTags` renderiza `patient.diagnosis` como chip destacado y `clinicalContext` como párrafo, dentro de un hero de 790×588px. En la sesión revisada: "Depresión Mayor" y "Paciente adolescente (17 años)… padres divorciados".

Son dos de los seis campos cifrados en reposo. El cifrado protege el dato en la base y el diseño lo publica a metro y medio en la pantalla que queda abierta cuando el paciente entra. `RecentPatientsWidget` ya aprendió esta lección — su `reason` es explícitamente `null` con comentario — y el hero no. Media corrección lee peor que ninguna: documenta que se entendió el riesgo y no se aplicó donde más pesa.

**Fix.** El hero muestra nombre, hora, número de sesión y CTA. Diagnóstico y contexto tras un disclosure explícito, o en `/session/:id`, que es una superficie que el clínico abre a propósito.

**Suggested command:** `/impeccable harden`

### [P2] El calendario no es accesible como retícula

`role="grid"` con **0 elementos `role="row"`** y 31 `gridcell` colgando directos — patrón ARIA inválido. **0 celdas focalizables.** Los siete `<abbr>` de cabecera no son `columnheader`. Y `freeHours`, calculado con un horario 9:00–18:00 cableado en `dashboard.helpers.ts`, aparece **solo** dentro del `aria-label`: una cifra que nadie configuró y que ahora solo oye quien usa lector de pantalla.

**Fix.** Decidir primero si el widget pertenece a `/agenda`. Si se queda: `role="row"` por semana, `columnheader` en cabeceras, `tabindex` roving, y quitar `freeHours` del `aria-label` hasta que el horario sea configurable.

**Suggested command:** `/impeccable audit`

### [P2] Contrastes sueltos y objetivos táctiles del tour

Medidos en claro: chip "Ver recorrido guiado" **3.88**, eyebrow de fecha **4.29**, avatar "DR" sobre su gradiente **2.50/3.88**, "Programada: lunes 10" sobre el tope claro del hero **3.76**, nota al pie del calendario **4.47**. Los cuatro botones del tour miden 42px de alto y la X 42×42. `Configuración` era el único `NavLink` del sidebar sin `min-h-11` (40px) — **ya corregido**, igual que el texto del estado vacío de la agenda.

**Suggested command:** `/impeccable audit`

## Persona Red Flags

**Alex (power user).** Seis elementos interactivos en todo `<main>` y ningún atajo. Sin `refetchOnWindowFocus` y con `staleTime` de 5–10 min, vuelve de una sesión de 50 minutos y lee datos viejos sin marca de frescura ni botón de refrescar. Las 31 celdas del calendario no se alcanzan con Tab. Y en cuanto descubra que la agenda de hoy trae las de ayer, abrirá `/agenda` directamente: la pantalla se convierte en una redirección con gradiente.

**Sam (accesibilidad).** Mejoras reales y medidas: 0 botones sin nombre accesible, objetivos de 44px en el producto, `focus-visible:ring-kio` en filas, tarjetas y tour, encabezados H1→H2→H3 sin saltos, y el modo oscuro sólido (`kio` sobre slate-900 = 7.2:1). Quedan: el `role="grid"` sin filas ni celdas focalizables; el tour no atrapa el foco (Tab escapa al fondo, que no está `inert`) ni lo devuelve al chip al cerrar; `aria-live="polite"` más movimiento de foco produce doble anuncio.

**Marcela (psicóloga, 4 minutos entre sesiones).** Abre el móvil a las 16:39. La agenda es lo primero (276px — la inversión funcionó). Lee "0/3" y tres nombres, el primero a las 15:01: cree que faltó a una sesión. Mira el hero: la próxima es mañana. Tiene una contradicción y tres minutos y medio. La sesión que sí dio ayer sigue sin registrarse en ninguna parte visible, porque no hay cobros en la pantalla.

## Minor Observations

- `formatDateHeader()` usa hora local y `getTodayDateString()` usa UTC: **dos definiciones de "hoy" en el mismo flujo de datos**.
- Discrepancia numérica confirmada: agenda y `<title>` dicen 3 citas hoy; la celda del día 9 dice 2. Endpoints distintos, ambos en 200 — uno filtra por estado y el otro no.
- `text-white/80` sobre el tope claro del gradiente mide 4.41:1, justo bajo AA; `/90` lo resuelve.
- Segundo gradiente del sistema con dos hex crudos (`#45348a`, `#6b52b8`) que no son tokens; DESIGN.md sigue diciendo que el avatar es la única excepción.
- Cinco `backdrop-blur` en `NextAppointmentWidget`, fuera de las dos excepciones permitidas.
- `hover:scale-105` en "Iniciar Consulta" cuando el sistema define el press como `active:scale-95`; y `rounded-2xl` en botones donde el radio de trabajo es `rounded-xl`.
- `'Doctor'` como fallback en `DashboardLayout.tsx:111` vs `'Profesional'` en `DashboardPage.tsx`.
- `"Psicólogo"` cableado: no distingue rol de clínica ni personal administrativo, dos de las cuatro audiencias.
- `.tour-highlight` declara un anillo `kio` con `!important` pero computa `box-shadow` transparente; además el `overflow-hidden` del deck lo recortaría.
- `recentPatients` sigue hidratándose desde `localStorage`: en equipo compartido persiste el historial del clínico anterior.
- Consola: **0 errores, 0 warnings**. Red: **8/8 peticiones en 200**. Sin desbordamiento horizontal a 375 ni a 1280.

## Questions to Consider

1. **¿Cuál es la definición de "hoy" en este producto, y dónde vive?** Hoy hay al menos tres y las tres aparecen a la vez en la misma pantalla. Antes de tocar otro pixel, esa definición necesita un único lugar y una prueba que la fije.
2. **Si el calendario de disponibilidad desapareciera mañana, ¿alguien lo notaría?** Se reparó, no se decidió. Reparar antes de decidir es como un dashboard acumula widgets.
3. **¿Por qué el dashboard no menciona el dinero?** Cuatro de los cinco eslabones del recorrido diferenciador están aquí. El cobro, ninguno.
4. **¿Qué gana el clínico viendo el diagnóstico de su paciente a 48px?** Él ya lo sabe. La única persona para quien ese texto es información nueva es quien pasa por detrás de la pantalla.
5. **La ronda fue disciplinada, dejó comentarios excelentes y aun así introdujo una regresión que `npm run build` no detecta.** ¿Qué prueba automática habría atrapado "SEG a 16px"? Mientras la respuesta sea "ninguna", la calidad visual depende de que alguien mire, cada vez.
