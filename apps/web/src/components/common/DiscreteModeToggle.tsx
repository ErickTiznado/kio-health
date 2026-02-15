import { Eye, EyeOff } from 'lucide-react';
import { useSettingsStore } from '../../stores/settings.store';

export function DiscreteModeToggle() {
  const { isDiscreteMode, toggleDiscreteMode } = useSettingsStore();

  return (
    <button
      onClick={toggleDiscreteMode}
      className={`p-2 rounded-full transition-all ${
        isDiscreteMode 
          ? 'bg-kanji dark:bg-kio text-white dark:text-slate-900' 
          : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
      }`}
      title={isDiscreteMode ? "Desactivar Modo Discreto" : "Activar Modo Discreto"}
    >
      {isDiscreteMode ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  );
}
