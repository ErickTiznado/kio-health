import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { signupSchema, type SignupFormData } from '../schemas/auth.schemas';
import { useState, useEffect, useRef } from 'react';
import { getErrorMessage } from '../lib/errors';
import { api } from '../lib/api';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
    },
  });

  const emailValue = watch('email');

  useEffect(() => {
    setEmailTaken(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Only check if the email looks valid (basic shape)
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) return;

    setEmailChecking(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get<{ available: boolean }>('/auth/check-email', {
          params: { email: emailValue },
        });
        setEmailTaken(!data.available);
      } catch {
        // silently ignore — server-side validation will catch it on submit
      } finally {
        setEmailChecking(false);
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [emailValue]);

  const onSubmit = async (data: SignupFormData) => {
    setServerError(null);
    if (emailTaken) return;

    try {
      await signup(data);

      // Get fresh user state after signup
      const user = useAuthStore.getState().user;

      if (user?.mustChangePassword) {
        navigate('/change-password', { replace: true });
      } else if (user?.profile) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (error: unknown) {
      setServerError(getErrorMessage(error, 'El registro falló. Por favor intenta de nuevo.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg via-bg to-kio/5 dark:from-slate-950 dark:via-slate-950 dark:to-kio/10 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-5 sm:mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 rounded-2xl mb-4 overflow-hidden">
            <img src="/logo.png" alt="Kio Health" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-kanji dark:text-white">Únete a Kio</h1>
          <p className="text-text/60 dark:text-slate-400 mt-2">Crea tu cuenta</p>
        </div>

        {/* Signup Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/20 border border-cruz/50 dark:border-slate-800 p-6 sm:p-8"
        >
          {/* Server Error */}
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{serverError}</p>
            </div>
          )}

          {/* Full Name Field */}
          <div className="mb-5">
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-kanji dark:text-slate-200 mb-2"
            >
              Nombre Completo
            </label>
            <input
              {...register('fullName')}
              type="text"
              id="fullName"
              placeholder="Dra. Jane Doe"
              className={`
                w-full px-4 py-3 rounded-xl border transition-all duration-200
                bg-bg dark:bg-slate-800 text-kanji dark:text-white placeholder:text-text/40 dark:placeholder:text-slate-500
                focus:outline-none focus:ring-2 focus:ring-kio/30 focus:border-kio
                ${errors.fullName ? 'border-red-400' : 'border-cruz dark:border-slate-700'}
              `}
            />
            {errors.fullName && (
              <p className="mt-2 text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-kanji dark:text-slate-200 mb-2"
            >
              Correo Electrónico
            </label>
            <div className="relative">
              <input
                {...register('email')}
                type="email"
                id="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`
                  w-full px-4 py-3 pr-10 rounded-xl border transition-all duration-200
                  bg-bg dark:bg-slate-800 text-kanji dark:text-white placeholder:text-text/40 dark:placeholder:text-slate-500
                  focus:outline-none focus:ring-2 focus:ring-kio/30 focus:border-kio
                  ${errors.email || emailTaken ? 'border-red-400' : 'border-cruz dark:border-slate-700'}
                `}
              />
              {emailChecking && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-kio/40 border-t-kio rounded-full animate-spin" />
              )}
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
            )}
            {!errors.email && emailTaken && (
              <p className="mt-2 text-sm text-red-500">Este correo ya está registrado. ¿Ya tienes cuenta?</p>
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
              autoComplete="new-password"
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
                Creando cuenta...
              </span>
            ) : (
              'Crear Cuenta'
            )}
          </button>
          
          <p className="mt-6 text-center text-sm text-text/60 dark:text-slate-400">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-kio hover:text-kio/80 font-medium transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
