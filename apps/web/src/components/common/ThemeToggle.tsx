import { Moon, Sun, Laptop } from 'lucide-react';
import { useThemeStore } from '../../stores/theme.store';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'light') return <Sun size={20} />;
    if (theme === 'dark') return <Moon size={20} />;
    return <Laptop size={20} />;
  };

  const getLabel = () => {
    if (theme === 'light') return 'Modo Claro';
    if (theme === 'dark') return 'Modo Oscuro';
    return 'Sistema';
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex h-11 w-11 items-center justify-center rounded-full transition-colors bg-secondary dark:bg-slate-800 text-gray-600 dark:text-kio hover:bg-cruz/50 dark:hover:bg-slate-700"
      title={`Tema: ${getLabel()}`}
    >
      {getIcon()}
    </button>
  );
}
