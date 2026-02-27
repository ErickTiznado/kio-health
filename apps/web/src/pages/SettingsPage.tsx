import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuthStore } from '../stores/auth.store';
import { settingsSchema, type SettingsFormData } from '../schemas/settings.schema';
import { api } from '../lib/api';
import { 
  Settings, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Shield, 
  User, 
  FileText,
  CreditCard,
  Clock,
  Loader2
} from 'lucide-react';

export function SettingsPage() {
  const { user, fetchCurrentUser } = useAuthStore();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      currency: user?.profile?.currency || 'USD',
      sessionDefaultPrice: user?.profile?.sessionDefaultPrice || 0,
      sessionDefaultDuration: user?.profile?.sessionDefaultDuration || 50,
    },
  });

  const selectedCurrency = watch('currency') || user?.profile?.currency || 'USD';

  const updateProfileMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      const response = await api.patch('/users/profile', data);
      return response.data;
    },
    onSuccess: () => {
      setSuccessMessage('Configuración guardada correctamente');
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
      <div className="max-w-4xl mx-auto pb-12">
        {/* Page Header */}
        <div className="mb-8 flex items-center space-x-3">
          <div className="p-2.5 bg-kio/10 dark:bg-kio/20 rounded-xl">
            <Settings className="w-6 h-6 text-kio" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-kanji dark:text-white">Configuración</h1>
            <p className="text-text/60 dark:text-slate-400 text-sm mt-0.5">
              Personaliza tu perfil y preferencias de sesión
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="border-b border-cruz dark:border-slate-800 px-6 py-5">
                <h2 className="text-lg font-semibold text-kanji dark:text-white">
                  Preferencias de Sesión
                </h2>
                <p className="text-sm text-text/60 dark:text-slate-400 mt-1">
                  Configura los valores predeterminados para tus nuevas citas
                </p>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Currency */}
                  <div className="space-y-2">
                    <label
                      htmlFor="currency"
                      className="block text-sm font-medium text-kanji dark:text-slate-300"
                    >
                      Moneda
                    </label>
                    <div className="relative">
                      <select
                        id="currency"
                        {...register('currency')}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white focus:outline-none focus:ring-2 focus:ring-kio/50 focus:border-kio transition-all appearance-none cursor-pointer"
                      >
                        <option value="USD">USD - Dólar Estadounidense</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="MXN">MXN - Peso Mexicano</option>
                        <option value="COP">COP - Peso Colombiano</option>
                        <option value="ARS">ARS - Peso Argentino</option>
                        <option value="CLP">CLP - Peso Chileno</option>
                        <option value="PEN">PEN - Sol Peruano</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-text/40 dark:text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    {errors.currency && (
                      <p className="text-sm text-red-500 font-medium">
                        {errors.currency.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Session Price */}
                    <div className="space-y-2">
                      <label
                        htmlFor="sessionDefaultPrice"
                        className="block text-sm font-medium text-kanji dark:text-slate-300"
                      >
                        Precio por sesión ({selectedCurrency})
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <CreditCard className="h-4 w-4 text-text/40 dark:text-slate-500" />
                        </div>
                        <input
                          id="sessionDefaultPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          {...register('sessionDefaultPrice', { valueAsNumber: true })}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white placeholder:text-text/40 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-kio/50 focus:border-kio transition-all"
                          placeholder="100.00"
                        />
                      </div>
                      {errors.sessionDefaultPrice && (
                        <p className="text-sm text-red-500 font-medium">
                          {errors.sessionDefaultPrice.message}
                        </p>
                      )}
                    </div>

                    {/* Session Duration */}
                    <div className="space-y-2">
                      <label
                        htmlFor="sessionDefaultDuration"
                        className="block text-sm font-medium text-kanji dark:text-slate-300"
                      >
                        Duración (minutos)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Clock className="h-4 w-4 text-text/40 dark:text-slate-500" />
                        </div>
                        <input
                          id="sessionDefaultDuration"
                          type="number"
                          min="15"
                          max="180"
                          {...register('sessionDefaultDuration', { valueAsNumber: true })}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white placeholder:text-text/40 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-kio/50 focus:border-kio transition-all"
                          placeholder="50"
                        />
                      </div>
                      {errors.sessionDefaultDuration && (
                        <p className="text-sm text-red-500 font-medium">
                          {errors.sessionDefaultDuration.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Feedback Messages */}
                  {successMessage && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <p className="text-sm font-medium">{successMessage}</p>
                    </div>
                  )}

                  {updateProfileMutation.isError && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400">
                      <XCircle className="w-5 h-5 shrink-0" />
                      <p className="text-sm font-medium">Error al guardar la configuración. Intenta de nuevo.</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting || updateProfileMutation.isPending}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-kio text-white font-medium rounded-xl shadow-sm hover:bg-kio/90 focus:outline-none focus:ring-2 focus:ring-kio/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        'Guardar Cambios'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Account Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-surface dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm overflow-hidden sticky top-6">
              <div className="border-b border-cruz dark:border-slate-800 px-6 py-5 bg-bg/50 dark:bg-slate-800/50">
                <h2 className="text-lg font-semibold text-kanji dark:text-white">
                  Información de Cuenta
                </h2>
              </div>
              <div className="p-6">
                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg shrink-0 mt-0.5">
                      <Mail className="w-4 h-4 text-text/60 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text/50 dark:text-slate-500 uppercase tracking-wider mb-1">
                        Correo Electrónico
                      </p>
                      <p className="text-sm font-medium text-kanji dark:text-white truncate">
                        {user?.email}
                      </p>
                    </div>
                  </li>
                  
                  <li className="flex items-start gap-4">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg shrink-0 mt-0.5">
                      <Shield className="w-4 h-4 text-text/60 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text/50 dark:text-slate-500 uppercase tracking-wider mb-1">
                        Rol del Sistema
                      </p>
                      <p className="text-sm font-medium text-kanji dark:text-white">
                        {user?.role}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-4">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-text/60 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text/50 dark:text-slate-500 uppercase tracking-wider mb-1">
                        Especialidad
                      </p>
                      <p className="text-sm font-medium text-kanji dark:text-white">
                        {user?.profile?.type === 'PSYCHOLOGIST' ? 'Psicólogo' : 'Nutriólogo'}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-4">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-text/60 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text/50 dark:text-slate-500 uppercase tracking-wider mb-1">
                        Cédula Profesional
                      </p>
                      <p className="text-sm font-medium text-kanji dark:text-white">
                        {user?.profile?.licenseNumber || (
                          <span className="text-text/40 dark:text-slate-500 italic">No especificada</span>
                        )}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
