import { useEffect, useId, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: 'danger' | 'warning' | 'default';
  /**
   * Se llama con la decisión del usuario. `confirmAction` la hace idempotente,
   * así que este componente puede invocarla desde cualquier vía de cierre sin
   * preocuparse por llamadas repetidas.
   */
  onResolve: (value: boolean) => void;
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Pila de diálogos abiertos. Sólo el de arriba responde a Escape y a Tab: si
 * una confirmación se abre sobre otra, la de abajo deja pasar el evento en vez
 * de cerrarse ella misma.
 */
const openDialogs: symbol[] = [];

const VARIANT_STYLES = {
  danger: {
    icon: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    // rose-600 con texto blanco mide 4.83:1. rose-500 (el color anterior) se
    // quedaba en 3.4:1, por debajo de AA para texto normal.
    confirm:
      'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600/50 dark:focus:ring-rose-400/50',
  },
  warning: {
    icon: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    // El ámbar sólo es legible con tinta oscura encima: blanco sobre amber-500
    // mide 2.15:1; amber-950 sobre amber-500 mide 7.7:1.
    confirm:
      'bg-amber-500 text-amber-950 hover:bg-amber-600 focus:ring-amber-600/50 dark:focus:ring-amber-400/50',
  },
  default: {
    icon: 'bg-kio-light text-kanji-deep dark:bg-kio/10 dark:text-kio',
    // Regla del Púrpura Legible: el fondo de un botón sólido de marca con texto
    // blanco es `kanji-deep` (7.3:1), nunca `kanji` (3.88:1) ni `kio` (2.2:1).
    confirm:
      'bg-kanji-deep text-white hover:bg-kanji-deep/90 focus:ring-kio/50 dark:focus:ring-kio/60',
  },
} as const;

const BUTTON_BASE =
  'flex-1 min-h-11 px-4 rounded-xl text-sm font-bold transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800';

/**
 * Diálogo de confirmación real: `role="alertdialog"`, foco atrapado, Escape
 * gestionado y una promesa que resuelve por cualquier vía de cierre.
 *
 * No se monta desde JSX: lo monta `lib/confirm-action.ts` en su propia raíz de
 * React sobre `document.body`, para que la API imperativa `confirmAction()`
 * siga funcionando desde cualquier callback.
 */
export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant,
  onResolve,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // `onResolve` no cambia en la práctica, pero el ref evita que el efecto de
  // teclado se remonte —y con él el foco inicial— si alguna vez cambiara.
  const resolveRef = useRef(onResolve);
  useEffect(() => {
    resolveRef.current = onResolve;
  }, [onResolve]);

  const reactId = useId();
  const titleId = `confirm-dialog-title-${reactId}`;
  const descriptionId = `confirm-dialog-description-${reactId}`;

  useEffect(() => {
    const token = Symbol('confirm-dialog');
    openDialogs.push(token);

    // El foco arranca en «cancelar», no en el botón destructivo: la tecla
    // Enter refleja entonces la salida segura.
    cancelRef.current?.focus({ preventScroll: true });

    /**
     * El listener va en `window` y en fase de captura a propósito. Los modales
     * que abren una confirmación (AddendumModal, PatientModal…) escuchan en
     * `document`, también en captura; la captura de `window` corre antes, así
     * que `stopImmediatePropagation` impide que el modal de debajo reaccione a
     * la misma tecla —cerrándose, o abriendo una segunda confirmación— cuando
     * el Escape iba dirigido a este diálogo.
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      const root = dialogRef.current;
      // Ya desmontado, o hay otra confirmación por encima: no tocamos el evento.
      if (!root || !root.isConnected) return;
      if (openDialogs[openDialogs.length - 1] !== token) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        resolveRef.current(false);
        return;
      }

      if (event.key !== 'Tab') return;

      const focusables = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      // El Tab pertenece a este diálogo aunque no haya que redirigirlo: si lo
      // dejamos subir, la trampa de foco del modal de debajo lo devuelve a su
      // propio contenido.
      event.stopImmediatePropagation();

      if (!active || !root.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      const index = openDialogs.indexOf(token);
      if (index !== -1) openDialogs.splice(index, 1);
    };
  }, []);

  const styles = VARIANT_STYLES[variant];

  return (
    <div className="fixed inset-0 z-[9500] flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={() => onResolve(false)}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm dark:bg-black/60"
      />

      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="relative flex w-[min(360px,calc(100vw-2rem))] flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}
          >
            <AlertTriangle size={22} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-lg leading-tight font-bold text-kanji-deep dark:text-white"
            >
              {title}
            </h2>
            {description && (
              <p
                id={descriptionId}
                className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-slate-400"
              >
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            ref={cancelRef}
            onClick={() => onResolve(false)}
            className={`${BUTTON_BASE} border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 focus:ring-kio/50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onResolve(true)}
            className={`${BUTTON_BASE} shadow-sm ${styles.confirm}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
