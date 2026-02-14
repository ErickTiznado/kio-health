import { useState, useEffect } from 'react';

const GRID_START_HOUR = 8;
const HOUR_HEIGHT_PX = 80;

function calculateCurrentTimePosition(): number {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const offsetHours = currentHour - GRID_START_HOUR + currentMinute / 60;
  return offsetHours * HOUR_HEIGHT_PX;
}

function isWithinGridBounds(): boolean {
  const hour = new Date().getHours();
  return hour >= GRID_START_HOUR && hour < 20;
}

/**
 * Renders a glowing horizontal line at the current time position.
 * Updates every 60 seconds.
 */
export function CurrentTimeLine() {
  const [topPosition, setTopPosition] = useState(calculateCurrentTimePosition);

  useEffect(() => {
    const interval = setInterval(() => {
      setTopPosition(calculateCurrentTimePosition());
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  if (!isWithinGridBounds()) return null;

  return (
    <div
      className="absolute left-0 right-0 z-10 pointer-events-none flex items-center"
      style={{ top: `${topPosition}px` }}
    >
      {/* Time Label */}
      <div className="absolute -left-12 bg-[var(--color-kio)] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm shadow-sm flex items-center justify-center">
        AHORA
      </div>

      {/* Circle indicator */}
      <div
        className="w-4 h-4 rounded-full bg-[var(--color-kio)] -ml-[8px] shrink-0 z-10 border-2 border-white"
        style={{ boxShadow: '0 0 10px rgba(174, 147, 254, 0.7), 0 0 20px rgba(174, 147, 254, 0.3)' }}
      />

      {/* Line */}
      <div
        className="flex-1 h-[2px] bg-[var(--color-kio)]/80"
        style={{ boxShadow: '0 0 8px rgba(174, 147, 254, 0.4)' }}
      />
    </div>
  );
}


