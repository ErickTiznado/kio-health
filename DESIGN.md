---
name: Kio Health
description: Plataforma de gestión clínica para psicólogos — plana, cálida y de púrpura contenido.
colors:
  lavanda-kio: "#ae93fe"
  lavanda-kio-veil: "rgba(174, 147, 254, 0.28)"
  purpura-kanji: "#8a72d1"
  purpura-kanji-hondo: "#5b46a8"
  lavanda-cruz: "#ddd3fa"
  lino-calido: "#f5f3ef"
  lino-sombra: "#ece9e3"
  pizarra-profunda: "#213547"
  gris-secundario: "#64748b"
  gris-muted: "#94a3b8"
  borde-claro: "#e2e8f0"
  noche-base: "#020617"
  noche-superficie: "#0f172a"
  noche-elevada: "#1e293b"
  noche-texto: "#f8fafc"
  exito: "#10b981"
  aviso: "#f59e0b"
  peligro: "#f43f5e"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 2rem
    letterSpacing: "normal"
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.5rem
    letterSpacing: "normal"
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25rem
    letterSpacing: "normal"
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1rem
    letterSpacing: "0.05em"
  caption:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1rem
    letterSpacing: "normal"
rounded:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "20px"
  xl: "28px"
  2xl: "16px"
  3xl: "24px"
  hero: "40px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.lavanda-kio}"
    textColor: "#ffffff"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "8px 14px"
  button-primary-hover:
    backgroundColor: "{colors.purpura-kanji}"
  button-ghost:
    backgroundColor: "{colors.noche-superficie}"
    textColor: "{colors.gris-secundario}"
    rounded: "{rounded.xl}"
    padding: "8px 14px"
  button-danger:
    textColor: "{colors.peligro}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  card:
    backgroundColor: "#ffffff"
    textColor: "{colors.pizarra-profunda}"
    rounded: "{rounded.2xl}"
    padding: "16px 24px"
  input:
    backgroundColor: "{colors.lino-sombra}"
    textColor: "{colors.pizarra-profunda}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "10px 14px"
  badge:
    rounded: "{rounded.full}"
    typography: "{typography.caption}"
    padding: "4px 12px"
  nav-item-active:
    backgroundColor: "{colors.lavanda-kio-veil}"
    textColor: "{colors.lavanda-kio}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
  modal:
    backgroundColor: "#ffffff"
    rounded: "{rounded.3xl}"
    padding: "32px"
---

# Design System: Kio Health

## Overview

**Creative North Star: "El Consultorio Sereno"**

Kio Health se diseña como la sala de terapia que representa: nada compite por atención, todo
está donde debe estar. La base no es blanca sino un lino cálido (`#f5f3ef`) — la decisión
más consecuente del sistema, porque desplaza al producto entero fuera del registro
frío-sanitario y hacia algo habitable. Sobre esa base, un púrpura lavanda (`#ae93fe`) que
aparece poco y por eso pesa mucho: marca el ítem activo, el botón que importa, el foco. El
resto es slate.

Las superficies son planas. La jerarquía se comunica con espacio, peso tipográfico y color,
nunca con profundidad simulada: no hay gradientes (salvo un avatar), no hay glow (salvo un
indicador de 4px en el sidebar), no hay blur fuera de los overlays modales. Lo que queda es
una retícula estricta con esquinas muy blandas — **blandos pero precisos**: radios generosos
de 16 a 28px sobre alineación y espaciado sin concesiones.

El modo oscuro no es una variante: es la mitad del sistema. Cada decisión de color existe en
lino y en slate, y una superficie sin su par `dark:` está incompleta, no "pendiente".

**Key Characteristics:**
- Base lino cálido, no blanco — la calidez es la posición, no el adorno
- Púrpura escaso: acento, nunca relleno
- Planitud absoluta; la profundidad es un error, no un recurso
- Radios blandos (16–28px) sobre retícula rígida
- Dark mode como par obligatorio de toda decisión
- Vocabulario de iconos único (Lucide), sin mezcla

## Colors

Una paleta de un solo acento: púrpura de marca sobre neutros cálidos en claro y slate en
oscuro, con semánticos reservados para estado clínico y financiero.

### Primary
- **Lavanda Kio** (`#ae93fe`): el único acento. CTAs, ítem de navegación activo, anillo de
  foco, punto de dato activo en gráficas, `accent-color` de los inputs de fecha nativos.
  Aparece en menos del 10% de cualquier pantalla.
- **Velo Lavanda Kio** (`rgba(174, 147, 254, 0.28)`): fondo del estado activo en el sidebar y
  de badges de marca. Es el púrpura como superficie, no como tinta.
- **Púrpura Kanji** (`#8a72d1`): la variante grave. Hover sobre neutros y el extremo oscuro
  del único gradiente del sistema. Sobre blanco alcanza 3.88:1, así que **sirve para texto
  grande, no para texto normal**.
- **Púrpura Kanji Hondo** (`#5b46a8`): el púrpura que sí es legible. Texto de marca sobre
  superficies claras (6.6:1 sobre lino) y fondo de los botones sólidos de marca con texto
  blanco (7.3:1). Existe porque ni `kio` (2.2:1) ni `kanji` (3.9:1) alcanzan AA para texto
  normal sobre lino, y el nombre del propio usuario en el encabezado era el texto menos
  legible de la aplicación.
- **Lavanda Cruz** (`#ddd3fa`): acento pálido. Skeletons de carga (`bg-cruz/40`) y realces
  muy suaves. Nunca lleva texto encima.

### Neutral — modo claro
- **Lino Cálido** (`#f5f3ef`): fondo base *y* superficie. En claro no hay contraste entre
  lienzo y panel; la separación se hace con borde, no con tono.
- **Lino Sombra** (`#ece9e3`): superficie secundaria y hover sutil.
- **Pizarra Profunda** (`#213547`): texto principal. Es un azul desaturado, no negro — la
  contraparte fría que impide que el lino se vuelva sepia.
- **Gris Secundario** (`#64748b`) y **Gris Muted** (`#94a3b8`): texto de apoyo y helper.
- **Borde Claro** (`#e2e8f0`): divisiones y contornos de card.

### Neutral — modo oscuro
- **Noche Base** (`#020617`): lienzo de página.
- **Noche Superficie** (`#0f172a`): cards, sidebar, header. Es el suelo oscuro real.
- **Noche Elevada** (`#1e293b`): superficies elevadas, inputs, hover, tooltips.
- **Noche Texto** (`#f8fafc`): texto principal en oscuro.

### Tertiary — semánticos
- **Éxito** (emerald `#10b981`): sesión completada, pago recibido, indicador de bienestar ≥ 8.
- **Aviso** (amber `#f59e0b`): pendiente, nota fijada, indicador ≥ 5.
- **Peligro** (rose / red `#f43f5e`): cancelación, acción destructiva, bandera de riesgo,
  indicador < 5.

### Named Rules

**La Regla del Acento Escaso.** El Lavanda Kio ocupa ≤10% de cualquier pantalla. Si dos
elementos compiten en púrpura, uno de los dos está mal.

**La Regla del Lino.** El fondo claro nunca es `#ffffff` a nivel de página. El blanco puro
existe solo dentro de cards y modales, y su función es despegarse del lino — invertirlo
rompe el sistema.

**La Regla del Suelo Slate.** En oscuro, el mínimo es `#0f172a`. Nunca `dark:bg-black`.

**La Regla del Púrpura Legible.** El Lavanda Kio nunca lleva texto encima ni se usa como
color de texto sobre superficies claras. Para púrpura legible sobre claro, y para el fondo de
un botón sólido de marca, el color es el Kanji Hondo.

## Typography

**Familia real en pantalla:** la pila `sans-serif` del sistema (`ui-sans-serif, system-ui,
-apple-system, "Segoe UI", …`), heredada de Tailwind.
**Familias cargadas pero sin aplicar:** Inter (400/500/600/700) y Roboto (400/500/700) se
descargan desde Google Fonts en `index.html` y existen como tokens (`--font-inter`,
`--font-roboto`), pero solo hay **dos** usos en toda la aplicación. En la práctica el
producto renderiza en la fuente del sistema. Ver *Do's and Don'ts*: esto es deuda a resolver,
no una invariante a preservar.

**Character:** neutra y funcional. La personalidad tipográfica no viene de la familia sino
del contraste de pesos y del uso de versalitas espaciadas para etiquetas — un gesto de
formulario clínico bien impreso.

### Hierarchy
- **Display** (700, `1.5rem`/`text-2xl`): títulos de página y cifras destacadas del dashboard.
- **Title** (700, `1rem`/`text-base`): títulos de card y de sección.
- **Body** (500, `0.875rem`/`text-sm`): el peso de trabajo de toda la interfaz. Casi todo el
  texto de Kio es `text-sm font-medium`.
- **Label** (700, `0.6875rem`/`text-[11px]`, `tracking-wider`, mayúsculas): etiquetas de campo
  y encabezados de columna. Es la firma tipográfica del sistema.
- **Caption** (400–500, `0.75rem`/`text-xs`): texto muted, helper y metadatos.
- **Micro** (500, `0.625rem`/`text-[10px]`): tags dentro de cards.

### Named Rules

**La Regla del Rango Medio.** El sistema vive entre `font-medium` (500) y `font-bold` (700).
Ni `font-light` ni `font-black` existen; la jerarquía se resuelve con tamaño y color antes
que con peso extremo.

**La Regla de la Versalita.** Toda etiqueta de campo va en `text-[11px] font-bold uppercase
tracking-wider`. Es el único lugar donde se usan mayúsculas.

## Layout

Shell fijo de dos zonas: sidebar de navegación de ancho constante (`w-64` móvil, `w-60` en
`lg`, `w-64` en `xl`) y una columna de contenido con header pegajoso de 64px. El sidebar es
un cajón deslizante bajo `lg` (con overlay `bg-black/30`) y pasa a fijo desde `lg`.

Padding de página `p-4` en móvil y `p-6` desde `sm`. Los contenedores acotados usan
`max-w-md` para diálogos y formularios de autenticación, y `max-w-5xl` para vistas de
contenido ancho.

Breakpoints en uso, por frecuencia real: `sm` (640px) es el principal punto de ajuste y
absorbe la mayor parte del trabajo responsive; `lg` (1024px) es el umbral estructural donde
el sidebar deja de ser cajón; `md` y `xl` son ajustes puntuales.

Ritmo de espaciado: `gap-1` iconos inline, `gap-2` controles de formulario, `gap-3` estándar
entre elementos, `gap-4` secciones dentro de una card, `gap-6` entre secciones.

### Named Rules

**La Regla del Umbral lg.** El cambio estructural ocurre una sola vez, en `lg`. Introducir un
segundo reflow mayor en `md` fragmenta el shell.

## Elevation & Depth

Sistema **plano por defecto**. Las superficies no flotan en reposo: se separan por borde y
por tono (lino contra blanco en claro; `slate-900` contra `slate-950` en oscuro). La sombra
no describe altura, describe **estado**.

### Shadow Vocabulary
- **Reposo** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)` — `shadow-sm`): card quieta, avatar,
  punto indicador. Es casi imperceptible y esa es la intención.
- **Respuesta** (`shadow-md` en hover): la card contesta al puntero. Nunca es su estado base.
- **Marca** (`shadow-md shadow-kio/20`): exclusivo del botón primario. La sombra teñida es la
  única licencia cromática de profundidad.
- **Flotante** (`shadow-xl` / `shadow-2xl`, y `shadow-xl shadow-black/10 dark:shadow-black/40`
  en dropdowns): elementos genuinamente despegados del plano — modales, menús contextuales.
- **Dato activo** (`shadow-lg shadow-kio/30`): punto seleccionado en una gráfica.

### Named Rules

**La Regla del Plano en Reposo.** Ninguna superficie lleva sombra mayor que `shadow-sm` sin
que el usuario haya hecho algo. `shadow-lg` en una card quieta es un error.

**La Regla de la Sombra Única.** Como máximo dos modificadores de sombra por elemento. Apilar
box-shadows para fingir profundidad está prohibido.

## Shapes

Lenguaje de esquina muy blando sobre geometría rectangular estricta. No hay biseles, ni
recortes, ni formas orgánicas: solo rectángulos con radios grandes y círculos completos.

La escala real, tal como la genera Tailwind v4 desde `@theme` en `src/index.css`:

| Clase | Valor real | Uso |
|---|---|---|
| `rounded-xs` | 6px | tags y badges inline |
| `rounded-sm` | 10px | (definido, prácticamente sin uso) |
| `rounded-md` | 14px | contenedores menores |
| `rounded-lg` | 20px | ítems de navegación, botones destructivos |
| `rounded-xl` | **28px** | el radio de trabajo: botones, inputs, chips |
| `rounded-2xl` | 16px | cards principales |
| `rounded-3xl` | 24px | modales |
| `rounded-full` | 9999px | avatares, badges pill, indicadores |

**Advertencia estructural:** la escala **no es monótona**. El proyecto redefine `--radius-xs`
a `--radius-xl` en `@theme` pero deja `2xl` y `3xl` en los valores por defecto de Tailwind, de
modo que `rounded-xl` (28px) es más redondo que `rounded-2xl` (16px) y que `rounded-3xl`
(24px). En consecuencia, hoy los **botones son más redondos que las cards que los contienen**.
Está documentado aquí como el estado real del sistema, no como una intención.

Los bordes son de 1px y de color neutro (`gray-200` / `slate-800` en oscuro). El borde hace
el trabajo que en otros sistemas hace la sombra.

## Components

### Buttons
- **Shape:** esquinas muy blandas (`rounded-xl`, 28px). El destructivo usa 20px
  (`rounded-lg`).
- **Primary:** Lavanda Kio de fondo, texto blanco, `py-3 px-4` (o `px-3.5 py-2` en barras),
  `font-bold`, `shadow-md shadow-kio/20`.
- **Hover / Focus:** `hover:bg-kio/90`; el press es `active:scale-95` con
  `transition-all duration-150`.
- **Secondary / Ghost:** superficie blanca o `slate-800`, borde neutro, texto gris; el hover
  solo oscurece el borde.
- **Danger:** sin fondo en reposo; texto rose-600 y `hover:bg-rose-50` /
  `dark:hover:bg-rose-900/20`.

### Cards / Containers
- **Corner Style:** 16px (`rounded-2xl`).
- **Background:** blanco puro en claro, `slate-900` en oscuro.
- **Shadow Strategy:** `shadow-sm` en reposo, `hover:shadow-md`. Ver *Elevation & Depth*.
- **Border:** 1px `gray-200` / `slate-800` — hace el trabajo principal de separación.
- **Internal Padding:** `px-4 py-3` a `px-6 py-4`.
- **Variante fijada:** contenido pinneado en `bg-amber-50/30` / `dark:bg-amber-900/10` con
  borde ámbar.

### Inputs / Fields
- **Style:** fondo `gray-50/50` (claro) o `slate-800` (oscuro), borde 1px, `rounded-xl`
  (28px), `py-2.5 px-3.5`, `text-sm font-medium`.
- **Focus:** borde a Lavanda Kio más anillo `ring-2 ring-kio/50`, sin `outline` nativo.
- **Placeholder:** `gray-400` / `slate-500`.

### Navigation
- **Ítem activo:** fondo velo lavanda (`bg-kio-light`, `dark:bg-kio/10`), texto Lavanda Kio,
  `rounded-lg` (20px), y una **barra indicadora izquierda** de `w-1 h-6` en Lavanda Kio con
  `rounded-r-full` y `shadow-[0_0_10px_rgba(174,147,254,0.4)]`.
- **Ítem inactivo:** texto `gray-600` / `slate-400`; hover cambia superficie y tiñe el texto a
  Púrpura Kanji (claro) o Lavanda Kio (oscuro).
- **Móvil:** cajón deslizante desde la izquierda con overlay `bg-black/30`, oculto desde `lg`.

### Badges / Chips
- **Pill** (`rounded-full`, `px-3 py-1`, `text-xs font-bold tracking-wide`) con par de color
  semántico: emerald para completado, amber para pendiente, rose para cancelado.
- **Tag micro** (`text-[10px] font-medium`, `bg-gray-100` / `slate-800`, `px-2 py-0.5`,
  `rounded-full`) para metadatos dentro de cards.

### Modals
- **Overlay:** `bg-gray-900/40` / `dark:bg-black/60` con `backdrop-blur-sm`. Es, junto al
  omnibox, el **único** lugar donde el blur está permitido.
- **Contenido:** blanco / `slate-900`, `rounded-3xl` (24px), `px-8 pt-8 pb-8`, `shadow-2xl`,
  `max-w-lg`.

### Dropdowns
`rounded-2xl`, `shadow-xl shadow-black/10` (`dark:shadow-black/40`), borde `gray-100` /
`slate-700`, `py-2`. Los ítems son `px-4 py-2.5` con hover `gray-50` / `slate-800`.
Se renderizan por portal a `document.body` para escapar del stacking context del header
pegajoso.

### Signature: la barra indicadora del sidebar
Una barra de 4px de ancho y 24px de alto, en Lavanda Kio, pegada al borde izquierdo del ítem
activo, con esquina derecha redondeada y un glow de 10px al 40% de opacidad. Es el **único
glow del sistema** y no se replica en ningún otro contexto.

### Signature: el deck del dashboard
Un panel a sangre con el gradiente de marca `deck-from` (`#45348a`) → `deck-to` (`#6b52b8`),
sobre el que va texto blanco. La rampa está deliberadamente oscurecida respecto a
`kanji → kio`: con los tonos originales el texto blanco medía entre 3.88:1 y 2.50:1, bajo AA
en todo el recorrido. **Sobre esta superficie, aclarar el fondo de un chip o botón
(`bg-white/15`) reduce el contraste del texto blanco; hay que oscurecerlo (`bg-black/20`).**
Es el segundo y último gradiente del sistema.

### Signature: el avatar degradado
`bg-gradient-to-br from-kio to-kanji`, circular, con `ring-2` del color de la superficie. Es
el **único gradiente de todo el producto** y es intencional.

## Do's and Don'ts

### Do:
- **Do** comprobar el estado de error **antes** de renderizar un empty state. Una superficie
  que muestra datos clínicos no tiene permitido decir "no hay nada" cuando lo que ocurrió es
  que la petición falló: "Agenda despejada" ante un error 500 es una afirmación falsa sobre
  la agenda de un paciente. Todo widget con datos expone `isError` y usa `WidgetError`
  (`components/widgets/WidgetError.tsx`) con su acción de reintento.
- **Do** dar 44px de área táctil mínima a cualquier control, y un nombre accesible
  (`aria-label`) a todo botón que solo contenga un icono.
- **Do** usar `text-sm font-medium` como texto por defecto; casi toda la interfaz vive ahí.
- **Do** escribir el par `dark:` de cada color, fondo y borde en el mismo commit. Un
  componente sin modo oscuro está incompleto.
- **Do** separar superficies con borde de 1px antes que con sombra.
- **Do** reservar el Lavanda Kio para acento: activo, primario, foco.
- **Do** usar `rounded-full` para todo lo circular o tipo pill, y la escala `@theme` para lo
  demás.
- **Do** tomar los iconos de Lucide React exclusivamente, a 15–22px.
- **Do** usar Sonner para toasts en lugar de construir notificaciones propias.
- **Do** mantener las transiciones entre 150ms y 500ms (`duration-150` es el estándar).
- **Do** sanear con DOMPurify cualquier markdown de usuario antes de renderizarlo.

### Don't:
- **Don't** añadir gradientes. Las dos únicas excepciones son el avatar y el deck del
  dashboard (`deck-from` → `deck-to`), ambos documentados arriba.
- **Don't** afirmar un hecho clínico que la interfaz no puede sostener. No basta con
  comprobar el error: un widget titulado "Agenda de hoy" comprueba también que lo que va a
  pintar **es de hoy en la zona del clínico**. "Hoy" se calcula en hora local y se envía al
  servidor como `tz`; nunca se deriva de `toISOString()`.
- **Don't** aplicar `backdrop-blur` fuera del overlay de modal y del omnibox.
- **Don't** usar glow, neon ni `text-shadow`. La barra del sidebar es la única excepción y no
  se replica.
- **Don't** usar `dark:bg-black`; el suelo oscuro es `#0f172a`.
- **Don't** poner `shadow-lg` en una card en reposo, ni apilar más de dos modificadores de
  sombra.
- **Don't** usar `rounded` (4px) ni radios menores a 6px en elementos visibles.
- **Don't** usar `font-light` (300) ni `font-black` (900).
- **Don't** bajar de `text-[11px]`. El suelo tipográfico son 11px; existían badges a 8px y 9px
  y no son legibles para buena parte del público profesional del producto.
- **Don't** dejar un dato solo en `hover`. En táctil y con lector de pantalla, el hover no
  existe: si el dato importa, es texto visible.
- **Don't** animar la entrada de página ni añadir partículas, fondos animados o patrones
  decorativos.
- **Don't** introducir una segunda librería de iconos ni fuentes display/decorativas.
- **Don't** prometer buscar, filtrar u ordenar por diagnóstico, contexto clínico, teléfono,
  contacto de emergencia, medicación, alergias o contenido de notas: esos campos están
  cifrados y no son consultables en SQL.

### Deuda conocida del sistema (no replicar, resolver)
- **Don't** asumir que Inter o Roboto están aplicadas. Están cargadas desde Google Fonts y
  declaradas como tokens, pero solo hay dos usos de `font-inter` / `font-roboto` en todo
  `src`: el producto renderiza en la fuente del sistema. Resolver es una decisión pendiente
  (aplicar la familia en `body` o dejar de cargarla), no algo que un componente nuevo deba
  imitar.
- **Don't** tratar la escala de radios como monótona. `rounded-xl` (28px) es mayor que
  `rounded-2xl` (16px) porque `@theme` redefine solo hasta `xl`. Al elegir radio, mira el
  valor real de la tabla de *Shapes*, no el nombre de la clase.
