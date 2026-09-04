import { useRef, useState } from 'react';
import type { CalendarCell, CalendarDay } from '../../lib/dashboard.helpers';
import { WidgetError } from './WidgetError';
import { SKELETON_SURFACE } from './WidgetSkeleton';

interface AvailabilityWidgetProps {
  cells: CalendarCell[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

/** Lunes primero, igual que la rejilla que construye `buildCalendarDays`. */
const WEEKDAYS = [
  { short: 'L', full: 'lunes' },
  { short: 'M', full: 'martes' },
  { short: 'X', full: 'miércoles' },
  { short: 'J', full: 'jueves' },
  { short: 'V', full: 'viernes' },
  { short: 'S', full: 'sábado' },
  { short: 'D', full: 'domingo' },
];

/**
 * Rampa de densidad sobre el lino.
 *
 * La rejilla ya no vive sobre el degradado de marca, así que la densidad se
 * expresa con la propia rampa púrpura en vez de con negro translúcido. Cada
 * escalón está elegido para que su numeral supere 4.5:1: `cruz` y `kio/60` son
 * lo bastante pálidos para llevar `kanji-deep`, y `deck-to` / `deck-from` lo
 * bastante hondos para llevar blanco (5.96:1 y 9.95:1). En oscuro la rampa se
 * invierte — más ocupado es más claro — porque el suelo es slate.
 *
 * Nunca se baja la opacidad del texto: eso fue lo que rompió AA en la versión
 * anterior, donde los numerales medían entre 1.83:1 y 3.37:1.
 */
function densitySurface(day: CalendarDay): string {
  if (day.isPast) {
    // Apagado, no ilegible. `text-muted` sobre el lino medía 2.40:1 y
    // `slate-600` sobre el suelo oscuro 2.46:1 — el mismo suspenso que esta
    // función corrigió en la rampa, colado por la puerta del pasado: el numeral
    // inferior es el número de citas de ese día, y un día pasado con tres
    // sesiones seguía siendo un dato. El tono secundario del sistema (4.30:1 en
    // claro, 7.87:1 en oscuro) deja el día apagado frente al presente sin
    // borrarlo.
    //
    // MEJORA, NO APROBADO. 4.30:1 no llega a 4.5:1. El límite no es de esta
    // celda: lo pone el token `--text-secondary` (#64748b sobre el lino
    // #f5f3ef), que es el gris de apoyo de TODO el producto. Si alguna vez se
    // adopta AA como objetivo — hoy PRODUCT.md lo deja como decisión abierta en
    // "Accessibility & Inclusion" — el cambio es del token (a ~#5a6b80) y entra
    // en un solo commit para toda la superficie, no widget a widget. No cerrar
    // este punto como "contraste corregido" a secas.
    return 'bg-transparent text-text-secondary dark:text-slate-400';
  }
  switch (day.density) {
    case 'full':
      return 'bg-deck-from text-white dark:bg-kio dark:text-slate-950';
    case 'high':
      return 'bg-deck-to text-white dark:bg-kio/60 dark:text-white';
    case 'medium':
      return 'bg-kio/60 text-kanji-deep dark:bg-kio/30 dark:text-white';
    case 'low':
      return 'bg-cruz text-kanji-deep dark:bg-kio/15 dark:text-slate-200';
    default:
      return 'bg-secondary text-text-secondary dark:bg-slate-800 dark:text-slate-400';
  }
}

function chunk(cells: CalendarCell[]): CalendarCell[][] {
  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const last = weeks[weeks.length - 1];
  if (last && last.length < 7) {
    while (last.length < 7) last.push(null);
  }
  return weeks;
}

/** Escalones de la leyenda, en el mismo orden que la rampa. */
const LEGEND = [
  { key: 'free', className: 'bg-secondary dark:bg-slate-800' },
  { key: 'low', className: 'bg-cruz dark:bg-kio/15' },
  { key: 'medium', className: 'bg-kio/60 dark:bg-kio/30' },
  { key: 'high', className: 'bg-deck-to dark:bg-kio/60' },
  { key: 'full', className: 'bg-deck-from dark:bg-kio' },
];

export function AvailabilityWidget({ cells, isLoading, isError, onRetry }: AvailabilityWidgetProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  // Roving tabindex: la rejilla es una sola parada de tabulación, las flechas
  // mueven entre días.
  const [activeDate, setActiveDate] = useState<string | null>(null);

  const days = cells.filter((c): c is CalendarDay => c !== null);
  const focusable = activeDate ?? days.find((d) => d.isToday)?.date ?? days[0]?.date ?? null;

  const moveFocus = (fromDate: string, delta: number) => {
    const i = days.findIndex((d) => d.date === fromDate);
    const next = days[i + delta];
    if (!next) return;
    setActiveDate(next.date);
    gridRef.current?.querySelector<HTMLElement>(`[data-date="${next.date}"]`)?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, date: string) => {
    const map: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: 7,
      ArrowUp: -7,
    };
    const delta = map[e.key];
    if (!delta) return;
    e.preventDefault();
    moveFocus(date, delta);
  };

  if (isError) return <WidgetError what="tu disponibilidad" onRetry={onRetry} />;

  // `buildCalendarDays(undefined)` devuelve el mes entero con cero citas en cada
  // día, así que sin esta puerta la rejilla pintaba un mes completamente libre
  // mientras la petición seguía en vuelo — y "libre" es una afirmación sobre la
  // agenda, no una ausencia de dato.
  if (isLoading) {
    return (
      <div role="status">
        <span className="sr-only">Cargando tu disponibilidad…</span>
        <div aria-hidden="true" className="flex flex-col gap-1">
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <span
                key={d.full}
                className="pb-1 text-center text-[11px] font-bold text-text-secondary dark:text-slate-400"
              >
                {d.short}
              </span>
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, wi) => (
            <div key={`sk-${wi}`} className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, ci) => (
                <span
                  key={`sk-${wi}-${ci}`}
                  className={`block aspect-square min-h-11 rounded-md ${SKELETON_SURFACE}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const weeks = chunk(cells);

  return (
    <div>
      <div ref={gridRef} role="grid" aria-labelledby="availability-heading" className="flex flex-col gap-1">
        <div role="row" className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <span
              key={d.full}
              role="columnheader"
              aria-label={d.full}
              className="pb-1 text-center text-[11px] font-bold text-text-secondary dark:text-slate-400"
            >
              <span aria-hidden="true">{d.short}</span>
            </span>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div role="row" key={`w-${wi}`} className="grid grid-cols-7 gap-1">
            {week.map((cell, ci) => {
              if (!cell) return <span role="gridcell" key={`b-${wi}-${ci}`} aria-hidden="true" />;

              const count = cell.appointmentCount;
              // Solo el número de citas: la jornada laboral no es configurable
              // en el producto, así que no hay ninguna cifra de horas libres que
              // se pueda anunciar aquí como un hecho.
              const description =
                count === 0
                  ? `${cell.label}: sin citas`
                  : `${cell.label}: ${count} ${count === 1 ? 'cita' : 'citas'}`;

              return (
                <span role="gridcell" key={cell.date}>
                  <span
                    data-date={cell.date}
                    tabIndex={cell.date === focusable ? 0 : -1}
                    onKeyDown={(e) => onKeyDown(e, cell.date)}
                    onFocus={() => setActiveDate(cell.date)}
                    aria-label={description}
                    aria-current={cell.isToday ? 'date' : undefined}
                    className={`flex aspect-square min-h-11 flex-col items-center justify-center rounded-md leading-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kio ${densitySurface(
                      cell,
                    )} ${cell.isToday ? 'ring-2 ring-kanji-deep dark:ring-kio' : ''}`}
                  >
                    <span className="text-xs font-bold tabular-nums" aria-hidden="true">
                      {cell.day}
                    </span>
                    {/* Los días sin citas dejan el hueco vacío en vez de un
                        middot: a text-[11px] sobre texto secundario ese glifo
                        era invisible, de modo que el dato vivía solo en la
                        etiqueta accesible. Un hueco reservado sí se lee. */}
                    <span
                      className="mt-0.5 h-4 text-[11px] font-medium leading-4 tabular-nums"
                      aria-hidden="true"
                    >
                      {count > 0 ? count : ''}
                    </span>
                  </span>
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {/* La leyenda sustituye a la frase explicativa: dice lo mismo y además
          nombra la rampa, que la frase no hacía. */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[11px] font-medium text-text-secondary dark:text-slate-400">Libre</span>
        <span aria-hidden="true" className="flex flex-1 gap-0.5">
          {LEGEND.map((step) => (
            <span key={step.key} className={`h-1.5 flex-1 rounded-full ${step.className}`} />
          ))}
        </span>
        <span className="text-[11px] font-medium text-text-secondary dark:text-slate-400">Lleno</span>
      </div>
      <p className="mt-2 text-[11px] font-medium text-text-secondary dark:text-slate-400">
        El número inferior son las citas de ese día; los días sin número están libres.
      </p>
    </div>
  );
}
