import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="relative mb-8 w-full max-w-md">
        <span
          aria-hidden="true"
          className="block text-8xl sm:text-9xl font-bold text-kanji-deep/10 dark:text-white/10 select-none"
        >
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center px-2">
          <h1 className="text-2xl sm:text-4xl font-bold text-kanji-deep dark:text-white">
            Página no encontrada
          </h1>
        </div>
      </div>

      <p className="max-w-md mb-8 text-sm font-medium text-text-secondary">
        La página que buscas no existe o ha sido movida. Verifica la URL o regresa al inicio.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex min-h-11 items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-text-secondary transition-colors hover:bg-secondary hover:text-text dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft size={20} aria-hidden="true" />
          Volver
        </button>
        <Link
          to="/dashboard"
          className="flex min-h-11 items-center gap-2 rounded-xl bg-kanji-deep px-6 py-3 text-sm font-bold text-white shadow-md shadow-kanji-deep/20 transition-all duration-150 hover:bg-kanji-deep/90 active:scale-95"
        >
          <Home size={20} aria-hidden="true" />
          Ir al Dashboard
        </Link>
      </div>
    </div>
  );
}
