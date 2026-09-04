import {
  DEFAULT_GRID_END_HOUR,
  DEFAULT_GRID_START_HOUR,
  HOUR_COLUMN_WIDTH,
  HOUR_HEIGHT_PX,
  buildHourSlots,
  formatHourLabel,
} from '../lib/grid';

interface CalendarGridSkeletonProps {
  view: 'week' | 'day';
}

const BOUNDS = { startHour: DEFAULT_GRID_START_HOUR, endHour: DEFAULT_GRID_END_HOUR };

/** Bloques por columna: posición (en horas desde el inicio) y duración. */
const PLACEHOLDER_BLOCKS: Array<Array<{ offsetHours: number; hours: number }>> = [
  [{ offsetHours: 1, hours: 1 }, { offsetHours: 4.5, hours: 1 }],
  [{ offsetHours: 2, hours: 1.5 }],
  [{ offsetHours: 0.5, hours: 1 }, { offsetHours: 6, hours: 1 }],
  [{ offsetHours: 3, hours: 1 }],
  [{ offsetHours: 1.5, hours: 1 }, { offsetHours: 5, hours: 1.5 }],
  [{ offsetHours: 7, hours: 1 }],
  [],
];

/**
 * Estado de carga de la retícula.
 *
 * La agenda tardaba lo que tardase mostrando una semana vacía con un spinner de
 * 16px en el encabezado: la superficie afirmaba "no hay citas" mientras todavía
 * no sabía nada. El esqueleto ocupa el sitio de la retícula y no afirma nada.
 */
export function CalendarGridSkeleton({ view }: CalendarGridSkeletonProps) {
  const hourSlots = buildHourSlots(BOUNDS);
  const columnCount = view === 'week' ? 7 : 1;
  const gridTemplateColumns = `${HOUR_COLUMN_WIDTH} repeat(${columnCount}, 1fr)`;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-surface dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 h-full flex flex-col overflow-hidden"
    >
      <span className="sr-only">Cargando tu agenda</span>

      {/* Cabecera */}
      <div
        className="grid border-b border-gray-200 dark:border-slate-800"
        style={{ gridTemplateColumns }}
      >
        <div className="p-3 border-r border-gray-200 dark:border-slate-800" />
        {Array.from({ length: columnCount }).map((_, index) => (
          <div key={index} className="py-3 px-2 flex flex-col items-center gap-2">
            <div className="h-3 w-8 animate-pulse rounded-xs bg-cruz/40 dark:bg-slate-800" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-cruz/40 dark:bg-slate-800" />
          </div>
        ))}
      </div>

      <div className="h-3" />

      {/* Cuerpo */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="relative grid" style={{ gridTemplateColumns }}>
          {hourSlots.map((hour) => (
            <div key={hour} className="contents">
              <div
                className="pr-3 text-right border-r border-dashed border-gray-200/60 dark:border-slate-800/60 flex items-start justify-end"
                style={{ height: `${HOUR_HEIGHT_PX}px` }}
              >
                <span className="text-xs font-medium text-kanji/30 dark:text-kio/30 -mt-2 select-none">
                  {formatHourLabel(hour)}
                </span>
              </div>
              {Array.from({ length: columnCount }).map((_, index) => (
                <div
                  key={index}
                  className="border-r border-b border-gray-200 dark:border-slate-800"
                  style={{ height: `${HOUR_HEIGHT_PX}px` }}
                />
              ))}
            </div>
          ))}

          {/* Bloques fantasma sobre las columnas */}
          <div
            className="absolute inset-0 grid pointer-events-none"
            style={{ gridTemplateColumns }}
            aria-hidden="true"
          >
            <div />
            {Array.from({ length: columnCount }).map((_, index) => (
              <div key={index} className="relative">
                {(PLACEHOLDER_BLOCKS[index] ?? []).map((block, blockIndex) => (
                  <div
                    key={blockIndex}
                    className="absolute left-1.5 right-1.5 animate-pulse rounded-md bg-cruz/40 dark:bg-slate-800"
                    style={{
                      top: `${block.offsetHours * HOUR_HEIGHT_PX}px`,
                      height: `${block.hours * HOUR_HEIGHT_PX - 6}px`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
