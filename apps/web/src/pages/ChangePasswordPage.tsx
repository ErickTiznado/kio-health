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
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-kio/5 dark:from-slate-950 dark:via-slate-950 dark:to-kio/10 flex items-center justify-center px-4">
      <div className="max-w-md w-full">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-44 h-44 rounded-2xl mb-4 overflow-hidden">
            <img src="/kio.svg" alt="Kio Health" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <ShieldCheck size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Debes cambiar tu contraseña
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Tu cuenta fue configurada con una contraseña temporal. Por seguridad, elige una nueva antes de continuar.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-cruz dark:border-slate-800 shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-kio to-kanji rounded-xl flex items-center justify-center shrink-0">
              <KeyRound size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-kanji dark:text-white">Nueva contraseña</h2>
              <p className="text-xs text-text/50 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">

            {/* Current password */}
            <div>
              <label className="block text-sm font-medium text-kanji dark:text-slate-200 mb-1.5">
                Contraseña temporal
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('currentPassword', { required: 'Ingresa tu contraseña temporal' })}
                  className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm bg-bg dark:bg-slate-800 text-kanji dark:text-white focus:outline-none focus:ring-2 focus:ring-kio/50 placeholder:text-text/30 dark:placeholder:text-slate-600 ${
                    errors.currentPassword ? 'border-red-400' : 'border-cruz dark:border-slate-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-kanji dark:hover:text-kio"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.currentPassword.message}</p>
              )}
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-kanji dark:text-slate-200 mb-1.5">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  {...register('newPassword', {
                    required: 'Ingresa una nueva contraseña',
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                  })}
                  className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm bg-bg dark:bg-slate-800 text-kanji dark:text-white focus:outline-none focus:ring-2 focus:ring-kio/50 placeholder:text-text/30 dark:placeholder:text-slate-600 ${
                    errors.newPassword ? 'border-red-400' : 'border-cruz dark:border-slate-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-kanji dark:hover:text-kio"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-kanji dark:text-slate-200 mb-1.5">
                Confirmar contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Confirma tu contraseña',
                  validate: (val) => val === watch('newPassword') || 'Las contraseñas no coinciden',
                })}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-bg dark:bg-slate-800 text-kanji dark:text-white focus:outline-none focus:ring-2 focus:ring-kio/50 placeholder:text-text/30 dark:placeholder:text-slate-600 ${
                  errors.confirmPassword ? 'border-red-400' : 'border-cruz dark:border-slate-700'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 bg-kio text-white rounded-xl text-sm font-semibold hover:bg-kio/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
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
            onClick={handleLogout}
            className="text-text/40 dark:text-slate-600 hover:text-text/70 dark:hover:text-slate-400 text-xs font-medium transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
