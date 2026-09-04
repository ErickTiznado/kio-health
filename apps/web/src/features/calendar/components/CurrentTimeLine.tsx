import { useState, useEffect } from 'react';
import { DEFAULT_GRID_END_HOUR, DEFAULT_GRID_START_HOUR, HOUR_HEIGHT_PX } from '../lib/grid';

interface CurrentTimeLineProps {
  /** Primera hora pintada por la retícula que contiene la línea. */
  startHour?: number;
  /** Primera hora ya fuera de la retícula (límite superior exclusivo). */
  endHour?: number;
}

function positionFor(now: Date, startHour: number): number {
  const offsetHours = now.getHours() - startHour + now.getMinutes() / 60;
  return offsetHours * HOUR_HEIGHT_PX;
}

/**
 * Renders a horizontal line at the current time position.
 * Updates every 60 seconds.
 */
export function CurrentTimeLine({
  startHour = DEFAULT_GRID_START_HOUR,
  endHour = DEFAULT_GRID_END_HOUR,
}: CurrentTimeLineProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const hour = now.getHours();
  if (hour < startHour || hour >= endHour) return null;

  return (
    <div
      className="absolute left-0 right-0 z-10 pointer-events-none flex items-center"
      style={{ top: `${positionFor(now, startHour)}px` }}
    >
      {/* Time Label */}
      <div className="absolute -left-14 bg-kanji-deep dark:bg-kio text-white dark:text-slate-900 text-[11px] font-bold px-1.5 py-0.5 rounded-xs shadow-sm flex items-center justify-center">
        Ahora
      </div>

      {/* Circle indicator */}
      <div className="w-4 h-4 rounded-full bg-kio -ml-[8px] shrink-0 z-10 border-2 border-white dark:border-slate-900" />

      {/* Line */}
      <div className="flex-1 h-[2px] bg-kio" />
    </div>
  );
}
