import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuthStore } from '../stores/auth.store';
import { settingsSchema, type SettingsFormData } from '../schemas/settings.schema';
import { api } from '../lib/api';
import { useCreateClinic, useLeaveClinic } from '../hooks/use-clinics';
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
  Loader2,
  Building2,
  ExternalLink,
  Compass,
} from 'lucide-react';
import { useTourStore } from '../stores/tour.store';

export function SettingsPage() {
  const { user, fetchCurrentUser } = useAuthStore();
  const { resetTour, startTour } = useTourStore();
  const [clinicName, setClinicName] = useState('');
  const createClinicMutation = useCreateClinic();
  const leaveClinicMutation = useLeaveClinic();
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

            {/* Clinic Section */}
            <div className="bg-surface dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="border-b border-cruz dark:border-slate-800 px-6 py-5">
                <h2 className="text-lg font-semibold text-kanji dark:text-white flex items-center gap-2">
                  <Building2 size={18} />
                  Mi Clínica
                </h2>
              </div>
              <div className="p-6">
                {user?.profile?.plan === 'INDIVIDUAL' ? (
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-cruz dark:border-slate-700 bg-bg/50 dark:bg-slate-800/50">
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg shrink-0">
                      <Building2 size={18} className="text-text/40 dark:text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-kanji dark:text-white">Plan Clínica</p>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-text/50 dark:text-slate-400">
                          Bloqueado
                        </span>
                      </div>
                      <p className="text-sm text-text/60 dark:text-slate-400">
                        La gestión de clínicas y equipos está disponible en el plan Clínica.
                      </p>
                      <p className="text-xs text-text/40 dark:text-slate-500 mt-2">
                        Contacta a soporte para cambiar tu plan.
                      </p>
                    </div>
                  </div>
                ) : !user?.clinicId ? (
                  <div className="space-y-3">
                    <p className="text-sm text-text/60 dark:text-slate-400">
                      No perteneces a ninguna clínica. Crea una para gestionar tu equipo.
                    </p>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        placeholder="Nombre de tu clínica"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kio/50"
                      />
                      <button
                        type="button"
                        disabled={!clinicName.trim() || createClinicMutation.isPending}
                        onClick={() => createClinicMutation.mutate({ name: clinicName.trim() })}
                        className="flex items-center gap-2 px-4 py-2.5 bg-kio text-white rounded-xl text-sm font-medium hover:bg-kio/90 transition-colors disabled:opacity-70"
                      >
                        {createClinicMutation.isPending ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Building2 size={14} />
                        )}
                        Crear
                      </button>
                    </div>
                  </div>
                ) : user.clinicRole === 'MEMBER' ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-text/60 dark:text-slate-400">
                      Perteneces a una clínica como{' '}
                      <span className="font-medium text-kanji dark:text-white">Miembro</span>.
                    </p>
                    <button
                      type="button"
                      onClick={() => leaveClinicMutation.mutate()}
                      disabled={leaveClinicMutation.isPending}
                      className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-70"
                    >
                      Abandonar clínica
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-text/60 dark:text-slate-400">
                      Gestionas una clínica como{' '}
                      <span className="font-medium text-kanji dark:text-white">
                        {user.clinicRole === 'OWNER' ? 'Propietario' : 'Administrador'}
                      </span>
                      .
                    </p>
                    <Link
                      to="/clinic"
                      className="flex items-center gap-1.5 text-sm text-kio font-medium hover:text-kanji transition-colors"
                    >
                      Gestionar <ExternalLink size={13} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
            {/* Google Calendar Section */}
            <div className="bg-surface dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm overflow-hidden mt-8">
              <div className="border-b border-cruz dark:border-slate-800 px-6 py-5">
                <h2 className="text-lg font-semibold text-kanji dark:text-white flex items-center gap-2">
                  <ExternalLink size={18} />
                  Integraciones
                </h2>
                <p className="text-sm text-text/60 dark:text-slate-400 mt-1">
                  Conecta herramientas externas para mejorar tu flujo de trabajo
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-cruz dark:border-slate-700 bg-bg/50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <svg viewBox="0 0 24 24" className="w-6 h-6">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-kanji dark:text-white">Google Calendar</h3>
                      <p className="text-xs text-text/60 dark:text-slate-400">
                        {user?.profile?.googleIntegration
                          ? 'Sincronización activa. Tus citas se reflejarán automáticamente en tu calendario.'
                          : 'Sincroniza tus citas de Kio automáticamente.'}
                      </p>
                    </div>
                  </div>
                  {user?.profile?.googleIntegration ? (
                    <button
                      onClick={async () => {
                        try {
                          await api.delete('/integrations/google/disconnect');
                          await fetchCurrentUser();
                        } catch (e) {
                          console.error('Error desconectando Google Calendar', e);
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                    >
                      Desconectar
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          const res = await api.get<{ url: string }>('/integrations/google/auth');
                          window.location.href = res.data.url;
                        } catch (e) {
                          console.error('Error iniciando conexión con Google', e);
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium bg-kio text-white rounded-lg shadow-sm hover:bg-kio/90 transition-colors"
                    >
                      Conectar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="lg:col-span-2 bg-surface dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm p-6">
            <h2 className="font-semibold text-kanji dark:text-white mb-1">Ayuda</h2>
            <p className="text-sm text-text/60 dark:text-slate-400 mb-4">
              ¿Quieres volver a conocer la plataforma?
            </p>
            <button
              type="button"
              onClick={() => { resetTour(); startTour(); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cruz dark:border-slate-700 text-sm font-medium text-gray-600 dark:text-slate-300 hover:border-kio hover:text-kio dark:hover:border-kio dark:hover:text-kio transition-colors"
            >
              <Compass size={16} className="text-kio" />
              Ver el tutorial nuevamente
            </button>
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
