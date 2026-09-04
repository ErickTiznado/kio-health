import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { signupSchema, type SignupFormData } from '../schemas/auth.schemas';
import { useState, useEffect } from 'react';
import { AlertTriangle, Check, Lock } from 'lucide-react';
import { getErrorMessage } from '../lib/errors';
import { api } from '../lib/api';
import { capture } from '../lib/analytics';

type InviteState =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'invalid'; reason: string }
  | { status: 'valid'; email: string; token: string };

export function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup, isLoading } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const inviteToken = searchParams.get('invite');
  const [inviteResult, setInviteResult] = useState<InviteState>({ status: 'loading' });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', fullName: '' },
  });

  // Validar token de invitación al montar
  useEffect(() => {
    if (!inviteToken) return;

    let cancelled = false;
    api
      .get<{ valid: boolean; email: string }>(`/auth/validate-invite/${inviteToken}`)
      .then(({ data }) => {
        if (cancelled) return;
        setInviteResult({ status: 'valid', email: data.email, token: inviteToken });
        setValue('email', data.email);
      })
      .catch(() => {
        if (cancelled) return;
        setInviteResult({
          status: 'invalid',
          reason: 'Este enlace de invitación no es válido o ya fue utilizado.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [inviteToken, setValue]);

  // Sin token en la URL no hay nada que validar: es estado derivado, no del efecto.
  const invite: InviteState = inviteToken ? inviteResult : { status: 'missing' };

  const onSubmit = async (data: SignupFormData) => {
    setServerError(null);
    if (invite.status !== 'valid') return;

    try {
      await signup({ ...data, inviteToken: invite.token });

      capture('signup_completed', { via_invite: true });

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

  // ── Estados de bloqueo ──────────────────────────────────────────────────────

  if (invite.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-slate-950 px-4">
        <div role="status" className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-kio/40 border-t-kio rounded-full animate-spin" />
          <p className="text-sm font-medium text-text-secondary">Validando tu invitación...</p>
        </div>
      </div>
    );
  }

  if (invite.status === 'missing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-slate-950 px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-2xl mb-6 overflow-hidden">
            <img src="/logo.png" alt="Kio Health" className="w-full h-full object-contain" />
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-cruz/50 dark:border-slate-800 p-8">
            <div className="w-14 h-14 bg-kio-light/40 dark:bg-kio/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock size={26} className="text-kanji-deep dark:text-kio" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-kanji-deep dark:text-white mb-2">Beta cerrada</h1>
            <p className="text-sm font-medium leading-relaxed text-text-secondary mb-6">
              Kio Health está en beta cerrada por el momento. El acceso es únicamente por
              invitación.
            </p>
            <p className="text-xs font-medium text-text-secondary">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="font-bold text-kanji-deep hover:underline dark:text-kio transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (invite.status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-slate-950 px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-2xl mb-6 overflow-hidden">
            <img src="/logo.png" alt="Kio Health" className="w-full h-full object-contain" />
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-cruz/50 dark:border-slate-800 p-8">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={26} className="text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-kanji-deep dark:text-white mb-2">
              Enlace no válido
            </h1>
            <p role="alert" className="text-sm font-medium leading-relaxed text-text-secondary mb-6">
              {invite.reason}
            </p>
            <p className="text-xs font-medium text-text-secondary">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="font-bold text-kanji-deep hover:underline dark:text-kio transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulario de registro (invite válido) ──────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-slate-950 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-5 sm:mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 rounded-2xl mb-4 overflow-hidden">
            <img src="/logo.png" alt="Kio Health" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-kanji-deep dark:text-white">Únete a Kio</h1>
          <p className="mt-2 text-sm font-medium text-text-secondary">Estás invitado a la beta</p>
        </div>

        {/* Signup Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-cruz/50 dark:border-slate-800 p-6 sm:p-8"
        >
          {/* Beta badge */}
          <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-kio-light/40 dark:bg-kio/10 rounded-xl border border-kio/20">
            <span className="w-2 h-2 rounded-full bg-kanji-deep dark:bg-kio flex-shrink-0" />
            <p className="text-xs font-bold text-kanji-deep dark:text-kio">
              Acceso beta — invitado como {invite.email}
            </p>
          </div>

          {/* Server Error */}
          {serverError && (
            <div
              role="alert"
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
            >
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{serverError}</p>
            </div>
          )}

          {/* Full Name Field */}
          <div className="mb-5">
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-text dark:text-slate-200 mb-2"
            >
              Nombre completo
            </label>
            <input
              {...register('fullName')}
              type="text"
              id="fullName"
              placeholder="Dra. Ana Martínez"
              aria-invalid={errors.fullName ? true : undefined}
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              className={`
                w-full px-4 py-3 rounded-xl border transition-all duration-200
                bg-bg dark:bg-slate-800 text-text dark:text-white placeholder:text-text-muted dark:placeholder:text-slate-500
                focus:outline-none focus:ring-2 focus:ring-kio/50 focus:border-kio
                ${errors.fullName ? 'border-red-400' : 'border-cruz dark:border-slate-700'}
              `}
            />
            {errors.fullName && (
              <p id="fullName-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email Field (readonly — pre-llenado desde el token) */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text dark:text-slate-200 mb-2"
            >
              Correo electrónico
            </label>
            <div className="relative">
              <input
                {...register('email')}
                type="email"
                id="email"
                readOnly
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'email-locked email-error' : 'email-locked'}
                className={`w-full px-4 py-3 pr-10 rounded-xl border bg-secondary dark:bg-slate-800 text-text dark:text-white cursor-not-allowed ${
                  errors.email ? 'border-red-400' : 'border-cruz dark:border-slate-700'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400">
                <Check size={20} aria-hidden="true" />
              </span>
            </div>
            <p id="email-locked" className="mt-1 text-xs font-medium text-text-secondary">
              El correo está vinculado a tu invitación y no puede cambiarse.
            </p>
            {/* El campo es readOnly y lo rellena el backend desde la invitación, pero
                sigue registrado en el resolver: sin este bloque, un correo que el
                esquema rechazase abortaría el submit sin pintar nada y dejaría el
                botón "Crear cuenta" muerto sin explicación. */}
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text dark:text-slate-200 mb-2"
            >
              Contraseña
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              autoComplete="new-password"
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
                {errors.password.message}
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
                Creando cuenta...
              </span>
            ) : (
              'Crear cuenta'
            )}
          </button>

          <p className="mt-6 text-center text-sm font-medium text-text-secondary">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              className="font-bold text-kanji-deep hover:underline dark:text-kio transition-colors"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
