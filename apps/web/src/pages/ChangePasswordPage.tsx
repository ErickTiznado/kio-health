import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../stores/auth.store';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../lib/errors';
import { KeyRound, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

type FormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, logout, fetchCurrentUser } = useAuthStore();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      await fetchCurrentUser();
      toast.success('¡Contraseña actualizada! Bienvenido a Kio Health.');
      const fresh = useAuthStore.getState().user;
      if (fresh?.profile) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'No se pudo actualizar la contraseña.'));
      setIsSubmitting(false);
    }
  });

  return (
    <div className="min-h-screen bg-bg dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-44 h-44 rounded-2xl mb-4 overflow-hidden">
            <img src="/logo.png" alt="Kio Health" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <ShieldCheck size={20} className="text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
              Debes cambiar tu contraseña
            </p>
            <p className="text-xs font-medium text-amber-800 dark:text-amber-400 mt-0.5">
              Tu cuenta fue configurada con una contraseña temporal. Por seguridad, elige una nueva antes de continuar.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-secondary dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
              <KeyRound size={18} className="text-kanji-deep dark:text-kio" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-kanji-deep dark:text-white">Nueva contraseña</h2>
              <p className="text-xs font-medium text-text-secondary">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">

            {/* Current password */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-text dark:text-slate-200 mb-1.5"
              >
                Contraseña temporal
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={errors.currentPassword ? true : undefined}
                  aria-describedby={errors.currentPassword ? 'currentPassword-error' : undefined}
                  {...register('currentPassword', { required: 'Ingresa tu contraseña temporal' })}
                  className={`w-full min-h-11 px-4 py-2.5 pr-12 rounded-xl border text-sm bg-bg dark:bg-slate-800 text-text dark:text-white focus:outline-none focus:ring-2 focus:ring-kio/50 placeholder:text-text-muted dark:placeholder:text-slate-600 ${
                    errors.currentPassword ? 'border-red-400' : 'border-cruz dark:border-slate-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  aria-label={
                    showCurrent ? 'Ocultar contraseña temporal' : 'Mostrar contraseña temporal'
                  }
                  aria-pressed={showCurrent}
                  className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-text-secondary transition-colors hover:text-kanji-deep dark:hover:text-kio"
                >
                  {showCurrent ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p id="currentPassword-error" className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-text dark:text-slate-200 mb-1.5"
              >
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  aria-invalid={errors.newPassword ? true : undefined}
                  aria-describedby={errors.newPassword ? 'newPassword-error' : undefined}
                  {...register('newPassword', {
                    required: 'Ingresa una nueva contraseña',
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                  })}
                  className={`w-full min-h-11 px-4 py-2.5 pr-12 rounded-xl border text-sm bg-bg dark:bg-slate-800 text-text dark:text-white focus:outline-none focus:ring-2 focus:ring-kio/50 placeholder:text-text-muted dark:placeholder:text-slate-600 ${
                    errors.newPassword ? 'border-red-400' : 'border-cruz dark:border-slate-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  aria-label={showNew ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
                  aria-pressed={showNew}
                  className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-text-secondary transition-colors hover:text-kanji-deep dark:hover:text-kio"
                >
                  {showNew ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
              {errors.newPassword && (
                <p id="newPassword-error" className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-text dark:text-slate-200 mb-1.5"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={errors.confirmPassword ? true : undefined}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                {...register('confirmPassword', {
                  required: 'Confirma tu contraseña',
                  validate: (val) => val === watch('newPassword') || 'Las contraseñas no coinciden',
                })}
                className={`w-full min-h-11 px-4 py-2.5 rounded-xl border text-sm bg-bg dark:bg-slate-800 text-text dark:text-white focus:outline-none focus:ring-2 focus:ring-kio/50 placeholder:text-text-muted dark:placeholder:text-slate-600 ${
                  errors.confirmPassword ? 'border-red-400' : 'border-cruz dark:border-slate-700'
                }`}
              />
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex min-h-11 items-center justify-center gap-2 px-5 py-3 bg-kanji-deep text-white rounded-xl text-sm font-bold shadow-md shadow-kanji-deep/20 hover:bg-kanji-deep/90 transition-colors duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                  Guardando...
                </>
              ) : (
                'Establecer contraseña'
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex min-h-11 items-center rounded-xl px-3 text-xs font-medium text-text-secondary hover:text-text dark:hover:text-slate-200 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
