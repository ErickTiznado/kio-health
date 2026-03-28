import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../lib/auth.api';
import { getErrorMessage } from '../lib/errors';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Ocurrió un error. Por favor intenta de nuevo.'));
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
          <h1 className="text-3xl font-bold text-kanji dark:text-white">Recuperar contraseña</h1>
          <p className="text-text/60 dark:text-slate-400 mt-2">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/20 border border-cruz/50 dark:border-slate-800 p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4 text-emerald-500 text-2xl">
                ✓
              </div>
              <p className="text-sm font-medium text-kanji dark:text-white mb-2">
                Si el correo existe, recibirás el enlace en breve.
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Revisa tu bandeja de entrada y carpeta de spam.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-kanji dark:text-slate-200 mb-2"
                >
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white placeholder:text-text/40 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-kio/30 focus:border-kio transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full py-3 px-4 rounded-xl bg-kanji dark:bg-kio text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-kio hover:text-kio/80 transition-colors"
            >
              ← Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
