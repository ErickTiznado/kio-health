interface MoodIndicatorProps {
  rating: number; // 1-10
  size?: 'sm' | 'md' | 'lg';
}

export function MoodIndicator({ rating, size = 'md' }: MoodIndicatorProps) {
  const getColor = (val: number) => {
    if (val >= 8) return 'bg-emerald-500';
    if (val >= 5) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getSize = () => {
    switch (size) {
      case 'sm': return 'w-2 h-2';
      case 'lg': return 'w-4 h-4';
      default: return 'w-3 h-3';
    }
  };

  // El dato vivía sólo en el color y en un `title`: en escala de grises, con
  // daltonismo o en táctil, un punto ámbar y uno rojo eran el mismo punto. El
  // número va ahora como texto visible y el punto sólo lo acompaña.
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tabular-nums text-slate-600 dark:text-slate-400">
      <span
        aria-hidden="true"
        className={`${getSize()} shrink-0 rounded-full ${getColor(rating)} ring-2 ring-white dark:ring-slate-900`}
      />
      Ánimo {rating}/10
    </span>
  );
}
