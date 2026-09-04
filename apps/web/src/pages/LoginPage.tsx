import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { loginSchema, type LoginFormData } from '../schemas/auth.schemas';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../lib/errors';

/**
 * `loginSchema` emite sus mensajes en inglés ("Email is required", …) y el
 * bloque `auth.errors` de los locales guarda esas mismas frases en inglés, así
 * que interpolar el mensaje como clave de i18n ("auth.errors." + message) nunca
 * acertaba y el defaultValue inglés terminaba pintado bajo el campo — en un
 * producto que solo habla español, en la primera pantalla y en el caso más
 * común que existe: enviar el formulario vacío.
 *
 * Mientras el esquema y los locales se cierran desde su propio carril, la
 * pantalla resuelve el texto aquí. El mapa acepta tanto la frase inglesa actual
 * como la clave literal (`email_required`, …) por si el esquema migra a claves,
 * y cualquier mensaje que ya venga en español pasa tal cual.
 */
const FIELD_ERROR_ES: Record<string, string> = {
  'Email is required': 'El correo electrónico es requerido',
  email_required: 'El correo electrónico es requerido',
  'Please enter a valid email': 'Ingresa un correo electrónico válido',
  email_invalid: 'Ingresa un correo electrónico válido',
  'Password is required': 'La contraseña es requerida',
  password_required: 'La contraseña es requerida',
};

const fieldError = (message?: string): string | null =>
  message ? (FIELD_ERROR_ES[message] ?? message) : null;

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);

    try {
      await login(data.email, data.password);

      // Get fresh user state after login
      const user = useAuthStore.getState().user;

      if (user?.mustChangePassword) {
        navigate('/change-password', { replace: true });
      } else if (user?.profile) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (error: unknown) {
      setServerError(getErrorMessage(error, 'Credenciales inválidas. Por favor intenta de nuevo.'));
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
          <h1 className="text-3xl font-bold text-kanji-deep dark:text-white">
            {t('auth.login_title')}
          </h1>
          <p className="mt-2 text-sm font-medium text-text-secondary">{t('auth.login_subtitle')}</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-cruz/50 dark:border-slate-800 p-6 sm:p-8"
        >
          {/* Server Error */}
          {serverError && (
            <div
              role="alert"
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
            >
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{serverError}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text dark:text-slate-200 mb-2"
            >
              {t('auth.email_label')}
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              autoComplete="email"
              placeholder="tucorreo@ejemplo.com"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`
                w-full px-4 py-3 rounded-xl border transition-all duration-200
                bg-bg dark:bg-slate-800 text-text dark:text-white placeholder:text-text-muted dark:placeholder:text-slate-500
                focus:outline-none focus:ring-2 focus:ring-kio/50 focus:border-kio
                ${errors.email ? 'border-red-400' : 'border-cruz dark:border-slate-700'}
              `}
            />
            {errors.email && (
              <p id="email-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
                {fieldError(errors.email.message)}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text dark:text-slate-200"
              >
                {t('auth.password_label')}
              </label>
              {/* El área táctil de 44px se da con padding y margen negativo que lo
                  cancela: con `min-h-11` la fila entera crecía a 44px y despegaba
                  la etiqueta del campo que nombra. */}
              <Link
                to="/forgot-password"
                className="-mx-2 -my-3.5 inline-flex items-center px-2 py-3.5 text-xs font-medium text-kanji-deep hover:underline dark:text-kio transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              {...register('password')}
              type="password"
              id="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={`
                w-full px-4 py-3 rounded-xl border transition-all duration-200
                bg-bg dark:bg-slate-800 text-text dark:text-white placeholder:text-text-muted dark:placeholder:text-slate-500
                focus:outline-none focus:ring-2 focus:ring-kio/50 focus:border-kio
                ${errors.password ? 'border-red-400' : 'border-cruz dark:border-slate-700'}
              `}
            />
            {errors.password && (
              <p id="password-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
                {fieldError(errors.password.message)}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full min-h-11 py-3.5 px-6 rounded-xl font-bold text-white
              bg-kanji-deep hover:bg-kanji-deep/90
              focus:outline-none focus:ring-2 focus:ring-kio/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900
              transition-colors duration-150 shadow-md shadow-kanji-deep/20
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('auth.login_loading')}
              </span>
            ) : (
              t('auth.login_button')
            )}
          </button>

          <p className="mt-6 text-center text-sm font-medium text-text-secondary">
            {t('auth.no_account')}{' '}
            <Link
              to="/signup"
              className="font-bold text-kanji-deep hover:underline dark:text-kio transition-colors"
            >
              {t('auth.signup_link')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
