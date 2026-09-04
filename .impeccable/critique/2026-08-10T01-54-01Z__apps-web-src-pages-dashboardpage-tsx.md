---
target: the principal dashboard
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-08-10T01-54-01Z
slug: apps-web-src-pages-dashboardpage-tsx
---
Method: dual-agent (A: revisión de diseño · B: detector + evidencia de navegador)

## Design Health Score

| # | Heurística | Score | Hallazgo clave |
|---|-----------|-------|----------------|
| 1 | Visibilidad del estado del sistema | 3 | Las tres superficies por fin coinciden. Resta: `staleTime` 5–10 min sin `refetchOnWindowFocus`, sin marca de frescura ni refresco manual. |
| 2 | Correspondencia con el mundo real | 3 | Vocabulario correcto, `'Doctor'` eliminado. Sigue cableado "Psicólogo", que no describe a dos de las cuatro audiencias. |
| 3 | Control y libertad | 3 | Escape/X/Omitir devuelven el foco al chip. Pero "Finalizar" no, y el disclosure lo tira al `<body>`. |
| 4 | Consistencia y estándares | 3 | Gradiente tokenizado, cero `backdrop-blur`, cero clases concatenadas con grep en CI. Rompe estándar: `aria-label` sobre `<span>` sin rol dentro de `gridcell`. |
| 5 | Prevención de errores | 3 | Ventana de 15 min intacta; el disclosure previene la exposición por hombro. Latente: `findByDate` no filtra estado y `getDaySummary` sí. |
| 6 | Reconocer antes que recordar | 3 | La nota al pie explica el número y la densidad se distingue. El título dice "Disponibilidad" y la retícula muestra ocupación. |
| 7 | Flexibilidad y eficiencia | 2 | Cuatro botones en `<main>`, cero atajos, cero refresco manual, y 31 paradas de foco que no hacen nada. |
| 8 | Estética y minimalismo | 3 | El deck lleno se lee; el vacío se comprime con dignidad. |
| 9 | Diagnóstico y recuperación de errores | 4 | `WidgetError` con `role="alert"` e `isError \|\| isPaused` en las seis consultas. Terminado. |
| 10 | Ayuda y documentación | 2 | El tour tiene **3 fallos de contraste medidos** (uno en ambos temas), botones a 42px y un anillo de resaltado que no pinta lo declarado. |
| **Total** | | **29/40** | **Acceptable, en el borde de Good — antes 25/40 y 14/40** |

La evaluación A puntuó 30/40 con ayuda y documentación en 3. Bajo esa heurística a 2 porque las mediciones de contraste del panel del tour de la evaluación B no estaban disponibles cuando A puntuó.

## Design Specificity Verdict

**Ya es una herramienta clínica, y esta ronda es la que la empuja al otro lado.** Tres decisiones no son intercambiables de categoría: el disclosure cerrado por defecto (un CRM no oculta su campo estrella; un producto cuyo argumento es el cifrado sí), `WidgetError` con el copy "Esto no significa que esté vacío", y las banderas de riesgo con tarjeta propia por encima del papeleo.

Lo que impide el sí pleno es lo mismo que hace dos rondas y **sigue sin tocarse**: no hay una sola referencia a dinero, y el widget más grande del deck sigue siendo un calendario de densidad mensual — una pregunta de recepción — en un producto cuya primera audiencia es un psicólogo sin personal administrativo. Se ha reparado ese calendario tres veces sin decidir nunca si debe estar.

**Deterministic scan.** 2 hallazgos, 1 regla, 1 archivo: los `gray-on-color` de `DashboardLayout.tsx:214`. La evaluación B verificó el razonamiento por tercera vez de forma independiente y coincide en que son falsos positivos. Cero hallazgos en la página, los widgets y el tour. El grep de CI: **0 coincidencias**.

**Visual overlays.** No disponibles; el panel no compone frames. Toda la evidencia es DOM, estilos computados y cuerpos de respuesta.

## Overall Impression

El P0 que arrastrábamos dos rondas está cerrado de verdad y en la capa correcta. Lo nuevo es un patrón que se repite tres veces: **la mitad accesible del arreglo**. Se puso `tabindex` sin `onClick`; se puso `aria-label` sin `role`; se devolvió el foco al cerrar pero no al terminar. Cada uno pasa una revisión de diff y falla al recorrer la pantalla con el teclado.

## What's Working

1. **La corrección de zona horaria es arquitectura, no parche.** `timezone.util.ts` define `zonedDayStart`/`zonedRange`/`zonedDayKey` y los usan tanto el rango como el bucketing, con rango semiabierto. Verificado extremo a extremo: `?date=2026-08-09&tz=America/Guatemala` → agenda "Día libre", hero "lunes 10", celda del 9 con "·" y la del 8 con "3". Las tres superficies coinciden.
2. **La defensa en profundidad de `TodayAgendaWidget`.** Filtra por `isSameDay` por su cuenta y dice cuántas ocultó, en vez de tragárselas.
3. **El contraste del calendario se sobre-corrigió con criterio.** De 1.83–3.37 a **6.95–17.36** sobre los extremos reales del gradiente. Y oscurecer la celda en lugar de aclarar el texto mantiene legible "más ocupado = más oscuro".

## Priority Issues

### [P1] El panel del tour tiene tres fallos de contraste, y uno es regresión mía de esta ronda

Medido: "Paso 1 de 4" **3.88:1**, el `<h3>` del título **3.88:1**, y el botón "Siguiente" **3.88:1 — que falla también en oscuro**, porque `bg-kanji` no tiene variante dark. Causa común: `#8a72d1` contra blanco y blanco contra `#8a72d1`, exactamente el valor que DESIGN.md marca como insuficiente para texto normal.

Yo puse ese `bg-kanji` en el botón la ronda pasada, mientras arreglaba contraste en el resto de la página. Es la Regla del Púrpura Legible violada en el mismo commit que la escribió.

**Fix.** `kanji-deep` en los tres: texto sobre blanco y fondo del botón primario. → `/impeccable audit`

### [P1] Revelar el contexto clínico tira el foco al `<body>`

Medido: se enfoca "Ver contexto clínico", se activa, y `document.activeElement` pasa a ser `BODY`. El botón se desmonta al revelarse y nadie recoge el foco. Tampoco expone `aria-expanded` (null antes y después), así que para un lector de pantalla el control simplemente desaparece.

Es la pieza que más distingue a este producto y su único camino de teclado es volver a tabular desde el principio del documento.

**Fix.** Un solo botón persistente con `aria-expanded` y `aria-controls` sobre un contenedor que se muestra u oculta, en vez de dos botones que se sustituyen. "Ocultar" deja de ser un control aparte y el foco nunca se mueve. → `/impeccable harden`

### [P1] 31 celdas alcanzan el foco y ninguna hace nada

`AvailabilityWidget`: cada día es un `<span>` con `tabIndex`, `aria-label`, flechas y anillo de foco — sin `onClick`, sin `role="button"`, sin `href`. Sam tabula, oye "domingo 16 de agosto: 1 cita", pulsa Enter y no pasa nada.

Es una regresión de affordance que introdujo el propio arreglo ARIA de esta ronda: prometer interactividad y no cumplirla es peor que no ser focalizable.

**Fix.** Decidir la acción — navegar a `/agenda?date=…` es la obvia. Si la respuesta es "ninguna", entonces quitar `tabindex` y flechas y exponerlo como `role="table"`. → `/impeccable layout`

### [P2] "Finalizar" el recorrido pierde el foco

`handleNext` no restaura `openerRef`; solo `handleSkip` lo hace. Terminar el tour por el botón principal deja el foco en un nodo desmontado. Media corrección de foco lee peor que ninguna: documenta que se entendió el problema y se cubrió solo el camino de abandono. El usuario que **completa** la única onboarding del producto es el que peor sale.

**Fix.** Extraer el patrón a `closeTour(fn)` y usarlo en ambos. → `/impeccable harden`

### [P2] El nombre accesible de la retícula vive en el elemento equivocado

Estructura ARIA verificada y correcta: 7 `role="row"`, 7 `columnheader`, 42 `gridcell`, exactamente un `tabindex="0"` y 30 a `-1`, flechas funcionando en los cuatro sentidos. Pero el `tabindex` y el `aria-label` cuelgan de un `<span>` **sin rol** dentro del `gridcell`: `aria-label` sobre `role=generic` está prohibido por ARIA, y la celda que sí tiene rol queda anónima.

**Fix.** Mover `tabindex`, `aria-label` y el manejador de teclado al propio `gridcell`. → `/impeccable audit`

### [P2] La divergencia numérica que arreglamos sigue en el código, dormida

`findByDate` no filtra por estado; `getDaySummary` hace `status: { not: 'CANCELLED' }`. Dos endpoints, dos definiciones de "cita que cuenta". Hoy es invisible porque hoy hay cero citas; una cita cancelada hoy reproduce el "la lista dice 3, la celda dice 2" del informe anterior.

**Fix.** Un predicado compartido usado por ambos, y un test que fije la equivalencia en un día con una cita cancelada. → `/impeccable harden`

### [P3] El anillo del tour no pinta lo declarado

Lectura estable (dos mediciones separadas, idénticas): en oscuro `outline: 3px solid rgb(174,147,254)`; en claro `3px solid rgb(91,70,168)`. La regla declara 4px y `#ae93fe`. El color coincide con el `currentColor` del elemento resaltado en cada tema — en oscuro acierta por coincidencia, porque el ítem activo es `text-kio`.

Es decir: mi arreglo de la ronda pasada **no funcionó**; el anillo sigue tomando `currentColor` y un ancho de 3px que no es el declarado. El resaltado se ve, pero no es el que pedí. Esto zanja lo que dejé como no verificable: no era un artefacto de medición.

**Fix.** Investigar qué declaración gana; probablemente pintar el anillo con un pseudo-elemento en vez de `outline`. → `/impeccable polish`

## Persona Red Flags

**Alex.** Cuatro botones y ningún atajo. `staleTime` de 5–10 min sin `refetchOnWindowFocus` ni indicador de frescura: vuelve de una sesión de 50 minutos y no sabe si lo que lee es de ahora. Y la cuenta atrás del hero se refresca cada 30s, así que la página **parece** viva mientras el resto está congelado. Descubrirá que las flechas recorren un calendario inerte y dejará de tabular.

**Sam.** Contraste de la página resuelto y con margen: barrido completo de `<main>` en ambos temas, **0 fallos AA**, peor caso 5.96:1 sobre el gradiente. Objetivos táctiles: 0 por debajo de 44px. Encabezados sin saltos, 0 imágenes sin `alt`, 0 botones sin nombre. Y el focus trap del tour pasa los tres vectores. Quedan: el `aria-label` sobre `span` sin rol, el foco perdido dos veces, la ausencia de `aria-expanded`, los botones del tour a 42px y los tres fallos de contraste del panel.

**Marcela.** Domingo 19:35, abre el móvil para cerrar el día. Lee "Día libre" — correcto, y por primera vez en tres rondas es verdad. Ve que la próxima es mañana. Y ahí se le acaba el producto: ayer dio tres sesiones y esta pantalla no le dice si cobró ninguna. Cierra la app y abre su hoja de cálculo. **El dashboard resolvió el "qué me toca ahora" y sigue sin tocar el "qué me quedó pendiente de ayer", que es el ritual real de las 19:35.**

## Minor Observations

- La fecha de hoy se imprime dos veces a 200px de distancia, en dos formatos distintos (`toLocaleDateString` y `date-fns/format`).
- `freeHours` se sigue calculando en `buildCalendarDays` — 31 iteraciones con un `Set` por día — y ya no lo consume nadie desde que salió del `aria-label`. Código muerto con coste de render.
- Se piden 42 días a `day-summary` para pintar 31: se descartan 11 en cada carga.
- El grep de CI cubre valores arbitrarios entre corchetes, pero no atrapa `text-white/80font-bold` ni `rounded-xlborder`. Es el 80% de la red, no la red completa.
- Los botones del panel del tour miden 42×42 pese a llevar `min-h-11`: 2px por debajo del mínimo.
- Datos de semilla incoherentes que el hero amplifica a 48px: calcula "50 años" de `dateOfBirth` mientras el contexto clínico dice "Paciente adolescente (17 años)".
- Las 6 peticiones del dashboard se disparan dos veces por carga (StrictMode, solo en dev).
- `Maximum update depth exceeded` reaparece en `/login` cuando la API no responde. Es el error que vimos al arrancar la sesión y que no se reprodujo en el dashboard: ahora sabemos que vive en la pantalla de login bajo fallo de API. Fuera del objetivo de esta auditoría, pero reproducible.
- Sin desbordamiento horizontal a 375 ni a 1280. "Agenda de hoy" a 276px en móvil.

## Questions to Consider

1. **Si el calendario de disponibilidad desapareciera mañana, ¿alguien lo notaría?** Tercera ronda que se repara, tercera que no se decide. Ya ha consumido más presupuesto de arreglo que cualquier otro widget.
2. **¿Por qué el dashboard sigue sin mencionar el dinero?** Tercera vez que se pregunta, sin respuesta y sin cambio.
3. **Se puso `tabindex` sin `onClick`, `aria-label` sin `role`, y foco de vuelta al cerrar pero no al terminar.** Tres veces el mismo patrón. ¿Hay alguien recorriendo la pantalla solo con teclado antes de dar algo por hecho, o la accesibilidad se verifica leyendo el diff?
4. **`getDaySummary` filtra por estado y `findByDate` no.** ¿Qué prueba impide que eso vuelva a divergir, ahora que la zona horaria ya no lo tapa?
5. **La ronda anterior escribió la Regla del Púrpura Legible y la violó en el mismo commit, en el botón "Siguiente".** ¿De qué sirve documentar una regla que el sistema no puede hacer cumplir?
