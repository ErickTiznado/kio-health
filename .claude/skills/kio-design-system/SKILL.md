---
name: kio-design-system
description: >
  Sistema de diseño visual de Kio Health. Usar SIEMPRE que se vaya a crear, editar o revisar
  cualquier componente de UI, página, sección, estilo o token visual del proyecto — incluso
  si el usuario solo dice "agrega un botón", "cambia el color" o "crea una tarjeta nueva".
  Esta skill define exactamente qué se puede y qué NO se puede usar visualmente, para
  preservar la identidad del producto.
---

# Kio Health — Reglas del Sistema de Diseño

Este documento es la fuente de verdad para todas las decisiones visuales del proyecto.
Antes de escribir cualquier clase de Tailwind, CSS o JSX con estilos, consulta esta guía.

---

## Principios fundamentales

1. **Flat y limpio.** Sin efectos decorativos. El diseño comunica jerarquía con espacio, peso tipográfico y color — no con sombras llamativas ni efectos visuales.
2. **Paleta restringida.** Solo colores de marca (púrpura) + slate/gray para UI + colores semánticos para estados. Nada más.
3. **Consistencia sobre creatividad.** Si un patrón ya existe en el proyecto, úsalo tal cual. No inventes variantes nuevas sin necesidad.
4. **Dark mode siempre.** Cada decisión visual tiene su contraparte `dark:`. No dejes componentes sin soporte oscuro.

---

## 🎨 Paleta de colores

### Colores de marca (brand)

| Token | Valor | Uso |
|---|---|---|
| `kio` | `#ae93fe` | Primario de marca — CTAs, activos, focus |
| `kio-light` | `rgba(174, 147, 254, 0.28)` | Fondos de estados activos (sidebar, badges) |
| `kanji` | `#8a72d1` | Secundario de marca — variante más oscura del púrpura |
| `cruz` | `#ddd3fa` | Acento lavanda pálido — skeletons, acentos suaves |

Estos tokens están definidos en `apps/web/src/index.css` via `@theme` y se usan como clases Tailwind: `bg-kio`, `text-kio`, `border-kio`, `shadow-kio/20`, etc.

### Variables CSS de la UI (fondos y textos)

Usar estas variables a través de las clases Tailwind `bg-surface`, `text-text`, etc.

**Light mode** (valores en `:root`):
- `--bg-primary: #f5f3ef` → fondo base cálido (beige)
- `--bg-surface: #f5f3ef` → superficies principales
- `--bg-secondary: #ece9e3` → superficies secundarias / hover sutil
- `--text-primary: #213547` → texto principal
- `--text-secondary: #64748b` → texto secundario (slate-500)
- `--text-muted: #94a3b8` → texto muted (slate-400)
- `--border-base: #e2e8f0` → bordes (slate-200)

**Dark mode** (valores en `.dark`):
- `--bg-primary: #020617` → slate-950
- `--bg-surface: #0f172a` → slate-900
- `--bg-secondary: #1e293b` → slate-800
- `--text-primary: #f8fafc` → slate-50
- `--text-secondary: #94a3b8` → slate-400
- `--text-muted: #64748b` → slate-500
- `--border-base: #1e293b` → slate-800

### Colores semánticos

Usar las clases de Tailwind estándar para estados:

- **Éxito / positivo:** `emerald-500`, `emerald-50`, `emerald-100` (dark: `emerald-900/20`)
- **Advertencia:** `amber-500`, `amber-50`, `amber-100`, `amber-200` (dark: `amber-900/10`)
- **Error / peligro:** `red-500` / `rose-500`, `red-50` / `rose-50` (dark: `rose-900/20`)
- **Neutro:** escala `gray-` y `slate-` según contexto

---

## 🚫 Efectos visuales prohibidos

Estos efectos **no existen** en Kio Health y **nunca deben añadirse**:

| Efecto | Estado |
|---|---|
| Gradientes de color en fondos o botones | ❌ No se usa |
| Blur de contenido (backdrop-blur en cards, paneles, secciones) | ❌ No se usa — solo en overlays modales/omnibox |
| Efectos neon o glow sobre texto | ❌ No se usa |
| Sombras de colores fuertes tipo "glow halo" en elementos generales | ❌ No se usa |
| Text-shadow | ❌ No se usa |
| Filtros CSS (filter: saturate, hue-rotate, brightness) en UI | ❌ No se usa |
| Bordes degradados o bordes animados | ❌ No se usa |
| Múltiples box-shadows acumuladas para fingir profundidad | ❌ No se usa |
| Animaciones de entrada en carga de página (page transitions) | ❌ No se usa |
| Partículas, fondos animados o patrones decorativos | ❌ No se usa |
| Fuentes decorativas o display | ❌ No se usa |

**Excepción permitida** — glow específico de marca:
- El indicador de ítem activo en el sidebar usa: `shadow-[0_0_10px_rgba(174,147,254,0.4)]`. Es el único glow del sistema y no debe replicarse en otros contextos.
- El avatar/perfil usa `bg-gradient-to-br from-kio to-kanji rounded-full` — es la única instancia de gradiente en todo el proyecto y es intencional.

---

## 📐 Border radius

Existe una escala definida de tokens. Úsalos con las clases Tailwind equivalentes:

| Token CSS | Valor | Clase Tailwind | Uso |
|---|---|---|---|
| `--radius-xs` | `6px` | `rounded-md` | Tags pequeños, badges inline |
| `--radius-sm` | `10px` | `rounded-xl` | Inputs, botones, chips |
| `--radius-md` | `14px` | `rounded-xl` / `rounded-2xl` | Cards secundarias |
| `--radius-lg` | `20px` | `rounded-2xl` | Cards principales, modales |
| `--radius-xl` | `28px` | `rounded-3xl` | Modales grandes |
| `--radius-hero` | `40px` | uso directo | Solo el dashboard hero card |
| — | `9999px` | `rounded-full` | Avatares, indicadores circulares, badges pill |

**Regla:** No uses `rounded` (4px) ni `rounded-sm` (2px) en componentes visibles — son demasiado angulares para este sistema.

---

## 🔤 Tipografía

### Familias de fuente

- **Roboto** (`--font-roboto`, `font-roboto`) — fuente principal del cuerpo
- **Inter** (`--font-inter`, `font-inter`) — fuente secundaria / UI

### Jerarquía tipográfica

| Uso | Clases |
|---|---|
| Título de sección / card | `text-base font-bold` o `text-lg font-bold` |
| Etiqueta / label de campo | `text-[11px] font-bold uppercase tracking-wider` |
| Cuerpo principal | `text-sm font-medium` |
| Texto secundario | `text-sm text-text-secondary` |
| Texto muted / helper | `text-xs text-text-muted` |
| Tags / micro-labels | `text-[10px] font-medium` |
| Placeholder de inputs | `placeholder:text-gray-400 dark:placeholder:text-slate-500` |

**No se usan:** pesos `font-light` (300) ni `font-black` (900). El rango es `font-medium` (500) a `font-bold` (700).

---

## 🃏 Componentes — Patrones exactos

### Tarjeta (Card)

```
bg-white dark:bg-slate-900
rounded-2xl
border border-gray-200 dark:border-slate-800
shadow-sm
hover:shadow-md transition-all
```

Tarjeta de contenido destacado / pinned:
```
bg-amber-50/30 dark:bg-amber-900/10
border-amber-200 dark:border-amber-800
```

### Botón primario

```
bg-kio hover:bg-kio/90
text-white
py-3 px-4
rounded-xl
font-bold
shadow-md shadow-kio/20
active:scale-95
transition-all
```

### Botón secundario / ghost

```
bg-white dark:bg-slate-800
border border-gray-200 dark:border-slate-700
text-gray-500 dark:text-slate-400
rounded-xl
hover:border-gray-300
transition-all
```

### Botón destructivo / danger

```
text-rose-600
hover:bg-rose-50 dark:hover:bg-rose-900/20
rounded-lg
transition-colors
```

### Input / campo de texto

```
bg-gray-50/50 dark:bg-slate-800
border border-gray-200 dark:border-slate-700
rounded-xl
py-2.5 px-3.5
text-sm font-medium
placeholder:text-gray-400 dark:placeholder:text-slate-500
focus:border-kio focus:ring-2 focus:ring-kio/50
outline-none
transition-colors
```

### Badge / status chip (pill)

```
inline-flex items-center
px-3 py-1
rounded-full
text-xs font-bold tracking-wide
[color según estado]
```

Colores por estado:
- Activo / completado: `bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400`
- Pendiente / warning: `bg-amber-100 text-amber-700 dark:bg-amber-900/10 dark:text-amber-400`
- Error / cancelado: `bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400`

### Tag micro (dentro de cards)

```
text-[10px] font-medium
bg-gray-100 dark:bg-slate-800
px-2 py-0.5
rounded-full
```

### Modal

Overlay:
```
fixed inset-0
bg-gray-900/40 dark:bg-black/60
backdrop-blur-sm
```
> El `backdrop-blur-sm` **solo** es válido en overlays de modal y omnibox. No en ningún otro lugar.

Contenido:
```
bg-white dark:bg-slate-900
rounded-3xl
px-8 pt-8 pb-8
shadow-2xl
w-full max-w-lg
```

### Dropdown / menú contextual

```
absolute right-0 mt-2 w-48
bg-surface dark:bg-slate-900
rounded-2xl
shadow-xl shadow-black/10 dark:shadow-black/40
border border-gray-100 dark:border-slate-700
overflow-hidden z-50 py-2
```

Ítem de menú:
```
px-4 py-2.5
hover:bg-gray-50 dark:hover:bg-slate-800
transition-colors text-sm
```

### Sidebar — ítem de navegación

Activo:
```
bg-kio-light dark:bg-kio/10
text-kio
rounded-xl
relative
```
Con barra indicadora izquierda:
```
absolute left-0 w-1 h-6 bg-kio rounded-r-full
shadow-[0_0_10px_rgba(174,147,254,0.4)]
```

Inactivo:
```
text-gray-600 dark:text-slate-400
hover:bg-surface/80 dark:hover:bg-slate-800
rounded-xl transition-colors
```

### Skeleton loader

```
animate-pulse
bg-cruz/40 dark:bg-slate-800
rounded-xl
```

### Indicador de estado (dot)

```
w-2.5 h-2.5 rounded-full shadow-sm
ring-2 ring-white dark:ring-slate-900
```
Colores:
- `>= 8`: `bg-emerald-500`
- `>= 5`: `bg-amber-500`
- `< 5`: `bg-red-500`

### Avatar / perfil

```
w-10 h-10
bg-gradient-to-br from-kio to-kanji
rounded-full
flex items-center justify-center
shadow-sm
ring-2 ring-surface dark:ring-slate-800
```
> Este es el **único gradiente permitido** en todo el sistema.

---

## 🌑 Dark mode

- Implementado con clase `.dark` en el `<html>` — controlado por `useThemeStore` (Zustand).
- **Siempre** añade el par `dark:` correspondiente a cada clase de color, fondo o borde.
- Nunca uses `dark:bg-black` puro — el mínimo oscuro es `dark:bg-slate-900` (slate-900 = `#0f172a`).
- Superficies en dark: `slate-900` (base), `slate-800` (elevada), `slate-700` (interactiva hover).

---

## 🌑 Sombras

Usar solo estas variantes:

| Situación | Clase |
|---|---|
| Card en reposo | `shadow-sm` |
| Card en hover | `hover:shadow-md` |
| Modal / dropdown | `shadow-xl` o `shadow-2xl` |
| Dropdown con color oscuro | `shadow-xl shadow-black/10 dark:shadow-black/40` |
| Botón primario | `shadow-md shadow-kio/20` |
| Data point activo (chart) | `shadow-lg shadow-kio/30` |

No uses `shadow-lg` en cards en reposo. No combines más de dos modificadores de sombra.

---

## 📏 Espaciado

### Gap entre elementos

- `gap-1` (4px) — mínimo, íconos inline
- `gap-2` (8px) — controles de formulario
- `gap-3` (12px) — estándar entre elementos
- `gap-4` (16px) — secciones dentro de una card
- `gap-6` (24px) — separación de secciones

### Padding de contenedores

- Inputs: `py-2.5 px-3.5`
- Card headers: `px-4 py-3` a `px-6 py-4`
- Modales: `px-8 pt-8 pb-8`
- Badges pequeños: `px-2 py-0.5` a `px-3 py-1`
- Ítems de menú: `px-4 py-2.5`

---

## ✨ Animaciones y transiciones

### Tailwind transitions (CSS)

- Transición estándar de UI: `transition-all duration-150`
- Solo color: `transition-colors`
- Elementos más lentos (modales): `transition-all duration-200`

### Framer Motion

Usar para interacciones de mayor énfasis:

```js
// Hover scale sutil en cards
whileHover={{ scale: 1.02 }}

// Press / tap
whileTap={{ scale: 0.98 }}

// Aparición
initial={{ opacity: 0 }} animate={{ opacity: 1 }}

// Duración típica
transition={{ duration: 0.15 }} // rápido
transition={{ duration: 0.25 }} // estándar
transition={{ duration: 0.5 }}  // lento (modales)
```

Efectos de click en botones: `active:scale-95`

**No usar:**
- Animaciones de rotación continua (spin) salvo en loaders
- Transiciones mayores a 500ms
- Spring physics salvo en iconos con carga semántica

---

## 🎯 Tour highlight (guía de usuario)

Clase especial definida en `index.css` — solo para el tour guiado:

```css
.tour-highlight {
  box-shadow: 0 0 0 4px #ae93fe, 0 0 0 9999px rgba(0, 0, 0, 0.55);
  border-radius: 8px;
  transition: box-shadow 0.25s ease;
  z-index: 9001;
}
```

No adaptar ni reusar este efecto para otros propósitos.

---

## 🔗 Dependencias de diseño clave

- **Tailwind CSS v4** — sin `tailwind.config.js`; tokens en `@theme` dentro de `index.css`
- **Framer Motion** — animaciones de interacción
- **Lucide React** — íconos (no mezclar con otras librerías)
- **Sonner** — toasts / notificaciones (no crear toasts custom)
- **DOMPurify** — sanitizar markdown antes de renderizar HTML de usuario

---

## ✅ Checklist antes de mergear un componente

- [ ] ¿Usa solo colores de la paleta definida?
- [ ] ¿Tiene soporte `dark:` en todos los colores, fondos y bordes?
- [ ] ¿El border-radius sigue la escala del sistema?
- [ ] ¿No hay gradientes (salvo el avatar)?
- [ ] ¿No hay blur en contenido (solo en overlays)?
- [ ] ¿No hay neon, glow o text-shadow?
- [ ] ¿Las sombras siguen la jerarquía definida?
- [ ] ¿Las transiciones están dentro del rango 150-500ms?
- [ ] ¿La tipografía usa solo `font-medium` a `font-bold`?
- [ ] ¿Los íconos son de Lucide React?
