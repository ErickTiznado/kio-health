import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-slate-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-5 sm:mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 rounded-2xl mb-4 overflow-hidden">
            <img src="/logo.png" alt="Kio Health" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-kanji-deep dark:text-white">Recuperar contraseña</h1>
          <p className="mt-2 text-sm font-medium text-text-secondary">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-cruz/50 dark:border-slate-800 p-6 sm:p-8">
          {submitted ? (
            <div role="status" className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
                <Check size={26} aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-kanji-deep dark:text-white mb-2">
                Si el correo existe, recibirás el enlace en breve.
              </p>
              <p className="text-xs font-medium text-text-secondary">
                Revisa tu bandeja de entrada y carpeta de spam.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  id="forgot-error"
                  role="alert"
                  className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                >
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text dark:text-slate-200 mb-2"
                >
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? 'forgot-error' : undefined}
                  className="w-full px-4 py-3 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-text dark:text-white placeholder:text-text-muted dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-kio/50 focus:border-kio transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full min-h-11 py-3 px-4 rounded-xl bg-kanji-deep text-white font-bold text-sm shadow-md shadow-kanji-deep/20 hover:bg-kanji-deep/90 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-kanji-deep hover:underline dark:text-kio transition-colors"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
