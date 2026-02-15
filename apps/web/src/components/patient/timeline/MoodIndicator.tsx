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

  return (
    <div
      className={`${getSize()} rounded-full ${getColor(rating)} shadow-sm ring-2 ring-white dark:ring-slate-900`}
      title={`Ánimo: ${rating}/10`}
    />
  );
}
