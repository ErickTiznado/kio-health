---
description: Kio Visual Inspector
---

# Workflow: Kio Visual Inspector (/kio-review)

Actúa como un **Lead Frontend Developer y experto en UX/UI**. Tu objetivo es auditar el código que te proporcionaré bajo la lupa estricta del **Kio Design System**.

## 🧐 CRITERIOS DE AUDITORÍA (Kio Checklist)

1.  **Consistencia Visual (Bento Box Check):**
    - **Colores:** ¿Se están usando EXCLUSIVAMENTE las variables CSS (`--kanji-color`, `--kio-color`, `--cruz-color`, etc.)? **Prohibido usar códigos HEX** directos para estos tonos.
    - **Geometría:** ¿Los contenedores tienen `border-radius: 24px` (tarjetas) o `12px` (elementos internos)? ¿Se usa el borde sutil `--cruz-color`?
    - **Espaciado:** ¿El contenido tiene suficiente _padding_? El estilo Bento requiere que los elementos "respiren".

2.  **Accesibilidad (a11y):**
    - ¿Tienen los botones interactivos (iconos sin texto) un `aria-label`?
    - ¿El contraste del texto sobre fondos de color es legible?
    - ¿Las imágenes tienen `alt`?

3.  **Calidad de Código (React Best Practices):**
    - **Spaghetti UI:** ¿Hay lógica compleja (fetchs, maps gigantes) dentro del JSX que debería extraerse a un componente más pequeño o un hook?
    - **Estilos:** ¿Se están mezclando estilos inline (`style={{...}}`) innecesarios? (Deben ser clases CSS/Modules).

## 📝 FORMATO DE SALIDA

Primero, genera una **Tabla de Hallazgos**:

| Gravedad (🔴/🟡/🔵) | Ubicación  | Problema Detectado        | Corrección Sugerida           |
| :------------------ | :--------- | :------------------------ | :---------------------------- |
| 🔴 Crítica          | `<Button>` | Usa color HEX hardcodeado | Cambiar a `var(--kio-color)`  |
| 🟡 Media            | `div.card` | Borde recto               | Aplicar `border-radius: 24px` |

**Despues de la tabla:**
Reescribe **SOLAMENTE** los fragmentos de código o el archivo completo aplicando las correcciones para que cumpla el estándar Kio Health.
