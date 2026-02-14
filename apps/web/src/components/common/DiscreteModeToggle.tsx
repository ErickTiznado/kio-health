import { Eye, EyeOff } from 'lucide-react';
import { useSettingsStore } from '../../stores/settings.store';

export function DiscreteModeToggle() {
  const { isDiscreteMode, toggleDiscreteMode } = useSettingsStore();

  return (
    <button
      onClick={toggleDiscreteMode}
      className={`p-2 rounded-full transition-all ${
        isDiscreteMode 
          ? 'bg-[var(--color-kanji)] text-white' 
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
      title={isDiscreteMode ? "Desactivar Modo Discreto" : "Activar Modo Discreto"}
    >
      {isDiscreteMode ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  );
}
