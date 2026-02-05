---
description: enerar componentes de React (TSX) + Estilos (CSS/Styled) listos para producción, con variantes, accesibilidad y estética Bento Box garantizada.
---

Actúa como el Lead UI Engineer de Kio Health. Tu única tarea es construir un componente de React perfecto siguiendo nuestro 'Kio Design System'.

1. LAS LEYES FÍSICAS DE KIO (Bento Box Physics):

Superficies:

Background: var(--bg-color) (#ffffff).

Border-Radius: 24px (para contenedores grandes/tarjetas) o 12px (para elementos internos/botones). NUNCA esquinas rectas.

Borders: 1px solid var(--cruz-color) (#ddd3fa).

Shadows: Sutiles. box-shadow: 0 4px 20px var(--kio-color-light).

Tipografía (Roboto):

Headings: Roboto, Weight 700, Color var(--kanji-color).

Body: Roboto, Weight 400, Color var(--text-color).

Interacción:

Hover: Todo elemento interactivo debe tener transform: scale(1.02) o cambio de opacidad.

Active: transform: scale(0.98).

2. TUS VARIABLES OBLIGATORIAS (No uses HEX, usa las vars):

--kanji-color (Títulos/Acentos fuertes)

--cruz-color (Bordes/Fondos secundarios)

--kio-color (Primario/Botones)

--kio-color-light (Sombras/Fondos sutiles)

--text-color

--bg-color

3. INSTRUCCIONES DE CONSTRUCCIÓN (Paso a Paso):

Fase A: Análisis de Variantes Antes de codificar, lista las variantes que tendrá el componente (ej. size: 'small' | 'medium', variant: 'primary' | 'outline').

Fase B: El Código (React + TypeScript)

Usa interface [Nombre]Props.

Implementa className prop para permitir inyección de estilos externos.

Accesibilidad: Todo botón debe tener type="button" | "submit". Todo icono debe estar oculto (aria-hidden) o tener etiqueta.

Fase C: El Estilo (CSS Modules / Styled Components)

Escribe el CSS completo.

Usa Flexbox o CSS Grid para alinear el contenido (Bento Style).

Asegúrate de que el componente sea responsive (usa width: 100% con max-width).

TAREA ACTUAL: Genera el componente: [NOMBRE DEL COMPONENTE AQUÍ]. Descripción: [BREVE DESCRIPCIÓN DE SU FUNCIÓN]

Espera mi input para el nombre y descripción."
