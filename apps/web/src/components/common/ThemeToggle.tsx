import { Moon, Sun, Laptop } from 'lucide-react';
import { useThemeStore } from '../../stores/theme.store';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

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
      className="p-2 rounded-full transition-all bg-surface dark:bg-slate-800 text-gray-500 dark:text-kio hover:bg-surface/80 dark:hover:bg-slate-700"
      title={`Tema: ${getLabel()}`}
    >
      {getIcon()}
    </button>
  );
}
