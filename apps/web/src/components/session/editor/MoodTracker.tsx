import { Smile, Frown, Meh } from 'lucide-react';

interface MoodTrackerProps {
  value: number; // 1-10
  onChange: (val: number) => void;
  label?: string;
}

export function MoodTracker({ value, onChange, label = 'Percepción inicial de ánimo' }: MoodTrackerProps) {
  // Helper to get color based on value
  const getColor = (val: number) => {
    if (val >= 8) return 'text-emerald-500';
    if (val >= 5) return 'text-amber-500';
    return 'text-red-500';
  };

  const Icon = value >= 8 ? Smile : value >= 5 ? Meh : Frown;

  return (
    <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-surface px-4 py-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
        {label}
      </span>

      <div className="flex items-center gap-2">
        {/* La barra se ve de 6px, pero el área que se puede arrastrar mide 44px:
            el relleno vertical va en `content-box`, el fondo se recorta al
            contenido y el margen negativo devuelve la altura de maquetación.
            El aspecto no cambia y el control sí se alcanza con el dedo. */}
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={value || 5}
          aria-label={label}
          aria-valuetext={`${value || 5} de 10`}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="box-content -my-[19px] h-1.5 w-24 cursor-pointer appearance-none rounded-lg bg-gray-200 bg-clip-content py-[19px] accent-[var(--color-kanji)] dark:bg-slate-600"
        />

        <div className={`flex items-center gap-1 font-bold ${getColor(value || 5)} w-8 justify-end`}>
          <span className="text-sm">{value || 5}</span>
          <Icon size={14} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
