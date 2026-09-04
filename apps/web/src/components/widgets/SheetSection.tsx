import type { ReactNode } from 'react';

/**
 * La gramática de la "hoja de sala".
 *
 * Toda sección del dashboard se anuncia igual: una etiqueta en versalitas
 * anclada al margen izquierdo del documento, una regla de 1px que corre hasta
 * el final del ancho disponible, y meta opcional alineada a la derecha. Un solo
 * eje de alineación para toda la página — que es justo lo que el mosaico de
 * tarjetas anterior no tenía.
 *
 * No hay contenedor: la sección no es una isla flotante, es un bloque del
 * documento. La separación la hace la regla, nunca el hueco entre cajas.
 */

/**
 * Ancho del canal izquierdo. Horas, contadores e iconos de estado se alinean
 * aquí, sección tras sección: es la vertical que sostiene toda la hoja.
 */
export const GUTTER = 'w-14';

interface SheetSectionProps {
  /** Etiqueta de sección. Se renderiza en mayúsculas por CSS, no en el texto. */
  label: string;
  /** Meta a la derecha de la regla: contadores, estado. */
  meta?: ReactNode;
  children: ReactNode;
  /** `id` del encabezado, para que el cuerpo pueda referenciarlo con aria. */
  headingId?: string;
  className?: string;
}

export function SheetSection({ label, meta, children, headingId, className = '' }: SheetSectionProps) {
  return (
    <section className={className}>
      <div className="flex items-center gap-3 pb-3">
        <h2
          id={headingId}
          className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-text-secondary dark:text-slate-400"
        >
          {label}
        </h2>
        <span aria-hidden="true" className="h-px flex-1 bg-border dark:bg-slate-800" />
        {meta && (
          <div className="shrink-0 text-[11px] font-bold text-text-secondary dark:text-slate-400">{meta}</div>
        )}
      </div>
      {children}
    </section>
  );
}
