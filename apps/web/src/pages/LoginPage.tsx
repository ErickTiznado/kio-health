import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { loginSchema, type LoginFormData } from '../schemas/auth.schemas';
import { useState } from 'react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

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

      // Redirect based on profile status
      if (user?.profile) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Credenciales inválidas. Por favor intenta de nuevo.';
      setServerError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg via-bg to-kio/5 dark:from-slate-950 dark:via-slate-950 dark:to-kio/10 px-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-kio rounded-2xl mb-4 shadow-lg shadow-kio/20">
            <span className="text-2xl font-bold text-white">K</span>
          </div>
          <h1 className="text-3xl font-bold text-kanji dark:text-white">Bienvenido a Kio</h1>
          <p className="text-text/60 dark:text-slate-400 mt-2">Inicia sesión en tu cuenta</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/20 border border-cruz/50 dark:border-slate-800 p-8"
        >
          {/* Server Error */}
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{serverError}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-kanji dark:text-slate-200 mb-2"
            >
              Correo Electrónico
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={`
                w-full px-4 py-3 rounded-xl border transition-all duration-200
                bg-bg dark:bg-slate-800 text-kanji dark:text-white placeholder:text-text/40 dark:placeholder:text-slate-500
                focus:outline-none focus:ring-2 focus:ring-kio/30 focus:border-kio
                ${errors.email ? 'border-red-400' : 'border-cruz dark:border-slate-700'}
              `}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-kanji dark:text-slate-200 mb-2"
            >
              Contraseña
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className={`
                w-full px-4 py-3 rounded-xl border transition-all duration-200
                bg-bg dark:bg-slate-800 text-kanji dark:text-white placeholder:text-text/40 dark:placeholder:text-slate-500
                focus:outline-none focus:ring-2 focus:ring-kio/30 focus:border-kio
                ${errors.password ? 'border-red-400' : 'border-cruz dark:border-slate-700'}
              `}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-3.5 px-6 rounded-xl font-semibold text-white
              bg-gradient-to-r from-kio to-kio/90
              hover:from-kio/95 hover:to-kio/85
              focus:outline-none focus:ring-2 focus:ring-kio/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900
              transition-all duration-200 shadow-lg shadow-kio/20
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-text/50 dark:text-slate-500 text-sm mt-6">
          Credenciales de prueba: <strong>psych@kio.com</strong> /{' '}
          <strong>123456</strong>
        </p>
      </div>
    </div>
  );
}
