import { Smile, Frown, Meh } from 'lucide-react';

interface MoodTrackerProps {
  value: number; // 1-10
  onChange: (val: number) => void;
}

export function MoodTracker({ value, onChange }: MoodTrackerProps) {
  // Helper to get color based on value
  const getColor = (val: number) => {
    if (val >= 8) return 'text-emerald-500';
    if (val >= 5) return 'text-amber-500';
    return 'text-red-500';
  };

  const getIcon = (val: number) => {
    if (val >= 8) return Smile;
    if (val >= 5) return Meh;
    return Frown;
  };

  const Icon = getIcon(value);

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ánimo</span>
      
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={value || 5}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-kanji)]"
        />
        
        <div className={`flex items-center gap-1 font-bold ${getColor(value || 5)} w-8 justify-end`}>
          <span className="text-sm">{value || 5}</span>
          <Icon size={14} />
        </div>
      </div>
    </div>
  );
}
