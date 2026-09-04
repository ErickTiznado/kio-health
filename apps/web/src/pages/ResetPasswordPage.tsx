import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { resetPassword } from '../lib/auth.api';
import { getErrorMessage } from '../lib/errors';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirigir es un efecto secundario, no parte del render: hacerlo en el cuerpo
  // del componente hace que React Router avise por consola y que StrictMode
  // dispare dos navegaciones al montar dos veces.
  useEffect(() => {
    if (!token) navigate('/forgot-password', { replace: true });
  }, [token, navigate]);

  if (!token) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, newPassword);
      toast.success('Contraseña actualizada correctamente');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Token inválido o expirado. Solicita un nuevo enlace.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-slate-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-5 sm:mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 rounded-2xl mb-4 overflow-hidden">
            <img src="/logo.png" alt="Kio Health" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-kanji-deep dark:text-white">Nueva contraseña</h1>
          <p className="mt-2 text-sm font-medium text-text-secondary">
            Elige una contraseña segura de al menos 8 caracteres.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-cruz/50 dark:border-slate-800 p-6 sm:p-8"
        >
          {error && (
            <div
              id="reset-error"
              role="alert"
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
            >
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="mb-5">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-text dark:text-slate-200 mb-2"
            >
              Nueva contraseña
            </label>
            <input
              type="password"
              id="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'reset-error' : undefined}
              className="w-full px-4 py-3 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-text dark:text-white placeholder:text-text-muted dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-kio/50 focus:border-kio transition-all duration-200"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-text dark:text-slate-200 mb-2"
            >
              Confirmar contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'reset-error' : undefined}
              className="w-full px-4 py-3 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-text dark:text-white placeholder:text-text-muted dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-kio/50 focus:border-kio transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !newPassword || !confirmPassword}
            className="w-full min-h-11 py-3 px-4 rounded-xl bg-kanji-deep text-white font-bold text-sm shadow-md shadow-kanji-deep/20 hover:bg-kanji-deep/90 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : 'Guardar nueva contraseña'}
          </button>

          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="inline-flex min-h-11 items-center text-sm font-medium text-kanji-deep hover:underline dark:text-kio transition-colors"
            >
              Solicitar un nuevo enlace
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
