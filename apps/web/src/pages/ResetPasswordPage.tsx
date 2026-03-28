import { useState } from 'react';
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

  if (!token) {
    navigate('/forgot-password', { replace: true });
    return null;
  }

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg via-bg to-kio/5 dark:from-slate-950 dark:via-slate-950 dark:to-kio/10 px-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-5 sm:mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 rounded-2xl mb-4 overflow-hidden">
            <img src="/kio.svg" alt="Kio Health" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-kanji dark:text-white">Nueva contraseña</h1>
          <p className="text-text/60 dark:text-slate-400 mt-2">
            Elige una contraseña segura de al menos 8 caracteres.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/20 border border-cruz/50 dark:border-slate-800 p-6 sm:p-8"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="mb-5">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-kanji dark:text-slate-200 mb-2"
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
              className="w-full px-4 py-3 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white placeholder:text-text/40 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-kio/30 focus:border-kio transition-all duration-200"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-kanji dark:text-slate-200 mb-2"
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
              className="w-full px-4 py-3 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white placeholder:text-text/40 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-kio/30 focus:border-kio transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !newPassword || !confirmPassword}
            className="w-full py-3 px-4 rounded-xl bg-kanji dark:bg-kio text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : 'Guardar nueva contraseña'}
          </button>

          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-kio hover:text-kio/80 transition-colors"
            >
              Solicitar un nuevo enlace
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
