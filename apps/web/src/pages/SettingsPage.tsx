import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuthStore } from '../stores/auth.store';
import { settingsSchema, type SettingsFormData } from '../schemas/settings.schema';
import { api } from '../lib/api';

export function SettingsPage() {
  const { user, fetchCurrentUser } = useAuthStore();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      sessionDefaultPrice: user?.profile?.sessionDefaultPrice || 0,
      sessionDefaultDuration: user?.profile?.sessionDefaultDuration || 50,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      const response = await api.patch('/users/profile', data);
      return response.data;
    },
    onSuccess: () => {
      setSuccessMessage('Configuración guardada correctamente');
      // Refresh user data in store
      fetchCurrentUser();
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    setSuccessMessage(null);
    updateProfileMutation.mutate(data);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-kanji dark:text-kio">⚙️ Configuración</h1>
          <p className="text-text/60 dark:text-slate-400 mt-1">
            Personaliza tu perfil y preferencias de sesión.
          </p>
        </div>

        {/* Settings Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-cruz dark:border-slate-800 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-kanji dark:text-white mb-6">
            Preferencias de Sesión
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Session Price */}
            <div>
              <label
                htmlFor="sessionDefaultPrice"
                className="block text-sm font-medium text-kanji dark:text-slate-200 mb-2"
              >
                Precio por sesión ({user?.profile?.currency || 'USD'})
              </label>
              <input
                id="sessionDefaultPrice"
                type="number"
                step="0.01"
                min="0"
                {...register('sessionDefaultPrice', { valueAsNumber: true })}
                className="w-full px-4 py-3 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white placeholder:text-text/40 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-kio focus:border-transparent transition-all"
                placeholder="100.00"
              />
              {errors.sessionDefaultPrice && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.sessionDefaultPrice.message}
                </p>
              )}
            </div>

            {/* Session Duration */}
            <div>
              <label
                htmlFor="sessionDefaultDuration"
                className="block text-sm font-medium text-kanji dark:text-slate-200 mb-2"
              >
                Duración por sesión (minutos)
              </label>
              <input
                id="sessionDefaultDuration"
                type="number"
                min="15"
                max="180"
                {...register('sessionDefaultDuration', { valueAsNumber: true })}
                className="w-full px-4 py-3 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white placeholder:text-text/40 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-kio focus:border-transparent transition-all"
                placeholder="50"
              />
              {errors.sessionDefaultDuration && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.sessionDefaultDuration.message}
                </p>
              )}
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
                ✓ {successMessage}
              </div>
            )}

            {/* Error Message */}
            {updateProfileMutation.isError && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                ✕ Error al guardar. Intenta de nuevo.
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || updateProfileMutation.isPending}
              className="w-full py-3 px-6 bg-kio text-white font-semibold rounded-xl shadow-md hover:bg-kanji focus:outline-none focus:ring-2 focus:ring-kio focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Account Info Card */}
        <div className="mt-6 bg-white dark:bg-slate-900 rounded-3xl border border-cruz dark:border-slate-800 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-kanji dark:text-white mb-4">
            Información de Cuenta
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-text/60 dark:text-slate-400 text-sm">Email</p>
              <p className="font-medium text-kanji dark:text-white">{user?.email}</p>
            </div>
            <div>
              <p className="text-text/60 dark:text-slate-400 text-sm">Rol</p>
              <p className="font-medium text-kanji dark:text-white">{user?.role}</p>
            </div>
            <div>
              <p className="text-text/60 dark:text-slate-400 text-sm">Tipo</p>
              <p className="font-medium text-kanji dark:text-white">
                {user?.profile?.type === 'PSYCHOLOGIST' ? 'Psicólogo' : 'Nutriólogo'}
              </p>
            </div>
            <div>
              <p className="text-text/60 dark:text-slate-400 text-sm">Número de Licencia</p>
              <p className="font-medium text-kanji dark:text-white">
                {user?.profile?.licenseNumber || 'No especificado'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
