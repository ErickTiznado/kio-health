import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-kio/20 blur-3xl rounded-full" />
        <h1 className="relative text-9xl font-black text-kanji/10 dark:text-white/10 select-none">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-kanji dark:text-white">Página no encontrada</span>
        </div>
      </div>

      <p className="text-gray-500 dark:text-slate-400 max-w-md mb-8">
        La página que buscas no existe o ha sido movida. Verifica la URL o regresa al inicio.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 rounded-2xl font-bold text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
        <Link
          to="/dashboard"
          className="px-6 py-3 rounded-2xl font-bold bg-kio text-white shadow-lg shadow-kio/20 hover:bg-kanji transition-all active:scale-95 flex items-center gap-2"
        >
          <Home size={20} />
          Ir al Dashboard
        </Link>
      </div>
    </div>
  );
}
