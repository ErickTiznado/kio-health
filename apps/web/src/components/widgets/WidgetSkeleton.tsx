/**
 * Vocabulario de carga de la hoja de sala.
 *
 * Existe porque el tercer estado obligatorio de un widget clínico no es solo el
 * error. Mientras la petición está en vuelo la superficie tampoco sabe nada, y
 * un empty state tranquilizador — "Día libre", "Todo al día" — pintado sobre
 * datos que aún no han llegado afirma exactamente lo mismo que `WidgetError`
 * existe para impedir: un hecho sobre la agenda o el riesgo de un paciente que
 * la interfaz no puede sostener. Ver DESIGN.md → Do's and Don'ts.
 *
 * No se apoya en `Skeleton` de `@repo/ui` porque su variante rectangular fija
 * `rounded-xl` (28px) y la clase de radio que se le pase por `className` puede
 * perder la cascada según el orden que Tailwind genera. Aquí el radio se
 * decide en cada sitio, sobre la misma superficie.
 */

import { GUTTER } from './SheetSection';

/** Superficie de carga compartida: el mismo lavado que `Skeleton` de `@repo/ui`. */
export const SKELETON_SURFACE = 'animate-pulse bg-cruz/40 dark:bg-slate-800';

/** Marca del canal que la fila real llevará cuando llegue el dato. */
type RowMark = 'dot' | 'badge' | 'none';

interface SheetSkeletonRowProps {
  /** Ancho del bloque de texto, para que las filas no se vean clonadas. */
  width?: string;
  mark?: RowMark;
}

/** Una fila fantasma alineada al canal izquierdo de la hoja. */
export function SheetSkeletonRow({ width = 'w-44', mark = 'badge' }: SheetSkeletonRowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      {/* El canal izquierdo: la hora o el contador que va a llegar. */}
      <span className={`${GUTTER} h-4 shrink-0 rounded-full ${SKELETON_SURFACE}`} />
      {mark === 'badge' && <span className={`h-8 w-8 shrink-0 rounded-full ${SKELETON_SURFACE}`} />}
      {mark === 'dot' && <span className={`h-2 w-2 shrink-0 rounded-full ${SKELETON_SURFACE}`} />}
      <span className={`h-4 ${width} rounded-full ${SKELETON_SURFACE}`} />
    </div>
  );
}

interface SheetSkeletonRowsProps {
  count?: number;
  /** Qué se está cargando, en lenguaje del usuario. Ej: "tu agenda de hoy". */
  label: string;
  mark?: RowMark;
  /** Anchos por fila; se ciclan si hay menos que filas. */
  widths?: string[];
}

/** Bloque de filas fantasma, ya anunciado al lector de pantalla. */
export function SheetSkeletonRows({
  count = 3,
  label,
  mark = 'badge',
  widths = ['w-44', 'w-32', 'w-48', 'w-36', 'w-40'],
}: SheetSkeletonRowsProps) {
  return (
    <div role="status">
      <span className="sr-only">Cargando {label}…</span>
      {Array.from({ length: count }).map((_, i) => (
        <SheetSkeletonRow key={i} width={widths[i % widths.length]} mark={mark} />
      ))}
    </div>
  );
}
