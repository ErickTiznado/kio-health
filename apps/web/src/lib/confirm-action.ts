import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { ConfirmDialog } from '../components/ui/ConfirmDialog';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
}

/**
 * Bloqueo de scroll con contador. Una confirmación puede abrirse encima de un
 * modal que ya bloqueó el scroll (PatientModal guarda y restaura
 * `body.style.overflow` igual que aquí), y también encima de otra
 * confirmación: sin contador, la primera en cerrarse devolvería el scroll con
 * un diálogo todavía abierto.
 */
let openCount = 0;
let previousBodyOverflow: string | null = null;

function lockBodyScroll() {
  if (openCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  openCount += 1;
}

function releaseBodyScroll() {
  openCount = Math.max(0, openCount - 1);
  if (openCount === 0 && previousBodyOverflow !== null) {
    document.body.style.overflow = previousBodyOverflow;
    previousBodyOverflow = null;
  }
}

/**
 * Diálogo de confirmación del sistema. Sustituye a `confirm()` nativo y es el
 * primitivo detrás de toda decisión destructiva del producto.
 *
 * Antes esto era un `toast.custom` de Sonner. Un toast no es un diálogo: no
 * anunciaba su rol, no atrapaba el foco, ignoraba Escape y —lo grave— si se
 * descartaba por cualquier vía que no fueran sus dos botones, la promesa nunca
 * resolvía. En SessionPage eso dejaba a `ensureSaved` esperando para siempre y
 * convertía «Finalizar sesión» en un botón muerto.
 *
 * La garantía que sostiene ahora este archivo: **toda vía de cierre resuelve la
 * promesa exactamente una vez**. `settle` es idempotente y es lo único que
 * desmonta el diálogo, así que no existe un camino que desmonte sin resolver.
 *
 * La firma pública no ha cambiado — mismos parámetros, mismo `Promise<boolean>`.
 */
export function confirmAction({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
}: ConfirmOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    // Sin DOM (tests de nodo, SSR) no se puede preguntar nada. Resolvemos que
    // no: nunca inventamos un «sí» para una acción destructiva.
    if (typeof document === 'undefined') {
      resolve(false);
      return;
    }

    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const container = document.createElement('div');
    container.setAttribute('data-confirm-dialog', '');
    document.body.appendChild(container);

    let settled = false;
    // `settle` necesita la raíz y la raíz necesita `settle` (para
    // `onUncaughtError`). El contenedor rompe el ciclo sin declarar nada suelto.
    const rootHolder: { current: Root | null } = { current: null };

    const settle = (value: boolean) => {
      if (settled) return;
      settled = true;

      // Se desmonta el DOM de forma síncrona para que el diálogo desaparezca ya
      // y para que el listener de teclado del componente se autodesactive
      // (comprueba `isConnected`). `root.unmount()` va en un microtask porque
      // `settle` suele llamarse desde un handler de React.
      container.remove();
      releaseBodyScroll();

      if (trigger && trigger.isConnected) {
        try {
          trigger.focus({ preventScroll: true });
        } catch {
          // El disparador ya no admite foco; no es motivo para romper el flujo.
        }
      }

      // El orden importa: este microtask se encola ANTES que la continuación de
      // quien está esperando la promesa. Si hay dos confirmaciones encadenadas,
      // la primera termina de desmontarse y de devolver el foco antes de que la
      // segunda se monte, así que la segunda no hereda su foco ni su posición
      // en la pila de diálogos.
      queueMicrotask(() => rootHolder.current?.unmount());

      resolve(value);
    };

    // Si el diálogo revienta al renderizar, la promesa no puede quedarse
    // colgada: sin esto, un fallo aquí volvería a dejar a `ensureSaved`
    // esperando para siempre. Un error se resuelve como «no confirmado».
    const root = createRoot(container, {
      onUncaughtError: () => settle(false),
    });
    rootHolder.current = root;
    lockBodyScroll();

    root.render(
      createElement(ConfirmDialog, {
        title,
        description,
        confirmLabel,
        cancelLabel,
        variant,
        onResolve: settle,
      }),
    );
  });
}
